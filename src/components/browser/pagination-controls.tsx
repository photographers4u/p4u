import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

export function BrowserPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const navLink = cn(
    buttonVariants({ variant: "ghost", size: "default" }),
    "gap-1 px-2.5",
  );
  const navDisabled = cn(navLink, "pointer-events-none opacity-50");
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div>
          {currentPage > 1 ? (
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              className={navLink}
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:block">Previous</span>
            </button>
          ) : (
            <span className={navDisabled} aria-disabled>
              <ChevronLeft className="size-4" />
              <span className="hidden sm:block">Previous</span>
            </span>
          )}
        </div>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${pages[index - 1]}-${pages[index + 1]}`}
              className="inline-flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={buttonVariants({
                variant: page === currentPage ? "outline" : "ghost",
                size: "icon",
              })}
            >
              {page}
            </button>
          ),
        )}

        <div>
          {currentPage < totalPages ? (
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              className={navLink}
            >
              <span className="hidden sm:block">Next</span>
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <span className={navDisabled} aria-disabled>
              <span className="hidden sm:block">Next</span>
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
