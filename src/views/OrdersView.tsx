import React, { useState, useMemo } from 'react';
import { SupplierOrder, AuthUser } from '../types';
import { Language, translations } from '../i18n/translations';
import {
  PageHeaderBanner,
  DataTable,
  ColumnDef,
  StatusBadge,
} from '../components/common';

interface OrdersViewProps {
  orders: SupplierOrder[];
  currentUser: AuthUser | null;
  onOpenReceiveStockModal: () => void;
  isDarkMode: boolean;
  language: Language;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currentUser: _currentUser,
  onOpenReceiveStockModal,
  language,
}) => {
  const t = translations[language];

  // Filters state
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (selectedSupplier !== 'ALL' && ord.supplier !== selectedSupplier) {
        return false;
      }
      if (selectedStatus !== 'ALL' && ord.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [orders, selectedSupplier, selectedStatus]);

  // Overall metric totals
  const totalUnits = orders.reduce((acc, o) => acc + o.totalUnits, 0);
  const totalAmountTZS = orders.reduce((acc, o) => acc + o.totalAmountTZS, 0);
  const inTransitCount = orders.filter((o) => o.status === 'IN_TRANSIT').length;
  const receivedCount = orders.filter((o) => o.status === 'RECEIVED').length;

  const handleResetFilters = () => {
    setSelectedSupplier('ALL');
    setSelectedStatus('ALL');
  };

  const ordersColumns: ColumnDef<SupplierOrder>[] = [
    {
      header: '#',
      width: '45px',
      cell: (_ord, idx) => (
        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {idx + 1}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Namba ya Oda' : 'Order No',
      accessor: 'orderNumber',
      sortable: true,
      cell: (ord) => (
        <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
          {ord.orderNumber}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Kiwanda / Muuzaji' : 'Supplier',
      accessor: 'supplier',
      sortable: true,
      cell: (ord) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs">
          {ord.supplier}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Tarehe ya Oda' : 'Order Date',
      accessor: 'orderDate',
      sortable: true,
      cell: (ord) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {ord.orderDate}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Tarehe Inayotarajiwa' : 'Expected Date',
      accessor: 'expectedDate',
      sortable: true,
      cell: (ord) => (
        <span className="font-mono font-semibold text-xs text-slate-700 dark:text-slate-300">
          {ord.expectedDate}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Idadi ya 2W' : '2W Qty',
      accessor: 'qty2W',
      align: 'center',
      sortable: true,
      cell: (ord) => (
        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {ord.qty2W}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Idadi ya 3W' : '3W Qty',
      accessor: 'qty3W',
      align: 'center',
      sortable: true,
      cell: (ord) => (
        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          {ord.qty3W}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Jumla ya Vyombo' : 'Total Units',
      accessor: 'totalUnits',
      align: 'center',
      sortable: true,
      cell: (ord) => (
        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs">
          {ord.totalUnits} {t.units}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Thamani (TZS)' : 'Total (TZS)',
      accessor: 'totalAmountTZS',
      align: 'right',
      sortable: true,
      cell: (ord) => (
        <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
          TZS {(ord.totalAmountTZS / 1000000).toFixed(1)}M
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Hali ya Oda' : 'Status',
      accessor: 'status',
      align: 'center',
      sortable: true,
      cell: (ord) => <StatusBadge status={ord.status} language={language} />,
    },
  ];

  const orderFilters = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          {t.colSupplier}
        </label>
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        >
          <option value="ALL">{language === 'sw' ? 'Wauzaji / Viwanda Vyote' : 'All Suppliers'}</option>
          <option value="TVS Motor Company (India)">TVS Motor Company</option>
          <option value="Bajaj Auto Ltd (India)">Bajaj Auto Ltd</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          {t.colOrderStatus}
        </label>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          >
            <option value="ALL">{language === 'sw' ? 'Hali Zote za Oda' : 'All Order Statuses'}</option>
            <option value="RECEIVED">{language === 'sw' ? 'Zilizopokelewa (Received)' : 'Received'}</option>
            <option value="IN_TRANSIT">{language === 'sw' ? 'Safarini (In Transit)' : 'In Transit'}</option>
            <option value="PARTIALLY_RECEIVED">{language === 'sw' ? 'Zilizopokelewa Nusu' : 'Partially Received'}</option>
          </select>
          <button
            type="button"
            onClick={handleResetFilters}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={language === 'sw' ? 'Safisha vichujio' : 'Reset filters'}
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Page Header Banner */}
      <PageHeaderBanner
        title={t.ordersTitle}
        subtitle={
          language === 'sw'
            ? 'Uagizaji wa mizigo ya vyombo kutoka viwandani, ufuatiliaji wa meli na upokeaji stoo'
            : 'Factory motorcycle supplier orders, container shipments, and receiving'
        }
        icon="factory"
        badgeText={`${totalUnits} ${t.units}`}
        badgeVariant="info"
        actions={
          <button
            type="button"
            onClick={onOpenReceiveStockModal}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#006948] rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>{t.actionReceiveStock}</span>
          </button>
        }
      />

      {/* 2. Responsive KPI Cards (Strict Rule 10: 2 per row on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {language === 'sw' ? 'Oda Zote' : 'Total Orders'}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-base">receipt_long</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans block">
            {orders.length}
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">
            {language === 'sw' ? 'Mizigo iliyoagizwa' : 'Purchase orders'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
              {language === 'sw' ? 'Idadi ya Vyombo' : 'Total Units'}
            </span>
            <span className="material-symbols-outlined text-emerald-500 text-base">two_wheeler</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans block">
            {totalUnits}
          </span>
          <span className="text-[10px] sm:text-[11px] text-emerald-500 mt-0.5 block">{t.units}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
              {language === 'sw' ? 'Safarini / Bandarini' : 'In Transit'}
            </span>
            <span className="material-symbols-outlined text-blue-500 text-base">directions_boat</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-sans block">
            {inTransitCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-blue-400 mt-0.5 block">
            {language === 'sw' ? 'Inasubiri bandari' : 'Awaiting arrival'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 truncate">
              {language === 'sw' ? 'Thamani Jumla' : 'Total Value'}
            </span>
            <span className="material-symbols-outlined text-purple-500 text-base">payments</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-sans block">
            {(totalAmountTZS / 1000000000).toFixed(2)}B
          </span>
          <span className="text-[10px] sm:text-[11px] text-purple-400 mt-0.5 block">TZS Bilioni</span>
        </div>
      </div>

      {/* 3. Reusable Enterprise DataTable */}
      <DataTable<SupplierOrder>
        data={filteredOrders}
        columns={ordersColumns}
        keyExtractor={(ord) => ord.id}
        language={language}
        title={t.ordersTitle}
        searchPlaceholder={
          language === 'sw'
            ? 'Tafuta kwa Namba ya Oda, Kiwanda (TVS / Bajaj)...'
            : 'Search by Order Number, Supplier (TVS / Bajaj)...'
        }
        filterComponent={orderFilters}
        exportFileName="oda-za-viwanda"
      />
    </div>
  );
};
