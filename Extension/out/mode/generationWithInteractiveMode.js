"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const codegeexCodeGen_1 = require("../utils/codegeexCodeGen");
const updateStatusBarItem_1 = require("../utils/updateStatusBarItem");
const addSignal = "<|add|>";
const andSignal = "<|and|>";
const hash = "<|hash|>";
async function generationWithInteractiveMode(editor, myStatusBarItem, g_isLoading) {
    const document = editor.document;
    let selection;
    const cursorPosition = editor.selection.active;
    selection = new vscode.Selection(0, 0, cursorPosition.line, cursorPosition.character);
    let code_block = document.getText(selection);
    if (cursorPosition.character === 0 &&
        code_block[code_block.length - 1] !== "\n") {
        code_block += "\n";
    }
    code_block = code_block
        .replaceAll("#", hash)
        .replaceAll("+", addSignal)
        .replaceAll("&", andSignal);
    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, true, "");
    await (0, codegeexCodeGen_1.codegeexCodeGen)(code_block)
        .then(() => (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, "Done"))
        .catch((err) => {
        console.log(err);
        (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, "No Suggestion");
    });
}
exports.default = generationWithInteractiveMode;
//# sourceMappingURL=generationWithInteractiveMode.js.map