"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showQuickPick = void 0;
const vscode_1 = require("vscode");
async function showQuickPick(list, description) {
    const result = await vscode_1.window.showQuickPick(list, {
        placeHolder: description,
        onDidSelectItem: (item) => { },
    });
    return result;
}
exports.showQuickPick = showQuickPick;
//# sourceMappingURL=showQuickPick.js.map