import { Item } from '@prisma/client';
import { create } from 'zustand';
import { useItemStore } from '.';

interface PaginationStore {
  items: Item[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setItems: (items: Item[]) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export const usePaginationStore = create<PaginationStore>((set, get) => ({
  items: [],
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 0,
  currentItems: [],

  setItems: (items: Item[]) => {
    const totalPages = Math.max(
      1,
      Math.ceil(items.length / get().itemsPerPage)
    );

    set(() => ({ items, totalPages, currentPage: totalPages }));
  },

  setTotalPages: (totalPages: number) => {
    set({ totalPages });
  },

  goToNextPage: () => {
    const { currentPage, totalPages } = get();
    set(() => ({ currentPage: Math.min(currentPage + 1, totalPages) }));
  },

  goToPreviousPage: () => {
    const { currentPage } = get();
    set(() => ({ currentPage: Math.max(1, currentPage - 1) }));
  },
}));

usePaginationStore.subscribe((state) => {
  const { items, currentPage, itemsPerPage } = state;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  useItemStore.getState().setCurrentItems(currentItems);
});
