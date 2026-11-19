import React, { useState, useEffect } from 'react';
import { 
  Branch, 
  VehicleUnit, 
  SaleRecord, 
  SupplierOrder, 
  NavTab, 
  AuthUser,
  Expense,
  VehicleModel,
  Dealer
} from '../types';
import { DEALER_INFO } from '../data/mockData';
import { Language, translations } from '../i18n/translations';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  QuickChassisChip,
} from '../components/common';

type TimeRange = 'today' | 'this_week' | 'this_month' | 'all_time';

interface DashboardViewProps {
  onSelectTab: (tab: NavTab) => void;
  branches: Branch[];
  units: VehicleUnit[];
  sales: SaleRecord[];
  orders: SupplierOrder[];
  expenses?: Expense[];
  models?: VehicleModel[];
  dealers?: Dealer[];
  currentUser: AuthUser | null;
  onOpenRecordSaleModal: () => void;
  onOpenReceiveStockModal: () => void;
  onOpenUnitDetail: (unit: VehicleUnit) => void;
  onOpenReceipt: (sale: SaleRecord) => void;
  isDarkMode: boolean;
  language: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  branches,
  units,
  sales,
  orders,
  expenses = [],
  models = [],
  dealers = [],
  currentUser,
  onOpenRecordSaleModal,
  onOpenReceiveStockModal,
  onOpenUnitDetail,
  onOpenReceipt,
  isDarkMode,
  language,
}) => {
  const isSuperAdmin = (currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && !currentUser?.isSuperAdminImpersonating;
  const isBranchStaff = currentUser?.role === 'branch_manager' || currentUser?.role === 'storekeeper' || currentUser?.role === 'sales_person';
  const t = translations[language];

  // Super Admin Cascading Filter State: Dealer -> Branch
  const [selectedDealerCode, setSelectedDealerCode] = useState<string>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

  // Time Range Filter State: Default is 'today'
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  // Pagination state for recent sales
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Available branches for cascading filter
  const availableBranchesForFilter = isSuperAdmin
    ? (selectedDealerCode === 'ALL' ? branches : branches.filter((b) => b.dealerCode === selectedDealerCode))
    : branches;

  const handleDealerChange = (dealerCode: string) => {
    setSelectedDealerCode(dealerCode);
    setSelectedBranchId('ALL');
    setCurrentPage(1);
  };

  // Reset page on timeRange or dealer change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange, selectedDealerCode, selectedBranchId]);

  // Filter units and sales with hierarchical multi-dealer logic
  const relevantUnits = units.filter((u) => {
    if (isBranchStaff && currentUser?.branchCode) {
      return u.branchCode === currentUser.branchCode;
    }
    if (isSuperAdmin) {
      if (selectedDealerCode !== 'ALL' && u.dealerCode !== selectedDealerCode) return false;
      if (selectedBranchId !== 'ALL' && u.branchId !== selectedBranchId) return false;
      return true;
    }
    if (selectedBranchId !== 'ALL' && u.branchId !== selectedBranchId) return false;
    return true;
  });

  const relevantSales = sales.filter((s) => {
    if (isBranchStaff && currentUser?.branchCode) {
      return s.branchCode === currentUser.branchCode;
    }
    if (isSuperAdmin) {
      if (selectedDealerCode !== 'ALL' && s.dealerCode !== selectedDealerCode) return false;
      if (selectedBranchId !== 'ALL' && s.branchId !== selectedBranchId) return false;
      return true;
    }
    if (selectedBranchId !== 'ALL' && s.branchId !== selectedBranchId) return false;
    return true;
  });

  const relevantExpenses = expenses.filter((e) => {
    const b = branches.find((br) => br.id === e.branchId);
    if (isBranchStaff && currentUser?.branchCode) {
      return b?.code === currentUser.branchCode;
    }
    if (isSuperAdmin) {
      if (selectedDealerCode !== 'ALL' && b?.dealerCode !== selectedDealerCode) return false;
      if (selectedBranchId !== 'ALL' && e.branchId !== selectedBranchId) return false;
      return true;
    }
    if (selectedBranchId !== 'ALL' && e.branchId !== selectedBranchId) return false;
    return true;
  });

  // Filter sales based on time range (Anchor: 2026-09-23 or current date)
  const todayStr = '2026-09-23';
  const filteredSales = relevantSales.filter((s) => {
    if (timeRange === 'today') {
      return s.date === todayStr || s.date === new Date().toISOString().split('T')[0];
    }
    if (timeRange === 'this_week') {
      return s.date >= '2026-09-17' && s.date <= '2026-09-30';
    }
    if (timeRange === 'this_month') {
      return s.date.startsWith('2026-09') || s.date.startsWith(new Date().toISOString().slice(0, 7));
    }
    return true; // 'all_time'
  });

  // Filter expenses based on time range
  const filteredExpenses = relevantExpenses.filter((e) => {
    if (timeRange === 'today') {
      return e.date === todayStr || e.date === new Date().toISOString().split('T')[0];
    }
    if (timeRange === 'this_week') {
      return e.date >= '2026-09-17' && e.date <= '2026-09-30';
    }
    if (timeRange === 'this_month') {
      return e.date.startsWith('2026-09') || e.date.startsWith(new Date().toISOString().slice(0, 7));
    }
    return true; // 'all_time'
  });

  // Dynamic period metrics (Revenue, Units Sold, Real Expenses & Gross/Net Profit)
  const periodRevenue = filteredSales.reduce((acc, s) => acc + (s.amountPaid ?? s.amount), 0);
  const periodUnitsSold = filteredSales.length;

  // Period Cost of Goods Sold (COGS)
  const periodCOGS = filteredSales.reduce((acc, s) => {
    const cost = s.costPrice || (s.amount > 6000000 ? s.amount - 1500000 : s.amount - 600000);
    return acc + cost;
  }, 0);

  const periodGrossProfit = Math.max(0, periodRevenue - periodCOGS);
  const periodExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const periodNetProfit = Math.max(0, periodGrossProfit - periodExpense);
  const profitMarginPercent = periodRevenue > 0 ? Math.round((periodNetProfit / periodRevenue) * 100) : 0;

  // Key Instant Inventory Metrics
  const inStockUnits = relevantUnits.filter((u) => u.status === 'IN STOCK');
  const soldUnits = relevantUnits.filter((u) => u.status === 'SOLD');
  const reservedUnits = relevantUnits.filter((u) => u.status === 'RESERVED');
  
  const totalRevenue = relevantSales.reduce((acc, s) => acc + (s.amountPaid ?? s.amount), 0);
  const todaySalesCount = relevantSales.filter(
    (s) => s.date === todayStr || s.date === new Date().toISOString().split('T')[0]
  ).length;

  const monthSales = relevantSales.filter(
    (s) => s.date.startsWith('2026-09') || s.date.startsWith(new Date().toISOString().slice(0, 7))
  );
  const monthSalesCount = monthSales.length;
  const monthRevenue = monthSales.reduce((acc, s) => acc + (s.amountPaid ?? s.amount), 0);
  const monthExpensesList = relevantExpenses.filter((e) => e.date.startsWith('2026-09') || e.date.startsWith(new Date().toISOString().slice(0, 7)));
  const monthExpense = monthExpensesList.reduce((acc, e) => acc + e.amount, 0);
  const monthCOGS = monthSales.reduce((acc, s) => acc + (s.costPrice || (s.amount > 6000000 ? s.amount - 1500000 : s.amount - 600000)), 0);
  const monthGrossProfit = Math.max(0, monthRevenue - monthCOGS);
  const monthNetProfit = Math.max(0, monthGrossProfit - monthExpense);

  const units2WInStock = inStockUnits.filter((u) => u.vehicleType === '2W').length;
  const units3WInStock = inStockUnits.filter((u) => u.vehicleType === '3W').length;

  const periodUnits2WSold = filteredSales.filter((s) => s.vehicleType === '2W').length;
  const periodUnits3WSold = filteredSales.filter((s) => s.vehicleType === '3W').length;

  const allTimeUnitsSold = relevantSales.length;
  const allTime2WSold = relevantSales.filter((s) => s.vehicleType === '2W').length;
  const allTime3WSold = relevantSales.filter((s) => s.vehicleType === '3W').length;

  // Instant Chassis Quick Search State
  const [quickChassisSearch, setQuickChassisSearch] = useState('');
  const quickSearchResult = quickChassisSearch.trim()
    ? relevantUnits.find(
        (u) =>
          u.chassisNumber.toLowerCase().includes(quickChassisSearch.toLowerCase().trim()) ||
          u.engineNumber.toLowerCase().includes(quickChassisSearch.toLowerCase().trim()) ||
          u.id.toLowerCase().includes(quickChassisSearch.toLowerCase().trim())
      )
    : null;

  const getPaymentMethodLabel = (method: string, lang: Language) => {
    if (lang === 'sw') {
      switch (method) {
        case 'CASH':
          return 'Pesa Taslimu';
        case 'MOBILE_MONEY':
          return 'Pesa ya Simu';
        case 'BANK_TRANSFER':
          return 'Benki';
        case 'INSTALLMENT':
          return 'Kwa Awamu';
        default:
          return method.replace('_', ' ');
      }
    }
    return method.replace('_', ' ');
  };

  const getBranchStatusLabel = (status: string, lang: Language) => {
    if (lang === 'sw') {
      switch (status) {
        case 'ACTIVE':
          return 'Linafanya Kazi';
        case 'INACTIVE':
          return 'Limesimama';
        default:
          return status;
      }
    }
    return status;
  };

  const getTimeRangeLabel = (range: TimeRange, lang: Language) => {
    switch (range) {
      case 'today':
        return lang === 'sw' ? 'Leo' : 'Today';
      case 'this_week':
        return lang === 'sw' ? 'Wiki Hii' : 'This Week';
      case 'this_month':
        return lang === 'sw' ? 'Mwezi Huu' : 'This Month';
      case 'all_time':
        return lang === 'sw' ? 'Muda Wote' : 'All Time';
    }
  };

  const activeDealerObj = dealers.find((d) => d.code === selectedDealerCode);
  const activeBranchObj = branches.find((b) => b.id === selectedBranchId);

  const recentSalesColumns: ColumnDef<SaleRecord>[] = [
    {
      header: '#',
      width: '45px',
      cell: (_sale, idx) => (
        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {idx + 1}
        </span>
      ),
    },
    {
      header: t.date,
      accessor: 'date',
      sortable: true,
      cell: (sale) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {sale.date}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Aina' : 'Category',
      accessor: 'vehicleType',
      sortable: true,
      align: 'center',
      cell: (sale) => (
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-bold inline-block ${
            sale.vehicleType === '2W'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
          }`}
        >
          {sale.vehicleType}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Modeli' : 'Model',
      accessor: 'modelName',
      sortable: true,
      cell: (sale) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs block">
          {sale.modelName}
        </span>
      ),
    },
    {
      header: t.colChassis,
      accessor: 'chassisNumber',
      cell: (sale) => <QuickChassisChip chassisNumber={sale.chassisNumber} language={language} />,
    },
    {
      header: language === 'sw' ? 'Tawi' : 'Branch Name',
      accessor: 'branchName',
      sortable: true,
      cell: (sale) => (
        <span className="font-medium text-slate-800 dark:text-slate-200 text-xs block">
          {sale.branchName}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Msimbo wa Tawi' : 'Branch Code',
      accessor: 'branchCode',
      sortable: true,
      cell: (sale) => (
        <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
          {sale.branchCode}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Jina la Mteja' : 'Customer Name',
      accessor: 'customerName',
      sortable: true,
      cell: (sale) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs block">
          {sale.customerName}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Namba ya Simu' : 'Phone Number',
      accessor: 'customerPhone',
      sortable: true,
      cell: (sale) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {sale.customerPhone}
        </span>
      ),
    },
    {
      header: t.unitPrice,
      align: 'right',
      sortable: true,
      cell: (sale) => {
        const unitPrice = sale.unitPrice ?? sale.amount;
        return (
          <span className="font-mono font-semibold text-xs text-slate-700 dark:text-slate-300">
            TZS {unitPrice.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: t.amountPaid,
      align: 'right',
      sortable: true,
      cell: (sale) => {
        const unitPrice = sale.unitPrice ?? sale.amount;
        const isPartial = sale.paymentStatus === 'PARTIAL' || (sale.remainedAmount !== undefined && sale.remainedAmount > 0);
        const amountPaid = sale.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
        return (
          <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
            TZS {amountPaid.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: t.remained,
      align: 'right',
      sortable: true,
      cell: (sale) => {
        const unitPrice = sale.unitPrice ?? sale.amount;
        const isPartial = sale.paymentStatus === 'PARTIAL' || (sale.remainedAmount !== undefined && sale.remainedAmount > 0);
        const amountPaid = sale.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
        const remained = sale.remainedAmount ?? Math.max(0, unitPrice - amountPaid);
        return remained > 0 ? (
          <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
            TZS {remained.toLocaleString()}
          </span>
        ) : (
          <span className="font-mono text-xs text-slate-400">TZS 0</span>
        );
      },
    },
    {
      header: language === 'sw' ? 'Hali' : 'Status',
      align: 'center',
      cell: (sale) => {
        const isPartial = sale.paymentStatus === 'PARTIAL' || (sale.remainedAmount !== undefined && sale.remainedAmount > 0);
        return <StatusBadge status={isPartial ? 'PARTIAL' : 'PAID'} language={language} />;
      },
    },
    {
      header: language === 'sw' ? 'Risiti' : 'Receipt',
      align: 'right',
      cell: (sale) => (
        <button
          type="button"
          onClick={() => onOpenReceipt(sale)}
          className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 transition-colors"
          title={t.receipt}
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
        </button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      
      {/* 0. SUPER ADMIN MULTI-DEALER FILTER BAR */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {language === 'sw' ? 'Dashibodi ya Super Admin (Global Portal)' : 'Super Admin Global Portal'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedDealerCode === 'ALL' ? 'GLOBAL NETWORK' : activeDealerObj?.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {language === 'sw'
                  ? 'Chuja na tazama takwimu za mtandao mzima, au chagua Dealer na Tawi maalum.'
                  : 'Filter metrics across the entire dealer network, or isolate a specific dealer and branch.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Dealer Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors">
              <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400">hub</span>
              <select
                value={selectedDealerCode}
                onChange={(e) => handleDealerChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {language === 'sw' ? 'Ma-Dealer Wote (Mtandao Mzima)' : 'All Dealers (Global Network)'}
                </option>
                {dealers.map((d) => (
                  <option key={d.id} value={d.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Selector (Cascades dynamically based on Dealer) */}
            <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors">
              <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">storefront</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-white outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {selectedDealerCode === 'ALL'
                    ? (language === 'sw' ? 'Matawi Yote Mtandaoni' : 'All Network Branches')
                    : (language === 'sw' ? 'Matawi Yote ya Dealer Huyu' : 'All Branches of this Dealer')}
                </option>
                {availableBranchesForFilter.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP HERO BANNER */}
      <div className={`rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 border transition-all text-white ${
        isSuperAdmin 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-[#004d34] border-[#005a3e]'
      }`}>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs border ${
              isSuperAdmin
                ? 'bg-slate-800 text-amber-300 border-slate-700'
                : 'bg-white/10 text-emerald-100 border-white/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSuperAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {isSuperAdmin ? (language === 'sw' ? 'Mfumo Mkuu wa Multi-Dealer' : 'Multi-Dealer Core Engine') : (language === 'sw' ? 'ERP Moja kwa Moja' : 'Live Realtime ERP')}
            </span>
            {selectedDealerCode !== 'ALL' && (
              <span className="text-xs font-bold text-amber-300 font-mono">
                • {activeDealerObj?.name}
              </span>
            )}
            {selectedBranchId !== 'ALL' && (
              <span className="text-xs font-bold text-emerald-200 font-mono">
                / {activeBranchObj?.name}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white font-sans">
            {isSuperAdmin 
              ? (selectedDealerCode === 'ALL' 
                  ? (language === 'sw' ? 'Mtandao wa Ma-Dealer Wote Nchini' : 'Nationwide Multi-Dealer Network Overview')
                  : `${activeDealerObj?.name} (${activeDealerObj?.code})`)
              : currentUser?.role === 'dealer' || currentUser?.role === 'owner' 
              ? (currentUser?.dealerName ? `${currentUser.dealerName} — ${language === 'sw' ? 'Muhtasari wa Biashara' : 'Business Dashboard'}` : t.dashTitle)
              : currentUser?.branchName}
          </h2>
          <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed font-normal ${
            isSuperAdmin ? 'text-slate-300' : 'text-emerald-100/90'
          }`}>
            {language === 'sw' 
              ? `Pikipiki ${inStockUnits.length} ziko stoo (2W: ${units2WInStock} | 3W: ${units3WInStock}). Mauzo ya ${getTimeRangeLabel(timeRange, 'sw')} ni TZS ${(periodRevenue / 1000000).toFixed(1)}M (${periodUnitsSold} vitengo — 2W: ${periodUnits2WSold}, 3W: ${periodUnits3WSold}).`
              : `${inStockUnits.length} motorcycles in stock (2W: ${units2WInStock} | 3W: ${units3WInStock}). ${getTimeRangeLabel(timeRange, 'en')} revenue: TZS ${(periodRevenue / 1000000).toFixed(1)}M across ${periodUnitsSold} units (2W: ${periodUnits2WSold}, 3W: ${periodUnits3WSold}).`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:w-auto w-full items-center relative z-10 shrink-0">
          {isSuperAdmin ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('dealers')}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                <span>{language === 'sw' ? 'Dhibiti Ma-Dealer' : 'Manage Dealers'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('sales')}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                <span>{language === 'sw' ? 'Mauzo Global' : 'Global Sales'}</span>
              </button>
            </>
          ) : currentUser?.role === 'dealer' || currentUser?.role === 'owner' ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('reports')}
                className="w-full sm:w-auto px-3 sm:px-5 py-2.5 bg-white hover:bg-emerald-50 active:scale-95 text-[#006948] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                <span className="truncate">{language === 'sw' ? 'Tazama Ripoti & Uchambuzi' : 'View Reports & Analytics'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('branches')}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-white/25 backdrop-blur-sm transition-all cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span className="truncate">{language === 'sw' ? `Matawi Yote (${availableBranchesForFilter.length})` : `All Branches (${availableBranchesForFilter.length})`}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenRecordSaleModal}
                className="w-full sm:w-auto px-3 sm:px-5 py-2.5 bg-white hover:bg-emerald-50 active:scale-95 text-[#006948] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span className="truncate">{t.actionRecordSale}</span>
              </button>

              <button
                type="button"
                onClick={onOpenReceiveStockModal}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-white/25 backdrop-blur-sm transition-all cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                <span className="truncate">{t.actionReceiveStock}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. FAST CHASSIS SEARCH & SALES PERIOD FILTER (Single Sleek Row) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Quick Chassis / VIN Search */}
        <div className="w-full md:max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder={language === 'sw' ? 'Tafuta Chassis / VIN ya pikipiki...' : 'Search Chassis / VIN number...'}
              value={quickChassisSearch}
              onChange={(e) => setQuickChassisSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
            />
            {quickChassisSearch && (
              <button
                type="button"
                onClick={() => setQuickChassisSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {quickSearchResult && (
            <button
              type="button"
              onClick={() => onOpenUnitDetail(quickSearchResult)}
              className="px-3 py-2 rounded-xl bg-[#006948] hover:bg-[#005a3e] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer animate-in fade-in"
            >
              <span className="truncate max-w-[130px] sm:max-w-[180px]">
                {quickSearchResult.modelName} ({quickSearchResult.branchCode})
              </span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>

        {/* Right: Time Range Filter Buttons */}
        <div className="w-full md:w-auto flex items-center justify-start md:justify-end gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-hide">
          {[
            { id: 'today' as TimeRange, label: language === 'sw' ? 'Leo' : 'Today', count: todaySalesCount },
            { id: 'this_week' as TimeRange, label: language === 'sw' ? 'Wiki Hii' : 'This Week', count: relevantSales.filter(s => s.date >= '2026-09-17').length },
            { id: 'this_month' as TimeRange, label: language === 'sw' ? 'Mwezi Huu' : 'This Month', count: monthSalesCount },
            { id: 'all_time' as TimeRange, label: language === 'sw' ? 'Muda Wote' : 'All Time', count: relevantSales.length },
          ].map((tab) => {
            const isActive = timeRange === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeRange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. BALANCED EXECUTIVE KPI CARDS (5 cards: Stock, Sold, Revenue, Expense, Net Profit) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Total Stock (Inventory Status) */}
        <div 
          onClick={() => onSelectTab('inventory')}
          className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-80" />
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {t.totalStock}
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/50 shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">two_wheeler</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                {inStockUnits.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">{t.units}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono font-bold text-[10px] border border-teal-200/50 dark:border-teal-900">
                2W: {units2WInStock}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px] border border-emerald-200/50 dark:border-emerald-900">
                3W: {units3WInStock}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              {language === 'sw' ? 'Stoo' : 'Stock'}
            </span>
          </div>
        </div>

        {/* Card 2: Sold in Period (Units Sold) */}
        <div 
          onClick={() => onSelectTab('sales')}
          className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80" />
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {timeRange === 'today'
                  ? (language === 'sw' ? 'Zilizouzwa Leo' : 'Sold Today')
                  : timeRange === 'this_week'
                  ? (language === 'sw' ? 'Zilizouzwa Wiki' : 'Sold This Week')
                  : timeRange === 'this_month'
                  ? (language === 'sw' ? 'Zilizouzwa Mwezi' : 'Sold This Month')
                  : (language === 'sw' ? 'Jumla Zilizouzwa' : 'Total Units Sold')}
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">point_of_sale</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 font-sans">
                {periodUnitsSold}
              </span>
              <span className="text-xs font-semibold text-slate-400">{t.units}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[10px] border border-indigo-200/50 dark:border-indigo-900">
                2W: {periodUnits2WSold}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-[10px] border border-purple-200/50 dark:border-purple-900">
                3W: {periodUnits3WSold}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
              {language === 'sw' ? 'Mauzo' : 'Sold'}
            </span>
          </div>
        </div>

        {/* Card 3: Revenue in Period */}
        <div 
          onClick={() => onSelectTab('sales')}
          className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-80" />
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {timeRange === 'today'
                  ? (language === 'sw' ? 'Mapato ya Leo' : "Today's Revenue")
                  : timeRange === 'this_week'
                  ? (language === 'sw' ? 'Mapato ya Wiki' : 'This Week Revenue')
                  : timeRange === 'this_month'
                  ? (language === 'sw' ? 'Mapato ya Mwezi' : 'This Month Revenue')
                  : (language === 'sw' ? 'Jumla ya Mapato' : 'Total Revenue')}
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">payments</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 font-mono">
                TZS {(periodRevenue / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate font-medium text-[10px] sm:text-[11px]">
              {language === 'sw'
                ? (timeRange === 'today' ? `Mwezi: TZS ${(monthRevenue / 1000000).toFixed(0)}M` : `Jumla: TZS ${(totalRevenue / 1000000).toFixed(0)}M`)
                : (timeRange === 'today' ? `MTD: TZS ${(monthRevenue / 1000000).toFixed(0)}M` : `Total: TZS ${(totalRevenue / 1000000).toFixed(0)}M`)}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0 border border-emerald-200/50 dark:border-emerald-900">
              {language === 'sw' ? 'Mauzo' : 'Sales'}
            </span>
          </div>
        </div>

        {/* Card 4: Expense in Period */}
        <div 
          onClick={() => onSelectTab('reports')}
          className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600 opacity-80" />
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {timeRange === 'today'
                  ? (language === 'sw' ? 'Matumizi ya Leo' : "Today's Expenses")
                  : timeRange === 'this_week'
                  ? (language === 'sw' ? 'Matumizi ya Wiki' : 'This Week Expenses')
                  : timeRange === 'this_month'
                  ? (language === 'sw' ? 'Matumizi ya Mwezi' : 'This Month Expenses')
                  : (language === 'sw' ? 'Jumla ya Matumizi' : 'Total Expenses')}
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/50 shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">receipt_long</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
                TZS {(periodExpense / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate font-medium text-[10px] sm:text-[11px]">
              {language === 'sw'
                ? (timeRange === 'today' ? `Mwezi: TZS ${(monthExpense / 1000000).toFixed(0)}M` : `Uendeshaji`)
                : (timeRange === 'today' ? `MTD: TZS ${(monthExpense / 1000000).toFixed(0)}M` : `Operations`)}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-[10px] shrink-0 border border-rose-200/50 dark:border-rose-900">
              {language === 'sw' ? 'Gharama' : 'Cost'}
            </span>
          </div>
        </div>

        {/* Card 5: Net Profit in Period (Executive Hero Card ⭐) */}
        <div 
          onClick={() => onSelectTab('reports')}
          className="col-span-2 md:col-span-1 relative overflow-hidden bg-gradient-to-br from-[#003d29] via-[#005a3e] to-[#00734f] text-white rounded-2xl p-3.5 sm:p-4 shadow-md shadow-emerald-950/20 border border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/30 hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100/90 truncate">
                {timeRange === 'today'
                  ? (language === 'sw' ? 'Faida Halisi ya Leo' : "Today's Net Profit")
                  : timeRange === 'this_week'
                  ? (language === 'sw' ? 'Faida ya Wiki Hii' : 'This Week Net Profit')
                  : timeRange === 'this_month'
                  ? (language === 'sw' ? 'Faida ya Mwezi Huu' : 'This Month Net Profit')
                  : (language === 'sw' ? 'Jumla ya Faida Halisi' : 'Total Net Profit')}
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 text-emerald-200 flex items-center justify-center border border-white/20 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">query_stats</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-white font-mono drop-shadow-xs">
                TZS {(periodNetProfit / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
          <div className="relative z-10 mt-3 pt-2.5 border-t border-emerald-400/25 flex items-center justify-between gap-1 text-[11px] text-emerald-100/80">
            <span className="truncate font-medium text-[10px] sm:text-[11px]">
              {language === 'sw'
                ? (timeRange === 'today' ? `Mwezi: TZS ${(monthNetProfit / 1000000).toFixed(0)}M` : `Faida Halisi`)
                : (timeRange === 'today' ? `MTD: TZS ${(monthNetProfit / 1000000).toFixed(0)}M` : `Net Margin`)}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 font-bold text-[10px] flex items-center gap-0.5 shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[11px]">trending_up</span>+{profitMarginPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 4.5. MOBILE QUICK ACTIONS SHORTCUT GRID (Visible on Mobile / Small Screens Only) */}
      <div className="block md:hidden space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#006948] dark:text-emerald-400 text-[18px]">grid_view</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {language === 'sw' ? 'Moduli za Haraka' : 'Quick Access Modules'}
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {language === 'sw' ? 'Gusa kufungua' : 'Tap to open'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* 1. Matawi (Branches) */}
          <button
            type="button"
            onClick={() => onSelectTab('branches')}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#006948] active:scale-95 transition-all cursor-pointer group text-center min-h-[82px]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60 mb-1.5 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {language === 'sw' ? 'Matawi' : 'Branches'}
            </span>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {availableBranchesForFilter.length} {language === 'sw' ? 'Tawi' : 'Branches'}
            </span>
          </button>

          {/* 2. Stoo / Pikipiki (Inventory) */}
          <button
            type="button"
            onClick={() => onSelectTab('inventory')}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-teal-500 active:scale-95 transition-all cursor-pointer group text-center min-h-[82px]"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60 mb-1.5 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">two_wheeler</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {language === 'sw' ? 'Stoo / Pikipiki' : 'Inventory'}
            </span>
            <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 mt-0.5 font-mono">
              {inStockUnits.length} {t.units}
            </span>
          </button>

          {/* 3. Mauzo (Sales) */}
          <button
            type="button"
            onClick={() => onSelectTab('sales')}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-500 active:scale-95 transition-all cursor-pointer group text-center min-h-[82px]"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 mb-1.5 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {language === 'sw' ? 'Mauzo' : 'Sales'}
            </span>
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
              {periodUnitsSold} {language === 'sw' ? 'Mauzo' : 'Sold'}
            </span>
          </button>

          {/* 4. Matumizi (Expenses) */}
          <button
            type="button"
            onClick={() => onSelectTab('expenses')}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-rose-500 active:scale-95 transition-all cursor-pointer group text-center min-h-[82px]"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/60 mb-1.5 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {language === 'sw' ? 'Matumizi' : 'Expenses'}
            </span>
            <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 mt-0.5 font-mono truncate max-w-full">
              {(periodExpense / 1000000).toFixed(1)}M TZS
            </span>
          </button>

          {/* 5. Uhamisho (Transfers) */}
          <button
            type="button"
            onClick={() => onSelectTab('transfers')}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-amber-500 active:scale-95 transition-all cursor-pointer group text-center min-h-[82px]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60 mb-1.5 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {language === 'sw' ? 'Uhamisho' : 'Transfers'}
            </span>
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
              {language === 'sw' ? 'Matawini' : 'Inter-branch'}
            </span>
          </button>

          {/* 6. Wateja (Customers) */}
          <button
            type="button"
            onClick={() => onSelectTab('customers')}
            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-purple-500 active:scale-95 transition-all cursor-pointer group text-center min-h-[82px]"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/60 mb-1.5 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {language === 'sw' ? 'Wateja' : 'Customers'}
            </span>
            <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 mt-0.5">
              {language === 'sw' ? 'Daftari & Madeni' : 'Ledger'}
            </span>
          </button>
        </div>
      </div>

      {/* 4.8. MULTI-DEALER NETWORK OVERVIEW (Super Admin Only) */}
      {isSuperAdmin && selectedDealerCode === 'ALL' && dealers && dealers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[20px]">corporate_fare</span>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {language === 'sw' ? 'Muhtasari wa Utendaji wa Ma-Dealer Wote' : 'Multi-Dealer Performance Overview'} ({dealers.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('dealers')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Dhibiti Ma-Dealer' : 'Manage Dealers'}</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dealers.map((d) => {
              const dBranches = branches.filter((b) => b.dealerCode === d.code);
              const dUnits = units.filter((u) => u.dealerCode === d.code || dBranches.some((b) => b.id === u.branchId));
              const dInStock = dUnits.filter((u) => u.status === 'IN STOCK');
              const dInStock2W = dInStock.filter((u) => u.vehicleType === '2W').length;
              const dInStock3W = dInStock.filter((u) => u.vehicleType === '3W').length;
              const dSales = relevantSales.filter((s) => s.dealerCode === d.code || dBranches.some((b) => b.id === s.branchId));
              const dSold = dSales.length;
              const dSold2W = dSales.filter((s) => s.vehicleType === '2W').length;
              const dSold3W = dSales.filter((s) => s.vehicleType === '3W').length;
              const dRevenue = dSales.reduce((acc, s) => acc + (s.amountPaid ?? s.amount), 0);

              return (
                <div
                  key={d.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-slate-700">
                        {d.code}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        d.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {d.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      {d.city}, {d.region || d.country} • {dBranches.length} {language === 'sw' ? 'Matawi' : 'Branches'}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.inStock}</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {dInStock.length}
                        </span>
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                          2W: {dInStock2W} | 3W: {dInStock3W}
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.sold}</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
                          {dSold}
                        </span>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                          2W: {dSold2W} | 3W: {dSold3W}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px] uppercase font-medium">
                        {language === 'sw' ? 'Mauzo:' : 'Sales:'}
                      </span>
                      <span className="font-bold text-[#006948] dark:text-emerald-400 font-mono text-xs">
                        TZS {(dRevenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDealerCode(d.code)}
                      className="w-full py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">filter_alt</span>
                      <span>{language === 'sw' ? 'Chuja Dashboard' : 'Filter View'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. BRANCHES COMPARISON MATRIX (Desktop/Tablet view only - hidden on mobile) */}
      {!isBranchStaff && (
        <div className="hidden md:block space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] dark:text-emerald-400 text-[20px]">storefront</span>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                {t.branchesPerformance} ({getTimeRangeLabel(timeRange, language)})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('branches')}
              className="text-xs font-semibold text-[#006948] dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>{t.viewAll}</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-4">
            {availableBranchesForFilter.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800">
                <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 dark:text-slate-600 block">storefront</span>
                <p className="font-semibold text-xs">{language === 'sw' ? 'Hakuna tawi lililosajiliwa bado.' : 'No branches registered yet.'}</p>
              </div>
            ) : (
              availableBranchesForFilter.map((b) => {
                const bUnitsInStock = relevantUnits.filter((u) => u.branchId === b.id && u.status === 'IN STOCK').length;
                const bSold = filteredSales.filter((s) => s.branchId === b.id).length;
                const bRevenue = filteredSales.filter((s) => s.branchId === b.id).reduce((acc, s) => acc + s.amount, 0);

                return (
                <div
                  key={b.id}
                  onClick={() => onSelectTab('branches')}
                  className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all hover:border-[#00855d] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        {b.code.split('-').pop()}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {b.status}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {b.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate mt-0.5">{b.zone}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-medium">{t.inStock}:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{bUnitsInStock} {t.units}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-medium">{t.sold}:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">{bSold} {t.units}</span>
                      </div>
                      <div className="col-span-2 mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-slate-400 block text-[9px] uppercase font-medium">
                          {language === 'sw' ? `Mapato:` : `Revenue:`}
                        </span>
                        <span className="font-bold text-[#006948] dark:text-emerald-400 font-mono text-[11px] sm:text-xs">
                          TZS {(bRevenue / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* 6. REUSABLE ENTERPRISE RECENT SALES DATA TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
              {language === 'sw' ? 'Mauzo ya Hivi Karibuni' : 'Recent Sales Stream'} ({getTimeRangeLabel(timeRange, language)})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('sales')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'sw' ? 'Tazama Mauzo Yote' : 'View Full Sales Ledger'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <DataTable<SaleRecord>
          data={filteredSales}
          columns={recentSalesColumns}
          keyExtractor={(s) => s.id}
          language={language}
          title={language === 'sw' ? 'Mauzo ya Hivi Karibuni' : 'Recent Sales Stream'}
          searchPlaceholder={t.chassisSearchPlaceholder}
          exportFileName="mauzo-ya-hivi-karibuni"
          initialPageSize={5}
          onRowClick={(s) => onOpenReceipt(s)}
        />
      </div>

    </div>
  );
};

export default DashboardView;
