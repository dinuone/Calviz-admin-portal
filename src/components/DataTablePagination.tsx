"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTablePaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  loading?: boolean;
  className?: string;
}

export function DataTablePagination({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = "items",
  loading = false,
  className = "",
}: DataTablePaginationProps) {
  // If no items at all, show simple indicator
  if (totalCount === 0) {
    return (
      <div
        className={`p-4 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400 bg-slate-900/60 ${className}`}
      >
        <span>No {itemLabel} found</span>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Per page:</span>
            <select
              aria-label={`Rows per page for ${itemLabel}`}
              value={pageSize}
              disabled={loading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-white font-mono"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  const fromIndex = (pageNumber - 1) * pageSize + 1;
  const toIndex = Math.min(pageNumber * pageSize, totalCount);

  // Calculate page numbers to display with smart windowing
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      const start = Math.max(2, pageNumber - 1);
      const end = Math.min(totalPages - 1, pageNumber + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400 bg-slate-900/60 ${className}`}
    >
      {/* Records Info */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-white font-bold">{fromIndex}–{toIndex}</strong> of{" "}
          <strong className="text-white font-bold">{totalCount}</strong> {itemLabel}
        </span>
        <span className="text-slate-600 hidden md:inline">•</span>
        <span className="text-slate-500 hidden md:inline">
          Page {pageNumber} of {Math.max(1, totalPages)}
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-slate-500 text-[11px] hidden sm:inline">Per page:</span>
            <select
              aria-label={`Rows per page for ${itemLabel}`}
              value={pageSize}
              disabled={loading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-white font-mono cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            disabled={pageNumber <= 1 || loading}
            onClick={() => onPageChange(1)}
            title="First Page"
            className="h-8 w-8 p-0 bg-[#0e1420] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            disabled={pageNumber <= 1 || loading}
            onClick={() => onPageChange(pageNumber - 1)}
            title="Previous Page"
            className="h-8 px-2.5 bg-[#0e1420] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">PREV</span>
          </Button>

          {/* Numbered Page Buttons */}
          <div className="hidden sm:flex items-center gap-1 mx-1">
            {pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 text-center text-slate-500 select-none text-xs"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = p === pageNumber;
              return (
                <Button
                  key={`page-${p}`}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => onPageChange(p)}
                  className={`h-8 min-w-[32px] px-2 text-xs font-mono font-bold cursor-pointer transition-colors ${
                    isCurrent
                      ? "bg-white text-slate-950 border-white hover:bg-slate-200"
                      : "bg-[#0e1420] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            disabled={pageNumber >= totalPages || loading}
            onClick={() => onPageChange(pageNumber + 1)}
            title="Next Page"
            className="h-8 px-2.5 bg-[#0e1420] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden sm:inline text-[11px]">NEXT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            disabled={pageNumber >= totalPages || loading}
            onClick={() => onPageChange(totalPages)}
            title="Last Page"
            className="h-8 w-8 p-0 bg-[#0e1420] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
