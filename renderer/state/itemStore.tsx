import { ITEMS_PER_PAGE } from "@/lib/utils";
import { create } from "zustand";

interface ItemState {
  currentPage: number;
  name: string;
  note: string;
  filterDate: Date | null;
  filterTagId: number | null;
  setFilterDate: (date: Date | null) => void;
  setFilterTagId: (tagId: number | null) => void;
  clearFilter: () => void;
  setName: (name: string) => void;
  setNote: (note: string) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

export const useItemStore = create<ItemState>((set, get) => ({
  currentPage: 1,
  name: "",
  note: "",
  filterDate: null,
  filterTagId: null,
  setFilterDate: (date) => set({ filterDate: date }),
  setFilterTagId: (tagId) => set({ filterTagId: tagId }),
  clearFilter: () => set({ filterDate: null, filterTagId: null }),
  setName: (name) => set({ name }),
  setNote: (note) => set({ note }),
  goToNextPage: () =>
    set((s) => ({ currentPage: s.currentPage + 1 })),
  goToPrevPage: () =>
    set((s) => {
      if (s.currentPage <= 1) return { ...s };
      return { currentPage: s.currentPage - 1 };
    }),
}));
