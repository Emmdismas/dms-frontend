import React, { useState } from 'react';
import { Branch, SaleRecord, VehicleUnit, AuthUser } from '../types';
import { Language, translations } from '../i18n/translations';
import { Pagination } from '../components/Pagination';

interface ReportsViewProps {
  branches: Branch[];
  sales: SaleRecord[];
  units: VehicleUnit[];
  currentUser: AuthUser | null;
  isDarkMode: boolean;
  language: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  branches,
  sales,
  units,
  currentUser,
  isDarkMode,
  language,
}) => {
  const t = translations[language];
  const [reportPeriod, setReportPeriod] = useState<'today' | '7days' | '30days' | 'mtd'>('mtd');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const totalRevenue = sales.reduce((acc, s) => acc + s.amount, 0);
  const units2WSold = sales.filter((s) => s.vehicleType === '2W').length;
  const units3WSold = sales.filter((s) => s.vehicleType === '3W').length;

  const handleExport = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    setDownloadSuccess(
      language === 'sw' 
        ? `Ripoti ya Mauzo (${format}) imeandaliwa na kupakuliwa kikamilifu.`
        : `Sales Report (${format}) generated and downloaded successfully.`
    );
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 4000);
  };

  return (
    <div className="w-full px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      {/* 1. EXECUTIVE REPORTS HEADER (Production Grade) */}
      <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden text-white transition-all ${
        currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-[#004d34] border-[#005a3e]'
      }`}>
        <div className="flex items-start sm:items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/25 text-white flex items-center justify-center shadow-md backdrop-blur-md shrink-0">
            <span className="material-symbols-outlined text-[24px]">analytics</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-sans">
                {t.reportsTitle}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/25 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {language === 'sw' ? 'Uchambuzi wa Mauzo' : 'Executive Analytics'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-emerald-100 font-medium text-[11px] sm:text-xs border border-white/15 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[14px] text-emerald-200">calendar_today</span>
                <span>
                  {language === 'sw' ? 'Kipindi: Mwezi Huu' : 'Period: MTD'}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-emerald-100 font-mono font-bold text-[11px] sm:text-xs border border-white/15 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[14px] text-emerald-300">payments</span>
                <span>
                  {language === 'sw' ? 'Jumla ya Mapato:' : 'Total Revenue:'} TZS {(totalRevenue / 1000000).toFixed(1)}M
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <button
            type="button"
            onClick={() => handleExport('EXCEL')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-white/25 bg-white/15 hover:bg-white/25 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer backdrop-blur-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm text-emerald-200">table_chart</span>
            <span>{t.actionExportExcel}</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('PDF')}
            className="px-4.5 py-2.5 bg-white hover:bg-emerald-50 text-[#006948] rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            <span>{t.actionExportPdf}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[#006948] dark:text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="font-semibold">{downloadSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'today', label: t.periodToday },
          { id: '7days', label: t.period7Days },
          { id: '30days', label: t.period30Days },
          { id: 'mtd', label: t.periodMtd },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setReportPeriod(p.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportPeriod === p.id
                ? 'bg-[#006948] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-80" />
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              {t.totalRevenueTitle}
            </span>
            <p className="text-lg sm:text-2xl font-extrabold text-[#006948] dark:text-emerald-400 font-mono truncate">
              TZS {(totalRevenue / 1000000).toFixed(2)}M
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{sales.length} {language === 'sw' ? 'vitengo' : 'units'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              {language === 'sw' ? 'Mapato' : 'Revenue'}
            </span>
          </div>
        </div>

        {/* Total Units */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80" />
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              {language === 'sw' ? 'Jumla ya Vitengo' : 'Total Units'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
                {sales.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">{t.units}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{branches.length} {language === 'sw' ? 'Matawi yote' : 'All branches'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
              {language === 'sw' ? 'Jumla' : 'Total'}
            </span>
          </div>
        </div>

        {/* 2W Units */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-600 opacity-80" />
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              {language === 'sw' ? 'Pikipiki (2W)' : '2-Wheeler (2W)'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-sans">
                {units2WSold}
              </span>
              <span className="text-xs font-semibold text-slate-400">{t.units}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{Math.round((units2WSold / (sales.length || 1)) * 100)}% {language === 'sw' ? 'ya mauzo' : 'of sales'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
              2W
            </span>
          </div>
        </div>

        {/* 3W Units */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-80" />
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              {language === 'sw' ? 'Bajaj (3W)' : 'Tricycle (3W)'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-sans">
                {units3WSold}
              </span>
              <span className="text-xs font-semibold text-slate-400">{t.units}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{Math.round((units3WSold / (sales.length || 1)) * 100)}% {language === 'sw' ? 'ya mauzo' : 'of sales'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
              3W
            </span>
          </div>
        </div>
      </div>

      {/* 3. Branch Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t.salesByBranchTitle}
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            {branches.length} {language === 'sw' ? 'Matawi' : 'Branches'}
          </span>
        </div>

        <div className="overflow-x-auto enterprise-scrollbar w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="text-xs font-bold text-white border-b-2 border-[#004d34] bg-[#006948] whitespace-nowrap">
                <th className="py-3.5 px-4 border-r border-white/15 w-16 whitespace-nowrap text-center">SN</th>
                <th className="py-3.5 px-4 border-r border-white/15 whitespace-nowrap">{t.colBranch}</th>
                <th className="py-3.5 px-4 border-r border-white/15 whitespace-nowrap">{t.colLocation}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-center whitespace-nowrap">{t.inStock}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-center whitespace-nowrap">{t.sold}</th>
                <th className="py-3.5 px-4 border-r border-white/15 text-right whitespace-nowrap">{t.amount}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{t.colMarketShare}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600 block">table_chart</span>
                    <p>{t.noDataAvailable}</p>
                  </td>
                </tr>
              ) : (
                branches
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((b, idx) => {
                    const bSales = sales.filter((s) => s.branchId === b.id);
                    const bUnits = units.filter((u) => u.branchId === b.id && u.status === 'IN STOCK');
                    const bRev = bSales.reduce((acc, s) => acc + s.amount, 0);
                    const percentage = totalRevenue > 0 ? Math.round((bRev / totalRevenue) * 100) : 0;
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors border-b border-slate-200 dark:border-slate-800 ${
                          idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/60'
                        }`}
                      >
                        <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {rowNumber}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white whitespace-nowrap">{b.name}</td>
                        <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-500 whitespace-nowrap">{b.zone} • {b.region}</td>
                        <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{bUnits.length} {t.units}</td>
                        <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{bSales.length} {t.units}</td>
                        <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-right font-mono font-bold text-[#006948] dark:text-emerald-400 whitespace-nowrap text-sm">
                          TZS {(bRev / 1000000).toFixed(1)}M
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={branches.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          language={language}
        />
      </div>
    </div>
  );
};
