"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusBarItem = void 0;
var statusbartimer;
async function updateStatusBarItem(myStatusBarItem, g_isLoading, isLoading, info) {
    myStatusBarItem.show();
    if (statusbartimer) {
        clearTimeout(statusbartimer);
    }
    if (isLoading) {
        g_isLoading = true;
        myStatusBarItem.text = `$(loading~spin)` + info;
    }
    else {
        g_isLoading = false;
        myStatusBarItem.text = `$(codegeex-dark)` + info;
        statusbartimer = setTimeout(() => {
            myStatusBarItem.text = `$(codegeex-dark)`;
        }, 30000);
    }
}
exports.updateStatusBarItem = updateStatusBarItem;
//# sourceMappingURL=updateStatusBarItem.js.map