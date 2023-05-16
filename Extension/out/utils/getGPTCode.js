"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGPTCode = void 0;
const codelensProvider_1 = require("../provider/codelensProvider");
const updateStatusBarItem_1 = require("./updateStatusBarItem");
const getGPTCode = (candidateList, commandid, myStatusBarItem, g_isLoading) => {
    codelensProvider_1.codelensProvider.clearEls();
    let content = "";
    //let content = `/* ${localeTag.candidateList} */\n`;
    if (candidateList.length === 0) {
        (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " No Suggestion");
        return content;
    }
    let allCandidates = [];
    for (let i = 0; i < candidateList.length; i++) {
        allCandidates.push([candidateList[i], "CodeGeeX"]);
    }
    allCandidates.sort(function (a, b) {
        return b[0].length - a[0].length;
    });
    for (let i = 0; i < allCandidates.length; i++) {
        content += `\n/* Generate by ${allCandidates[i][1]} */\n`;
        const lineNum = content.split("\n").length;
        codelensProvider_1.codelensProvider.addEl(lineNum, allCandidates[i][0], allCandidates[i][1] === "CodeGeeX" ? commandid : "");
        if (allCandidates[i][0][0] === "\n") {
            content += allCandidates[i][0];
        }
        else {
            content += "\n" + allCandidates[i][0];
        }
        if (i <
            allCandidates.length - 1 /*&& candidateList[i].slice(-1) != '\n'*/) {
            content += "\n";
            content += "###########################";
        }
    }
    (0, updateStatusBarItem_1.updateStatusBarItem)(myStatusBarItem, g_isLoading, false, " Done");
    return content;
};
exports.getGPTCode = getGPTCode;
//# sourceMappingURL=getGPTCode.js.map