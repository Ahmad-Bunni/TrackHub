import { Item } from '@prisma/client';
import { useEffect, useState } from 'react';

const usePagination = (
  items: Item[],
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  itemsPerPage = 10,
  totalPages = Math.ceil(items.length / itemsPerPage)
) => {
  const [currentItems, setCurrentItems] = useState<Item[]>([]);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentItems(items.slice(indexOfFirstItem, indexOfLastItem));
  }, [items, currentPage, itemsPerPage]);

  const goToNextPage = () =>
    setCurrentPage((current: number) =>
      Math.min(current + 1, Math.ceil(items.length / itemsPerPage))
    );
  const goToPreviousPage = () =>
    setCurrentPage((current: number) => Math.max(1, current - 1));

  return {
    currentItems,
    itemsPerPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
  };
};

export default usePagination;
