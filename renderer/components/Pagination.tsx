import {
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Pagination as UIPagination,
} from '@/components/ui/pagination';

const Pagination = ({
  currentPage,
  totalPages,
  goToPreviousPage,
  goToNextPage,
}) => {
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
