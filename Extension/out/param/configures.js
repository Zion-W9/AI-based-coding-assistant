"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controls = exports.onlyKeyControl = exports.templates = exports.completionDelay = exports.acceptedsurvey = exports.enableExtension = exports.translationInsertMode = exports.needGuide = exports.candidateNum = exports.topp = exports.topk = exports.temp = exports.disabledLangs = exports.disabledFor = exports.generationPreference = void 0;
const vscode_1 = require("vscode");
const configuration = vscode_1.workspace.getConfiguration("Codegeex", undefined);
exports.generationPreference = configuration.get("GenerationPreference");
exports.disabledFor = configuration.get("DisabledFor", new Object());
const disabledLangs = () => {
    const disabledFor = configuration.get("DisabledFor", new Object());
    let disabledLangs = [];
    const keys = Object.keys(disabledFor);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (disabledFor[key] === true ||
            disabledFor[key] === "true") {
            disabledLangs.push(key);
        }
    }
    return disabledLangs;
};
exports.disabledLangs = disabledLangs;
const defaultConfig = {
    temp: 0.8,
    topp: 0.95,
    topk: 0,
};
const modelConfig = configuration.get("DecodingStrategies", defaultConfig);
exports.temp = modelConfig.temp;
exports.topk = modelConfig.topk;
exports.topp = modelConfig.topp;
//get number of candidates
const candidateNum_str = String(configuration.get("CandidateNum", "1"));
exports.candidateNum = parseInt(candidateNum_str);
exports.needGuide = configuration.get("NeedGuide");
exports.translationInsertMode = configuration.get("Translation");
exports.enableExtension = configuration.get("EnableExtension", true);
exports.acceptedsurvey = configuration.get("Survey", null);
exports.completionDelay = configuration.get("CompletionDelay", 0.5);
exports.templates = configuration.get("PromptTemplates(Experimental)", {});
exports.onlyKeyControl = configuration.get("OnlyKeyControl");
exports.controls = {
    interactiveMode: {
        mac: "Control + Enter",
        win: "Ctrl + Enter",
    },
    promptMode: {
        mac: "Option + T",
        win: "Ctrl + T",
    },
    translationMode: {
        mac: "Option + Control + T",
        win: "Alt + Ctrl + T",
    },
    nextSuggestion: {
        mac: "Option + ]",
        win: "Alt + ]",
    },
    previousSuggestion: {
        mac: "Option + [",
        win: "Alt + [",
    },
    newSuggestion: {
        mac: "Option + N",
        win: "Alt + N",
    },
};
//# sourceMappingURL=configures.js.map