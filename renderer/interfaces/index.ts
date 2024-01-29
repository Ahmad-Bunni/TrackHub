declare global {
  interface Window {
    electron: {
      addItem: (name: string) => void;
      removeItem: (id: number) => void;
      searchItem: (name: string) => void;
      listItems: () => void;
      startListening: (handler: (event, args) => void, event: string) => void;
      stopListening: (handler: (event, args) => void, event: string) => void;
    };
  }
}

export {};
