import { contextBridge, ipcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/main';

contextBridge.exposeInMainWorld('electron', {
  addItem: (item: string) => ipcRenderer.send('add', item),
  searchItem: (item: string) => ipcRenderer.send('search', item),
  listItems: () => ipcRenderer.send('list'),

  startListening: (
    handler: (event: IpcRendererEvent, ...args: any[]) => void,
    name: string
  ) => ipcRenderer.on(name, handler),
  stopListening: (
    handler: (event: IpcRendererEvent, ...args: any[]) => void,
    name: string
  ) => ipcRenderer.removeListener(name, handler),
});
