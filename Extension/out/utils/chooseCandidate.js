"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configures_1 = require("../param/configures");
const constparams_1 = require("../param/constparams");
const commentCode_1 = require("./commentCode");
const statisticFunc_1 = require("./statisticFunc");
//function to insert code when user click 'use code'
function chooseCandidate(targetEditor, fn, mode, commandid) {
    if (!targetEditor)
        return;
    try {
        targetEditor
            .edit(async (editBuilder) => {
            var s = targetEditor.selection;
            if (s.start.character == 0 && fn.slice(0, 1) == "\n") {
                fn = fn.slice(1);
            }
            if (mode === "translation") {
                let selection = new vscode.Selection(s.start, s.end);
                const text = targetEditor.document.getText(selection);
                const lang = targetEditor.document.languageId;
                const commentSignal = (0, commentCode_1.getCommentSignal)(lang);
                if (configures_1.translationInsertMode === "comment") {
                    const commentedText = (0, commentCode_1.default)(text, lang, "line").replaceAll(constparams_1.comment, commentSignal.line || "#");
                    editBuilder.replace(s, commentedText + "\n" + fn);
                }
                else {
                    editBuilder.replace(s, fn);
                }
            }
            else {
                editBuilder.replace(s, fn);
            }
            try {
                if (commandid.length !== 0) {
                    await (0, statisticFunc_1.getEndData)(commandid, "", "Yes", fn);
                }
            }
            catch (err) {
                console.log(err);
            }
        })
            .then((success) => {
            var postion = targetEditor.selection.end;
            targetEditor.selection = new vscode.Selection(postion, postion);
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.default = chooseCandidate;
//# sourceMappingURL=chooseCandidate.js.map