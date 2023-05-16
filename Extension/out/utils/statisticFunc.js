"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalRequestNum = exports.getEndData = exports.getStartData = exports.getOpenExtensionData = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
const os = require("os");
const constparams_1 = require("../param/constparams");
const privacy = vscode.workspace.getConfiguration("Codegeex").get("Privacy");
function getOpenExtensionData() {
    return new Promise((resolve, reject) => {
        try {
            axios_1.default
                .post(`${constparams_1.apiHerf}/tracking/insertVscodeStartRecord`, {
                vscodeMachineId: vscode.env.machineId,
                vscodeSessionId: vscode.env.sessionId,
                platformVersion: os.release(),
                systemOs: os.type(),
                extensionId: constparams_1.extensionId,
                extensionVersion: constparams_1.extensionVersion,
                nodeArch: os.arch(),
                isNewAppInstall: vscode.env.isNewAppInstall,
                vscodeVersion: vscode.version,
                product: vscode.env.appHost,
                uikind: vscode.env.uiKind,
                remoteName: vscode.env.remoteName,
            }, { proxy: false })
                .then((res) => {
                console.log("写入开机信息", res);
                resolve(res.data.msg);
            })
                .catch((err) => {
                reject("error");
            });
        }
        catch (e) {
            reject("error");
        }
    });
}
exports.getOpenExtensionData = getOpenExtensionData;
function getStartData(inputText, prompt, lang, mode) {
    return new Promise((resolve, reject) => {
        const startParam = {
            vscodeMachineId: vscode.env.machineId,
            vscodeSessionId: vscode.env.sessionId,
            requestPhase: "start",
            inputContent: privacy ? inputText : null,
            prompt: privacy ? prompt : null,
            lang: lang,
            mode: mode ? mode : null,
            extensionId: constparams_1.extensionId,
            extensionVersion: constparams_1.extensionVersion,
        };
        try {
            axios_1.default
                .post(`${constparams_1.apiHerf}/tracking/vsCodeOperationRecord`, startParam, {
                proxy: false,
                timeout: 1000,
            })
                .then((res) => {
                console.log("开始请求测试", res);
                let commandid = res.data.data.id || "";
                resolve(commandid);
            })
                .catch((err) => {
                reject("error");
            });
        }
        catch (err) {
            reject("");
        }
    });
}
exports.getStartData = getStartData;
function getEndData(commandid, message, isAdopted, acceptItem, completions) {
    return new Promise((resolve, reject) => {
        if (commandid === "") {
            reject("No command id");
        }
        let endparam = {
            id: commandid,
            requestPhase: "end",
            outputContent: privacy ? acceptItem : null,
            modelStatus: -1,
            message: message,
            num: privacy ? completions?.length : 0,
            numContent: privacy ? completions?.toString() : null,
            whetherAdopt: isAdopted,
            extensionId: constparams_1.extensionId,
            extensionVersion: constparams_1.extensionVersion,
        };
        try {
            axios_1.default
                .post(`${constparams_1.apiHerf}/tracking/vsCodeOperationRecord`, endparam, {
                proxy: false,
                timeout: 1000,
            })
                .then((res) => {
                console.log("测试结束埋点", res);
                resolve("");
            })
                .catch((e) => {
                console.log("结束埋点错误", e);
                reject("error");
            });
        }
        catch (e) {
            reject("error");
        }
    });
}
exports.getEndData = getEndData;
function getTotalRequestNum() {
    return new Promise((resolve, reject) => {
        try {
            axios_1.default
                .get(`${constparams_1.apiHerf}/tracking/selectByVscodeMachineIdTotal?vscodeMachineId=${vscode.env.machineId}`, { proxy: false })
                .then((res) => {
                console.log("获取总请求数", res);
                if (res.data.code === 200 && res.data.data) {
                    resolve(res.data.data);
                }
                else {
                    reject("error");
                }
            });
        }
        catch (e) {
            console.log(e);
            reject("error");
        }
    });
}
exports.getTotalRequestNum = getTotalRequestNum;
//# sourceMappingURL=statisticFunc.js.map