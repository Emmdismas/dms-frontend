import React, { useState } from 'react';
import { Branch, VehicleUnit, SaleRecord, AuthUser } from '../types';
import { Language, translations, formatVehicleColor } from '../i18n/translations';
import { Pagination } from '../components/Pagination';

interface BranchDetailViewProps {
  branch: Branch;
  units: VehicleUnit[];
  sales: SaleRecord[];
  currentUser: AuthUser | null;
  onBack: () => void;
  onOpenUnitDetail: (unit: VehicleUnit) => void;
  onOpenRecordSaleModal: () => void;
  onOpenTransferModal: () => void;
  isDarkMode: boolean;
  language: Language;
}

export const BranchDetailView: React.FC<BranchDetailViewProps> = ({
  branch,
  units,
  sales,
  currentUser,
  onBack,
  onOpenUnitDetail,
  onOpenRecordSaleModal,
  onOpenTransferModal,
  isDarkMode,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'sales'>('stock');
  const t = translations[language];

  // Pagination states
  const [stockCurrentPage, setStockCurrentPage] = useState<number>(1);
  const [stockPageSize, setStockPageSize] = useState<number>(10);

  const [salesCurrentPage, setSalesCurrentPage] = useState<number>(1);
  const [salesPageSize, setSalesPageSize] = useState<number>(10);

  const branchUnits = units.filter((u) => u.branchId === branch.id);
  const inStockUnits = branchUnits.filter((u) => u.status === 'IN STOCK');
  const branchSales = sales.filter((s) => s.branchId === branch.id);
  const totalRevenue = branchSales.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="w-full px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation Back Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>{t.actionBack}</span>
        </button>
        <span className="text-xs text-slate-400">/ {t.navBranches} / {branch.name}</span>
      </div>

      {/* Branch Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              {branch.code}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {branch.status}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {branch.name}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
            <span>{branch.location} • Zone: <strong>{branch.zone}</strong> ({branch.region})</span>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            {language === 'sw' ? 'Meneja wa Tawi:' : 'Branch Manager:'} <strong>{branch.managerName}</strong> • {branch.phone}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTransferModal}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">local_shipping</span>
            <span>{t.actionTransfer}</span>
          </button>

          <button
            onClick={onOpenRecordSaleModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#006948] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>{t.actionRecordSale}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {t.inStock}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">{inStockUnits.length}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">{t.units}</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">{language === 'sw' ? 'Ipo stoo sasa' : 'Ready in branch'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {t.sold}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{branchSales.length}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">{t.units}</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">{language === 'sw' ? 'Mauzo yaliyofanyika' : 'Total sales'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {t.totalRevenueTitle}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-2xl lg:text-3xl font-black text-[#006948] dark:text-emerald-400 font-mono truncate">
              TZS {(totalRevenue / 1000000).toFixed(1)}M
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 truncate">
            {language === 'sw' ? 'Jumla ya mapato' : 'Branch revenue'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {language === 'sw' ? 'Uwezo wa Stoo' : 'Storage Space'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {branchUnits.length}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">/ 50</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            {Math.round((branchUnits.length / 50) * 100)}% {language === 'sw' ? 'nafasi imetumika' : 'capacity used'}
          </p>
        </div>
      </div>

      {/* Tabs Switcher: Stock vs Sales */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => {
            setActiveTab('stock');
            setStockCurrentPage(1);
          }}
          className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'border-[#00855d] text-[#00855d]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {language === 'sw' ? 'Stoo ya Tawi' : 'Branch Inventory'} ({branchUnits.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('sales');
            setSalesCurrentPage(1);
          }}
          className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'border-[#00855d] text-[#00855d]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {language === 'sw' ? 'Historia ya Mauzo' : 'Sales History'} ({branchSales.length})
        </button>
      </div>

      {/* Tab 1: Branch Stock Table */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto enterprise-scrollbar w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
              <thead>
                <tr className="text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 whitespace-nowrap">
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 w-16 whitespace-nowrap">{t.colUnitId}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{t.colVehicle}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{t.colChassis}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{t.colEngine}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">{t.colStatus}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">{t.colStockAge}</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {branchUnits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                      <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600 block">inventory_2</span>
                      <p>{t.noDataAvailable}</p>
                    </td>
                  </tr>
                ) : (
                  branchUnits
                    .slice((stockCurrentPage - 1) * stockPageSize, stockCurrentPage * stockPageSize)
                    .map((u, idx) => {
                      const rowNumber = (stockCurrentPage - 1) * stockPageSize + idx + 1;
                      return (
                        <tr
                          key={u.id}
                          onClick={() => onOpenUnitDetail(u)}
                          className={`hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-800 ${
                            idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/60'
                          }`}
                        >
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <span className="text-slate-400 text-[11px] mr-1.5">{rowNumber}</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{u.id}</span>
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {u.modelName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                                {u.vehicleType}
                              </span>
                              <span>•</span>
                              <span className="font-medium text-slate-600 dark:text-slate-300">{formatVehicleColor(u.color, language)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                              {u.chassisNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{u.engineNumber}</td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-center whitespace-nowrap">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-mono text-center whitespace-nowrap">
                            <span className={`font-bold text-xs ${u.stockAgeDays <= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {u.stockAgeDays} {t.days}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700">
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
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
            currentPage={stockCurrentPage}
            totalItems={branchUnits.length}
            pageSize={stockPageSize}
            onPageChange={setStockCurrentPage}
            onPageSizeChange={setStockPageSize}
            language={language}
          />
        </div>
      )}

      {/* Tab 2: Branch Sales Table */}
      {activeTab === 'sales' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto enterprise-scrollbar w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
              <thead>
                <tr className="text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 whitespace-nowrap">
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 w-16 whitespace-nowrap">SN</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{t.receiptNumber}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{t.date}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{t.colVehicle}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{t.colChassis}</th>
                  <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">{t.customer}</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">{t.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {branchSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                      <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600 block">receipt_long</span>
                      <p>{t.noDataAvailable}</p>
                    </td>
                  </tr>
                ) : (
                  branchSales
                    .slice((salesCurrentPage - 1) * salesPageSize, salesCurrentPage * salesPageSize)
                    .map((s, idx) => {
                      const rowNumber = (salesCurrentPage - 1) * salesPageSize + idx + 1;
                      return (
                        <tr
                          key={s.id}
                          className={`hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors border-b border-slate-200 dark:border-slate-800 ${
                            idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/60'
                          }`}
                        >
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {rowNumber}
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-[#006948] dark:text-emerald-400 whitespace-nowrap">
                            {s.receiptNumber}
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-500 font-mono whitespace-nowrap">{s.date}</td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white whitespace-nowrap">{s.modelName}</td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                              {s.chassisNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-medium whitespace-nowrap">{s.customerName}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#006948] dark:text-emerald-400 whitespace-nowrap text-sm">
                            TZS {s.amount.toLocaleString()}
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
            currentPage={salesCurrentPage}
            totalItems={branchSales.length}
            pageSize={salesPageSize}
            onPageChange={setSalesCurrentPage}
            onPageSizeChange={setSalesPageSize}
            language={language}
          />
        </div>
      )}
    </div>
  );
};
