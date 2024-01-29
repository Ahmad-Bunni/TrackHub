import { Item } from '@prisma/client';
import { create } from 'zustand';

interface ItemState {
  currentItems: Item[];
  name: string;
  note: string;
  id: number;
  setName: (name: string) => void;
  setNote: (note: string) => void;
  setId: (id: number) => void;
  setCurrentItems: (currentItems: Item[]) => void;
}

export const useItemStore = create<ItemState>((set, get) => ({
  name: '',
  note: '',
  id: 0,
  currentItems: [],
  inputItem: undefined,
  selectedItem: undefined,

  setName: (name: string) => {
    if (!name.trim() && !get().name) {
      return;
    }

    set(() => ({ name }));
  },

  setNote: (note: string) => {
    set(() => ({ note }));
  },

  setId: (id?: number) => {
    set(() => ({ id }));
  },

  setCurrentItems: (currentItems: Item[]) => {
    set(() => ({ currentItems }));
  },
}));
