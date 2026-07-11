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
// Application handlers
require("./ipc-handlers");
// Create the main window
electron_1.app.on('ready', async () => {
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
        ? 'http://localhost:5173/' // Vite dev server
        : `file://${(0, path_1.join)(__dirname, '../renderer/out/index.html')}` // prod
    );
});
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
