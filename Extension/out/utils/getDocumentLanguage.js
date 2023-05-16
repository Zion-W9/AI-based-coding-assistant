"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDocumentLanguage(editor) {
    const documentLanguageId = editor.document.languageId;
    let lang = "";
    switch (documentLanguageId) {
        case "cpp":
            lang = "C++";
            break;
        case "c":
            lang = "C";
            break;
        case "csharp":
            lang = "C#";
            break;
        case "cuda-cpp":
            lang = "Cuda";
            break;
        case "objective-c":
            lang = "Objective-C";
            break;
        case "objective-cpp":
            lang = "Objective-C++";
            break;
        case "python":
            lang = "Python";
            break;
        case "java":
            lang = "Java";
            break;
        case "tex":
            lang = "TeX";
            break;
        case "html":
            lang = "HTML";
            break;
        case "php":
            lang = "PHP";
            break;
        case "javascript":
        case "javascriptreact":
            lang = "JavaScript";
            break;
        case "typescript":
        case "typescriptreact":
            lang = "TypeScript";
            break;
        case "go":
            lang = "Go";
            break;
        case "shellscript":
            lang = "Shell";
            break;
        case "rust":
            lang = "Rust";
            break;
        case "css":
        case "less":
        case "sass":
        case "scss":
            lang = "CSS";
            break;
        case "sql":
            lang = "SQL";
            break;
        case "r":
            lang = "R";
            break;
        default:
            lang = "";
    }
    return lang;
}
exports.default = getDocumentLanguage;
//# sourceMappingURL=getDocumentLanguage.js.map