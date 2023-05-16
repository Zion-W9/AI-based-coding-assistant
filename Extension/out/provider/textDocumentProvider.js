"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textDocumentProvider = void 0;
const vscode = require("vscode");
const https = require("https");
const codelensProvider_1 = require("./codelensProvider");
const configures_1 = require("../param/configures");
const constparams_1 = require("../param/constparams");
const commentCode_1 = require("../utils/commentCode");
const getDocumentLanguage_1 = require("../utils/getDocumentLanguage");
const getGPTCode_1 = require("../utils/getGPTCode");
const getCodeCompletions_1 = require("../utils/getCodeCompletions");
const localconfig_1 = require("../localconfig");
function textDocumentProvider(myStatusBarItem, g_isLoading) {
    const textDocumentProvider = new (class {
        async provideTextDocumentContent(uri) {
            const params = new URLSearchParams(uri.query);
            if (params.get("loading") === "true") {
                return `/* ${constparams_1.localeTag.generating} */\n`;
            }
            const mode = params.get("mode");
            if (mode === "translation") {
                let transResult = params.get("translation_res") || "";
                transResult = transResult
                    .replaceAll(constparams_1.addSignal, "+")
                    .replaceAll(constparams_1.andSignal, "&");
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage(constparams_1.localeTag.noEditorInfo);
                    return;
                }
                codelensProvider_1.codelensProvider.clearEls();
                let commandid = params.get("commandid") || "";
                let commentSignal = (0, commentCode_1.getCommentSignal)(editor.document.languageId);
                transResult = transResult
                    .replaceAll(constparams_1.hash, "#")
                    .replaceAll(constparams_1.comment, commentSignal.line || "#");
                codelensProvider_1.codelensProvider.addEl(0, transResult, commandid, "translation");
                return transResult;
            }
            else {
                let code_block = params.get("code_block") ?? "";
                try {
                    code_block = code_block
                        .replaceAll(constparams_1.hash, "#")
                        .replaceAll(constparams_1.addSignal, "+")
                        .replaceAll(constparams_1.andSignal, "&");
                    // 'lang': 'Python',
                    if (code_block.length > 1200) {
                        code_block = code_block.slice(code_block.length - 1200);
                    }
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        vscode.window.showInformationMessage(constparams_1.localeTag.noEditorInfo);
                        return;
                    }
                    let payload = {};
                    const num = configures_1.candidateNum;
                    let lang = (0, getDocumentLanguage_1.default)(editor);
                    if (lang.length == 0) {
                        payload = {
                            prompt: code_block,
                            n: num,
                            apikey: localconfig_1.apiKey,
                            apisecret: localconfig_1.apiSecret,
                        };
                    }
                    else {
                        payload = {
                            lang: lang,
                            prompt: code_block,
                            n: num,
                            apikey: localconfig_1.apiKey,
                            apisecret: localconfig_1.apiSecret,
                        };
                    }
                    // }
                    const agent = new https.Agent({
                        rejectUnauthorized: false,
                    });
                    const { commandid, completions } = await (0, getCodeCompletions_1.getCodeCompletions)(code_block, num, lang, localconfig_1.apiKey, localconfig_1.apiSecret, "interactive");
                    if (completions.length > 0) {
                        return (0, getGPTCode_1.getGPTCode)(completions, commandid, myStatusBarItem, g_isLoading);
                    }
                    else {
                        return constparams_1.localeTag.noResult;
                    }
                }
                catch (err) {
                    console.log("Error sending request", err);
                    return `${constparams_1.localeTag.sendingRequestErr}\n` + err;
                }
            }
        }
    })();
    return textDocumentProvider;
}
exports.textDocumentProvider = textDocumentProvider;
//# sourceMappingURL=textDocumentProvider.js.map