"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCurrentLanguageDisable = void 0;
const vscode = require("vscode");
const configures_1 = require("../param/configures");
const isCurrentLanguageDisable = () => {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return false;
    }
    else {
        const languageId = editor.document.languageId;
        if (configures_1.disabledFor[languageId] === true ||
            configures_1.disabledFor[languageId] === "true") {
            return true;
        }
        else {
            return false;
        }
    }
};
exports.isCurrentLanguageDisable = isCurrentLanguageDisable;
//# sourceMappingURL=isCurrentLanguageDisable.js.map