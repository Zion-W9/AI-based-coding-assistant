"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDocumentLangId(lang) {
    let id;
    lang = lang.replace("++", "pp").replace("#", "sharp");
    switch (lang) {
        case "Cuda":
            id = "cuda-cpp";
            break;
        case "Shell":
            id = "shellscript";
            break;
        default:
            id = lang.toLowerCase();
    }
    return id;
}
exports.default = getDocumentLangId;
//# sourceMappingURL=getDocumentLangId.js.map