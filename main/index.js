"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const ipc_handlers_1 = require("./ipc-handlers");
electron_1.app.on('ready', async () => {
    (0, ipc_handlers_1.initDatabase)();
    const mainWindow = new electron_1.BrowserWindow({
        fullscreenable: false,
        width: 1024,
        height: 768,
        autoHideMenuBar: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: (0, path_1.join)(__dirname, 'preload.js'),
        },
    });
    if (electron_is_dev_1.default) {
        await mainWindow.loadURL('http://localhost:5173/');
    }
    else {
        // loadFile handles Windows paths; Vite base './' makes assets resolve next to index.html
        await mainWindow.loadFile((0, path_1.join)(__dirname, '../renderer/out/index.html'));
    }
});
electron_1.app.on('window-all-closed', electron_1.app.quit);
