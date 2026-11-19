import React, { useState, useEffect, useMemo } from 'react';
import { SaleRecord, Branch, AuthUser, VehicleModel, VehicleType, Dealer } from '../types';
import { Language, translations } from '../i18n/translations';
import { PageHeaderBanner, DataTable, ColumnDef, ActionMenu, StatusBadge, QuickChassisChip } from '../components/common';

interface SalesViewProps {
  sales: SaleRecord[];
  branches: Branch[];
  dealers?: Dealer[];
  models: VehicleModel[];
  currentUser: AuthUser | null;
  onOpenRecordSaleModal: () => void;
  onOpenReceipt: (sale: SaleRecord) => void;
  onReleaseSaleUnit?: (sale: SaleRecord) => void;
  isDarkMode: boolean;
  searchQuery: string;
  language: Language;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  branches,
  dealers = [],
  models,
  currentUser,
  onOpenRecordSaleModal,
  onOpenReceipt,
  onReleaseSaleUnit,
  isDarkMode: _isDarkMode,
  searchQuery,
  language,
}) => {
  const isSuperAdmin = (currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && !currentUser?.isSuperAdminImpersonating;
  const isBranchStaff = currentUser?.role === 'branch_manager' || currentUser?.role === 'storekeeper' || currentUser?.role === 'sales_person';
  const t = translations[language];

  const [selectedDealerCode, setSelectedDealerCode] = useState<string>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isBranchStaff && currentUser?.branchCode
      ? branches.find((b) => b.code === currentUser.branchCode)?.id || 'ALL'
      : 'ALL'
  );
  const [selectedType, setSelectedType] = useState<'ALL' | VehicleType>('ALL');
  const [selectedModel, setSelectedModel] = useState<string>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'ALL' | 'PAID' | 'PARTIAL'>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const effectiveSearch = searchQuery || localSearch;

  // Cascading branches: when Super Admin selects a dealer, narrow branches to only that dealer's branches
  const availableBranches = isSuperAdmin
    ? (selectedDealerCode === 'ALL' ? branches : branches.filter((b) => b.dealerCode === selectedDealerCode))
    : branches;

  const handleDealerChange = (newDealerCode: string) => {
    setSelectedDealerCode(newDealerCode);
    setSelectedBranchId('ALL');
  };

  // Available models dynamically filtered by category
  const availableModels = models.filter((m) => {
    if (selectedType !== 'ALL' && m.type !== selectedType) {
      return false;
    }
    return true;
  });

  // Handle Category change
  const handleTypeChange = (newType: 'ALL' | VehicleType) => {
    setSelectedType(newType);
    if (newType !== 'ALL' && selectedModel !== 'ALL') {
      const currentModelObj = models.find((m) => m.name === selectedModel);
      if (currentModelObj && currentModelObj.type !== newType) {
        setSelectedModel('ALL');
      }
    }
  };

  const hasActiveFilters =
    (selectedDealerCode !== 'ALL' && isSuperAdmin) ||
    (selectedBranchId !== 'ALL' && (!isBranchStaff || !currentUser?.branchCode)) ||
    selectedType !== 'ALL' ||
    selectedModel !== 'ALL' ||
    selectedMethod !== 'ALL' ||
    selectedPaymentStatus !== 'ALL' ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(localSearch);

  const handleResetFilters = () => {
    if (isSuperAdmin) setSelectedDealerCode('ALL');
    if (!isBranchStaff) setSelectedBranchId('ALL');
    setSelectedType('ALL');
    setSelectedModel('ALL');
    setSelectedMethod('ALL');
    setSelectedPaymentStatus('ALL');
    setDateFrom('');
    setDateTo('');
    setLocalSearch('');
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDealerCode, selectedBranchId, selectedType, selectedModel, selectedMethod, selectedPaymentStatus, dateFrom, dateTo, effectiveSearch]);

  // Filter Sales
  const filteredSales = sales.filter((s) => {
    if (isSuperAdmin) {
      if (selectedDealerCode !== 'ALL' && s.dealerCode && s.dealerCode !== selectedDealerCode) {
        return false;
      }
      if (selectedBranchId !== 'ALL' && s.branchId !== selectedBranchId) {
        return false;
      }
    } else {
      if (isBranchStaff && currentUser?.branchCode) {
        if (s.branchCode !== currentUser.branchCode) return false;
      } else if (selectedBranchId !== 'ALL' && s.branchId !== selectedBranchId) {
        return false;
      }
    }

    if (selectedType !== 'ALL' && s.vehicleType !== selectedType) {
      return false;
    }

    if (selectedModel !== 'ALL' && s.modelName !== selectedModel) {
      return false;
    }

    if (selectedMethod !== 'ALL' && s.paymentMethod !== selectedMethod) {
      return false;
    }

    const unitPrice = s.unitPrice ?? s.amount;
    const isPartial = s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0);

    if (selectedPaymentStatus === 'PAID' && isPartial) {
      return false;
    }
    if (selectedPaymentStatus === 'PARTIAL' && !isPartial) {
      return false;
    }

    // Date filtering (YYYY-MM-DD)
    if (dateFrom && s.date < dateFrom) {
      return false;
    }
    if (dateTo && s.date > dateTo) {
      return false;
    }

    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase().trim();
      return (
        s.chassisNumber.toLowerCase().includes(q) ||
        s.modelName.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerPhone.toLowerCase().includes(q) ||
        (s.receiptNumber && s.receiptNumber.toLowerCase().includes(q))
      );
    }

    return true;
  });

  // Financial aggregates
  const totalSalesRevenue = filteredSales.reduce((acc, s) => {
    const unitPrice = s.unitPrice ?? s.amount;
    return acc + unitPrice;
  }, 0);

  const totalCostOfGoods = filteredSales.reduce((acc, s) => {
    const unitPrice = s.unitPrice ?? s.amount;
    const costPrice = s.costPrice ?? (unitPrice > 6000000 ? unitPrice - 1500000 : unitPrice - 600000);
    return acc + costPrice;
  }, 0);

  const totalRealizedProfit = totalSalesRevenue - totalCostOfGoods;
  const overallMarginPercent = totalSalesRevenue > 0 ? Math.round((totalRealizedProfit / totalSalesRevenue) * 100) : 0;

  const totalCollected = filteredSales.reduce((acc, s) => {
    const unitPrice = s.unitPrice ?? s.amount;
    const isPartial = s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0);
    const amountPaid = s.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
    return acc + amountPaid;
  }, 0);

  const totalOutstanding = filteredSales.reduce((acc, s) => {
    const unitPrice = s.unitPrice ?? s.amount;
    const isPartial = s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0);
    const amountPaid = s.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
    const remained = s.remainedAmount ?? Math.max(0, unitPrice - amountPaid);
    return acc + remained;
  }, 0);

  const partialSalesCount = filteredSales.filter(
    (s) => s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0)
  ).length;
  const fullyPaidCount = filteredSales.length - partialSalesCount;

  const isSw = language === 'sw';

  // Reusable Column Definitions for Sales Ledger
  const salesColumns: ColumnDef<SaleRecord>[] = useMemo(() => [
    {
      key: 'sn',
      header: 'SN',
      width: '45px',
      align: 'center',
      accessor: (_, idx) => (
        <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
          {idx + 1}
        </span>
      ),
    },
    {
      key: 'date',
      header: t.date,
      sortable: true,
      sortAccessor: (s) => s.date,
      accessor: (s) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {s.date}
        </span>
      ),
    },
    {
      key: 'category',
      header: isSw ? 'Aina' : 'Category',
      sortable: true,
      align: 'center',
      sortAccessor: (s) => s.vehicleType,
      accessor: (s) => (
        <span
          className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold ${
            s.vehicleType === '2W'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
          }`}
        >
          {s.vehicleType}
        </span>
      ),
    },
    {
      key: 'model',
      header: isSw ? 'Modeli' : 'Model',
      sortable: true,
      sortAccessor: (s) => s.modelName,
      accessor: (s) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {s.modelName}
        </span>
      ),
    },
    {
      key: 'chassis',
      header: t.colChassis,
      sortable: true,
      sortAccessor: (s) => s.chassisNumber,
      accessor: (s) => <QuickChassisChip chassisNumber={s.chassisNumber} />,
    },
    ...(isSuperAdmin
      ? [
          {
            key: 'dealer',
            header: isSw ? 'Muuzaji' : 'Dealer',
            sortable: true,
            sortAccessor: (s: SaleRecord) => s.dealerName || s.dealerCode || '',
            accessor: (s: SaleRecord) => (
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-900 text-amber-300 border border-slate-700">
                {s.dealerName || s.dealerCode || '-'}
              </span>
            ),
          },
        ]
      : []),
    {
      key: 'branchName',
      header: isSw ? 'Tawi' : 'Branch Name',
      sortable: true,
      sortAccessor: (s) => s.branchName,
      accessor: (s) => (
        <span className="text-slate-800 dark:text-slate-200 font-medium text-xs block">
          {s.branchName}
        </span>
      ),
    },
    {
      key: 'branchCode',
      header: isSw ? 'Msimbo wa Tawi' : 'Branch Code',
      sortable: true,
      sortAccessor: (s) => s.branchCode,
      accessor: (s) => (
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {s.branchCode}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: isSw ? 'Jina la Mteja' : 'Customer Name',
      sortable: true,
      sortAccessor: (s) => s.customerName,
      accessor: (s) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs block">
          {s.customerName}
        </span>
      ),
    },
    {
      key: 'customerPhone',
      header: isSw ? 'Namba ya Simu' : 'Phone Number',
      sortable: true,
      sortAccessor: (s) => s.customerPhone,
      accessor: (s) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {s.customerPhone}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: t.paymentMethod,
      align: 'center',
      accessor: (s) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {s.paymentMethod.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      header: isSw ? 'Bei ya Kuuza' : 'Selling Price',
      align: 'right',
      sortable: true,
      sortAccessor: (s) => s.unitPrice ?? s.amount,
      accessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        return (
          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
            TZS {unitPrice.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'amountPaid',
      header: isSw ? 'Kiasi Kilicholipwa' : 'Amount Paid',
      align: 'right',
      sortable: true,
      sortAccessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        const isPartial = s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0);
        return s.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
      },
      accessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        const isPartial = s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0);
        const amountPaid = s.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
        return (
          <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
            TZS {amountPaid.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'remained',
      header: isSw ? 'Deni / Baki' : 'Remained',
      align: 'right',
      sortable: true,
      sortAccessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        const isPartial = s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0);
        const amountPaid = s.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
        return s.remainedAmount ?? (unitPrice - amountPaid);
      },
      accessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        const isPartial = s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0);
        const amountPaid = s.amountPaid ?? (isPartial ? Math.round((unitPrice * 0.6) / 50000) * 50000 : unitPrice);
        const remained = s.remainedAmount ?? (unitPrice - amountPaid);
        if (remained > 0) {
          return (
            <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[11px] bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
              TZS {remained.toLocaleString()}
            </span>
          );
        }
        return (
          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
            TZS 0
          </span>
        );
      },
    },
    {
      key: 'costPrice',
      header: isSw ? 'Gharama' : 'Cost',
      align: 'right',
      sortable: true,
      sortAccessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        return s.costPrice ?? (unitPrice > 6000000 ? unitPrice - 1500000 : unitPrice - 600000);
      },
      accessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        const costPrice = s.costPrice ?? (unitPrice > 6000000 ? unitPrice - 1500000 : unitPrice - 600000);
        return (
          <span className="font-mono font-medium text-slate-500 dark:text-slate-400 text-xs">
            TZS {costPrice.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'profit',
      header: isSw ? 'Faida' : 'Profit',
      align: 'right',
      sortable: true,
      sortAccessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        const costPrice = s.costPrice ?? (unitPrice > 6000000 ? unitPrice - 1500000 : unitPrice - 600000);
        return unitPrice - costPrice;
      },
      accessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        const costPrice = s.costPrice ?? (unitPrice > 6000000 ? unitPrice - 1500000 : unitPrice - 600000);
        const profit = unitPrice - costPrice;
        return (
          <span className="font-mono font-black text-xs text-[#006948] dark:text-emerald-400">
            {profit >= 0 ? '+' : ''}TZS {profit.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'margin',
      header: isSw ? 'Margin' : 'Margin',
      align: 'center',
      accessor: (s) => {
        const unitPrice = s.unitPrice ?? s.amount;
        const costPrice = s.costPrice ?? (unitPrice > 6000000 ? unitPrice - 1500000 : unitPrice - 600000);
        const profit = unitPrice - costPrice;
        const margin = unitPrice > 0 ? Math.round((profit / unitPrice) * 100) : 0;
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-700">
            {margin}%
          </span>
        );
      },
    },
    {
      key: 'paymentStatus',
      header: isSw ? 'Hali ya Malipo' : 'Payment Status',
      align: 'center',
      accessor: (s) => {
        const isPartial = s.paymentStatus === 'PARTIAL' || (s.remainedAmount !== undefined && s.remainedAmount > 0);
        return <StatusBadge status={isPartial ? 'PARTIAL' : 'PAID'} language={language} showPulse={isPartial} />;
      },
    },
    {
      key: 'deliveryStatus',
      header: isSw ? 'Makabidhiano' : 'Delivery',
      align: 'center',
      accessor: (s) => {
        if (s.deliveryType === 'SCHEDULED' && s.deliveryStatus === 'PENDING_PICKUP') {
          return (
            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              {isSw ? `Hifadhi: ${s.pickupDate}` : `Pick-up: ${s.pickupDate}`}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {isSw ? 'Imekabidhiwa' : 'Released'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: isSw ? 'Chaguzi' : 'Actions',
      align: 'center',
      width: '70px',
      accessor: (s) => {
        const isPendingPickup = s.deliveryType === 'SCHEDULED' && s.deliveryStatus === 'PENDING_PICKUP';
        return (
          <ActionMenu
            triggerIcon="more_vert"
            items={[
              {
                label: t.actionPrintReceipt,
                icon: 'receipt_long',
                onClick: () => onOpenReceipt(s),
              },
              ...(isPendingPickup && onReleaseSaleUnit
                ? [
                    {
                      label: isSw ? 'Kabidhi Chombo' : 'Release Vehicle',
                      icon: 'task_alt',
                      onClick: () => {
                        if (
                          window.confirm(
                            isSw
                              ? `Je, unathibitisha kumkabidhi mteja (${s.customerName}) chombo (Chassis: ${s.chassisNumber}) na kukitoa rasmi stoo?`
                              : `Confirm handover & release of unit (${s.chassisNumber}) to customer?`
                          )
                        ) {
                          onReleaseSaleUnit(s);
                        }
                      },
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ], [isSw, language, t, isSuperAdmin, onOpenReceipt, onReleaseSaleUnit]);

  // Collapsible Filters Drawer Component
  const salesFilters = (
    <div className="space-y-3">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3`}>
        {isSuperAdmin && (
          <div>
            <label className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1">
              {language === 'sw' ? 'Dealer (Mtandao)' : 'Dealer Network'}
            </label>
            <select
              value={selectedDealerCode}
              onChange={(e) => handleDealerChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none"
            >
              <option value="ALL">{language === 'sw' ? '🌐 Ma-Dealer Wote' : '🌐 All Dealers'}</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {language === 'sw' ? 'Tawi' : 'Branch'}
          </label>
          <select
            disabled={isBranchStaff}
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
          >
            <option value="ALL">
              {selectedDealerCode === 'ALL'
                ? t.allBranches
                : (language === 'sw' ? 'Matawi Yote ya Dealer Huyu' : 'All Branches of this Dealer')}
            </option>
            {availableBranches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {language === 'sw' ? 'Aina ya Pikipiki' : 'Category'}
          </label>
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value as 'ALL' | VehicleType)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
          >
            <option value="ALL">{t.allCategories}</option>
            <option value="2W">{language === 'sw' ? 'Magurudumu 2 (2W)' : '2-Wheelers (2W)'}</option>
            <option value="3W">{language === 'sw' ? 'Magurudumu 3 / Bajaji (3W)' : '3-Wheelers (3W)'}</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {language === 'sw' ? 'Muundo / Model' : 'Model'}
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
          >
            <option value="ALL">{t.allModels}</option>
            {availableModels.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {t.paymentMethod}
          </label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
          >
            <option value="ALL">{language === 'sw' ? 'Njia Zote za Malipo' : 'All Payment Methods'}</option>
            <option value="CASH">{t.paymentCash}</option>
            <option value="MOBILE_MONEY">{t.paymentMobile}</option>
            <option value="BANK_TRANSFER">{t.paymentBank}</option>
            <option value="INSTALLMENT">{t.paymentInstallment}</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {language === 'sw' ? 'Hali ya Malipo' : 'Payment Status'}
          </label>
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value as 'ALL' | 'PAID' | 'PARTIAL')}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
          >
            <option value="ALL">{t.allPaymentStatuses}</option>
            <option value="PAID">{language === 'sw' ? 'Imelipwa Kamili (Paid)' : 'Fully Paid'}</option>
            <option value="PARTIAL">{language === 'sw' ? 'Malipo ya Sehemu (Partial)' : 'Partially Paid'}</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {t.dateFrom}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {t.dateTo}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
          />
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              <span>{t.clearFilters}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      
      {/* 1. EXECUTIVE SALES HEADER */}
      <PageHeaderBanner
        icon="receipt_long"
        title={t.salesTitle}
        subtitle={
          language === 'sw'
            ? 'Rekodi zote za miamala, risiti na faida ya kila chombo'
            : 'Transaction ledger, digital receipts, and unit profitability'
        }
        badge={{
          text: `${filteredSales.length} ${language === 'sw' ? 'Miamala' : 'Transactions'}`,
          variant: 'emerald',
          pulse: true,
        }}
        actions={
          currentUser?.role !== 'dealer' && currentUser?.role !== 'owner' ? (
            <button
              type="button"
              onClick={onOpenRecordSaleModal}
              className="min-h-[42px] px-5 py-2.5 bg-white hover:bg-emerald-50 active:scale-95 text-[#006948] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{t.actionRecordSale}</span>
            </button>
          ) : undefined
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Units Sold */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80" />
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {t.totalUnitsSold}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 shrink-0">
                <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans">{filteredSales.length}</span>
              <span className="text-xs font-semibold text-slate-400">{t.units}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate">
              {fullyPaidCount} {language === 'sw' ? 'kamili' : 'paid'} • {partialSalesCount} {language === 'sw' ? 'sehemu' : 'partial'}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] border border-indigo-200/50 dark:border-indigo-900">
              {language === 'sw' ? 'Vitengo' : 'Units'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-80" />
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {t.totalRevenueTitle}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 shrink-0">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-[#006948] dark:text-emerald-400 font-mono truncate">
                TZS {(totalSalesRevenue / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="truncate flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
              <span>{language === 'sw' ? 'Mauzo ya Wateja' : 'Total Revenue'}</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200/50 dark:border-emerald-900">
              100% ERP
            </span>
          </div>
        </div>

        {/* Card 3: Total Cost (COGS) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-slate-700 opacity-80" />
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {language === 'sw' ? 'Gharama ya Kununua (Cost)' : 'Cost of Goods (COGS)'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200 font-mono truncate">
                TZS {(totalCostOfGoods / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate">
              {language === 'sw' ? 'Bei ya Kiwandani' : 'Factory Invoiced Cost'}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
              COGS
            </span>
          </div>
        </div>

        {/* Card 4: Total Gross Profit & Margin % (High-Contrast Executive Hero Card) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#003d29] via-[#005a3e] to-[#007a54] text-white rounded-2xl p-4 border border-emerald-500/40 shadow-md shadow-emerald-950/20 hover:shadow-lg hover:shadow-emerald-950/30 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100/90 truncate">
                {language === 'sw' ? 'Faida Halisi ya Mauzo' : 'Realized Gross Profit'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-emerald-200 flex items-center justify-center border border-white/20 shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-white font-mono drop-shadow-xs truncate">
                +TZS {(totalRealizedProfit / 1000000).toFixed(2)}M
              </span>
              <span className="text-xs font-bold text-emerald-200 font-mono">
                (+{overallMarginPercent}%)
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-2.5 border-t border-emerald-400/25 flex items-center justify-between text-[11px] text-emerald-100/80">
            <span className="truncate font-medium">
              {language === 'sw' ? 'Faida kwa kila chombo' : 'Gross profit per unit'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-white border border-emerald-300/40 font-bold text-[10px] flex items-center gap-0.5 shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[11px]">trending_up</span>+{overallMarginPercent}% Margin
            </span>
          </div>
        </div>
      </div>



      {/* Reusable Enterprise DataTable */}
      <DataTable<SaleRecord>
        data={filteredSales}
        columns={salesColumns}
        keyExtractor={(s) => s.id}
        language={language}
        title={t.salesTitle}
        searchPlaceholder={t.chassisSearchPlaceholder}
        filterComponent={salesFilters}
        exportFileName="rekodi-za-mauzo"
      />
    </div>
  );
};

