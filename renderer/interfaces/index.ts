declare global {
  interface Window {
    electron: {
      addItem: (item: string) => void;
      searchItem: (item: string) => void;
      listItems: () => void;
      startListening: (handler: (event, args) => void, event: string) => void;
      stopListening: (handler: (event, args) => void, event: string) => void;
    };
  }
}

export {};
