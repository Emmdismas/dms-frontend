import React, { useState, useMemo } from 'react';
import { Customer, Branch, AuthUser } from '../types';
import { Language, translations } from '../i18n/translations';
import {
  PageHeaderBanner,
  DataTable,
  ColumnDef,
  SelectBox,
} from '../components/common';

interface CustomersViewProps {
  customers: Customer[];
  branches: Branch[];
  currentUser: AuthUser | null;
  onOpenAddCustomerModal: () => void;
  isDarkMode: boolean;
  searchQuery: string;
  language: Language;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  branches,
  currentUser: _currentUser,
  onOpenAddCustomerModal,
  searchQuery,
  language,
}) => {
  const t = translations[language];
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (selectedBranchId !== 'ALL' && c.branchId !== selectedBranchId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q);
        const matchNida = c.nidaNumber.includes(q);
        const matchLoc = c.location.toLowerCase().includes(q);
        return matchName || matchPhone || matchNida || matchLoc;
      }
      return true;
    });
  }, [customers, selectedBranchId, searchQuery]);

  const totalUnitsBought = customers.reduce((acc, c) => acc + c.totalPurchases, 0);
  const activeBranchCustomers = filteredCustomers.length;

  const handleResetFilters = () => {
    setSelectedBranchId('ALL');
  };

  const customerColumns: ColumnDef<Customer>[] = [
    {
      header: '#',
      width: '45px',
      cell: (_c, idx) => (
        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {idx + 1}
        </span>
      ),
    },
    {
      header: t.colCustomerName,
      accessor: 'name',
      sortable: true,
      cell: (c) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs">
          {c.name}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Nambari ya Simu' : 'Phone Number',
      accessor: 'phone',
      cell: (c) => (
        <a
          href={`tel:${c.phone}`}
          className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          {c.phone}
        </a>
      ),
    },
    {
      header: language === 'sw' ? 'Nambari ya NIDA' : 'NIDA No',
      accessor: 'nidaNumber',
      cell: (c) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {c.nidaNumber}
        </span>
      ),
    },
    {
      header: t.colLocation,
      accessor: 'location',
      sortable: true,
      cell: (c) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {c.location}
        </span>
      ),
    },
    {
      header: t.colRegisteredBranch,
      sortable: true,
      cell: (c) => {
        const branch = branches.find((b) => b.id === c.branchId);
        return (
          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
            {branch?.name || 'Kariakoo'}
          </span>
        );
      },
    },
    {
      header: t.colPurchasedUnits,
      accessor: 'totalPurchases',
      align: 'center',
      sortable: true,
      cell: (c) => (
        <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono">
          {c.totalPurchases} {t.units}
        </span>
      ),
    },
    {
      header: t.colLastPurchase,
      accessor: 'lastPurchaseDate',
      align: 'right',
      sortable: true,
      cell: (c) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {c.lastPurchaseDate}
        </span>
      ),
    },
  ];

  const customerFilters = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SelectBox
        label={language === 'sw' ? 'Tawi Lililosajili Mteja' : 'Registered Branch'}
        icon="storefront"
        size="sm"
        value={selectedBranchId}
        onChange={(e) => setSelectedBranchId(e.target.value)}
      >
        <option value="ALL">{t.allBranches}</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </SelectBox>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Page Header Banner */}
      <PageHeaderBanner
        title={t.customersTitle}
        subtitle={
          language === 'sw'
            ? 'Daftari la wateja wote, vitambulisho vya NIDA, na historia ya manunuzi ya vyombo'
            : 'Customer registry, NIDA identification, contact records, and fleet purchase history'
        }
        icon="contacts"
        badgeText={`${customers.length} ${language === 'sw' ? 'Wateja' : 'Customers'}`}
        badgeVariant="success"
        actions={
          <button
            type="button"
            onClick={onOpenAddCustomerModal}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#006948] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>{t.actionAddCustomer}</span>
          </button>
        }
      />

      {/* 2. Responsive KPI Cards (Strict Rule 10: 2 cards per row on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {language === 'sw' ? 'Wateja Waliosajiliwa' : 'Registered Customers'}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-base">groups</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans block">
            {customers.length}
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
            {language === 'sw' ? 'wateja kwenye kanzidata' : 'total in database'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
              {language === 'sw' ? 'Vyombo Vilivyonunuliwa' : 'Units Purchased'}
            </span>
            <span className="material-symbols-outlined text-emerald-500 text-base">two_wheeler</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans block">
            {totalUnitsBought}
          </span>
          <span className="text-[10px] sm:text-[11px] text-emerald-500 mt-0.5 block truncate">
            {t.units} {language === 'sw' ? 'zimeuzwa kwa wateja' : 'delivered'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
              {language === 'sw' ? 'Wateja Waliochujwa' : 'Filtered Customers'}
            </span>
            <span className="material-symbols-outlined text-blue-500 text-base">filter_alt</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-sans block">
            {activeBranchCustomers}
          </span>
          <span className="text-[10px] sm:text-[11px] text-blue-400 mt-0.5 block truncate">
            {language === 'sw' ? 'katika mtazamo huu' : 'in current view'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 truncate">
              {language === 'sw' ? 'Wastani kwa Mteja' : 'Avg per Customer'}
            </span>
            <span className="material-symbols-outlined text-purple-500 text-base">pie_chart</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-sans block">
            {customers.length > 0 ? (totalUnitsBought / customers.length).toFixed(1) : 0}
          </span>
          <span className="text-[10px] sm:text-[11px] text-purple-400 mt-0.5 block truncate">
            {t.units} / {language === 'sw' ? 'mteja' : 'customer'}
          </span>
        </div>
      </div>

      {/* 3. Reusable Enterprise DataTable */}
      <DataTable<Customer>
        data={filteredCustomers}
        columns={customerColumns}
        keyExtractor={(c) => c.id}
        language={language}
        title={t.customersTitle}
        searchPlaceholder={
          language === 'sw'
            ? 'Tafuta mteja kwa Jina, Simu, NIDA, au Eneo...'
            : 'Search customer by Name, Phone, NIDA, or Location...'
        }
        filterComponent={customerFilters}
        onResetFilters={handleResetFilters}
        exportLabel="Export Excel"
        exportFileName="rekodi-za-wateja"
      />
    </div>
  );
};
