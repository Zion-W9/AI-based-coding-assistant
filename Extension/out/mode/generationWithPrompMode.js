"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWithPromptMode = void 0;
const vscode = require("vscode");
const configures_1 = require("../param/configures");
const explanation_1 = require("../templates/explanation");
const codeGenByTemplate_1 = require("../utils/codeGenByTemplate");
const readTemplate_1 = require("../utils/readTemplate");
async function generateWithPromptMode(myStatusBarItem, g_isLoading, editor) {
    var items = [];
    const keys = Object.keys(configures_1.templates);
    items.push({
        label: "explanation",
        description: "Explain the selection line by line",
    });
    let custom_prompts = {};
    for (let key of keys) {
        if (key != "explanation") {
            try {
                // @ts-ignore
                custom_prompts[key] = await (0, readTemplate_1.default)(configures_1.templates[key]);
                items.push({ label: key, description: "" });
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    vscode.window.showQuickPick(items).then((selection) => {
        if (!selection) {
            return;
        }
        let e = vscode.window.activeTextEditor;
        let d = e?.document;
        let sel = e?.selections;
        switch (selection.label) {
            case "explanation":
                (0, codeGenByTemplate_1.default)(editor, explanation_1.templateExplanation, myStatusBarItem, g_isLoading);
                break;
            default:
                if (keys.indexOf(selection.label) !== -1) {
                    // @ts-ignore
                    let templateStr = custom_prompts[selection.label];
                    console.log("templateStr:");
                    console.log(templateStr);
                    (0, codeGenByTemplate_1.default)(editor, templateStr, myStatusBarItem, g_isLoading);
                }
                else {
                    // console.log("no selection")
                }
                break;
        }
    });
}
exports.generateWithPromptMode = generateWithPromptMode;
//# sourceMappingURL=generationWithPrompMode.js.map