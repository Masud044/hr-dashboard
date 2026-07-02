import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getPageNumbers } from "@/lib/constants/utils";
import { usePersistedPageSize } from "@/hooks/use-persisted-page-size";

export function DataTablePaginationTwo(
  {
    table,
    tableKey,
    pageSizeOptions = [10, 20, 30, 40, 50],
    minPageSize = 5,
    maxPageSize = 200,
    className,
  }
) {
  useEffect(() => {
    if (!tableKey) {
      console.warn(
        "DataTablePaginationTwo: pass a unique `tableKey` prop (e.g. \"projects\") so page size is persisted per table."
      );
    }
  }, [tableKey]);

  const [persistedPageSize, setPersistedPageSize] = usePersistedPageSize(
    tableKey ?? "default",
    table.getState().pagination.pageSize
  );

  // Apply the persisted size once when this table (or tableKey) mounts.
  useEffect(() => {
    table.setPageSize(persistedPageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableKey]);

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const currentPageSize = table.getState().pagination.pageSize;
  const [inputValue, setInputValue] = useState(String(currentPageSize));
  const [open, setOpen] = useState(false);

  // Keep the input in sync if page size changes from elsewhere (preset click, persisted load).
  useEffect(() => {
    setInputValue(String(currentPageSize));
  }, [currentPageSize]);

  const commitPageSize = (rawValue) => {
    const parsed = Number.parseInt(rawValue, 10);
    const clamped = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, minPageSize), maxPageSize)
      : currentPageSize;

    table.setPageSize(clamped);
    setPersistedPageSize(clamped);
    return clamped;
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setInputValue(String(commitPageSize(inputValue)));
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      setInputValue(String(currentPageSize));
      e.currentTarget.blur();
    }
  };

  const handleInputBlur = () => {
    setInputValue(String(commitPageSize(inputValue)));
  };

  const handlePresetSelect = (size) => {
    commitPageSize(size);
    setInputValue(String(size));
    setOpen(false);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-4 flex-wrap gap-4",
        className
      )}>
      {/* Left: Rows per page — type a value or pick a preset */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm">Rows per page</p>
        <Popover open={open} onOpenChange={setOpen}>
          <div
            className="flex h-8 items-center rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            <Input
              type="text"
              inputMode="numeric"
              aria-label="Rows per page"
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value.replace(/[^0-9]/g, ""))
              }
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              className="h-8 w-14 border-0 shadow-none focus-visible:ring-0"
            />
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Choose a preset page size"
                className="h-8 w-7 shrink-0 rounded-l-none border-l border-input">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent align="start" className="w-24 p-1">
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handlePresetSelect(size)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                  size === currentPageSize && "bg-accent/50"
                )}>
                {size}
                {size === currentPageSize && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Right: Pagination controls + page info */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-medium ml-2">
          Page {currentPage} of {totalPages || 1}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((pageNumber, index) => (
          <div key={`${pageNumber}-${index}`}>
            {pageNumber === "..." ? (
              <span className="px-2 text-sm text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(pageNumber - 1)}>
                {pageNumber}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}