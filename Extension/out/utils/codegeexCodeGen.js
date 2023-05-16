"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codegeexCodeGen = void 0;
const vscode = require("vscode");
const constparams_1 = require("../param/constparams");
const navUri_1 = require("./navUri");
//generate uri for interactive mode
const codegeexCodeGen = async (code_block) => {
    let loading = vscode.Uri.parse(`${constparams_1.myScheme}:CodeGeeX?loading=true&mode=gen&code_block=${code_block}`, true);
    await (0, navUri_1.navUri)(loading, "python", "CodeGeeX");
    let uri = vscode.Uri.parse(`${constparams_1.myScheme}:CodeGeeX?loading=false&mode=gen&code_block=${code_block}`, true);
    await (0, navUri_1.navUri)(uri, "python", "CodeGeeX");
};
exports.codegeexCodeGen = codegeexCodeGen;
//# sourceMappingURL=codegeexCodeGen.js.map