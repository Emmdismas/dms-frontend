import React, { useState, useMemo } from 'react';
import { StockTransfer, Branch, AuthUser, VehicleType } from '../types';
import { Language, translations } from '../i18n/translations';
import {
  PageHeaderBanner,
  DataTable,
  ColumnDef,
  QuickChassisChip,
  SelectBox,
} from '../components/common';

interface TransfersViewProps {
  transfers: StockTransfer[];
  branches: Branch[];
  currentUser: AuthUser | null;
  onOpenTransferModal: () => void;
  isDarkMode: boolean;
  language: Language;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  transfers,
  branches,
  currentUser: _currentUser,
  onOpenTransferModal,
  language,
}) => {
  const t = translations[language];

  // Filters state
  const [selectedFromBranch, setSelectedFromBranch] = useState<string>('ALL');
  const [selectedToBranch, setSelectedToBranch] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | VehicleType>('ALL');

  const filteredTransfers = useMemo(() => {
    return transfers.filter((trf) => {
      if (selectedFromBranch !== 'ALL' && trf.fromBranchId !== selectedFromBranch) {
        return false;
      }
      if (selectedToBranch !== 'ALL' && trf.toBranchId !== selectedToBranch) {
        return false;
      }
      if (selectedType !== 'ALL' && trf.vehicleType !== selectedType) {
        return false;
      }
      return true;
    });
  }, [transfers, selectedFromBranch, selectedToBranch, selectedType]);

  const totalTransferredUnits = transfers.reduce((acc, trf) => acc + trf.unitIds.length, 0);

  const handleResetFilters = () => {
    setSelectedFromBranch('ALL');
    setSelectedToBranch('ALL');
    setSelectedType('ALL');
  };

  const transferColumns: ColumnDef<StockTransfer>[] = [
    {
      header: '#',
      width: '45px',
      cell: (_trf, idx) => (
        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {idx + 1}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Namba ya Chassis / VIN' : 'Chassis / VIN',
      cell: (trf) => (
        <div className="flex flex-wrap gap-1 max-w-[260px]">
          {trf.chassisList.map((chassis, i) => (
            <QuickChassisChip key={i} chassisNumber={chassis} language={language} />
          ))}
        </div>
      ),
    },
    {
      header: language === 'sw' ? 'Aina' : 'Category',
      accessor: 'vehicleType',
      sortable: true,
      align: 'center',
      cell: (trf) => (
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-bold inline-block ${
            trf.vehicleType === '2W'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
          }`}
        >
          {trf.vehicleType}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Modeli' : 'Model',
      accessor: 'modelName',
      sortable: true,
      cell: (trf) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs block">
          {trf.modelName}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Aliyetuma' : 'Initiated By',
      accessor: 'initiatedBy',
      cell: (trf) => (
        <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">
          {trf.initiatedBy}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Kutoka' : 'From Branch',
      accessor: 'fromBranchName',
      sortable: true,
      cell: (trf) => (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {trf.fromBranchName}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Kwenda' : 'To Branch',
      accessor: 'toBranchName',
      sortable: true,
      cell: (trf) => (
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {trf.toBranchName}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Idadi' : 'Units',
      align: 'center',
      sortable: true,
      cell: (trf) => (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800">
          {trf.unitIds.length} {t.units}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Tarehe' : 'Date',
      accessor: 'date',
      align: 'right',
      sortable: true,
      cell: (trf) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {trf.date}
        </span>
      ),
    },
  ];

  const transferFilters = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
      <SelectBox
        label={language === 'sw' ? 'Kutoka Tawi' : 'From Branch'}
        icon="output"
        size="sm"
        value={selectedFromBranch}
        onChange={(e) => setSelectedFromBranch(e.target.value)}
      >
        <option value="ALL">{language === 'sw' ? 'Matawi Yote ya Kutoka' : 'All Origin Branches'}</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </SelectBox>

      <SelectBox
        label={language === 'sw' ? 'Kwenda Tawi' : 'To Branch'}
        icon="input"
        size="sm"
        value={selectedToBranch}
        onChange={(e) => setSelectedToBranch(e.target.value)}
      >
        <option value="ALL">{language === 'sw' ? 'Matawi Yote ya Kupokea' : 'All Destination Branches'}</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </SelectBox>

      <SelectBox
        label={language === 'sw' ? 'Aina ya Chombo' : 'Category'}
        icon="two_wheeler"
        size="sm"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as 'ALL' | VehicleType)}
      >
        <option value="ALL">{t.allCategories}</option>
        <option value="2W">{language === 'sw' ? 'Pikipiki (2W)' : '2-Wheelers (2W)'}</option>
        <option value="3W">{language === 'sw' ? 'Bajaji (3W)' : '3-Wheelers (3W)'}</option>
      </SelectBox>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Page Header Banner */}
      <PageHeaderBanner
        title={t.transfersTitle}
        subtitle={
          language === 'sw'
            ? 'Uhamisho wa vyombo kati ya matawi, uthibitisho wa dispatch, na ufuatiliaji wa stoo'
            : 'Inter-branch vehicle transfers, dispatch verification, and stock rebalancing'
        }
        icon="local_shipping"
        badgeText={`${transfers.length} ${language === 'sw' ? 'Uhamisho' : 'Transfers'}`}
        badgeVariant="info"
        actions={
          <button
            type="button"
            onClick={onOpenTransferModal}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#006948] rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            <span>{t.actionNewTransfer}</span>
          </button>
        }
      />

      {/* 2. Responsive KPI Cards (Strict Rule 10: 2 cards per row on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {language === 'sw' ? 'Jumla ya Uhamisho' : 'Total Transfers'}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-base">swap_horiz</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans block">
            {transfers.length}
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
            {language === 'sw' ? 'miamala iliyokamilika' : 'transfer dispatches'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
              {language === 'sw' ? 'Vyombo Vilivyohamishwa' : 'Units Relocated'}
            </span>
            <span className="material-symbols-outlined text-emerald-500 text-base">two_wheeler</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans block">
            {totalTransferredUnits}
          </span>
          <span className="text-[10px] sm:text-[11px] text-emerald-500 mt-0.5 block truncate">
            {t.units} {language === 'sw' ? 'zilizohamishwa' : 're-allocated'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
              {language === 'sw' ? 'Matawi Yaliyohusika' : 'Active Branches'}
            </span>
            <span className="material-symbols-outlined text-blue-500 text-base">store</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-sans block">
            {branches.length}
          </span>
          <span className="text-[10px] sm:text-[11px] text-blue-400 mt-0.5 block truncate">
            {language === 'sw' ? 'matawi ya kampuni' : 'company locations'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 truncate">
              {language === 'sw' ? 'Wastani kwa Muamala' : 'Avg Units/Batch'}
            </span>
            <span className="material-symbols-outlined text-purple-500 text-base">pin_invoke</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-sans block">
            {transfers.length > 0 ? (totalTransferredUnits / transfers.length).toFixed(1) : 0}
          </span>
          <span className="text-[10px] sm:text-[11px] text-purple-400 mt-0.5 block truncate">
            {t.units} / {language === 'sw' ? 'safari' : 'transfer'}
          </span>
        </div>
      </div>

      {/* 3. Reusable Enterprise DataTable */}
      <DataTable<StockTransfer>
        data={filteredTransfers}
        columns={transferColumns}
        keyExtractor={(trf) => trf.id}
        language={language}
        title={t.transfersTitle}
        searchPlaceholder={
          language === 'sw'
            ? 'Tafuta kwa Chassis, Mtindo, Aliyetuma, au Tawi...'
            : 'Search by Chassis, Model, Officer, or Branch...'
        }
        filterComponent={transferFilters}
        onResetFilters={handleResetFilters}
        exportLabel="Export Excel"
        exportFileName="rekodi-za-uhamisho"
      />
    </div>
  );
};
