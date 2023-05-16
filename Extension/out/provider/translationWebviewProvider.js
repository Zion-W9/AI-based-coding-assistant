"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
//import { codegeexCodeTranslation } from "../utils/codegeexCodeTranslation";
const getCodeTranslation_1 = require("../utils/getCodeTranslation");
const getDocumentLangId_1 = require("../utils/getDocumentLangId");
const getDocumentLanguage_1 = require("../utils/getDocumentLanguage");
const getUri_1 = require("../utils/getUri");
const statisticFunc_1 = require("../utils/statisticFunc");
class translationWebviewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        // Allow scripts in the webview
        webviewView.webview.options = {
            enableScripts: true,
        };
        // Set the HTML content that will fill the webview view
        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);
        // Sets up an event listener to listen for messages passed from the webview view context
        // and executes code based on the message that is recieved
        this._setWebviewMessageListener(webviewView);
    }
    _getWebviewContent(webview, extensionUri) {
        const toolkitUri = (0, getUri_1.default)(webview, extensionUri, [
            "node_modules",
            "@vscode",
            "webview-ui-toolkit",
            "dist",
            "toolkit.js",
        ]);
        const mainUri = (0, getUri_1.default)(webview, extensionUri, [
            "webview-ui",
            "main.js",
        ]);
        const stylesUri = (0, getUri_1.default)(webview, extensionUri, [
            "webview-ui",
            "styles.css",
        ]);
        const copysvg = (0, getUri_1.default)(webview, extensionUri, [
            "webview-ui",
            "copy.svg",
        ]);
        const insertsvg = (0, getUri_1.default)(webview, extensionUri, [
            "webview-ui",
            "insert.svg",
        ]);
        const editor = vscode_1.window.activeTextEditor;
        let defaultDstLang;
        if (editor) {
            defaultDstLang = (0, getDocumentLanguage_1.default)(editor);
        }
        else {
            defaultDstLang = "C";
        }
        vscode_1.window.onDidChangeActiveTextEditor(() => {
            const editor = vscode_1.window.activeTextEditor;
            let defaultDstLang;
            if (editor) {
                defaultDstLang = (0, getDocumentLanguage_1.default)(editor);
            }
            else {
                defaultDstLang = "C";
            }
            webview.postMessage({
                command: "code.changeDstLang",
                dstLang: defaultDstLang,
            });
        });
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script type="module" src="${toolkitUri}"></script>
                <script type="module" src="${mainUri}"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/agate.min.css">
                <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js"></script>
                <script>
                    hljs.highlightAll();                   
                </script>
                <link rel="stylesheet" href="${stylesUri}" />
                <title>Input Code</title>
            </head>
            <body>
                <table>
                    <tr>
                        <th class="title">Input Code</th>
                    </tr>
                </table>
                <section>
                    <textarea cols="60" rows="15" id="original"></textarea>
                </section>
                
                <table border="0" style="vertical-align: middle">
                    <tr>
                        <td>From:</td>
                        <td>
                            <vscode-dropdown id="srcLang">
                                <vscode-option value="C">C</vscode-option>
                                <vscode-option value="C++">C++</vscode-option>
                                <vscode-option value="C#">C#</vscode-option>
                                <vscode-option value="TypeScript"
                                    >TypeScript</vscode-option
                                >
                                <vscode-option value="JavaScript"
                                    >JavaScript</vscode-option
                                >
                                <vscode-option value="Go">Go</vscode-option>
                                <vscode-option value="Python">Python</vscode-option>
                                <vscode-option value="PHP">PHP</vscode-option>
                                <vscode-option value="HTML">HTML</vscode-option>
                                <vscode-option value="TeX">TeX</vscode-option>
                                <vscode-option value="Java">Java</vscode-option>
                                <vscode-option value="Objective-C++"
                                    >Objective-C++</vscode-option
                                >
                                <vscode-option value="Objective-C"
                                    >Objective-C</vscode-option
                                >
                                <vscode-option value="Cuda">Cuda</vscode-option>
                                <vscode-option value="SQL">SQL</vscode-option>
                                <vscode-option value="Rust">Rust</vscode-option>
                                <vscode-option value="Shell">Shell</vscode-option>
                                <vscode-option value="CSS">CSS</vscode-option>
                                <vscode-option value="R">R</vscode-option>
                            </vscode-dropdown>
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>To:</td>
                        <td>
                            <vscode-dropdown id="dstLang" value="${defaultDstLang}">
                                <vscode-option value="C++">C++</vscode-option>
                                <vscode-option value="C#">C#</vscode-option>
                                <vscode-option value="TypeScript"
                                    >TypeScript</vscode-option
                                >
                                <vscode-option value="JavaScript"
                                    >JavaScript</vscode-option
                                >
                                <vscode-option value="Go">Go</vscode-option>
                                <vscode-option value="Python">Python</vscode-option>
                                <vscode-option value="PHP">PHP</vscode-option>
                                <vscode-option value="Java">Java</vscode-option>
                            </vscode-dropdown>
                        </td>
                        <td>
                            <vscode-button id="translate-button"
                                >translate</vscode-button
                            >
                        </td>
                    </tr>
                </table>
                <table>
                    <tr>
                        <th class="title">Output Code</th>
                        
                        <th>
                            <vscode-button id="insert-button"
                                ><img
                                    src="${insertsvg}"
                                    alt=""
                                    height="10px"
                                    class="img"
                                /><span style="font-size: 10px"
                                    >Insert</span
                                ></vscode-button
                            >
                        </th>
                    </tr>
                </table>
                <section class="highlight">
                    <pre>
                    <code id='test'>
Here is the code translated from the input
                    </code>
                    </pre>
                    <script>
                        function highlight(){
                            hljs.highlightElement(document.getElementById("test"));
                        }
                    </script>
                </section>
            </body>
        </html>
        `;
    }
    _setWebviewMessageListener(webviewView) {
        let commandid = "";
        webviewView.webview.onDidReceiveMessage(async (message) => {
            const command = message.command;
            switch (command) {
                case "code.translate":
                    const original = message.original;
                    const srcLang = message.srcLang;
                    const dstLang = message.dstLang;
                    let result;
                    try {
                        result = await (0, getCodeTranslation_1.getCodeTranslation)(original, srcLang, dstLang);
                        //await codegeexCodeTranslation(dstLang,result.translation[0],'')
                    }
                    catch (err) {
                        console.log(err);
                        result = {
                            translation: [],
                        };
                    }
                    try {
                        commandid = await (0, statisticFunc_1.getStartData)(original, original, `${srcLang}->${dstLang}`, "translation");
                    }
                    catch (err) {
                        console.log(err);
                        commandid = "";
                    }
                    webviewView.webview.postMessage({
                        command: "code.translate",
                        payload: result.translation[0],
                        lang: (0, getDocumentLangId_1.default)(dstLang),
                        commandid: commandid,
                    });
                    break;
                case "code.insert":
                    const editor = vscode_1.window.activeTextEditor;
                    if (!editor) {
                        break;
                    }
                    editor.edit(async (editBuilder) => {
                        var s = editor.selection;
                        editBuilder.replace(s, message.result);
                    });
                    if (commandid.length > 0) {
                        await (0, statisticFunc_1.getEndData)(commandid, "", "Yes", message.result);
                    }
                    break;
                case "code.translate.inputError":
                    vscode_1.window.showInformationMessage("Please input some code to start translating");
                    break;
            }
        });
    }
}
exports.default = translationWebviewProvider;
//# sourceMappingURL=translationWebviewProvider.js.map