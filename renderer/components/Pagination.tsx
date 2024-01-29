import {
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Pagination as UIPagination,
} from '@/components/ui/pagination';
import { usePaginationStore } from '@/renderer/state';

const Pagination = () => {
  const { currentPage, totalPages, goToPreviousPage, goToNextPage } =
    usePaginationStore();

  return (
    <UIPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className="cursor-pointer"
            onClick={goToPreviousPage}
          />
        </PaginationItem>
        <PaginationItem>{`${currentPage} of ${totalPages}`}</PaginationItem>
        <PaginationItem>
          <PaginationNext className="cursor-pointer" onClick={goToNextPage} />
        </PaginationItem>
      </PaginationContent>
    </UIPagination>
  );
};

export default Pagination;
