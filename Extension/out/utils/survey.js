"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statisticFunc_1 = require("./statisticFunc");
const vscode = require("vscode");
const constparams_1 = require("../param/constparams");
const configures_1 = require("../param/configures");
let totolRequestNum;
async function survey() {
    try {
        totolRequestNum = await (0, statisticFunc_1.getTotalRequestNum)();
    }
    catch (err) {
        console.error(err);
        totolRequestNum = 0;
    }
    let configuration = vscode.workspace.getConfiguration("Codegeex", undefined);
    if (totolRequestNum >= 2000 && configures_1.acceptedsurvey === null) {
        const selection = await vscode.window.showInformationMessage(constparams_1.localeTag.surveyInfo, constparams_1.localeTag.surveyYes, constparams_1.localeTag.surveyNo);
        if (selection === constparams_1.localeTag.surveyYes) {
            configuration.update("Survey", true, true);
            let uri = vscode.Uri.parse(constparams_1.surveyUrl);
            vscode.env.openExternal(uri);
        }
        if (selection === constparams_1.localeTag.surveyNo) {
            configuration.update("Survey", false, true);
        }
    }
}
exports.default = survey;
//# sourceMappingURL=survey.js.map