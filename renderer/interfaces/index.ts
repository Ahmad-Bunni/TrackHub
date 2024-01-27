declare global {
  interface Window {
    electron: {
      addItem: (item: string) => void;
      listItems: () => void;
      itemsListed: (handler: (event, args) => void) => void;
      stopListening: (handler: (event, args) => void) => void;
    };
  }
}

export {};
