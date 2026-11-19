import React, { useState, useMemo } from 'react';
import { Dealer, VehicleUnit, SaleRecord, Branch, TeamMember, Language } from '../types';
import { translations, formatVehicleColor } from '../i18n/translations';
import { Pagination } from '../components/Pagination';

interface DealerDetailViewProps {
  dealer: Dealer;
  units: VehicleUnit[];
  sales: SaleRecord[];
  branches: Branch[];
  teamMembers?: TeamMember[];
  onBack: () => void;
  onImpersonateDealer: (dealer: Dealer) => void;
  onOpenEditModal: (dealer: Dealer) => void;
  onOpenResetPasswordModal: (dealer: Dealer) => void;
  isDarkMode: boolean;
  language: Language;
}

type DealerDetailTab = 'overview' | 'inventory' | 'sales' | 'manpower' | 'branches';

export const DealerDetailView: React.FC<DealerDetailViewProps> = ({
  dealer,
  units,
  sales,
  branches,
  teamMembers = [],
  onBack,
  onImpersonateDealer,
  onOpenEditModal,
  onOpenResetPasswordModal,
  isDarkMode,
  language,
}) => {
  const isSw = language === 'sw';
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<DealerDetailTab>('overview');

  // Pagination states
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPageSize, setInventoryPageSize] = useState(10);
  const [salesPage, setSalesPage] = useState(1);
  const [salesPageSize, setSalesPageSize] = useState(10);
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Scoped Branches for this Dealer
  const dealerBranches = useMemo(() => {
    return branches.filter(
      (b) => b.dealerCode === dealer.code || b.dealerName?.toLowerCase() === dealer.name.toLowerCase()
    );
  }, [branches, dealer.code, dealer.name]);

  const dealerBranchIds = useMemo(() => new Set(dealerBranches.map((b) => b.id)), [dealerBranches]);

  // 2. Scoped Units for this Dealer (Take-In & Inventory)
  const dealerUnits = useMemo(() => {
    return units.filter(
      (u) => u.dealerCode === dealer.code || dealerBranchIds.has(u.branchId)
    );
  }, [units, dealer.code, dealerBranchIds]);

  const inStockUnits = useMemo(() => dealerUnits.filter((u) => u.status === 'IN STOCK'), [dealerUnits]);
  const inStock2W = useMemo(() => inStockUnits.filter((u) => u.vehicleType === '2W').length, [inStockUnits]);
  const inStock3W = useMemo(() => inStockUnits.filter((u) => u.vehicleType === '3W').length, [inStockUnits]);

  // Total Take-In (All units ever received by this dealership)
  const totalTakeIn = dealerUnits.length;
  const takeIn2W = useMemo(() => dealerUnits.filter((u) => u.vehicleType === '2W').length, [dealerUnits]);
  const takeIn3W = useMemo(() => dealerUnits.filter((u) => u.vehicleType === '3W').length, [dealerUnits]);

  // 3. Scoped Sales for this Dealer (Take-Out)
  const dealerSales = useMemo(() => {
    return sales.filter(
      (s) => s.dealerCode === dealer.code || dealerBranchIds.has(s.branchId)
    );
  }, [sales, dealer.code, dealerBranchIds]);

  const totalTakeOut = dealerSales.length;
  const takeOut2W = useMemo(() => dealerSales.filter((s) => s.vehicleType === '2W').length, [dealerSales]);
  const takeOut3W = useMemo(() => dealerSales.filter((s) => s.vehicleType === '3W').length, [dealerSales]);
  const totalRevenueTZS = useMemo(() => {
    return dealerSales.reduce((acc, s) => acc + (s.amountPaid ?? s.amount ?? 0), 0);
  }, [dealerSales]);

  const turnoverRate = totalTakeIn > 0 ? Math.round((totalTakeOut / totalTakeIn) * 100) : 0;
  const avgSaleValue = totalTakeOut > 0 ? Math.round(totalRevenueTZS / totalTakeOut) : 0;

  // 4. Manpower (Staff under this Dealer)
  const dealerStaff = useMemo(() => {
    return teamMembers.filter((m) => {
      if (m.dealerCode && m.dealerCode.toUpperCase() === dealer.code.toUpperCase()) return true;
      if (m.branchName && dealerBranches.some((b) => b.name.toLowerCase() === m.branchName.toLowerCase())) return true;
      return false;
    });
  }, [teamMembers, dealer.code, dealerBranches]);

  // 5. Monthly Take-In vs Take-Out Analytics
  const monthlyFlowData = useMemo(() => {
    // Generate recent 6 months
    const months = ['Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt'];
    const monthsEn = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthKeys = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

    return monthKeys.map((key, index) => {
      const takeInCount = dealerUnits.filter((u) => u.receivedDate && u.receivedDate.startsWith(key)).length;
      const takeOutCount = dealerSales.filter((s) => s.date && s.date.startsWith(key)).length;
      return {
        key,
        name: isSw ? months[index] : monthsEn[index],
        takeIn: takeInCount,
        takeOut: takeOutCount,
      };
    });
  }, [dealerUnits, dealerSales, isSw]);

  const maxFlowValue = useMemo(() => {
    const vals = monthlyFlowData.flatMap((d) => [d.takeIn, d.takeOut]);
    return Math.max(...vals, 10);
  }, [monthlyFlowData]);

  // Filtered views for tabs
  const filteredInventory = useMemo(() => {
    if (!searchFilter.trim()) return inStockUnits;
    const q = searchFilter.toLowerCase().trim();
    return inStockUnits.filter(
      (u) =>
        u.modelName.toLowerCase().includes(q) ||
        u.chassisNumber.toLowerCase().includes(q) ||
        u.engineNumber.toLowerCase().includes(q) ||
        u.branchName.toLowerCase().includes(q)
    );
  }, [inStockUnits, searchFilter]);

  const filteredSales = useMemo(() => {
    if (!searchFilter.trim()) return dealerSales;
    const q = searchFilter.toLowerCase().trim();
    return dealerSales.filter(
      (s) =>
        s.customerName.toLowerCase().includes(q) ||
        s.modelName.toLowerCase().includes(q) ||
        s.chassisNumber.toLowerCase().includes(q) ||
        s.branchName.toLowerCase().includes(q) ||
        s.customerPhone.includes(q)
    );
  }, [dealerSales, searchFilter]);

  const paginatedInventory = filteredInventory.slice(
    (inventoryPage - 1) * inventoryPageSize,
    inventoryPage * inventoryPageSize
  );

  const paginatedSales = filteredSales.slice(
    (salesPage - 1) * salesPageSize,
    salesPage * salesPageSize
  );

  const isActive = dealer.status === 'Active';

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      {/* 1. Top Navigation & Breadcrumbs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onBack}
            className="h-7 sm:h-8 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>{isSw ? 'Rudi' : 'Back'}</span>
          </button>
          <span className="text-slate-400 dark:text-slate-500">/</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">{isSw ? 'Ma-Dealer' : 'Dealers'}</span>
          <span className="text-slate-400 dark:text-slate-500">/</span>
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-none">
            {dealer.name}
          </span>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={!isActive}
            onClick={() => onImpersonateDealer(dealer)}
            className="h-7 sm:h-8 px-3 rounded-lg bg-[#006948] hover:bg-[#005a3e] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40"
            title={`${isSw ? 'Ingia Portal kama' : 'Login Portal as'} ${dealer.ownerName || dealer.name}`}
          >
            <span className="material-symbols-outlined text-[15px]">login</span>
            <span>{isSw ? 'Ingia Portal' : 'Login Portal'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenEditModal(dealer)}
            className="h-7 sm:h-8 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title={isSw ? 'Hariri Dealer' : 'Edit Dealer'}
          >
            <span className="material-symbols-outlined text-[15px]">edit</span>
            <span>{isSw ? 'Hariri' : 'Edit'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenResetPasswordModal(dealer)}
            className="h-7 sm:h-8 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 text-amber-700 dark:text-amber-400 text-[11px] sm:text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title={isSw ? 'Nenosiri' : 'Reset Password'}
          >
            <span className="material-symbols-outlined text-[15px]">lock_reset</span>
            <span>{isSw ? 'Nenosiri' : 'Password'}</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Dealer Header Profile Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
        {/* Top Header Row: Avatar, Name, Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#006948] via-[#005a3e] to-[#00422c] text-white flex items-center justify-center shadow-lg shadow-emerald-950/20 ring-4 ring-emerald-500/10 shrink-0">
              <span className="material-symbols-outlined text-[28px] sm:text-[32px]">corporate_fare</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                  {dealer.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{isActive ? (isSw ? 'Inatumika' : 'Active') : (isSw ? 'Imesitishwa' : 'Inactive')}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono flex-wrap mt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-slate-700 font-bold">
                  {dealer.code}
                </span>
                {dealer.secondaryCode && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {dealer.secondaryCode}
                  </span>
                )}
                <span className="text-slate-400 font-sans text-xs">
                  • {isSw ? 'Alijiunga:' : 'Joined:'} {dealer.joinedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Information Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Card 1: Owner Name */}
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5 min-w-0 transition-all hover:border-slate-200 dark:hover:border-slate-600">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">person</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                {isSw ? 'Mmiliki Mkuu' : 'Owner'}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate block" title={dealer.ownerName}>
                {dealer.ownerName}
              </span>
            </div>
          </div>

          {/* Card 2: Phone Number */}
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5 min-w-0 transition-all hover:border-slate-200 dark:hover:border-slate-600">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">call</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                {isSw ? 'Simu' : 'Phone'}
              </span>
              <a
                href={`tel:${dealer.phone}`}
                className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline truncate block"
                title={dealer.phone}
              >
                {dealer.phone}
              </a>
            </div>
          </div>

          {/* Card 3: Email Address */}
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5 min-w-0 transition-all hover:border-slate-200 dark:hover:border-slate-600">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">mail</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                {isSw ? 'Barua Pepe' : 'Email'}
              </span>
              <a
                href={`mailto:${dealer.email}`}
                className="text-xs font-mono text-slate-700 dark:text-slate-300 hover:underline truncate block"
                title={dealer.email}
              >
                {dealer.email}
              </a>
            </div>
          </div>

          {/* Card 4: Location / City */}
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5 min-w-0 transition-all hover:border-slate-200 dark:hover:border-slate-600">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">location_on</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                {isSw ? 'Eneo / Mji' : 'Location'}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block" title={`${dealer.city}, ${dealer.country}`}>
                {dealer.city}, {dealer.country}
              </span>
            </div>
          </div>

          {/* Card 5: Registered Branches */}
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5 min-w-0 transition-all hover:border-slate-200 dark:hover:border-slate-600">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">storefront</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                {isSw ? 'Matawi' : 'Branches'}
              </span>
              <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 block">
                {dealerBranches.length || dealer.branchesCount || 1} {isSw ? 'Matawi' : 'Branches'}
              </span>
            </div>
          </div>

          {/* Card 6: Total Manpower */}
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5 min-w-0 transition-all hover:border-slate-200 dark:hover:border-slate-600">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[17px]">badge</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                {isSw ? 'Wafanyakazi' : 'Manpower'}
              </span>
              <span className="text-xs font-mono font-extrabold text-purple-600 dark:text-purple-400 block">
                {dealerStaff.length} {isSw ? 'Wafanyakazi' : 'Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Key Summary KPI Metrics: Take-In, Take-Out, In-Stock, Revenue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Take-In (Mzigo Ulioingia) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isSw ? 'Mzigo Ulioingia (Take-In)' : 'Total Take-In'}
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">move_to_inbox</span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {totalTakeIn} <span className="text-xs font-normal text-slate-400">{t.units}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>2W: <strong>{takeIn2W}</strong></span>
            <span>3W: <strong>{takeIn3W}</strong></span>
          </div>
        </div>

        {/* Metric 2: Total Take-Out (Mzigo Uliotoka / Mauzo) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              {isSw ? 'Mzigo Uliouzwa (Take-Out)' : 'Total Take-Out'}
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">outbox</span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {totalTakeOut} <span className="text-xs font-normal text-slate-400">{t.units}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>2W: <strong>{takeOut2W}</strong></span>
            <span>3W: <strong>{takeOut3W}</strong></span>
          </div>
        </div>

        {/* Metric 3: Current In-Stock (Stoo Iliyopo Sasa) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {isSw ? 'Stoo ya Sasa (In-Stock)' : 'Current In-Stock'}
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-300">
            {inStockUnits.length} <span className="text-xs font-normal text-slate-400">{t.units}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>2W: <strong>{inStock2W}</strong></span>
            <span>3W: <strong>{inStock3W}</strong></span>
          </div>
        </div>

        {/* Metric 4: Revenue & Turnover */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              {isSw ? 'Mapato ya Mauzo' : 'Sales Revenue'}
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#006948] dark:text-emerald-400 truncate">
            TZS {(totalRevenueTZS / 1000000).toFixed(1)}M
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Turnover: <strong className="text-emerald-600 dark:text-emerald-400">{turnoverRate}%</strong></span>
            <span>Avg: <strong>{(avgSaleValue / 1000000).toFixed(1)}M</strong></span>
          </div>
        </div>
      </div>

      {/* 4. VISUAL TAKE-IN VS TAKE-OUT FLOW GRAPH & ANALYTICS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#006948] dark:text-emerald-400">bar_chart</span>
              <span>{isSw ? 'Grafu ya Mzigo Ulioingia (Take-In) dhidi ya Uliouzwa (Take-Out)' : 'Take-In vs Take-Out Stock Flow Analytics'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSw ? 'Mtiririko wa usambazaji na mauzo ya vyombo vya moto katika miezi 6 iliyopita.' : 'Monthly flow comparing inventory arrivals against completed customer vehicle sales.'}
            </p>
          </div>

          {/* Graph Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#006948] shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300">{isSw ? 'Take-In (Mzigo Ulioingia)' : 'Take-In (Received)'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600 shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300">{isSw ? 'Take-Out (Uliouzwa)' : 'Take-Out (Sold)'}</span>
            </span>
          </div>
        </div>

        {/* Dual Market Line Graph */}
        {(() => {
          const chartW = 660;
          const chartH = 180;
          const padX = 45;
          const padTop = 32;
          const padBottom = 26;
          const usableW = chartW - padX * 2;
          const usableH = chartH - padTop - padBottom;
          const baseY = chartH - padBottom;

          const flowMax = Math.max(...monthlyFlowData.flatMap((d) => [d.takeIn, d.takeOut]), 8) * 1.18;
          const n = monthlyFlowData.length;

          const inPoints = monthlyFlowData.map((d, idx) => ({
            x: padX + (idx / (n - 1)) * usableW,
            y: padTop + (1 - d.takeIn / flowMax) * usableH,
            value: d.takeIn,
            name: d.name,
          }));

          const outPoints = monthlyFlowData.map((d, idx) => ({
            x: padX + (idx / (n - 1)) * usableW,
            y: padTop + (1 - d.takeOut / flowMax) * usableH,
            value: d.takeOut,
            name: d.name,
          }));

          // Smooth Bezier Curve generator
          const buildCurve = (pts: { x: number; y: number }[]) => {
            let d = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
              const p0 = pts[i];
              const p1 = pts[i + 1];
              const cpx1 = p0.x + (p1.x - p0.x) * 0.5;
              const cpy1 = p0.y;
              const cpx2 = p0.x + (p1.x - p0.x) * 0.5;
              const cpy2 = p1.y;
              d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
            }
            return d;
          };

          const inCurve = buildCurve(inPoints);
          const outCurve = buildCurve(outPoints);
          const inArea = `${inCurve} L ${inPoints[inPoints.length - 1].x} ${baseY} L ${inPoints[0].x} ${baseY} Z`;
          const outArea = `${outCurve} L ${outPoints[outPoints.length - 1].x} ${baseY} L ${outPoints[0].x} ${baseY} Z`;

          return (
            <div className="space-y-2">
              <div className="p-3 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-inner">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-44 sm:h-56 overflow-visible select-none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Take-In Green Area Gradient */}
                    <linearGradient id="takeInArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                      <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Take-Out Blue Area Gradient */}
                    <linearGradient id="takeOutArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                      <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Line Stroke Gradients */}
                    <linearGradient id="takeInStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>

                    <linearGradient id="takeOutStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>

                    {/* Filter Glows */}
                    <filter id="inLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
                    </filter>
                    <filter id="outLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Horizontal Gridlines */}
                  <line x1="20" y1={padTop} x2={chartW - 20} y2={padTop} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="20" y1={padTop + usableH * 0.5} x2={chartW - 20} y2={padTop + usableH * 0.5} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" />
                  <line x1="20" y1={baseY} x2={chartW - 20} y2={baseY} stroke="#334155" strokeWidth="1" opacity="0.4" />

                  {/* Shaded Areas */}
                  <path d={inArea} fill="url(#takeInArea)" />
                  <path d={outArea} fill="url(#takeOutArea)" />

                  {/* Vertical Guideline Drops */}
                  {inPoints.map((p, i) => (
                    <line
                      key={i}
                      x1={p.x}
                      y1={Math.min(p.y, outPoints[i].y)}
                      x2={p.x}
                      y2={baseY}
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                      opacity="0.3"
                    />
                  ))}

                  {/* Take-In Line Path */}
                  <path
                    d={inCurve}
                    fill="none"
                    stroke="url(#takeInStroke)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#inLineGlow)"
                  />

                  {/* Take-Out Line Path */}
                  <path
                    d={outCurve}
                    fill="none"
                    stroke="url(#takeOutStroke)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#outLineGlow)"
                  />

                  {/* Data Nodes & Badges for Take-In (Green) */}
                  {inPoints.map((p, i) => (
                    <g key={`in-${i}`}>
                      <circle cx={p.x} cy={p.y} r="5.5" fill="#0E131F" stroke="#10b981" strokeWidth="2.5" />
                      <circle cx={p.x} cy={p.y} r="2" fill="#10b981" />
                      {/* Pill Badge */}
                      <g transform={`translate(${p.x}, ${p.y - 14})`}>
                        <rect x="-18" y="-9" width="36" height="17" rx="5" fill="#006948" stroke="#34d399" strokeWidth="1" />
                        <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                          +{p.value}
                        </text>
                      </g>
                    </g>
                  ))}

                  {/* Data Nodes & Badges for Take-Out (Blue) */}
                  {outPoints.map((p, i) => (
                    <g key={`out-${i}`}>
                      <circle cx={p.x} cy={p.y} r="5.5" fill="#0E131F" stroke="#3b82f6" strokeWidth="2.5" />
                      <circle cx={p.x} cy={p.y} r="2" fill="#3b82f6" />
                      {/* Pill Badge */}
                      <g transform={`translate(${p.x}, ${p.y + 14})`}>
                        <rect x="-18" y="-8.5" width="36" height="17" rx="5" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
                        <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                          -{p.value}
                        </text>
                      </g>
                    </g>
                  ))}
                </svg>

                {/* Bottom Month Axis Markers */}
                <div className="flex items-center justify-between px-6 pt-2 text-xs font-mono text-slate-300">
                  {monthlyFlowData.map((d, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="font-bold text-slate-200">{d.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="text-emerald-400 font-bold">+{d.takeIn}</span>
                        <span className="mx-0.5 text-slate-600">/</span>
                        <span className="text-blue-400 font-bold">-{d.takeOut}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

          {/* Bottom Summary Bar for Flow */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{isSw ? 'Jumla ya Take-In' : 'Total Inflow'}:</span>
              <span className="font-mono font-extrabold text-[#006948] dark:text-emerald-400 text-sm">
                {totalTakeIn} {t.units}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{isSw ? 'Jumla ya Take-Out' : 'Total Outflow'}:</span>
              <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                {totalTakeOut} {t.units}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{isSw ? 'Uwiano wa 2W / 3W' : '2W / 3W Ratio'}:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                {takeIn2W} (2W) : {takeIn3W} (3W)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{isSw ? 'Kasi ya Mauzo' : 'Sales Velocity'}:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                {turnoverRate}% {isSw ? 'ya mzigo huuzwa' : 'turnover rate'}
              </span>
            </div>
          </div>
        </div>

      {/* 5. TABS BAR (Overview, Stoo, Mauzo, Manpower, Matawi) */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto enterprise-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#006948] text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">dashboard</span>
            <span>{isSw ? 'Muhtasari' : 'Overview'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-[#006948] text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">inventory_2</span>
            <span>{isSw ? 'Stoo ya Vyombo' : 'In-Stock Units'} ({inStockUnits.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sales'
                ? 'bg-[#006948] text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">point_of_sale</span>
            <span>{isSw ? 'Historia ya Mauzo' : 'Sales History'} ({dealerSales.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manpower')}
            className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'manpower'
                ? 'bg-[#006948] text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">badge</span>
            <span>{isSw ? 'Wafanyakazi' : 'Manpower'} ({dealerStaff.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'branches'
                ? 'bg-[#006948] text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">storefront</span>
            <span>{isSw ? 'Matawi' : 'Branches'} ({dealerBranches.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Owner & Legal Profile */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006948] dark:text-emerald-400">verified_user</span>
                <span>{isSw ? 'Taarifa za Usajili & Mmiliki Mkuu' : 'Registration & Owner Profile'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">{isSw ? 'Jina Kamili la Mmiliki:' : 'Owner Full Name:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{dealer.ownerName}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">{isSw ? 'Nambari ya Simu:' : 'Phone Number:'}</span>
                  <a href={`tel:${dealer.phone}`} className="font-mono font-bold text-[#006948] dark:text-emerald-400 hover:underline">
                    {dealer.phone}
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">{isSw ? 'Barua Pepe:' : 'Email Address:'}</span>
                  <a href={`mailto:${dealer.email}`} className="font-mono text-slate-700 dark:text-slate-300 hover:underline">
                    {dealer.email}
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">{isSw ? 'Eneo / Mji / Nchi:' : 'Location:'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dealer.city}{dealer.region ? `, ${dealer.region}` : ''} ({dealer.country})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isSw ? 'Nenosiri la Awali la Dealer Portal:' : 'Initial Dealer Password:'}</span>
                    <span className="font-mono font-bold text-amber-500">{dealer.password || '123456'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenResetPasswordModal(dealer)}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-200 dark:border-amber-800 cursor-pointer"
                  >
                    {isSw ? 'Badili Nenosiri' : 'Change Password'}
                  </button>
                </div>

                {dealer.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-1">{isSw ? 'Maelezo ya Ziada (Notes):' : 'Notes / Remarks:'}</span>
                    <p className="text-slate-700 dark:text-slate-300">{dealer.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Branches Quick Snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#006948] dark:text-emerald-400">storefront</span>
                  <span>{isSw ? 'Matawi Chini ya Dealer Huyu' : 'Branches Summary'} ({dealerBranches.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('branches')}
                  className="text-xs font-bold text-[#006948] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isSw ? 'Tazama Yote' : 'View All'} →
                </button>
              </div>

              {dealerBranches.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 dark:text-slate-600 block">storefront</span>
                  <p className="text-xs">{isSw ? 'Hakuna tawi la ziada lililosajiliwa chini ya code hii.' : 'No sub-branches registered under this dealer code.'}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dealerBranches.slice(0, 4).map((b) => {
                    const bUnits = units.filter((u) => u.branchId === b.id && u.status === 'IN STOCK').length;
                    const bSold = sales.filter((s) => s.branchId === b.id).length;

                    return (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white truncate">{b.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded">
                              {b.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {b.location} • {isSw ? 'Meneja:' : 'Manager:'} {b.managerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/60">
                            {bUnits} {isSw ? 'Stoo' : 'Stock'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/60">
                            {bSold} {isSw ? 'Mauzo' : 'Sold'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: In-Stock Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden space-y-3 p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">inventory_2</span>
                <span>{isSw ? 'Vitengo Vilivyopo Stoo ya Dealer' : 'Current Physical Inventory'} ({filteredInventory.length})</span>
              </h3>

              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder={isSw ? 'Tafuta model, VIN au tawi...' : 'Search model, VIN, or branch...'}
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setInventoryPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                />
              </div>
            </div>

            <div className="overflow-x-auto enterprise-scrollbar w-full border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr className="whitespace-nowrap">
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700 w-12 text-center">#</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Mfano wa Chombo' : 'Vehicle Model'}</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700 font-mono">VIN / Chassis</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700 text-center">{isSw ? 'Aina' : 'Type'}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Rangi' : 'Color'}</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Tawi' : 'Branch'}</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700 font-mono">{isSw ? 'Tarehe ya Kupokea' : 'Received Date'}</th>
                    <th className="py-3 px-3 text-center">{isSw ? 'Hali' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        {isSw ? 'Hakuna vitengo vilivyopo stoo vinavyolingana na utafutaji.' : 'No units in stock matching your filter.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedInventory.map((unit, idx) => {
                      const rowNum = (inventoryPage - 1) * inventoryPageSize + idx + 1;
                      return (
                        <tr key={unit.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800 text-center font-mono text-slate-400">
                            {rowNum}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                            {unit.modelName}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {unit.chassisNumber}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800 text-center font-mono">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {unit.vehicleType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800">
                            {formatVehicleColor(unit.color, language)}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {unit.branchName}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-mono text-slate-500">
                            {unit.receivedDate}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              IN STOCK
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Inventory */}
            <Pagination
              currentPage={inventoryPage}
              totalItems={filteredInventory.length}
              pageSize={inventoryPageSize}
              onPageChange={setInventoryPage}
              onPageSizeChange={(newSize) => {
                setInventoryPageSize(newSize);
                setInventoryPage(1);
              }}
              language={language}
            />
          </div>
        )}

        {/* Tab 3: Sales History Table */}
        {activeTab === 'sales' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden space-y-3 p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">point_of_sale</span>
                <span>{isSw ? 'Historia Kamili ya Mauzo ya Dealer' : 'Completed Sales History'} ({filteredSales.length})</span>
              </h3>

              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder={isSw ? 'Tafuta mteja, gari, simu...' : 'Search customer, model, phone...'}
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setSalesPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948]"
                />
              </div>
            </div>

            <div className="overflow-x-auto enterprise-scrollbar w-full border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr className="whitespace-nowrap">
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700 w-12 text-center">#</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700 font-mono">{isSw ? 'Tarehe' : 'Date'}</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Mteja' : 'Customer'}</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700 font-mono">{isSw ? 'Simu' : 'Phone'}</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Chombo' : 'Vehicle'}</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700 font-mono">VIN / Chassis</th>
                    <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700 text-right font-mono">{isSw ? 'Kiasi (TZS)' : 'Amount TZS'}</th>
                    <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700 text-center">{isSw ? 'Malipo' : 'Payment'}</th>
                    <th className="py-3 px-4">{isSw ? 'Tawi' : 'Branch'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        {isSw ? 'Hakuna rekodi za mauzo zilizopatikana.' : 'No sales records found.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedSales.map((sale, idx) => {
                      const rowNum = (salesPage - 1) * salesPageSize + idx + 1;
                      return (
                        <tr key={sale.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800 text-center font-mono text-slate-400">
                            {rowNum}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-300">
                            {sale.date}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                            {sale.customerName}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-mono text-slate-500">
                            {sale.customerPhone}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-medium">
                            {sale.modelName}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {sale.chassisNumber}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 text-right font-mono font-bold text-slate-900 dark:text-white">
                            TZS {(sale.amountPaid ?? sale.amount).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                            {sale.branchName}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Sales */}
            <Pagination
              currentPage={salesPage}
              totalItems={filteredSales.length}
              pageSize={salesPageSize}
              onPageChange={setSalesPage}
              onPageSizeChange={(newSize) => {
                setSalesPageSize(newSize);
                setSalesPage(1);
              }}
              language={language}
            />
          </div>
        )}

        {/* Tab 4: Manpower & Staff Table */}
        {activeTab === 'manpower' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-purple-600">badge</span>
                <span>{isSw ? 'Wafanyakazi & Uongozi wa Dealer Huyu (Man Power)' : 'Dealer Manpower & Staff'} ({dealerStaff.length})</span>
              </h3>
            </div>

            {dealerStaff.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600 block">people</span>
                <p className="text-xs">{isSw ? 'Hakuna wafanyakazi maalum waliosajiliwa bado chini ya matawi ya dealer huyu.' : 'No staff registered under this dealer branches yet.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto enterprise-scrollbar w-full border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                  <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr className="whitespace-nowrap">
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700 w-12 text-center">#</th>
                      <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Jina la Mfanyakazi' : 'Staff Name'}</th>
                      <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Wadhifa / Cheo' : 'Designation / Role'}</th>
                      <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Tawi' : 'Branch'}</th>
                      <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700 font-mono">{isSw ? 'Simu' : 'Phone'}</th>
                      <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-700">{isSw ? 'Barua Pepe' : 'Email'}</th>
                      <th className="py-3 px-3 text-center">{isSw ? 'Mauzo ya Mwezi' : 'MTD Sales'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dealerStaff.map((member, idx) => (
                      <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                              )}
                            </div>
                            <span>{member.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {member.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                          {member.branchName}
                        </td>
                        <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-mono">
                          <a href={`tel:${member.phone}`} className="text-[#006948] dark:text-emerald-400 hover:underline">
                            {member.phone}
                          </a>
                        </td>
                        <td className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800 font-mono text-slate-500">
                          {member.email}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                          {member.mtdSalesCount !== undefined ? `${member.mtdSalesCount} ${t.units}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Branches Grid */}
        {activeTab === 'branches' && (
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-teal-600">storefront</span>
              <span>{isSw ? 'Matawi Yote Chini ya Dealer Huyu' : 'Dealership Branches Network'} ({dealerBranches.length})</span>
            </h3>

            {dealerBranches.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600 block">storefront</span>
                <p className="text-xs">{isSw ? 'Hakuna matawi ya ziada yaliyosajiliwa.' : 'No branches registered.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dealerBranches.map((branch) => {
                  const bStock = units.filter((u) => u.branchId === branch.id && u.status === 'IN STOCK').length;
                  const bSold = sales.filter((s) => s.branchId === branch.id).length;

                  return (
                    <div
                      key={branch.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {branch.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {branch.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{branch.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          <span>{branch.location} ({branch.region})</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 text-center">
                          <span className="text-[10px] text-slate-400 font-sans block">{isSw ? 'Stoo ya Tawi' : 'In Stock'}</span>
                          <span className="font-extrabold text-[#006948] dark:text-emerald-400 text-sm">
                            {bStock} {t.units}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 text-center">
                          <span className="text-[10px] text-slate-400 font-sans block">{isSw ? 'Jumla ya Mauzo' : 'Sold'}</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                            {bSold} {t.units}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 text-[11px] text-slate-500">
                        {isSw ? 'Meneja wa Tawi:' : 'Branch Manager:'} <strong className="text-slate-700 dark:text-slate-300">{branch.managerName}</strong> ({branch.phone})
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
