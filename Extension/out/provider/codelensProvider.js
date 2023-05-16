"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codelensProvider = void 0;
const vscode = require("vscode");
const constparams_1 = require("../param/constparams");
exports.codelensProvider = new (class {
    constructor() {
        this.codelenses = [];
    }
    addEl(lineNum, text, commandid, mode) {
        let range;
        range = new vscode.Range(lineNum, 0, lineNum, 0);
        this.codelenses.push(new vscode.CodeLens(range, {
            title: constparams_1.localeTag.useCode,
            command: "CodeGeeX.chooseCandidate",
            arguments: [text, mode, commandid],
            tooltip: constparams_1.localeTag.chooseThisSnippet,
        }));
    }
    clearEls() {
        this.codelenses = [];
    }
    provideCodeLenses() {
        return this.codelenses;
    }
})();
//# sourceMappingURL=codelensProvider.js.map