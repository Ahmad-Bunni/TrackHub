"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    addItem: (name) => electron_1.ipcRenderer.send('add', name),
    removeItem: (id) => electron_1.ipcRenderer.send('remove', id),
    searchItem: (name) => electron_1.ipcRenderer.send('search', name),
    listItems: () => electron_1.ipcRenderer.send('list'),
    startListening: (handler, name) => electron_1.ipcRenderer.on(name, handler),
    stopListening: (handler, name) => electron_1.ipcRenderer.removeListener(name, handler),
});
