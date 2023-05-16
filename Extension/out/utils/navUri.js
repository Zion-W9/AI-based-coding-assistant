"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navUri = void 0;
const vscode = require("vscode");
const navUri = async (uri, language, mode) => {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.Beside,
        preview: true,
        preserveFocus: true,
    });
    vscode.languages.setTextDocumentLanguage(doc, language);
};
exports.navUri = navUri;
//# sourceMappingURL=navUri.js.map