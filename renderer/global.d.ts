interface SearchPayload {
  name?: string | null;
  date?: Date | number | string | null;
  tagId?: number | null;
}

declare global {
  interface Window {
    electron: {
      addItem: (payload: { name: string; tagIds?: number[]; search?: SearchPayload }) => Promise<any[]>;
      updateNote: (id: number, note?: string, search?: SearchPayload) => Promise<any[]>;
      removeItem: (id: number, search?: SearchPayload) => Promise<any[]>;
      searchItem: (name: string) => Promise<any[]>;
      listItems: () => Promise<any[]>;
      searchWithDate: (payload: SearchPayload) => Promise<any[]>;
      getAllTags: () => Promise<any[]>;
      createTag: (payload: { name: string; color: string }) => Promise<any[]>;
      updateItemTags: (id: number, tagIds: number[], search?: SearchPayload) => Promise<any[]>;
      deleteTag: (id: number, search?: SearchPayload) => Promise<{ tags: any[], items: any[] }>;
      logRendererError: (errorData: { message: string; stack: string }) => void;
      startListening: (handler: Function, name: string) => void;
      stopListening: (handler: Function, name: string) => void;
    };
  }
}

export {};
