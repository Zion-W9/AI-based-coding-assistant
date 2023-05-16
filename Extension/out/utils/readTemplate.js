"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
async function readTemplate(path) {
    const readData = await vscode.workspace.fs.readFile(vscode.Uri.parse(path));
    return Buffer.from(readData).toString("utf8");
}
exports.default = readTemplate;
//# sourceMappingURL=readTemplate.js.map