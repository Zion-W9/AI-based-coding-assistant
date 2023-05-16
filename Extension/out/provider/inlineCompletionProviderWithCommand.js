"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const localconfig_1 = require("../localconfig");
const configures_1 = require("../param/configures");
const getCodeCompletions_1 = require("../utils/getCodeCompletions");
const getDocumentLanguage_1 = require("../utils/getDocumentLanguage");
const updateStatusBarItem_1 = require("../utils/updateStatusBarItem");
let lastRequest = null;
let someTrackingIdCounter = 0;
function inlineCompletionProviderWithCommand(g_isLoading, myStatusBarItem, originalColor, extensionContext) {
    const provider = {
        provideInlineCompletionItems: async (document, position, context, token) => {
            console.log("new event!");
            const enableExtension = await extensionContext.globalState.get("EnableExtension");
            const isOneCommand = await extensionContext.globalState.get("isOneCommand");
            //= vscode.workspace
            // .getConfiguration("Codegeex", undefined)
            // .get("isOneCommand", undefined);
            if (!isOneCommand || !enableExtension) {
                extensionContext.globalState.update("isOneCommand", false);
                extensionContext.globalState.update("DisableInlineCompletion", false);
                return;
            }
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage("Please open a file first to use CodeGeeX.");
                extensionContext.globalState.update("isOneCommand", false);
                extensionContext.globalState.update("DisableInlineCompletion", false);
                return;
            }
            let selection;
            const languageId = editor.document.languageId || "undefined";
            if (configures_1.disabledFor[languageId] === true ||
                configures_1.disabledFor[languageId] === "true" ||
                !isOneCommand) {
                extensionContext.globalState.update("isOneCommand", false);
                extensionContext.globalState.update("DisableInlineCompletion", false);
                return;
            }
            const cursorPosition = editor.selection.active;
            selection = new vscode.Selection(0, 0, cursorPosition.line, cursorPosition.character);
            let textBeforeCursor = document.getText(selection);
            if (cursorPosition.character === 0 &&
                textBeforeCursor[textBeforeCursor.length - 1] !== "\n") {
                textBeforeCursor += "\n";
            }
            if (vscode.window.activeNotebookEditor) {
                const cells = vscode.window.activeNotebookEditor.notebook.getCells();
                const currentCell = vscode.window.activeNotebookEditor.selection.start;
                let str = "";
                for (let i = 0; i < currentCell; i++) {
                    str += cells[i].document.getText().trimEnd() + "\n";
                }
                textBeforeCursor = str + textBeforeCursor;
            }
            if (textBeforeCursor.trim() === "") {
                (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, "");
                extensionContext.globalState.update("isOneCommand", false);
                extensionContext.globalState.update("DisableInlineCompletion", false);
                return { items: [] };
            }
            //解决光标之后有除括号空格之外内容，仍然补充造成的调用浪费
            let selectionNextChar;
            selectionNextChar = new vscode.Selection(cursorPosition.line, cursorPosition.character, cursorPosition.line, cursorPosition.character + 1);
            let nextChar = document.getText(selectionNextChar);
            const checkString = "]}) \n\t'\"";
            if (!checkString.includes(nextChar)) {
                console.log("不进行补充");
                (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, "");
                extensionContext.globalState.update("isOneCommand", false);
                extensionContext.globalState.update("DisableInlineCompletion", false);
                return;
            }
            else {
                console.log("continue");
            }
            if (isOneCommand && textBeforeCursor.length > 8) {
                console.log("try to get");
                let requestId = new Date().getTime();
                lastRequest = requestId;
                if (lastRequest !== requestId) {
                    extensionContext.globalState.update("isOneCommand", false);
                    extensionContext.globalState.update("DisableInlineCompletion", false);
                    return { items: [] };
                }
                console.log("real to get");
                console.log("new command");
                let rs;
                let lang = "";
                const configuration = vscode.workspace.getConfiguration("Codegeex", undefined);
                const num_str = String(configuration.get("CandidateNum", "1"));
                const num = parseInt(num_str);
                try {
                    if (editor) {
                        lang = (0, getDocumentLanguage_1.default)(editor);
                    }
                    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, true, "");
                    let timestart = new Date().getTime();
                    rs = await (0, getCodeCompletions_1.getCodeCompletions)(textBeforeCursor, num, lang, localconfig_1.apiKey, localconfig_1.apiSecret, "inlinecompletion");
                    let timeend = new Date().getTime();
                    console.log("time execute", timeend - timestart);
                }
                catch (err) {
                    if (err) {
                        console.log("intended error");
                        console.log(err);
                    }
                    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " No Suggestion");
                    extensionContext.globalState.update("isOneCommand", false);
                    extensionContext.globalState.update("DisableInlineCompletion", false);
                    return { items: [] };
                }
                if (rs === null) {
                    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " No Suggestion");
                    extensionContext.globalState.update("isOneCommand", false);
                    extensionContext.globalState.update("DisableInlineCompletion", false);
                    return { items: [] };
                }
                // prompts.push(textBeforeCursor);
                // Add the generated code to the inline suggestion list
                let items = new Array();
                let cursorPosition = editor.selection.active;
                for (let i = 0; i < rs.completions.length; i++) {
                    items.push({
                        insertText: rs.completions[i],
                        // range: new vscode.Range(endPosition.translate(0, rs.completions.length), endPosition),
                        range: new vscode.Range(cursorPosition.translate(0, rs.completions.length), cursorPosition),
                        trackingId: someTrackingIdCounter++,
                    });
                    //trie.addWord(textBeforeCursor + rs.completions[i]);
                }
                for (let j = 0; j < items.length; j++) {
                    items[j].command = {
                        command: "verifyInsertion",
                        title: "Verify Insertion",
                        arguments: [
                            rs.commandid,
                            rs.completions,
                            items[j].insertText,
                        ],
                    };
                }
                if (rs.completions.length === 0) {
                    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " No Suggestion");
                }
                else {
                    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " Done");
                }
                extensionContext.globalState.update("isOneCommand", false);
                extensionContext.globalState.update("DisableInlineCompletion", false);
                return items;
            }
            (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " No Suggestion");
            extensionContext.globalState.update("isOneCommand", false);
            extensionContext.globalState.update("DisableInlineCompletion", false);
            return { items: [] };
        },
    };
    return provider;
}
exports.default = inlineCompletionProviderWithCommand;
//# sourceMappingURL=inlineCompletionProviderWithCommand.js.map