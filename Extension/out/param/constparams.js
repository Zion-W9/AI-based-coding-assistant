"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localeTag = exports.surveyUrl = exports.locale = exports.hash = exports.andSignal = exports.addSignal = exports.comment = exports.languageList = exports.apiHerf = exports.myScheme = exports.extensionVersion = exports.extensionId = void 0;
const localconfig_1 = require("../localconfig");
const vscode = require("vscode");
const localeCN_1 = require("../locales/localeCN");
const localeEN_1 = require("../locales/localeEN");
exports.extensionId = "aminer.codegeex";
exports.extensionVersion = "1.1.2";
exports.myScheme = "codegeex";
//api to do the statistics of data
exports.apiHerf = localconfig_1.statApiHerf;
//language accepted by the model
exports.languageList = [
    "C++",
    "C",
    "C#",
    "Cuda",
    "Objective-C",
    "Objective-C++",
    "Python",
    "Java",
    "TeX",
    "HTML",
    "PHP",
    "JavaScript",
    "TypeScript",
    "Go",
    "Shell",
    "Rust",
    "CSS",
    "SQL",
    "R",
];
//const to replace specfic characters
exports.comment = "<|comment|>";
exports.addSignal = "<|add|>";
exports.andSignal = "<|and|>";
exports.hash = "<|hash|>";
//locale language
exports.locale = vscode.env.language;
exports.surveyUrl = exports.locale === "zh-cn" ? localconfig_1.surveyUrlCN : localconfig_1.surveyUrlEN;
exports.localeTag = exports.locale === "zh-cn" ? localeCN_1.localeCN : localeEN_1.localeEN;
//# sourceMappingURL=constparams.js.map