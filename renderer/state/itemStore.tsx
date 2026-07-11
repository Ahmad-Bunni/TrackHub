import type { Item, Tag } from "@prisma/client";
import { create } from "zustand";

const ITEMS_PER_PAGE = 10;

interface ItemState {
  items: Item[];
  currentPage: number;
  name: string;
  note: string;
  filterDate: Date | null;
  filterTagId: number | null;
  tags: Tag[];
  setFilterDate: (date: Date | null) => void;
  setFilterTagId: (tagId: number | null) => void;
  clearFilter: () => void;
  setCurrentItems: (items: Item[]) => void;
  setName: (name: string) => void;
  setNote: (note: string) => void;
  setTags: (tags: Tag[]) => void;
  getAllTags: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  currentPage: 1,
  name: "",
  note: "",
  filterDate: null,
  filterTagId: null,
  tags: [],
  setFilterDate: (date) => set({ filterDate: date }),
  setFilterTagId: (tagId) => set({ filterTagId: tagId }),
  clearFilter: () => set({ filterDate: null, filterTagId: null }),
  setCurrentItems: (items) => set((s) => {
    let currentPage = s.currentPage;

    if (items.length < s.items.length) {
      const totalPages = items.length ? Math.ceil(items.length / ITEMS_PER_PAGE) : 1;
      currentPage = Math.min(currentPage, totalPages);
    } else if (items.length > s.items.length) {
      currentPage = 1;
    }

    return { items, currentPage: currentPage < 1 ? 1 : currentPage };
  }),
  setName: (name) => set({ name }),
  setNote: (note) => set({ note }),
  setTags: (tags) => set({ tags }),
  getAllTags: () => { (window as any).electron.getAllTags(); },
  goToNextPage: () => set((s) => {
    if (s.items.length === 0 || s.currentPage >= Math.ceil(s.items.length / ITEMS_PER_PAGE)) return { ...s };
    return { currentPage: s.currentPage + 1 };
  }),
  goToPrevPage: () => set((s) => {
    if (s.currentPage <= 1) return { ...s };
    return { currentPage: s.currentPage - 1 };
  }),
}));
