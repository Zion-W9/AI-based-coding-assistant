"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const getCodeCompletions_1 = require("./getCodeCompletions");
const getDocumentLanguage_1 = require("./getDocumentLanguage");
const constparams_1 = require("../param/constparams");
const updateStatusBarItem_1 = require("./updateStatusBarItem");
const localconfig_1 = require("../localconfig");
async function codeGenByTemplate(editor, templateStr, myStatusBarItem, g_isLoading) {
    let prompt_input = "";
    let document = editor.document;
    let sel = editor.selections;
    for (var x = 0; x < sel.length; x++) {
        let txt = document.getText(new vscode.Range(sel[x].start, sel[x].end));
        prompt_input += txt;
    }
    var selection = editor.selection;
    let rs;
    let prompt = "";
    let lang = "";
    try {
        let promptInputArr = prompt_input.split("\n");
        const re = /<INPUT(:.+)?>/g;
        let iter = re.exec(templateStr);
        prompt = templateStr;
        while (iter) {
            if (iter[0] == "<INPUT>") {
                prompt = prompt.replace(iter[0], prompt_input);
            }
            else if (iter[0].indexOf(":") != -1) {
                if (iter[0].indexOf(",") != -1) {
                    let rangeStr = iter[0].split(":")[1];
                    rangeStr = rangeStr.slice(0, -1);
                    let fromLine = Number(rangeStr.split(",")[0]);
                    let toLine = Number(rangeStr.split(",")[1]);
                    prompt = prompt.replace(iter[0], promptInputArr.slice(fromLine, toLine).join("\n"));
                }
                else {
                    let rangeStr = Number(iter[0].split(":")[1].slice(0, -1));
                    prompt = prompt.replace(iter[0], promptInputArr.slice(rangeStr).join("\n"));
                }
            }
            else {
                vscode.window.showInformationMessage(constparams_1.localeTag.errorInInputMarkup);
                return;
            }
            iter = re.exec(templateStr);
        }
        console.log("about to request");
        lang = (0, getDocumentLanguage_1.default)(editor);
        (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, true, "");
        rs = await (0, getCodeCompletions_1.getCodeCompletions)(prompt, 1, lang, localconfig_1.apiKey, localconfig_1.apiSecret, "prompt");
    }
    catch (err) {
        (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " No Suggestion");
        return;
    }
    if (rs && rs.completions.length > 0) {
        editor.edit(function (edit) {
            let pos = selection.end;
            edit.insert(new vscode.Position(pos.line + 3, 0), `${rs.completions[0]}`);
        });
        (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " Done");
    }
    else {
        (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " No Suggestion");
    }
}
exports.default = codeGenByTemplate;
//# sourceMappingURL=codeGenByTemplate.js.map