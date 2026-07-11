"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electronAPI = {
    addItem: (payload) => electron_1.ipcRenderer.send('addItem', payload),
    updateNote: (id, note, search) => electron_1.ipcRenderer.send('update', id, note, search),
    removeItem: (id, search) => electron_1.ipcRenderer.send('remove', id, search),
    searchItem: (name) => electron_1.ipcRenderer.send('search', name),
    listItems: () => electron_1.ipcRenderer.send('list'),
    searchWithDate: (payload) => electron_1.ipcRenderer.send('searchWithDate', payload),
    getAllTags: () => electron_1.ipcRenderer.send('getAllTags'),
    createTag: (payload) => electron_1.ipcRenderer.send('createTag', payload),
    updateItemTags: (id, tagIds, search) => electron_1.ipcRenderer.send('updateItemTags', id, tagIds, search),
    deleteTag: (id, search) => electron_1.ipcRenderer.send('deleteTag', id, search),
    logRendererError: (errorData) => electron_1.ipcRenderer.send('rendererError', errorData),
    startListening: (handler, name) => electron_1.ipcRenderer.on(name, handler),
    stopListening: (handler, name) => electron_1.ipcRenderer.removeListener(name, handler),
};
electron_1.contextBridge.exposeInMainWorld('electron', electronAPI);
