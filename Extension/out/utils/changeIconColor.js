"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const updateStatusBarItem_1 = require("./updateStatusBarItem");
let g_isEnable;
function changeIconColor(isEnable, myStatusBarItem, originalColor, isLangDisabled, switchTab) {
    myStatusBarItem.show();
    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, false, false, "");
    if (switchTab) {
        if (g_isEnable) {
            myStatusBarItem.backgroundColor = originalColor;
            if (isLangDisabled) {
                myStatusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
            }
        }
        else {
            originalColor = myStatusBarItem.backgroundColor;
            // myStatusBarItem.backgroundColor = "#7B5F00";
            myStatusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
        }
    }
    else {
        g_isEnable = isEnable;
        if (isEnable) {
            myStatusBarItem.backgroundColor = originalColor;
            if (isLangDisabled) {
                myStatusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
            }
        }
        else {
            originalColor = myStatusBarItem.backgroundColor;
            // myStatusBarItem.backgroundColor = "#7B5F00";
            myStatusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
        }
    }
}
exports.default = changeIconColor;
//# sourceMappingURL=changeIconColor.js.map