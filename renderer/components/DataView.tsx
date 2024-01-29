import { useState } from 'react';
import usePagination from '../hooks/usePagination';
import ListTable from './ListTable';
import Pagination from './Pagination';

const DataView = ({ items }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { currentItems, totalPages, goToNextPage, goToPreviousPage } =
    usePagination(items, currentPage, setCurrentPage);

  return (
    <div>
      <ListTable currentItems={currentItems} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
      />
    </div>
  );
};

export default DataView;
