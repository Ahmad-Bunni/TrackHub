interface SearchPayload {
  name?: string | null;
  date?: Date | number | string | null;
  tagId?: number | null;
}

declare global {
  interface Window {
    electron: {
      addItem: (payload: { name: string; tagIds?: number[]; search?: SearchPayload }) => void;
      updateNote: (id: number, note?: string, search?: SearchPayload) => void;
      removeItem: (id: number, search?: SearchPayload) => void;
      searchItem: (name: string) => void;
      listItems: () => void;
      searchWithDate: (payload: SearchPayload) => void;
      getAllTags: () => void;
      createTag: (payload: { name: string; color: string }) => void;
      updateItemTags: (id: number, tagIds: number[], search?: SearchPayload) => void;
      deleteTag: (id: number, search?: SearchPayload) => void;
      logRendererError: (errorData: { message: string; stack: string }) => void;
      startListening: (handler: Function, name: string) => void;
      stopListening: (handler: Function, name: string) => void;
    };
  }
}

export {};
