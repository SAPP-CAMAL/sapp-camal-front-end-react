"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetaPagination } from "@/features/people/domain";

interface PaginationFooterProps {
  meta?: MetaPagination & {
    onChangePage?: (page: number) => void;
    setSearchParams?: (params: Record<string, any>) => void;
  };
  isLoading?: boolean;
  hasData: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  disabledPreviousPage: boolean;
  disabledNextPage: boolean;
  itemsPerPageOptions?: number[];
  itemLabel?: string;
}

export function PaginationFooter({
  meta,
  isLoading,
  hasData,
  onPreviousPage,
  onNextPage,
  disabledPreviousPage,
  disabledNextPage,
  itemsPerPageOptions = [5, 10, 25, 50, 100],
  itemLabel = "registros",
}: PaginationFooterProps) {
  const currentPage = meta?.currentPage ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const itemsPerPage = meta?.itemsPerPage ?? 0;

  let start = (currentPage - 1) * itemsPerPage + 1;

  if (isLoading || !hasData) start = 0;

  const end = (currentPage - 1) * itemsPerPage + (meta?.itemCount ?? 0);

  const goToPage = (page: number) => meta?.onChangePage?.(page);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 px-2 sm:px-4 pb-3 border-t border-gray-200">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Mostrando {start} a {Math.min(end, meta?.totalItems ?? 0)} de{" "}
          {meta?.totalItems ?? 0} {itemLabel}
        </p>
        {meta?.setSearchParams && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select
              value={itemsPerPage ? itemsPerPage.toString() : undefined}
              onValueChange={(value) =>
                meta.setSearchParams?.({ limit: Number(value), page: 1 })
              }
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-x-1.5 flex-wrap">
          <Button
            disabled={disabledPreviousPage}
            onClick={onPreviousPage}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            Anterior
          </Button>

          {currentPage > 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => goToPage(1)}
              >
                1
              </Button>
              {currentPage > 4 && (
                <span className="px-1 text-xs text-muted-foreground">...</span>
              )}
            </>
          )}

          {Array.from({ length: totalPages }, (_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = pageNumber === currentPage;

            const shouldShow =
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

            if (!shouldShow) return null;

            return (
              <Button
                key={pageNumber}
                variant="outline"
                size="sm"
                className={`h-8 w-8 p-0 text-xs ${
                  isCurrentPage
                    ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white border-teal-600"
                    : ""
                }`}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}

          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="px-1 text-xs text-muted-foreground">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={disabledNextPage}
            onClick={onNextPage}
            className="h-8 text-xs"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
