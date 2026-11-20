import React, { useState, useMemo } from 'react';
import { Language } from '../../types';

export interface ColumnDef<T> {
  key?: string;
  header: string;
  accessor?: keyof T | string | ((row: T, index: number) => React.ReactNode);
  cell?: (row: T, index: number) => React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  language?: Language;
  title?: string;
  searchPlaceholder?: string;
  onSearchChange?: (term: string) => void;
  filterComponent?: React.ReactNode;
  onResetFilters?: () => void;
  exportFileName?: string;
  exportLabel?: string;
  defaultShowFilters?: boolean;
  actions?: React.ReactNode;
  initialPageSize?: number;
  maxHeight?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  enableExport?: boolean;
  enableDensityToggle?: boolean;
}

// Helper to determine a unique stable key for each column
export function getColumnKey<T>(col: ColumnDef<T>, idx: number): string {
  if (col.key) return col.key;
  if (typeof col.accessor === 'string') return col.accessor;
  return `${col.header || 'col'}-${idx}`;
}

// Helper to safely render cell content regardless of whether cell, render, or accessor was provided
export function renderCell<T>(col: ColumnDef<T>, item: T, index: number): React.ReactNode {
  if (col.cell) {
    return col.cell(item, index);
  }
  if (col.render) {
    return col.render(item, index);
  }
  if (typeof col.accessor === 'function') {
    return col.accessor(item, index);
  }
  if (typeof col.accessor === 'string') {
    const val = (item as any)[col.accessor];
    return val !== undefined && val !== null ? String(val) : '';
  }
  if (col.key) {
    const val = (item as any)[col.key];
    return val !== undefined && val !== null ? String(val) : '';
  }
  return '';
}

/** Helper to format table headers into clean Proper Case without forcing ALL CAPS */
export function toProperCase(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  const acronyms = new Set(['#', 'VIN', 'TRA', 'ID', 'PDI', 'TZS', 'CSV', '2W', '3W', 'NIDA', 'TVS', 'BM150', 'HLX']);
  if (acronyms.has(trimmed.toUpperCase())) return trimmed.toUpperCase();

  // If text is ALL CAPS, convert to Proper Title Case
  const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text) && text.length > 2;
  if (!isAllCaps) return text;

  return text
    .toLowerCase()
    .split(' ')
    .map((w) => (acronyms.has(w.toUpperCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/** Sleek, modern micro-caret sort indicator (Stripe / DataTables Enterprise standard) */
const TableSortCaret: React.FC<{ isSorted: boolean; sortOrder: 'asc' | 'desc' }> = ({
  isSorted,
  sortOrder,
}) => (
  <span className="inline-flex flex-col items-center justify-center ml-1.5 w-2.5 h-3 shrink-0 select-none opacity-85 group-hover:opacity-100">
    {/* Up Caret */}
    <svg
      className={`w-2 h-1.5 transition-colors duration-150 ${
        isSorted && sortOrder === 'asc'
          ? 'text-white opacity-100 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]'
          : isSorted
          ? 'text-white/20'
          : 'text-white/45'
      }`}
      viewBox="0 0 8 5"
      fill="currentColor"
    >
      <path d="M4 0L8 5H0L4 0Z" />
    </svg>
    {/* Down Caret */}
    <svg
      className={`w-2 h-1.5 mt-0.5 transition-colors duration-150 ${
        isSorted && sortOrder === 'desc'
          ? 'text-white opacity-100 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]'
          : isSorted
          ? 'text-white/20'
          : 'text-white/45'
      }`}
      viewBox="0 0 8 5"
      fill="currentColor"
    >
      <path d="M4 5L0 0H8L4 5Z" />
    </svg>
  </span>
);

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  language = 'sw',
  title,
  searchPlaceholder,
  onSearchChange,
  filterComponent,
  onResetFilters,
  exportFileName = 'export-data',
  exportLabel,
  defaultShowFilters = false,
  actions,
  initialPageSize = 10,
  maxHeight = '500px',
  emptyMessage,
  emptyIcon = 'search_off',
  rowClassName,
  onRowClick,
  enableExport = true,
  enableDensityToggle = false,
}: DataTableProps<T>) {
  const isSw = language === 'sw';

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(defaultShowFilters);
  const [exportFeedback, setExportFeedback] = useState(false);

  // Search filter
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    if (onSearchChange) {
      onSearchChange(term);
    }
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = [...data];

    // Client-side quick search across text content if search term entered
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((item) => {
        try {
          return JSON.stringify(item).toLowerCase().includes(q);
        } catch {
          return false;
        }
      });
    }

    // Sort
    if (sortKey) {
      const colIndex = columns.findIndex((c, i) => getColumnKey(c, i) === sortKey);
      const col = colIndex >= 0 ? columns[colIndex] : null;
      if (col) {
        result.sort((a, b) => {
          let valA: any = '';
          let valB: any = '';

          if (col.sortAccessor) {
            valA = col.sortAccessor(a);
            valB = col.sortAccessor(b);
          } else if (typeof col.accessor === 'string') {
            valA = (a as any)[col.accessor] ?? '';
            valB = (b as any)[col.accessor] ?? '';
          } else if (col.key) {
            valA = (a as any)[col.key] ?? '';
            valB = (b as any)[col.key] ?? '';
          }

          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortOrder === 'asc' ? valA - valB : valB - valA;
          }

          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();
          if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
          if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, searchTerm, sortKey, sortOrder, columns]);

  // Pagination calculation
  const totalEntries = processedData.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  // Sorting toggle
  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    try {
      const exportCols = columns.filter((c, i) => {
        const k = getColumnKey(c, i).toLowerCase();
        return (
          k !== 'actions' &&
          k !== 'action' &&
          k !== 'chaguzi' &&
          k !== 'vitendo' &&
          !c.header.toLowerCase().includes('action') &&
          !c.header.toLowerCase().includes('vitendo')
        );
      });
      const headers = exportCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');

      const rows = processedData.map((row, idx) => {
        return exportCols
          .map((c) => {
            let cellValue = '';
            if (c.sortAccessor) {
              cellValue = String(c.sortAccessor(row));
            } else if (typeof c.accessor === 'string') {
              cellValue = String((row as any)[c.accessor] ?? '');
            } else if (c.key) {
              cellValue = String((row as any)[c.key] ?? '');
            } else {
              const rendered = renderCell(c, row, idx);
              cellValue =
                typeof rendered === 'string' || typeof rendered === 'number'
                  ? String(rendered)
                  : '';
            }
            return `"${cellValue.replace(/"/g, '""')}"`;
          })
          .join(',');
      });

      const csvContent = [headers, ...rows].join('\r\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportFileName}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportFeedback(true);
      setTimeout(() => setExportFeedback(false), 2500);
    } catch (err) {
      console.error('Export error', err);
    }
  };

  // Styling helpers
  const cellPadding = density === 'compact' ? 'py-2.5 px-3.5' : 'py-3.5 px-4';
  const cellFontSize = density === 'compact' ? 'text-xs' : 'text-sm font-medium';

  return (
    <div className="w-full space-y-3">
      {/* 1. TOP ACTION & FILTER TOOLBAR (Faithful to benchmark Image 2) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Filters Toggle Button (Funnel icon filter_alt from Image 2) */}
        <div className="flex items-center gap-3">
          {filterComponent ? (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
                showFilters
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/15'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-slate-300">
                filter_alt
              </span>
              <span>{isSw ? 'Filters' : 'Filters'}</span>
            </button>
          ) : title ? (
            <span className="text-sm font-bold text-slate-800 dark:text-white font-sans">
              {title}
            </span>
          ) : null}

          {title && filterComponent && (
            <span className="hidden xl:inline-block text-xs font-bold text-slate-500 dark:text-slate-400 font-sans truncate">
              {title}
            </span>
          )}
        </div>

        {/* Right: Export & Reset Filters Actions (Matching Image 2 top right buttons) */}
        <div className="flex items-center gap-2 flex-wrap">
          {enableExport && (
            <button
              type="button"
              onClick={handleExportCSV}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
                exportFeedback
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
              title={isSw ? 'Pakua ripoti ya Excel/CSV' : 'Export Excel / CSV table report'}
            >
              <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-slate-300">
                {exportFeedback ? 'check_circle' : 'download'}
              </span>
              <span>
                {exportFeedback
                  ? (isSw ? 'Imepakuliwa!' : 'Exported!')
                  : (exportLabel || (isSw ? 'Export Excel' : 'Export Excel'))}
              </span>
            </button>
          )}

          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-2xs bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              title={isSw ? 'Safisha vichujio vyote' : 'Reset all active filters'}
            >
              <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-slate-300">
                restart_alt
              </span>
              <span>{isSw ? 'Reset Filters' : 'Reset Filters'}</span>
            </button>
          )}

          {actions}
        </div>
      </div>

      {/* 2. COLLAPSIBLE FILTER CONTAINER (Directly below Filters button) */}
      {filterComponent && showFilters && (
        <div className="p-4 bg-slate-50/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150">
          {filterComponent}
        </div>
      )}

      {/* 3. TABLE CONTROLS ROW: Show [entries] on left, Search on right (Matching Image 2) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-2.5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Show [ 10 ⌄ ] entries */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
          <span>Show</span>
          <div className="relative inline-flex items-center">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer shadow-2xs"
            >
              {[5, 10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[16px] absolute right-1.5 text-slate-400 pointer-events-none select-none">
              expand_more
            </span>
          </div>
          <span>entries</span>
        </div>

        {/* Right: Search: [             ] */}
        <div className="flex items-center gap-2 justify-end">
          <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap select-none">
            Search:
          </label>
          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder={searchPlaceholder || ''}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#006948] focus:border-[#006948] transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Optional Density Toggle */}
          {enableDensityToggle && (
            <button
              type="button"
              onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
              className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-2xs shrink-0"
              title={
                density === 'compact'
                  ? isSw
                    ? 'Muonekano mpana (Comfortable)'
                    : 'Switch to Comfortable view'
                  : isSw
                  ? 'Muonekano wa kawaida (Compact)'
                  : 'Switch to Compact view'
              }
            >
              <span className="material-symbols-outlined text-[17px]">
                {density === 'compact' ? 'density_medium' : 'density_small'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3. DEDICATED VERTICAL SCROLLER ("Kascroller" Container with Sticky Header) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div
          className="overflow-x-auto overflow-y-auto enterprise-scrollbar w-full"
          style={{ maxHeight }}
        >
          <table className="w-full text-left border-collapse min-w-max">
            {/* STICKY STATIC THEAD (Enterprise Forest Green Header) */}
            <thead className="sticky top-0 z-10 border-b-2 border-[#004d34] bg-[#006948] text-white select-none shadow-md">
              <tr>
                {columns.map((col, colIdx) => {
                  const colKey = getColumnKey(col, colIdx);
                  const isSorted = sortKey === colKey;
                  const alignClass =
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left';

                  return (
                    <th
                      key={colKey}
                      onClick={() => handleSort(colKey, col.sortable)}
                      style={{ width: col.width }}
                      className={`group py-3.5 px-4 text-xs sm:text-[13px] font-bold normal-case tracking-normal text-white border-r border-white/20 last:border-r-0 whitespace-nowrap select-none ${alignClass} ${
                        col.sortable
                          ? 'cursor-pointer hover:bg-[#005a3e] transition-colors'
                          : ''
                      } ${col.className || ''}`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          col.align === 'center'
                            ? 'justify-center'
                            : col.align === 'right'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <span className="text-white font-bold tracking-normal">{toProperCase(col.header)}</span>
                        {col.sortable && (
                          <TableSortCaret isSorted={isSorted} sortOrder={sortOrder} />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* TBODY WITH MICRO-INTERACTION HOVER */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-sans">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center text-slate-400 font-medium"
                  >
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600 block">
                      {emptyIcon}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold">
                      {emptyMessage ||
                        (isSw
                          ? 'Hakuna taarifa zilizopatikana kwenye jedwali hili.'
                          : 'No data records found in this table.')}
                    </p>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => handleSearch('')}
                        className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#006948] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        <span>{isSw ? 'Futa Utafutaji' : 'Clear search'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const globalIdx = startIndex + idx;
                  const customRowCls = rowClassName ? rowClassName(item, globalIdx) : '';

                  return (
                    <tr
                      key={keyExtractor(item, globalIdx)}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`hover:bg-emerald-50/50 dark:hover:bg-emerald-950/25 transition-colors duration-150 border-b border-slate-200/80 dark:border-slate-800/60 ${
                        idx % 2 === 0
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-slate-50/40 dark:bg-slate-900/50'
                      } ${onRowClick ? 'cursor-pointer' : ''} ${customRowCls}`}
                    >
                      {columns.map((col, colIdx) => {
                        const colKey = getColumnKey(col, colIdx);
                        const alignClass =
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left';

                        return (
                          <td
                            key={colKey}
                            className={`${cellPadding} ${cellFontSize} whitespace-nowrap border-r border-slate-200/70 dark:border-slate-800/80 last:border-r-0 text-slate-900 dark:text-slate-100 tabular-nums ${alignClass} ${
                              col.className || ''
                            }`}
                          >
                            {renderCell(col, item, globalIdx)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

        </div>

        {/* 4. STATIONARY PAGINATION & RECORD COUNTER (Stationary Below Scroller) */}
        <div className="p-3 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium text-center sm:text-left">
            {isSw ? (
              <span>
                Inaonyesha <strong className="font-bold text-slate-800 dark:text-white">{totalEntries === 0 ? 0 : startIndex + 1}</strong> hadi{' '}
                <strong className="font-bold text-slate-800 dark:text-white">
                  {Math.min(startIndex + pageSize, totalEntries)}
                </strong>{' '}
                kati ya <strong className="font-bold text-[#006948] dark:text-emerald-400">{totalEntries}</strong> rekodi
              </span>
            ) : (
              <span>
                Showing <strong className="font-bold text-slate-800 dark:text-white">{totalEntries === 0 ? 0 : startIndex + 1}</strong> to{' '}
                <strong className="font-bold text-slate-800 dark:text-white">
                  {Math.min(startIndex + pageSize, totalEntries)}
                </strong>{' '}
                of <strong className="font-bold text-[#006948] dark:text-emerald-400">{totalEntries}</strong> entries
              </span>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                <span className="hidden sm:inline">{isSw ? 'Awali' : 'Prev'}</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - safePage) <= 1;
                  })
                  .map((p, pIdx, arr) => {
                    const prevP = arr[pIdx - 1];
                    const isGap = prevP && p - prevP > 1;
                    const isActive = p === safePage;

                    return (
                      <React.Fragment key={p}>
                        {isGap && <span className="text-slate-400 text-xs px-1">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#006948] text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
              >
                <span className="hidden sm:inline">{isSw ? 'Ijayo' : 'Next'}</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
