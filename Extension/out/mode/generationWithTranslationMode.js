"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constparams_1 = require("../param/constparams");
const codegeexCodeTranslation_1 = require("../utils/codegeexCodeTranslation");
const getCodeTranslation_1 = require("../utils/getCodeTranslation");
const getDocumentLanguage_1 = require("../utils/getDocumentLanguage");
const showQuickPick_1 = require("../utils/showQuickPick");
const statisticFunc_1 = require("../utils/statisticFunc");
const updateStatusBarItem_1 = require("../utils/updateStatusBarItem");
async function generationWithTranslationMode(myStatusBarItem, g_isLoading, targetEditor) {
    let dstLang = (0, getDocumentLanguage_1.default)(targetEditor);
    const document = targetEditor.document;
    let selection;
    const cursorPosition = targetEditor.selection.active;
    const anchorPosition = targetEditor.selection.anchor;
    selection = new vscode.Selection(anchorPosition, cursorPosition);
    //vscode.commands.executeCommand('editor.action.addCommentLine')
    let text = document.getText(selection);
    if (text && text.trim().length > 0) {
        let srcLang = (await (0, showQuickPick_1.showQuickPick)(constparams_1.languageList, constparams_1.localeTag.chooseLanguage)) || "";
        let translation;
        if (constparams_1.languageList.indexOf(srcLang) >= 0 &&
            constparams_1.languageList.indexOf(dstLang) >= 0) {
            (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, true, " Translating");
            let commandid;
            try {
                commandid = await (0, statisticFunc_1.getStartData)(text, text, `${srcLang}->${dstLang}`, "translation");
            }
            catch (err) {
                commandid = "";
            }
            translation = await (0, getCodeTranslation_1.getCodeTranslation)(text, srcLang, dstLang).then(async (res) => {
                await (0, codegeexCodeTranslation_1.codegeexCodeTranslation)(dstLang, res.translation[0].replaceAll("#", constparams_1.hash), commandid).then(() => {
                    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " Done");
                });
            });
        }
        if (constparams_1.languageList.indexOf(srcLang) < 0) {
            vscode.window.showInformationMessage(constparams_1.localeTag.chooseLanguage);
        }
        if (constparams_1.languageList.indexOf(dstLang) < 0) {
            vscode.window.showInformationMessage(constparams_1.localeTag.languageNotSupported);
        }
    }
    else {
        vscode.window.showInformationMessage(constparams_1.localeTag.selectCode);
    }
}
exports.default = generationWithTranslationMode;
//# sourceMappingURL=generationWithTranslationMode.js.map