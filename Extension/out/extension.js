"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const vscode = require("vscode");
const constparams_1 = require("./param/constparams");
const checkPrivacy_1 = require("./utils/checkPrivacy");
const statisticFunc_1 = require("./utils/statisticFunc");
const updateStatusBarItem_1 = require("./utils/updateStatusBarItem");
const generationWithPrompMode_1 = require("./mode/generationWithPrompMode");
const welcomePage_1 = require("./welcomePage");
const generationWithTranslationMode_1 = require("./mode/generationWithTranslationMode");
const codelensProvider_1 = require("./provider/codelensProvider");
const generationWithInteractiveMode_1 = require("./mode/generationWithInteractiveMode");
const chooseCandidate_1 = require("./utils/chooseCandidate");
const disableEnable_1 = require("./disableEnable");
const textDocumentProvider_1 = require("./provider/textDocumentProvider");
const inlineCompletionProvider_1 = require("./provider/inlineCompletionProvider");
const configures_1 = require("./param/configures");
const changeIconColor_1 = require("./utils/changeIconColor");
const isCurrentLanguageDisable_1 = require("./utils/isCurrentLanguageDisable");
const survey_1 = require("./utils/survey");
const translationWebviewProvider_1 = require("./provider/translationWebviewProvider");
const inlineCompletionProviderWithCommand_1 = require("./provider/inlineCompletionProviderWithCommand");
let g_isLoading = false;
let originalColor;
let myStatusBarItem;
async function activate(context) {
    console.log('Congratulations, your extension "CodeGeeX" is now active!');
    try {
        (0, statisticFunc_1.getOpenExtensionData)();
    }
    catch (err) {
        console.error(err);
    }
    context.subscriptions.push(vscode.commands.registerCommand("codegeex.welcome-page", async () => {
        await (0, welcomePage_1.default)(context);
    }));
    if (vscode.env.isNewAppInstall) {
        vscode.commands.executeCommand("codegeex.welcome-page");
    }
    (0, checkPrivacy_1.checkPrivacy)();
    (0, survey_1.default)();
    let targetEditor;
    const statusBarItemCommandId = "codegeex.disable-enable";
    context.subscriptions.push(vscode.commands.registerCommand("codegeex.disable-enable", () => {
        (0, disableEnable_1.default)(myStatusBarItem, g_isLoading, originalColor, context);
    }));
    if (configures_1.enableExtension) {
        context.globalState.update("EnableExtension", true);
    }
    else {
        context.globalState.update("EnableExtension", false);
    }
    // create a new status bar item that we can now manage
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.command = statusBarItemCommandId;
    context.subscriptions.push(myStatusBarItem);
    //initialiser statusbar
    (0, changeIconColor_1.default)(configures_1.enableExtension, myStatusBarItem, originalColor, (0, isCurrentLanguageDisable_1.isCurrentLanguageDisable)());
    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, "");
    //subscribe interactive-mode command
    context.subscriptions.push(vscode.commands.registerCommand("codegeex.interactive-mode", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(constparams_1.localeTag.noEditorInfo);
            return;
        }
        targetEditor = editor;
        (0, generationWithInteractiveMode_1.default)(editor, myStatusBarItem, g_isLoading);
    }));
    //subscribe translation-mode command
    context.subscriptions.push(vscode.commands.registerCommand("codegeex.translate-mode", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(constparams_1.localeTag.noEditorInfo);
            return;
        }
        targetEditor = editor;
        (0, generationWithTranslationMode_1.default)(myStatusBarItem, g_isLoading, targetEditor);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("codegeex.prompt-mode", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(constparams_1.localeTag.noEditorInfo);
            return;
        }
        (0, generationWithPrompMode_1.generateWithPromptMode)(myStatusBarItem, g_isLoading, editor);
    }));
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(constparams_1.myScheme, (0, textDocumentProvider_1.textDocumentProvider)(myStatusBarItem, g_isLoading)));
    context.subscriptions.push(vscode.commands.registerCommand("CodeGeeX.chooseCandidate", (fn, mode, commandid) => {
        (0, chooseCandidate_1.default)(targetEditor, fn, mode, commandid);
    }));
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ scheme: constparams_1.myScheme }, codelensProvider_1.codelensProvider));
    //command after insert a suggestion in stealth mode
    context.subscriptions.push(vscode.commands.registerCommand("verifyInsertion", async (id, completions, acceptItem) => {
        try {
            (0, statisticFunc_1.getEndData)(id, "", "Yes", acceptItem, completions);
        }
        catch (err) {
            console.log(err);
        }
    }));
    let inlineProvider;
    inlineProvider = (0, inlineCompletionProvider_1.default)(g_isLoading, myStatusBarItem, false, originalColor, context);
    if (configures_1.onlyKeyControl) {
        context.globalState.update("DisableInlineCompletion", true);
    }
    else {
        context.globalState.update("DisableInlineCompletion", false);
        context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, inlineProvider));
    }
    let provider2 = (0, inlineCompletionProviderWithCommand_1.default)(g_isLoading, myStatusBarItem, originalColor, context);
    let oneTimeDispo;
    vscode.commands.registerCommand("codegeex.new-completions", () => {
        if (oneTimeDispo) {
            oneTimeDispo.dispose();
        }
        context.globalState.update("isOneCommand", true);
        context.globalState.update("DisableInlineCompletion", true);
        oneTimeDispo = vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider2);
    });
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(async (e) => {
        const editor = vscode.window.activeTextEditor;
        const enableExtension = await context.globalState.get("EnableExtension");
        if (editor) {
            (0, changeIconColor_1.default)(
            //@ts-ignore
            enableExtension, myStatusBarItem, originalColor, (0, isCurrentLanguageDisable_1.isCurrentLanguageDisable)(), true);
        }
    }));
    const tranlationProvider = new translationWebviewProvider_1.default(context.extensionUri);
    const translationViewDisposable = vscode.window.registerWebviewViewProvider("codegeex-translate", tranlationProvider);
    context.subscriptions.push(translationViewDisposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map