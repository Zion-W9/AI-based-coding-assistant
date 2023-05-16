"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
async function showMessage(options) {
    await vscode_1.window
        .showInformationMessage(options.messageText, options.buttonText)
        .then((selected) => {
        if (selected === options.buttonText) {
            options.action();
        }
    });
}
exports.default = showMessage;
//# sourceMappingURL=messages.js.map