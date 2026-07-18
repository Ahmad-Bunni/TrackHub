"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electronAPI = {
    addItem: (payload) => electron_1.ipcRenderer.invoke('addItem', payload),
    updateNote: (id, note, search) => electron_1.ipcRenderer.invoke('update', id, note, search),
    removeItem: (id, search) => electron_1.ipcRenderer.invoke('remove', id, search),
    searchItem: (name) => electron_1.ipcRenderer.invoke('search', name),
    listItems: () => electron_1.ipcRenderer.invoke('list'),
    searchWithDate: (payload) => electron_1.ipcRenderer.invoke('searchWithDate', payload),
    getAllTags: () => electron_1.ipcRenderer.invoke('getAllTags'),
    createTag: (payload) => electron_1.ipcRenderer.invoke('createTag', payload),
    updateItemTags: (id, tagIds, search) => electron_1.ipcRenderer.invoke('updateItemTags', id, tagIds, search),
    deleteTag: (id, search) => electron_1.ipcRenderer.invoke('deleteTag', id, search),
    logRendererError: (errorData) => electron_1.ipcRenderer.send('rendererError', errorData),
    startListening: (handler, name) => electron_1.ipcRenderer.on(name, handler),
    stopListening: (handler, name) => electron_1.ipcRenderer.removeListener(name, handler),
};
electron_1.contextBridge.exposeInMainWorld('electron', electronAPI);
