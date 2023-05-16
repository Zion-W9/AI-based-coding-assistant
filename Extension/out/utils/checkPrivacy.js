"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPrivacy = void 0;
const vscode_1 = require("vscode");
const constparams_1 = require("../param/constparams");
//check if the user accept to share codes
async function checkPrivacy() {
    const configuration = vscode_1.workspace.getConfiguration("Codegeex", undefined);
    let privacy = configuration.get("Privacy");
    if (privacy === null) {
        const selection = await vscode_1.window.showInformationMessage(constparams_1.localeTag.privacyInfo, constparams_1.localeTag.privacyAccept, constparams_1.localeTag.privacyDecline);
        if (selection !== undefined && selection === constparams_1.localeTag.privacyAccept) {
            configuration
                .update("Privacy", true, true)
                .then((res) => console.log(res));
        }
        if (selection !== undefined && selection === constparams_1.localeTag.privacyDecline) {
            configuration.update("Privacy", false, true);
        }
    }
}
exports.checkPrivacy = checkPrivacy;
//# sourceMappingURL=checkPrivacy.js.map