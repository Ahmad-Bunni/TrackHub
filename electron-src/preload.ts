import { contextBridge, ipcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/main';

contextBridge.exposeInMainWorld('electron', {
  addItem: (item: string) => ipcRenderer.send('add', item),
  listItems: () => ipcRenderer.send('list'),
  itemsListed: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on('listed', handler),
  stopListening: (handler: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.removeListener('listed', handler),
});
