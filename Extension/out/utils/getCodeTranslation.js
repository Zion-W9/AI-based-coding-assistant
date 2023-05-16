"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodeTranslation = void 0;
const axios_1 = require("axios");
const https = require("https");
const localconfig_1 = require("../localconfig");
const configures_1 = require("../param/configures");
function getCodeTranslation(prompt, src_lang, dst_lang) {
    const API_URL = `https://tianqi.aminer.cn/api/v2/multilingual_code_translate`;
    return new Promise((resolve, reject) => {
        let payload = {};
        payload = {
            prompt: prompt,
            n: 1,
            src_lang: src_lang,
            dst_lang: dst_lang,
            stop: [],
            userid: "",
            apikey: localconfig_1.apiKey,
            apisecret: localconfig_1.apiSecret,
            temperature: configures_1.temp,
            top_p: configures_1.topp,
            top_k: configures_1.topk,
        };
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        axios_1.default
            .post(API_URL, payload, { proxy: false, timeout: 120000 })
            .then((res) => {
            if (res?.data.status === 0) {
                let codeArray = res?.data.result.output.code;
                const translation = Array();
                for (let i = 0; i < codeArray.length; i++) {
                    const translationStr = codeArray[i]; //.trimStart()
                    let tmpstr = translationStr;
                    if (tmpstr.trim() === "")
                        continue;
                    translation.push(translationStr);
                }
                resolve({ translation });
            }
            else {
                console.log(res);
                reject("failed");
            }
        })
            .catch((err) => {
            reject(err);
        });
    });
}
exports.getCodeTranslation = getCodeTranslation;
//# sourceMappingURL=getCodeTranslation.js.map