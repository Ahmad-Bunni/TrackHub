"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Node.js modules
const path_1 = require("path");
// Electron modules
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const electron_next_1 = __importDefault(require("electron-next"));
// Application handlers
require("./ipc-handlers");
// Application Menu
require("./menu");
// Prepare the renderer once the app is ready
electron_1.app.on('ready', async () => {
    await (0, electron_next_1.default)('./renderer');
    const mainWindow = new electron_1.BrowserWindow({
        fullscreenable: false,
        width: 1024,
        height: 768,
        icon: 'resources/hub.ico',
        autoHideMenuBar: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: (0, path_1.join)(__dirname, 'preload.js'),
        },
    });
    mainWindow.loadURL(electron_is_dev_1.default
        ? 'http://localhost:8000/' // dev
        : `file://${(0, path_1.join)(__dirname, '../renderer/out/index.html')}` //prod
    );
});
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
