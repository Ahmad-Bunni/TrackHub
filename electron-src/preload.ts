import { contextBridge, ipcRenderer } from 'electron';

declare global {
  interface Window {
    electron: typeof electronAPI;
  }
}

export interface SearchPayload {
  name?: string | null;
  date?: Date | number | string | null;
  tagId?: number | null;
}

const electronAPI = {
  addItem: (payload: { name: string; tagIds?: number[]; search?: SearchPayload }) =>
    ipcRenderer.send('addItem', payload),
  updateNote: (id: number, note?: string, search?: SearchPayload) =>
    ipcRenderer.send('update', id, note, search),
  removeItem: (id: number, search?: SearchPayload) => ipcRenderer.send('remove', id, search),
  searchItem: (name: string) => ipcRenderer.send('search', name),
  listItems: () => ipcRenderer.send('list'),
  searchWithDate: (payload: SearchPayload) => ipcRenderer.send('searchWithDate', payload),
  getAllTags: () => ipcRenderer.send('getAllTags'),
  createTag: (payload: { name: string; color: string }) => ipcRenderer.send('createTag', payload),
  updateItemTags: (id: number, tagIds: number[], search?: SearchPayload) =>
    ipcRenderer.send('updateItemTags', id, tagIds, search),
  deleteTag: (id: number, search?: SearchPayload) => ipcRenderer.send('deleteTag', id, search),
  logRendererError: (errorData: { message: string; stack: string }) => ipcRenderer.send('rendererError', errorData),
  startListening: (
    handler: (event: import('electron').IpcRendererEvent, ...args: any[]) => void,
    name: string,
  ) => ipcRenderer.on(name, handler),
  stopListening: (
    handler: (event: import('electron').IpcRendererEvent, ...args: any[]) => void,
    name: string,
  ) => ipcRenderer.removeListener(name, handler),
};

contextBridge.exposeInMainWorld('electron', electronAPI);
