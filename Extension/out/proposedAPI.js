"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const vscode = require("vscode");
const path = require("path");
const os = require("os");
const messages_1 = require("./messages");
const EXTENSION_ID = "Aminer.cogcode";
const ARGV_FILE_NAME = "argv.json";
const PRODUCT_FILE_NAME = "product.json";
const PRODUCT_FILE_PATH = path.join(vscode.env.appRoot, PRODUCT_FILE_NAME);
const ENABLE_PROPOSED_API = [
    "",
    `	"enable-proposed-api": ["${EXTENSION_ID}"]`,
    "}",
];
async function enableProposed() {
    return handleProposed().catch((error) => {
        console.error("failed to enable proposedAPI", error);
        return false;
    });
}
exports.default = enableProposed;
async function getDataFolderName() {
    const data = await fs_1.promises.readFile(PRODUCT_FILE_PATH);
    const file = JSON.parse(data.toString("utf8"));
    return file?.dataFolderName;
}
function getArgvResource(dataFolderName) {
    const vscodePortable = process.env.VSCODE_PORTABLE;
    if (vscodePortable) {
        return path.join(vscodePortable, ARGV_FILE_NAME);
    }
    return path.join(os.homedir(), dataFolderName, ARGV_FILE_NAME);
}
async function handleProposed() {
    const dataFolderName = await getDataFolderName();
    if (dataFolderName) {
        const argvResource = getArgvResource(dataFolderName);
        const argvString = (await fs_1.promises.readFile(argvResource)).toString();
        if (argvString.includes(`${EXTENSION_ID}`)) {
            return true;
        }
        const modifiedArgvString = modifyArgvFileContent(argvString);
        await fs_1.promises.writeFile(argvResource, Buffer.from(modifiedArgvString));
        askForReload();
    }
    return false;
}
function askForReload() {
    void (0, messages_1.default)({
        messageId: "inline-update",
        messageText: `Please reload the window for the CogCode inline completions to take effect.`,
        buttonText: "Reload",
        action: () => void vscode.commands.executeCommand("workbench.action.reloadWindow"),
    });
}
function modifyArgvFileContent(argvString) {
    return argvString
        .substring(0, argvString.length - 2)
        .concat(",\n", ENABLE_PROPOSED_API.join("\n"));
}
//# sourceMappingURL=proposedAPI.js.map