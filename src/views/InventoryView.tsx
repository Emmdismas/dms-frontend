import React, { useState, useMemo } from 'react';
import { VehicleUnit, Branch, VehicleModel, AuthUser } from '../types';
import { Language, translations, formatVehicleColor } from '../i18n/translations';
import {
  PageHeaderBanner,
  DataTable,
  ColumnDef,
  ActionMenu,
  StatusBadge,
  QuickChassisChip,
  SelectBox,
} from '../components/common';

interface InventoryViewProps {
  units: VehicleUnit[];
  branches: Branch[];
  models: VehicleModel[];
  currentUser: AuthUser | null;
  onOpenUnitDetail: (unit: VehicleUnit) => void;
  onOpenReceiveStockModal: () => void;
  onOpenRecordSaleModal: () => void;
  onOpenTransferModal: (unitId?: string) => void;
  onReleaseUnit?: (unit: VehicleUnit) => void;
  searchQuery: string;
  isDarkMode: boolean;
  language: Language;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  units,
  branches,
  models,
  currentUser,
  onOpenUnitDetail,
  onOpenReceiveStockModal,
  onOpenRecordSaleModal,
  onOpenTransferModal,
  onReleaseUnit,
  searchQuery,
  language,
}) => {
  const isBranchStaff =
    currentUser?.role === 'branch_manager' ||
    currentUser?.role === 'storekeeper' ||
    currentUser?.role === 'sales_person';
  const t = translations[language];

  // Filters state
  const [selectedType, setSelectedType] = useState<'ALL' | '2W' | '3W'>('ALL');
  const [selectedModel, setSelectedModel] = useState<string>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isBranchStaff && currentUser?.branchCode
      ? branches.find((b) => b.code === currentUser.branchCode)?.id || 'ALL'
      : 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('ALL');

  // Available models filtered dynamically by Category
  const availableModels = models.filter((m) => {
    if (selectedType !== 'ALL' && m.type !== selectedType) {
      return false;
    }
    return true;
  });

  const handleTypeChange = (newType: 'ALL' | '2W' | '3W') => {
    setSelectedType(newType);
    if (newType !== 'ALL' && selectedModel !== 'ALL') {
      const currentModelObj = models.find((m) => m.name === selectedModel);
      if (currentModelObj && currentModelObj.type !== newType) {
        setSelectedModel('ALL');
      }
    }
  };

  const handleResetFilters = () => {
    if (!isBranchStaff) setSelectedBranchId('ALL');
    setSelectedType('ALL');
    setSelectedModel('ALL');
    setSelectedStatus('ALL');
    setSelectedAgeRange('ALL');
  };

  // Filter Logic
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (isBranchStaff && currentUser?.branchCode) {
        if (u.branchCode !== currentUser.branchCode) return false;
      } else if (selectedBranchId !== 'ALL' && u.branchId !== selectedBranchId) {
        return false;
      }

      if (selectedType !== 'ALL' && u.vehicleType !== selectedType) {
        return false;
      }

      if (selectedModel !== 'ALL' && u.modelName !== selectedModel) {
        return false;
      }

      if (selectedStatus !== 'ALL' && u.status !== selectedStatus) {
        return false;
      }

      if (selectedAgeRange === '0-30' && u.stockAgeDays > 30) return false;
      if (selectedAgeRange === '31-60' && (u.stockAgeDays <= 30 || u.stockAgeDays > 60)) return false;
      if (selectedAgeRange === '60+' && u.stockAgeDays <= 60) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesChassis = u.chassisNumber.toLowerCase().includes(q);
        const matchesEngine = u.engineNumber.toLowerCase().includes(q);
        const matchesId = u.id.toLowerCase().includes(q);
        const matchesModel = u.modelName.toLowerCase().includes(q);
        const matchesColor =
          u.color.toLowerCase().includes(q) ||
          formatVehicleColor(u.color, 'sw').toLowerCase().includes(q) ||
          formatVehicleColor(u.color, 'en').toLowerCase().includes(q);
        const matchesCustomer = u.soldToCustomerName?.toLowerCase().includes(q);
        return matchesChassis || matchesEngine || matchesId || matchesModel || matchesColor || matchesCustomer;
      }

      return true;
    });
  }, [
    units,
    isBranchStaff,
    currentUser?.branchCode,
    selectedBranchId,
    selectedType,
    selectedModel,
    selectedStatus,
    selectedAgeRange,
    searchQuery,
  ]);

  // Metric counts
  const inStockCount = units.filter((u) => u.status === 'IN STOCK').length;
  const soldCount = units.filter((u) => u.status === 'SOLD').length;
  const reservedCount = units.filter((u) => u.status === 'RESERVED').length;
  const transferredCount = units.filter((u) => u.status === 'TRANSFERRED').length;

  // Table Columns Definition
  const inventoryColumns: ColumnDef<VehicleUnit>[] = [
    {
      header: '#',
      width: '45px',
      cell: (_unit, idx) => (
        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {idx + 1}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Aina' : 'Category',
      accessor: 'vehicleType',
      sortable: true,
      align: 'center',
      cell: (unit) => (
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-bold inline-block ${
            unit.vehicleType === '2W'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
          }`}
        >
          {unit.vehicleType}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Modeli' : 'Model',
      accessor: 'modelName',
      sortable: true,
      cell: (unit) => (
        <button
          type="button"
          onClick={() => onOpenUnitDetail(unit)}
          className="font-bold text-slate-900 dark:text-white text-xs hover:text-emerald-600 transition-colors cursor-pointer text-left"
        >
          {unit.modelName}
        </button>
      ),
    },
    {
      header: language === 'sw' ? 'Rangi' : 'Color',
      accessor: 'color',
      sortable: true,
      cell: (unit) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {formatVehicleColor(unit.color, language)}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Namba ya Chassis / VIN' : 'Chassis / VIN',
      accessor: 'chassisNumber',
      sortable: true,
      cell: (unit) => (
        <QuickChassisChip chassisNumber={unit.chassisNumber} language={language} />
      ),
    },
    {
      header: language === 'sw' ? 'Namba ya Injini' : 'Engine No',
      accessor: 'engineNumber',
      sortable: true,
      cell: (unit) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-medium">
          {unit.engineNumber}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Tawi' : 'Branch Name',
      accessor: 'branchName',
      sortable: true,
      cell: (unit) => (
        <span className="font-medium text-slate-800 dark:text-slate-200 text-xs block">
          {unit.branchName}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Msimbo wa Tawi' : 'Branch Code',
      accessor: 'branchCode',
      sortable: true,
      cell: (unit) => (
        <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
          {unit.branchCode}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Hali ya Stoo' : 'Status',
      accessor: 'status',
      align: 'center',
      sortable: true,
      cell: (unit) => <StatusBadge status={unit.status} language={language} />,
    },
    {
      header: language === 'sw' ? 'Uhifadhi / Mteja' : 'Reservation',
      cell: (unit) => {
        if (unit.status === 'RESERVED') {
          return (
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              <span className="block font-mono text-[10px]">{unit.pickupDate || (language === 'sw' ? 'Inasubiriwa' : 'Pending')}</span>
              {unit.reservedCustomerName && (
                <span className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {unit.reservedCustomerName}
                </span>
              )}
            </div>
          );
        }
        return <span className="text-slate-400 text-xs">-</span>;
      },
    },
    {
      header: language === 'sw' ? 'Bei ya Kuuzia' : 'Price',
      align: 'right',
      sortable: true,
      sortAccessor: (unit) => unit.price,
      cell: (unit) => (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
          TZS {unit.price.toLocaleString()}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Muda Stoo' : 'Stock Age',
      accessor: 'stockAgeDays',
      align: 'center',
      sortable: true,
      cell: (unit) => (
        <span
          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
            unit.stockAgeDays <= 30
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
              : unit.stockAgeDays <= 60
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
          }`}
        >
          {unit.stockAgeDays} {t.days}
        </span>
      ),
    },
    {
      header: language === 'sw' ? 'Vitendo' : 'Actions',
      align: 'right',
      cell: (unit) => {
        const actionItems = [
          {
            label: t.actionViewDetails,
            icon: 'visibility',
            onClick: () => onOpenUnitDetail(unit),
          },
        ];

        if (unit.status === 'RESERVED' && onReleaseUnit) {
          actionItems.push({
            label: language === 'sw' ? 'Kabidhi Chombo' : 'Release Unit',
            icon: 'task_alt',
            onClick: () => {
              if (
                window.confirm(
                  language === 'sw'
                    ? `Je, unathibitisha kumkabidhi mteja (${unit.reservedCustomerName || 'Mteja'}) chombo hiki (Chassis: ${unit.chassisNumber}) na kukitoa rasmi stoo?`
                    : `Confirm handover & release of unit (${unit.chassisNumber}) to customer?`
                )
              ) {
                onReleaseUnit(unit);
              }
            },
          });
        }

        if (currentUser?.role !== 'dealer' && currentUser?.role !== 'owner' && unit.status === 'IN STOCK') {
          actionItems.push({
            label: t.actionTransfer,
            icon: 'local_shipping',
            onClick: () => onOpenTransferModal(unit.id),
          });
        }

        return <ActionMenu items={actionItems} language={language} />;
      },
    },
  ];

  // Collapsible Filters Panel
  const inventoryFilters = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      {/* Category Filter */}
      <SelectBox
        label={language === 'sw' ? 'Aina ya Chombo' : 'Category'}
        icon="two_wheeler"
        size="sm"
        value={selectedType}
        onChange={(e) => handleTypeChange(e.target.value as 'ALL' | '2W' | '3W')}
      >
        <option value="ALL">{t.allTypes}</option>
        <option value="2W">{t.type2W}</option>
        <option value="3W">{t.type3W}</option>
      </SelectBox>

      {/* Model Filter */}
      <SelectBox
        label={language === 'sw' ? 'Mtindo wa Gari' : 'Vehicle Model'}
        icon="motorcycle"
        size="sm"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        <option value="ALL">{t.allModels}</option>
        {availableModels.map((m) => (
          <option key={m.id} value={m.name}>
            {m.name}
          </option>
        ))}
      </SelectBox>

      {/* Branch Filter */}
      <SelectBox
        label={language === 'sw' ? 'Tawi' : 'Branch'}
        icon="storefront"
        size="sm"
        disabled={isBranchStaff}
        value={selectedBranchId}
        onChange={(e) => setSelectedBranchId(e.target.value)}
      >
        <option value="ALL">{t.allBranches}</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.zone})
          </option>
        ))}
      </SelectBox>

      {/* Status Filter */}
      <SelectBox
        label={language === 'sw' ? 'Hali ya Stoo' : 'Stock Status'}
        icon="check_circle"
        size="sm"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="ALL">{language === 'sw' ? 'Hali Zote' : 'All Statuses'}</option>
        <option value="IN STOCK">{t.inStock}</option>
        <option value="RESERVED">{t.reserved}</option>
        <option value="TRANSFERRED">{t.transferred}</option>
        <option value="SOLD">{t.sold}</option>
        <option value="DAMAGED">{t.damaged}</option>
      </SelectBox>

      {/* Stock Age Filter */}
      <SelectBox
        label={language === 'sw' ? 'Muda Stoo' : 'Stock Age'}
        icon="schedule"
        size="sm"
        value={selectedAgeRange}
        onChange={(e) => setSelectedAgeRange(e.target.value)}
      >
        <option value="ALL">{t.allAges}</option>
        <option value="0-30">{t.newStock0to30}</option>
        <option value="31-60">{t.midStock31to60}</option>
        <option value="60+">{t.oldStock60Plus}</option>
      </SelectBox>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Page Header Banner */}
      <PageHeaderBanner
        title={t.inventoryTitle}
        subtitle={
          language === 'sw'
            ? 'Usimamizi wa pikipiki na bajaji zote, hali ya upatikanaji, na usajili wa chassis'
            : 'Real-time vehicle stock tracking, chassis registry, and branch allocation'
        }
        icon="inventory_2"
        badgeText={`${inStockCount} ${language === 'sw' ? 'Zinapatikana' : 'Available'}`}
        badgeVariant="success"
        actions={
          currentUser?.role !== 'dealer' && currentUser?.role !== 'owner' ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenTransferModal()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                <span>{t.actionTransfer}</span>
              </button>

              <button
                type="button"
                onClick={onOpenReceiveStockModal}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-white/25 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                <span>{t.actionReceiveStock}</span>
              </button>

              <button
                type="button"
                onClick={onOpenRecordSaleModal}
                className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#006948] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add_circle</span>
                <span>{t.actionRecordSale}</span>
              </button>
            </div>
          ) : undefined
        }
      />

      {/* 2. Responsive Quick Filter KPI Cards (2 cards per row on mobile per Protocol) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        <div
          onClick={() => setSelectedStatus('ALL')}
          className={`bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === 'ALL'
              ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {t.allUnits}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-base">widgets</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans block">
            {units.length}
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">{t.units}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('IN STOCK')}
          className={`bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === 'IN STOCK'
              ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
              {t.inStock}
            </span>
            <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans block">
            {inStockCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-emerald-500 mt-0.5 block">{t.units}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('SOLD')}
          className={`bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === 'SOLD'
              ? 'border-2 border-blue-600 ring-2 ring-blue-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
              {t.sold}
            </span>
            <span className="material-symbols-outlined text-blue-500 text-base">point_of_sale</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-sans block">
            {soldCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-blue-400 mt-0.5 block">{t.units}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('RESERVED')}
          className={`bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === 'RESERVED'
              ? 'border-2 border-amber-600 ring-2 ring-amber-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
              {t.reserved}
            </span>
            <span className="material-symbols-outlined text-amber-500 text-base">bookmark_manager</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-sans block">
            {reservedCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-amber-500 mt-0.5 block">{t.units}</span>
        </div>

        <div
          onClick={() => setSelectedStatus('TRANSFERRED')}
          className={`bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md col-span-2 sm:col-span-1 ${
            selectedStatus === 'TRANSFERRED'
              ? 'border-2 border-purple-600 ring-2 ring-purple-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 truncate">
              {t.transferred}
            </span>
            <span className="material-symbols-outlined text-purple-500 text-base">sync_alt</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-sans block">
            {transferredCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-purple-400 mt-0.5 block">{t.units}</span>
        </div>
      </div>

      {/* 3. Reusable Enterprise DataTable */}
      <DataTable<VehicleUnit>
        data={filteredUnits}
        columns={inventoryColumns}
        keyExtractor={(u) => u.id}
        language={language}
        title={t.inventoryTitle}
        searchPlaceholder={language === 'sw' ? 'Tafuta kwa Chassis, Injini, Mtindo, au Mteja...' : 'Search by Chassis, Engine, Model, or Customer...'}
        filterComponent={inventoryFilters}
        onResetFilters={handleResetFilters}
        exportLabel="Export Excel"
        exportFileName="rekodi-za-stoo"
        onRowClick={(unit) => onOpenUnitDetail(unit)}
      />
    </div>
  );
};
