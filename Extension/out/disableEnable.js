"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configures_1 = require("./param/configures");
const constparams_1 = require("./param/constparams");
const changeIconColor_1 = require("./utils/changeIconColor");
const updateStatusBarItem_1 = require("./utils/updateStatusBarItem");
let g_isEnable = configures_1.enableExtension;
async function disableEnable(myStatusBarItem, g_isLoading, originalColor, context) {
    const lang = vscode.window.activeTextEditor?.document.languageId || "";
    if (g_isEnable) {
        if (configures_1.disabledFor[lang] ||
            configures_1.disabledFor[lang] === "true") {
            const answer = await vscode.window.showInformationMessage(constparams_1.localeTag.disableInfo, constparams_1.localeTag.disableGlobally, `${constparams_1.localeTag.enable} ${lang}`);
            if (answer === constparams_1.localeTag.disableGlobally) {
                // Run function
                (0, changeIconColor_1.default)(false, myStatusBarItem, originalColor);
                g_isEnable = false;
                const configuration = vscode.workspace.getConfiguration("Codegeex", undefined);
                configuration.update("EnableExtension", false);
                await context.globalState.update("EnableExtension", false);
            }
            if (answer === `${constparams_1.localeTag.enable} ${lang}`) {
                // Run function
                const configuration = vscode.workspace.getConfiguration("Codegeex", undefined);
                configures_1.disabledFor[lang] = false;
                configuration.update("DisabledFor", configures_1.disabledFor);
                (0, changeIconColor_1.default)(true, myStatusBarItem, originalColor);
            }
        }
        else {
            const answer = await vscode.window.showInformationMessage(constparams_1.localeTag.disableInfo, constparams_1.localeTag.disableGlobally, `${constparams_1.localeTag.disable} ${lang}`);
            if (answer === constparams_1.localeTag.disableGlobally) {
                // Run function
                (0, changeIconColor_1.default)(false, myStatusBarItem, originalColor);
                const configuration = vscode.workspace.getConfiguration("Codegeex", undefined);
                g_isEnable = false;
                configuration.update("EnableExtension", false);
                await context.globalState.update("EnableExtension", false);
            }
            if (answer === `${constparams_1.localeTag.disable} ${lang}`) {
                // Run function
                const configuration = vscode.workspace.getConfiguration("Codegeex", undefined);
                configures_1.disabledFor[lang] = true;
                configuration.update("DisabledFor", configures_1.disabledFor);
                (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, "");
                (0, changeIconColor_1.default)(true, myStatusBarItem, originalColor, true);
            }
        }
    }
    else {
        const answer = await vscode.window.showInformationMessage(constparams_1.localeTag.enableInfo, constparams_1.localeTag.enableGlobally);
        if (answer === constparams_1.localeTag.enableGlobally) {
            // Run function
            if (configures_1.disabledFor[lang] ||
                configures_1.disabledFor[lang] === "true") {
                (0, changeIconColor_1.default)(true, myStatusBarItem, originalColor, true);
            }
            else {
                (0, changeIconColor_1.default)(true, myStatusBarItem, originalColor);
            }
            const configuration = vscode.workspace.getConfiguration("Codegeex", undefined);
            g_isEnable = true;
            configuration.update("EnableExtension", true);
            await context.globalState.update("EnableExtension", true);
        }
    }
}
exports.default = disableEnable;
//# sourceMappingURL=disableEnable.js.map