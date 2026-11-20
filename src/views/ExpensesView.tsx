import React, { useState, useMemo } from 'react';
import { Expense, Branch, AuthUser, ExpenseCategory } from '../types';
import { Language, getExpenseCategoryLabel, getPaymentMethodLabel, translations } from '../i18n/translations';
import { RecordExpenseModal } from '../components/modals/RecordExpenseModal';
import {
  PageHeaderBanner,
  DataTable,
  ColumnDef,
  SelectBox,
} from '../components/common';

interface ExpensesViewProps {
  expenses: Expense[];
  branches: Branch[];
  currentUser: AuthUser | null;
  onAddExpense: (newExpense: Expense) => void;
  isDarkMode: boolean;
  language: Language;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  branches,
  currentUser,
  onAddExpense,
  language,
}) => {
  const isSw = language === 'sw';
  const _t = translations[language];
  const isBranchStaff =
    currentUser?.role === 'branch_manager' ||
    currentUser?.role === 'storekeeper' ||
    currentUser?.role === 'sales_person';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(
    isBranchStaff && currentUser?.branchCode
      ? branches.find((br) => br.code === currentUser.branchCode)?.id || 'ALL'
      : 'ALL'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | '7DAYS' | 'MONTH'>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);

  const categories: ExpenseCategory[] = [
    'USAFIRISHAJI',
    'KODI_LESENI',
    'UMEME_MAJI',
    'MISHAHARA_POSHO',
    'MATENGENEZO',
    'MAFUTA_LOGISTICS',
    'MATANGAZO_MASOKO',
    'CHAKULA_KINYWAJI',
    'VINGINEVYO',
  ];

  const handleTimePreset = (preset: 'ALL' | 'TODAY' | '7DAYS' | 'MONTH') => {
    setTimeFilter(preset);
    if (preset === 'ALL') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'TODAY') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === '7DAYS') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setDateFrom(d.toISOString().split('T')[0]);
      setDateTo(todayStr);
    } else if (preset === 'MONTH') {
      setDateFrom(`${currentMonthPrefix}-01`);
      setDateTo(todayStr);
    }
  };

  const handleResetFilters = () => {
    if (!isBranchStaff) setSelectedBranchId('ALL');
    setSelectedCategory('ALL');
    setDateFrom('');
    setDateTo('');
    setTimeFilter('ALL');
  };

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (isBranchStaff && currentUser?.branchCode) {
        if (exp.branchCode !== currentUser.branchCode) return false;
      } else if (selectedBranchId !== 'ALL' && exp.branchId !== selectedBranchId) {
        return false;
      }

      if (selectedCategory !== 'ALL' && exp.category !== selectedCategory) {
        return false;
      }

      if (dateFrom && exp.date < dateFrom) {
        return false;
      }

      if (dateTo && exp.date > dateTo) {
        return false;
      }

      return true;
    });
  }, [expenses, isBranchStaff, currentUser?.branchCode, selectedBranchId, selectedCategory, dateFrom, dateTo]);

  // Aggregate Stats
  const filteredTotalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todayTotalAmount = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));
  const monthTotalAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryColor = (category: ExpenseCategory) => {
    switch (category) {
      case 'USAFIRISHAJI':
      case 'MAFUTA_LOGISTICS':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'KODI_LESENI':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'UMEME_MAJI':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'MISHAHARA_POSHO':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'MATENGENEZO':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'MATANGAZO_MASOKO':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'CHAKULA_KINYWAJI':
        return 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const expenseColumns: ColumnDef<Expense>[] = [
    {
      header: '#',
      width: '45px',
      cell: (_exp, idx) => (
        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {idx + 1}
        </span>
      ),
    },
    {
      header: isSw ? 'Nambari ya Matumizi' : 'Expense ID',
      accessor: 'expenseNumber',
      sortable: true,
      cell: (exp) => (
        <span className="font-mono font-bold text-xs text-rose-700 dark:text-rose-400">
          {exp.expenseNumber}
        </span>
      ),
    },
    {
      header: isSw ? 'Tarehe' : 'Date',
      accessor: 'date',
      sortable: true,
      cell: (exp) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {exp.date}
        </span>
      ),
    },
    {
      header: isSw ? 'Aina ya Matumizi' : 'Category',
      accessor: 'category',
      sortable: true,
      cell: (exp) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(
            exp.category
          )}`}
        >
          {getExpenseCategoryLabel(exp.category, language)}
        </span>
      ),
    },
    {
      header: isSw ? 'Tawi' : 'Branch',
      accessor: 'branchName',
      sortable: true,
      cell: (exp) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
          {exp.branchName}
        </span>
      ),
    },
    {
      header: isSw ? 'Maelezo ya Matumizi' : 'Description',
      accessor: 'description',
      cell: (exp) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[280px]">
          {exp.description}
        </span>
      ),
    },
    {
      header: isSw ? 'Kiasi (TZS)' : 'Amount (TZS)',
      accessor: 'amount',
      align: 'right',
      sortable: true,
      cell: (exp) => (
        <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
          TZS {exp.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: isSw ? 'Njia ya Malipo' : 'Payment Method',
      accessor: 'paymentMethod',
      align: 'center',
      cell: (exp) => (
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {getPaymentMethodLabel(exp.paymentMethod, language)}
        </span>
      ),
    },
    {
      header: isSw ? 'Mrekodi' : 'Staff',
      accessor: 'recordedBy',
      cell: (exp) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {exp.recordedBy}
        </span>
      ),
    },
  ];

  const expenseFilters = (
    <div className="space-y-3">
      {/* Time Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">
          {isSw ? 'Muda:' : 'Period:'}
        </span>
        <button
          type="button"
          onClick={() => handleTimePreset('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            timeFilter === 'ALL'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          {isSw ? 'Zote' : 'All'}
        </button>
        <button
          type="button"
          onClick={() => handleTimePreset('TODAY')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            timeFilter === 'TODAY'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          {isSw ? 'Leo' : 'Today'}
        </button>
        <button
          type="button"
          onClick={() => handleTimePreset('7DAYS')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            timeFilter === '7DAYS'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          {isSw ? 'Siku 7' : '7 Days'}
        </button>
        <button
          type="button"
          onClick={() => handleTimePreset('MONTH')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            timeFilter === 'MONTH'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          {isSw ? 'Mwezi Huu' : 'This Month'}
        </button>
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <SelectBox
          label={isSw ? 'Aina ya Matumizi' : 'Category'}
          icon="category"
          size="sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">{isSw ? 'Aina Zote' : 'All Categories'}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {getExpenseCategoryLabel(cat, language)}
            </option>
          ))}
        </SelectBox>

        {!isBranchStaff && (
          <SelectBox
            label={isSw ? 'Tawi' : 'Branch'}
            icon="storefront"
            size="sm"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="ALL">{isSw ? 'Matawi Yote' : 'All Branches'}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectBox>
        )}

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {isSw ? 'Kuanzia Tarehe' : 'From Date'}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setTimeFilter('ALL');
            }}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {isSw ? 'Mpaka Tarehe' : 'To Date'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setTimeFilter('ALL');
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title={isSw ? 'Safisha vichujio' : 'Reset filters'}
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Page Header Banner */}
      <PageHeaderBanner
        title={isSw ? 'Usimamizi wa Matumizi ya Biashara' : 'Operating Expenses Management'}
        subtitle={
          isSw
            ? 'Ufuatiliaji wa aina zote za matumizi ya biashara, bili za uendeshaji, na bajeti za matawi'
            : 'Track and analyze operating expenses, utility bills, and branch cost allocation'
        }
        icon="receipt_long"
        badgeText={`${filteredExpenses.length} ${isSw ? 'Miamala' : 'Records'}`}
        badgeVariant="warning"
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>{isSw ? 'Sajili Matumizi' : 'Record Expense'}</span>
          </button>
        }
      />

      {/* 2. Responsive KPI Cards (Strict Rule 10: 2 cards per row on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {isSw ? 'Jumla Iliyochujwa' : 'Filtered Total'}
            </span>
            <span className="material-symbols-outlined text-rose-500 text-base">payments</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono block truncate">
            TZS {filteredTotalAmount.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
            {filteredExpenses.length} {isSw ? 'miamala' : 'entries'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
              {isSw ? 'Matumizi ya Leo' : 'Today\'s Expenses'}
            </span>
            <span className="material-symbols-outlined text-amber-500 text-base">today</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono block truncate">
            TZS {todayTotalAmount.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-[11px] text-amber-500 mt-0.5 block truncate">
            {todayExpenses.length} {isSw ? 'leo' : 'today'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
              {isSw ? 'Mwezi Huu (MTD)' : 'This Month'}
            </span>
            <span className="material-symbols-outlined text-blue-500 text-base">calendar_month</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono block truncate">
            TZS {(monthTotalAmount / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] sm:text-[11px] text-blue-500 mt-0.5 block truncate">
            {monthExpenses.length} {isSw ? 'mwezi huu' : 'this month'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 truncate">
              {isSw ? 'Wastani kwa Muamala' : 'Avg per Entry'}
            </span>
            <span className="material-symbols-outlined text-purple-500 text-base">monitoring</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono block truncate">
            TZS {filteredExpenses.length > 0 ? Math.round(filteredTotalAmount / filteredExpenses.length).toLocaleString() : 0}
          </span>
          <span className="text-[10px] sm:text-[11px] text-purple-400 mt-0.5 block truncate">
            {isSw ? 'kwa kila risiti' : 'per expense receipt'}
          </span>
        </div>
      </div>

      {/* 3. Reusable Enterprise DataTable */}
      <DataTable<Expense>
        data={filteredExpenses}
        columns={expenseColumns}
        keyExtractor={(exp) => exp.id}
        language={language}
        title={isSw ? 'Orodha ya Matumizi' : 'Expenses List'}
        searchPlaceholder={
          isSw
            ? 'Tafuta kwa nambari ya risiti, maelezo, au mrekodi...'
            : 'Search by receipt number, description, or staff...'
        }
        filterComponent={expenseFilters}
        exportFileName="rekodi-za-matumizi"
      />

      {/* 4. Record Expense Modal */}
      <RecordExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branches={branches}
        currentUser={currentUser}
        onAddExpense={onAddExpense}
        language={language}
      />
    </div>
  );
};
