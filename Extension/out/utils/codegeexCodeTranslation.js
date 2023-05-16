"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codegeexCodeTranslation = void 0;
const getDocumentLangId_1 = require("./getDocumentLangId");
const vscode_1 = require("vscode");
const navUri_1 = require("./navUri");
const constparams_1 = require("../param/constparams");
//generate uri for translation mode
const codegeexCodeTranslation = async (dstLang, translationRes, commandid) => {
    let documentLangId;
    documentLangId = (0, getDocumentLangId_1.default)(dstLang);
    let uri = vscode_1.Uri.parse(`${constparams_1.myScheme}:CodeGeeX_translation?loading=false&mode=translation&commandid=${commandid}&translation_res=${translationRes
        .replaceAll("+", constparams_1.addSignal)
        .replaceAll("&", constparams_1.andSignal)}`, true);
    await (0, navUri_1.navUri)(uri, documentLangId, "CodeGeeX_translation");
};
exports.codegeexCodeTranslation = codegeexCodeTranslation;
//# sourceMappingURL=codegeexCodeTranslation.js.map