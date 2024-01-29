import { contextBridge, ipcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/main';

contextBridge.exposeInMainWorld('electron', {
  addItem: (name: string) => ipcRenderer.send('add', name),
  removeItem: (id: number) => ipcRenderer.send('remove', id),
  searchItem: (name: string) => ipcRenderer.send('search', name),
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
