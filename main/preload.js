"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electronAPI = {
    addItem: (payload) => electron_1.ipcRenderer.invoke('addItem', payload),
    updateNote: (id, note, search) => electron_1.ipcRenderer.invoke('update', id, note, search),
    removeItem: (id, search) => electron_1.ipcRenderer.invoke('remove', id, search),
    searchWithDate: (payload) => electron_1.ipcRenderer.invoke('searchWithDate', payload),
    getAllTags: () => electron_1.ipcRenderer.invoke('getAllTags'),
    createTag: (payload) => electron_1.ipcRenderer.invoke('createTag', payload),
    updateItemTags: (id, tagIds, search) => electron_1.ipcRenderer.invoke('updateItemTags', id, tagIds, search),
    deleteTag: (id, search) => electron_1.ipcRenderer.invoke('deleteTag', id, search),
    logRendererError: (errorData) => electron_1.ipcRenderer.send('rendererError', errorData),
};
electron_1.contextBridge.exposeInMainWorld('electron', electronAPI);
