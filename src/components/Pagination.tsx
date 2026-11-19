import React from 'react';
import { Language, translations } from '../i18n/translations';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  language: Language;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  language,
}) => {
  const t = translations[language];
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startEntry = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(validCurrentPage * pageSize, totalItems);

  // Generate page numbers to show (e.g. 1, 2, 3, 4, 5 with ellipses)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (validCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 bg-slate-50/90 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs select-none">
      {/* Left side: Range Info & Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
        <span className="font-medium">
          {totalItems === 0
            ? t.noDataAvailable
            : t.showingEntries(startEntry, endEntry, totalItems)}
        </span>

        {onPageSizeChange && totalItems > 0 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <label className="text-[11px] text-slate-500">{t.rowsPerPage}</label>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                onPageChange(1);
              }}
              className="py-1 px-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#006948]"
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

      {/* Right side: Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(validCurrentPage - 1)}
            disabled={validCurrentPage <= 1}
            title={t.prevPage}
            className={`min-h-[34px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
              validCurrentPage <= 1
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#006948] hover:text-white hover:border-[#006948] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            <span className="hidden sm:inline">{t.prevPage}</span>
          </button>

          {/* Page Number Buttons */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold"
                  >
                    …
                  </span>
                );
              }
              const pageNum = p as number;
              const isActive = pageNum === validCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[34px] h-[34px] px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isActive
                      ? 'bg-[#006948] text-white shadow-xs shadow-emerald-900/40 border border-[#006948]'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(validCurrentPage + 1)}
            disabled={validCurrentPage >= totalPages}
            title={t.nextPage}
            className={`min-h-[34px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
              validCurrentPage >= totalPages
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#006948] hover:text-white hover:border-[#006948] text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer active:scale-95'
            }`}
          >
            <span className="hidden sm:inline">{t.nextPage}</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};
