import React from 'react';
import { Branch, VehicleUnit, SaleRecord, AuthUser } from '../types';
import { DEALER_INFO } from '../data/mockData';
import { Language, translations } from '../i18n/translations';

interface BranchesViewProps {
  branches: Branch[];
  units: VehicleUnit[];
  sales: SaleRecord[];
  currentUser: AuthUser | null;
  onSelectBranchDetail: (branch: Branch) => void;
  onOpenRecordSaleModal: () => void;
  onOpenTransferModal: () => void;
  isDarkMode: boolean;
  language: Language;
}

export const BranchesView: React.FC<BranchesViewProps> = ({
  branches,
  units,
  sales,
  currentUser,
  onSelectBranchDetail,
  onOpenRecordSaleModal,
  onOpenTransferModal,
  isDarkMode,
  language,
}) => {
  const t = translations[language];

  return (
    <div className="w-full px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      
      {/* 1. EXECUTIVE BRANCHES HEADER (Production Grade) */}
      <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden text-white transition-all ${
        currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-[#004d34] border-[#005a3e]'
      }`}>
        <div className="flex items-start sm:items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/25 text-white flex items-center justify-center shadow-md backdrop-blur-md shrink-0">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-sans">
                {currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
                  ? (language === 'sw' ? 'Matawi Yote ya Mfumo Mzima (Ma-Dealer Wote)' : 'All System Branches (Multi-Dealer Network)')
                  : currentUser?.role === 'dealer' || currentUser?.role === 'owner'
                    ? (language === 'sw' ? `Matawi ya Biashara (${currentUser?.dealerName || 'Dealer'})` : `Dealership Branches (${currentUser?.dealerName || 'Dealer'})`)
                    : (language === 'sw' ? `Tawi Lako (${currentUser?.branchName || 'Tawi'})` : `Your Branch (${currentUser?.branchName || 'Branch'})`)}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/25 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {branches.length} {language === 'sw' ? 'Matawi Yaliyopo' : 'Active Branches'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-emerald-100 font-medium text-[11px] sm:text-xs border border-white/15 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[14px] text-emerald-200">two_wheeler</span>
                <span>
                  {language === 'sw' ? `Jumla ya Vitengo: ${units.length}` : `Total Units: ${units.length}`}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-emerald-100 font-mono font-bold text-[11px] sm:text-xs border border-white/15 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[14px] text-emerald-300">payments</span>
                <span>
                  {language === 'sw' ? 'Mauzo Yote:' : 'Total Sales:'} TZS {(sales.reduce((acc, s) => acc + s.amount, 0) / 1000000).toFixed(1)}M
                </span>
              </span>
            </div>
          </div>
        </div>

        {currentUser?.role !== 'dealer' && currentUser?.role !== 'owner' && (
          <div className="flex items-center gap-2.5 flex-wrap relative z-10">
            <button
              type="button"
              onClick={onOpenTransferModal}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-white/25 bg-white/15 hover:bg-white/25 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer backdrop-blur-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">local_shipping</span>
              <span>{t.actionTransfer}</span>
            </button>

            <button
              type="button"
              onClick={onOpenRecordSaleModal}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#006948] rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>{t.actionRecordSale}</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of 5 Branches (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {branches.map((branch) => {
          const branchUnits = units.filter((u) => u.branchId === branch.id);
          const inStockCount = branchUnits.filter((u) => u.status === 'IN STOCK').length;
          const soldCount = branchUnits.filter((u) => u.status === 'SOLD').length;
          const branchSales = sales.filter((s) => s.branchId === branch.id);
          const totalRevenue = branchSales.reduce((acc, s) => acc + s.amount, 0);

          return (
            <div
              key={branch.id}
              onClick={() => onSelectBranchDetail(branch)}
              className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 hover:border-[#00855d] flex flex-col justify-between group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
              <div>
                {/* Branch Top Status */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-xs">
                    {branch.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {branch.status}
                  </span>
                </div>

                {currentUser?.role === 'super_admin' && (branch.dealerName || branch.dealerCode) && (
                  <div className="mb-1.5">
                    <span className="inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 truncate max-w-full">
                      {branch.dealerName || branch.dealerCode}
                    </span>
                  </div>
                )}

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#006948] dark:group-hover:text-emerald-400 transition-colors truncate">
                  {branch.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                  <span className="truncate">{branch.location}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 text-[11px]">
                    {branch.zone}
                  </span>
                  <span>•</span>
                  <span className="truncate text-[11px]">{branch.region}</span>
                </div>

                {/* Performance Metrics inside card */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.inStock}:</span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {inStockCount} <span className="text-xs font-normal text-slate-400">{t.units}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.sold}:</span>
                    <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400">
                      {soldCount} <span className="text-xs font-normal text-slate-400">{t.units}</span>
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-baseline justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">{language === 'sw' ? 'Mapato:' : 'Revenue:'}</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#006948] dark:text-emerald-400 font-mono">
                      TZS {(totalRevenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">badge</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate text-[11px] sm:text-xs">{branch.managerName}</span>
                </div>
                <div className="flex items-center gap-0.5 text-[#006948] dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform text-xs">
                  <span>{language === 'sw' ? 'Tazama Tawi' : 'View Branch'}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
