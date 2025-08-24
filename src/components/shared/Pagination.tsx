import React from "react";
// Import Heroicons (outline version)
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      end = Math.min(maxPagesToShow - 1, totalPages - 1);
    }

    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - (maxPagesToShow - 2));
    }

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1 my-8">
      {/* Previous Page Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-md flex items-center justify-center ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span className="px-3 py-1">...</span>
          ) : (
            <button
              onClick={() => typeof page === "number" && onPageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Page Button */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md flex items-center justify-center ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
