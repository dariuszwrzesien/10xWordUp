import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface WordsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function WordsPagination({ currentPage, totalPages, onPageChange }: WordsPaginationProps) {
  // Don't show pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const handlePreviousClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onPageChange(page);
  };

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 7; // Show at most 7 page buttons

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range if we're near the start or end
      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 4, 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("ellipsis");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="mt-6" data-testid="words-pagination">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePreviousClick}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            data-testid="pagination-previous"
          />
        </PaginationItem>

        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={handlePageClick(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
                data-testid={`pagination-page-${page}`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNextClick}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            data-testid="pagination-next"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
