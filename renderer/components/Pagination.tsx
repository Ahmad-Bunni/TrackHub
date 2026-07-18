import { Button } from "@/components/ui/button";
import { ITEMS_PER_PAGE } from "@/lib/utils";
import { useItemStore } from "@/state";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

const Pagination = () => {
  const { currentPage, items, goToPrevPage, goToNextPage } = useItemStore();

  // ponytail: derived total pages, no store merge needed.
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="flex items-center justify-center gap-6 text-sm pt-3">
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage <= 1}
        onClick={goToPrevPage}
        className="h-8 w-8 cursor-pointer"
        aria-label="Go to previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      <span className="font-medium">{`${currentPage} of ${totalPages}`}</span>

      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={goToNextPage}
        className="h-8 w-8 cursor-pointer"
        aria-label="Go to next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
