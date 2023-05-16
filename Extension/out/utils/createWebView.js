"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
let panel = undefined;
//To create web view in vscode
async function createWebView(context, content, view) {
    const columnToShowIn = vscode_1.window.activeTextEditor
        ? vscode_1.window.activeTextEditor.viewColumn
        : undefined;
    if (panel) {
        panel.reveal(columnToShowIn);
    }
    else {
        panel = vscode_1.window.createWebviewPanel("CodeGeeX.keys", "CodeGeeX Guide", { viewColumn: vscode_1.ViewColumn.Active, preserveFocus: false }, {
            retainContextWhenHidden: true,
            enableFindWidget: true,
            enableCommandUris: true,
            enableScripts: true,
        });
        panel.webview.html = `
<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0; min-width: 100%; min-height: 100%">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeGeeX Guide</title>
    </head>
    <body style="margin: 0; padding: 0; width: 100%; height: 100%">
        <div>
            <div>${content}</div>
        </div>
    </body>
</html>`;
        panel.onDidDispose(() => {
            panel = undefined;
        }, null, context.subscriptions);
    }
}
exports.default = createWebView;
//# sourceMappingURL=createWebView.js.map