"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    addItem: (item) => electron_1.ipcRenderer.send('add', item),
    listItems: () => electron_1.ipcRenderer.send('list'),
    itemsListed: (handler) => electron_1.ipcRenderer.on('listed', handler),
    stopListening: (handler) => electron_1.ipcRenderer.removeListener('listed', handler),
});
