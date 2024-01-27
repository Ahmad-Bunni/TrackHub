"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Native
const client_1 = require("@prisma/client");
const path_1 = require("path");
const url_1 = require("url");
const prisma = new client_1.PrismaClient();
// Packages
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const electron_next_1 = __importDefault(require("electron-next"));
// Prepare the renderer once the app is ready
electron_1.app.on('ready', async () => {
    await (0, electron_next_1.default)('./renderer');
    const mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: (0, path_1.join)(__dirname, 'preload.js'),
        },
    });
    const url = electron_is_dev_1.default
        ? 'http://localhost:8000/'
        : (0, url_1.format)({
            pathname: (0, path_1.join)(__dirname, '../renderer/out/index.html'),
            protocol: 'file:',
            slashes: true,
        });
    mainWindow.loadURL(url);
});
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
// IPC Handlers
electron_1.ipcMain.on('add', async (event, item) => {
    await prisma.item.create({
        data: {
            name: item,
        },
    });
    // Use the shared function to get items
    const items = await getItems();
    event.sender.send('listed', items);
});
electron_1.ipcMain.on('list', async (event) => {
    // Use the shared function to get items
    const items = await getItems();
    event.sender.send('listed', items);
});
async function getItems() {
    return await prisma.item.findMany();
}
