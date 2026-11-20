import React, { useState, useEffect, useMemo } from 'react';
import { Dealer, Language, VehicleUnit, SaleRecord, Branch, TeamMember } from '../types';
import { dealerService } from '../services/dealerService';
import { mockVehicleUnits, mockSalesRecords } from '../data/mockData';
import { DealerDetailView } from './DealerDetailView';
import { PageHeaderBanner, DataTable, ColumnDef, ActionMenu, StatusBadge } from '../components/common';

interface DealersViewProps {
  dealers: Dealer[];
  units?: VehicleUnit[];
  sales?: SaleRecord[];
  branches?: Branch[];
  teamMembers?: TeamMember[];
  onRefreshDealers: () => void;
  onImpersonateDealer: (dealer: Dealer) => void;
  isDarkMode: boolean;
  language: Language;
}

export const DealersView: React.FC<DealersViewProps> = ({
  dealers,
  units,
  sales,
  branches,
  teamMembers,
  onRefreshDealers,
  onImpersonateDealer,
  isDarkMode,
  language,
}) => {
  const isSw = language === 'sw';

  // System-wide Units & Inventory Across ALL Dealers
  const allUnits = units ?? [];
  const allSales = sales ?? [];

  // 1. Total In Stock across all dealers
  const totalInStockUnits = allUnits.filter((u) => u.status === 'IN STOCK');
  const inStock2W = totalInStockUnits.filter((u) => u.vehicleType === '2W').length;
  const inStock3W = totalInStockUnits.filter((u) => u.vehicleType === '3W').length;

  // 2. Total Units Sold across all dealers
  const totalSoldUnitsCount = allSales.length;
  const sold2W = allSales.filter((s) => s.vehicleType === '2W').length;
  const sold3W = allSales.filter((s) => s.vehicleType === '3W').length;

  // 3. Total 2W in system
  const total2WAll = allUnits.filter((u) => u.vehicleType === '2W').length;

  // 4. Total 3W in system
  const total3WAll = allUnits.filter((u) => u.vehicleType === '3W').length;

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDealerDetail, setSelectedDealerDetail] = useState<Dealer | null>(null);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [resetPwDealer, setResetPwDealer] = useState<Dealer | null>(null);
  const [deletingDealer, setDeletingDealer] = useState<Dealer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    code: '',
    secondaryCode: '',
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: 'ChangeMe@2026',
    status: 'Active' as 'Active' | 'Inactive',
    city: 'Dar Es Salaam',
    country: 'Tanzania',
    branchesCount: 1,
    notes: '',
  });

  // Reset password state
  const [newPassword, setNewPassword] = useState('ChangeMe@2026');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Dealers
  const filteredDealers = dealers.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.ownerName.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesCity = cityFilter === 'ALL' || d.city === cityFilter;

    return matchesSearch && matchesStatus && matchesCity;
  });

  // Cities list for filter
  const allCities = Array.from(new Set(dealers.map((d) => d.city))).filter(Boolean);

  // Metrics
  const totalDealersCount = dealers.length;
  const activeDealersCount = dealers.filter((d) => d.status === 'Active').length;
  const inactiveDealersCount = dealers.filter((d) => d.status === 'Inactive').length;
  const totalBranchesCount = dealers.reduce((acc, curr) => acc + (curr.branchesCount || 0), 0);

  // Handlers
  const handleToggleStatus = async (dealer: Dealer) => {
    try {
      const res = await dealerService.toggleDealerStatus(dealer.id);
      await onRefreshDealers();
      showToast(
        isSw
          ? `Hali ya "${dealer.name}" imebadilishwa kuwa: ${res.newStatus === 'Active' ? 'Kazini (Active)' : 'Imesitishwa (Inactive)'}`
          : `Status for "${dealer.name}" changed to: ${res.newStatus}`,
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status.');
    }
  };

  const handleOpenAddModal = () => {
    const autoCode = `C-DMS-D00${dealers.length + 101}`;
    setFormData({
      code: autoCode,
      secondaryCode: '',
      name: '',
      ownerName: '',
      email: '',
      phone: '',
      password: 'ChangeMe@2026',
      status: 'Active',
      city: 'Dar Es Salaam',
      country: 'Tanzania',
      branchesCount: 1,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAddDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.ownerName.trim()) {
      alert(isSw ? 'Tafadhali jaza jina la Dealer, Code na Mmiliki.' : 'Please fill Dealer Name, Code and Owner Name.');
      return;
    }

    try {
      await dealerService.addDealer(formData);
      await onRefreshDealers();
      setIsAddModalOpen(false);
      showToast(isSw ? `Dealer "${formData.name}" ameongezwa kikamilifu!` : `Dealer "${formData.name}" added successfully!`);
    } catch (err: any) {
      const firstErr = err?.errors ? (Object.values(err.errors)[0] as string[] | undefined)?.[0] : undefined;
      alert(firstErr || err?.message || 'Could not create dealer.');
    }
  };

  const handleOpenEditModal = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setFormData({
      code: dealer.code,
      secondaryCode: dealer.secondaryCode || '',
      name: dealer.name,
      ownerName: dealer.ownerName,
      email: dealer.email,
      phone: dealer.phone,
      password: 'ChangeMe@2026',
      status: dealer.status,
      city: dealer.city,
      country: dealer.country,
      branchesCount: dealer.branchesCount || 1,
      notes: dealer.notes || '',
    });
  };

  const handleSaveEditDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDealer) return;

    try {
      await dealerService.updateDealer(editingDealer.id, {
        code: formData.code.trim().toUpperCase(),
        secondaryCode: formData.secondaryCode.trim().toUpperCase() || undefined,
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        status: formData.status,
        city: formData.city.trim(),
        country: formData.country.trim(),
        notes: formData.notes.trim(),
      });

      await onRefreshDealers();
      setEditingDealer(null);
      showToast(isSw ? `Taarifa za "${formData.name}" zimesasishwa!` : `Updated "${formData.name}" successfully!`);
    } catch (err: any) {
      const firstErr = err?.errors ? (Object.values(err.errors)[0] as string[] | undefined)?.[0] : undefined;
      alert(firstErr || err?.message || 'Could not update dealer.');
    }
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwDealer) return;
    if (!newPassword.trim()) {
      alert(isSw ? 'Tafadhali weka nenosiri jipya.' : 'Please enter a new password.');
      return;
    }

    try {
      await dealerService.resetDealerPassword(resetPwDealer.id, newPassword.trim());
      await onRefreshDealers();
      showToast(
        isSw
          ? `Nenosiri la "${resetPwDealer.name}" limewekwa upya.`
          : `Password for "${resetPwDealer.name}" reset successfully.`,
      );
      setResetPwDealer(null);
      setNewPassword('ChangeMe@2026');
    } catch (err: any) {
      alert(err?.message || 'Could not reset password.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDealer) return;
    try {
      await dealerService.deleteDealer(deletingDealer.id);
      await onRefreshDealers();
      showToast(isSw ? `Dealer "${deletingDealer.name}" amefutwa kwenye mfumo.` : `Dealer "${deletingDealer.name}" removed.`);
      setDeletingDealer(null);
    } catch (err: any) {
      alert(err?.message || 'Could not delete dealer.');
    }
  };

  // Unified Reusable Columns
  const dealerColumns: ColumnDef<Dealer>[] = useMemo(() => [
    {
      key: 'index',
      header: '#',
      width: '45px',
      align: 'center',
      accessor: (_, idx) => (
        <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
          {idx + 1}
        </span>
      ),
    },
    {
      key: 'name',
      header: isSw ? 'Jina la Dealer' : 'Dealer Name',
      sortable: true,
      sortAccessor: (d) => d.name,
      accessor: (d) => (
        <button
          type="button"
          onClick={() => setSelectedDealerDetail(d)}
          className="text-slate-900 dark:text-white font-bold hover:text-[#006948] dark:hover:text-emerald-400 hover:underline cursor-pointer text-left transition-colors"
          title={isSw ? 'Bofya kutazama taarifa zote za dealer huyu' : 'Click to view full details'}
        >
          {d.name}
        </button>
      ),
    },
    {
      key: 'code',
      header: isSw ? 'Kodi 1' : 'Code 1',
      sortable: true,
      sortAccessor: (d) => d.code,
      accessor: (d) => (
        <span className="font-mono text-xs font-bold text-[#006948] dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40">
          {d.code}
        </span>
      ),
    },
    {
      key: 'secondaryCode',
      header: isSw ? 'Kodi 2' : 'Code 2',
      accessor: (d) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {d.secondaryCode || '-'}
        </span>
      ),
    },
    {
      key: 'ownerName',
      header: isSw ? 'Mwakilishi Mkuu' : 'Dealer Representative',
      sortable: true,
      sortAccessor: (d) => d.ownerName,
      accessor: (d) => <span className="font-semibold text-slate-800 dark:text-slate-200">{d.ownerName}</span>,
    },
    {
      key: 'phone',
      header: isSw ? 'Simu' : 'Phone',
      accessor: (d) => <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{d.phone}</span>,
    },
    {
      key: 'email',
      header: isSw ? 'Barua Pepe' : 'Email',
      accessor: (d) => <span className="text-xs text-slate-600 dark:text-slate-400">{d.email}</span>,
    },
    {
      key: 'location',
      header: isSw ? 'Mji / Nchi' : 'Location',
      accessor: (d) => <span className="text-xs text-slate-700 dark:text-slate-300">{d.city}, {d.country}</span>,
    },
    {
      key: 'branches',
      header: isSw ? 'Matawi' : 'Branches',
      align: 'center',
      sortable: true,
      sortAccessor: (d) => {
        const dBranches = branches?.filter((b) => b.dealerCode === d.code) || [];
        return dBranches.length || d.branchesCount || 1;
      },
      accessor: (d) => {
        const dBranches = branches?.filter((b) => b.dealerCode === d.code) || [];
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
            {dBranches.length || d.branchesCount || 1}
          </span>
        );
      },
    },
    {
      key: 'stock',
      header: isSw ? 'Stoo (Jumla)' : 'Total Stock',
      align: 'center',
      sortable: true,
      sortAccessor: (d) => {
        const dBranches = branches?.filter((b) => b.dealerCode === d.code) || [];
        return allUnits.filter((u) => (u.dealerCode === d.code || dBranches.some((b) => b.id === u.branchId)) && u.status === 'IN STOCK').length;
      },
      accessor: (d) => {
        const dBranches = branches?.filter((b) => b.dealerCode === d.code) || [];
        const inStock = allUnits.filter((u) => (u.dealerCode === d.code || dBranches.some((b) => b.id === u.branchId)) && u.status === 'IN STOCK');
        const count2W = inStock.filter((u) => u.vehicleType === '2W').length;
        const count3W = inStock.filter((u) => u.vehicleType === '3W').length;
        return (
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-xs text-[#006948] dark:text-emerald-400">
              {inStock.length}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              2W:{count2W} | 3W:{count3W}
            </span>
          </div>
        );
      },
    },
    {
      key: 'sales',
      header: isSw ? 'Mauzo (Jumla)' : 'Total Sold',
      align: 'center',
      sortable: true,
      sortAccessor: (d) => {
        const dBranches = branches?.filter((b) => b.dealerCode === d.code) || [];
        return allSales.filter((s) => s.dealerCode === d.code || dBranches.some((b) => b.id === s.branchId)).length;
      },
      accessor: (d) => {
        const dBranches = branches?.filter((b) => b.dealerCode === d.code) || [];
        const dSales = allSales.filter((s) => s.dealerCode === d.code || dBranches.some((b) => b.id === s.branchId));
        const sold2W = dSales.filter((s) => s.vehicleType === '2W').length;
        const sold3W = dSales.filter((s) => s.vehicleType === '3W').length;
        return (
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-xs text-teal-700 dark:text-teal-400">
              {dSales.length}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              2W:{sold2W} | 3W:{sold3W}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: isSw ? 'Hali' : 'Status',
      align: 'center',
      accessor: (d) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(d)}
          title={isSw ? 'Bofya kubadili hali' : 'Click to toggle status'}
          className="cursor-pointer"
        >
          <StatusBadge status={d.status} language={language} showPulse={d.status === 'Active'} />
        </button>
      ),
    },
    {
      key: 'actions',
      header: isSw ? 'Chaguzi' : 'Actions',
      align: 'center',
      width: '70px',
      accessor: (d) => {
        const isActive = d.status === 'Active';
        return (
          <ActionMenu
            triggerIcon="more_vert"
            items={[
              {
                label: isSw ? 'Tazama Taarifa' : 'View Details',
                icon: 'visibility',
                onClick: () => setSelectedDealerDetail(d),
              },
              {
                label: isSw ? `Ingia: ${d.ownerName || d.name}` : `Login: ${d.ownerName || d.name}`,
                icon: 'login',
                disabled: !isActive,
                onClick: () => onImpersonateDealer(d),
              },
              {
                label: isSw ? 'Weka Nenosiri' : 'Reset Password',
                icon: 'lock_reset',
                onClick: () => {
                  setResetPwDealer(d);
                  setNewPassword(d.password || '123456');
                },
              },
              {
                label: isSw ? 'Hariri' : 'Edit',
                icon: 'edit',
                onClick: () => handleOpenEditModal(d),
              },
              {
                label: isActive ? (isSw ? 'Sitisha (Inactive)' : 'Deactivate') : (isSw ? 'Amilisha (Active)' : 'Activate'),
                icon: isActive ? 'toggle_off' : 'toggle_on',
                onClick: () => handleToggleStatus(d),
              },
              {
                divider: true,
                label: '',
                onClick: () => {},
              },
              {
                label: isSw ? 'Futa Dealer' : 'Delete Dealer',
                icon: 'delete',
                danger: true,
                onClick: () => setDeletingDealer(d),
              },
            ]}
          />
        );
      },
    },
  ], [isSw, language, branches, allUnits, allSales]);

  const dealerFilters = (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Status Filter */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shrink-0">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-[#006948] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isSw ? 'Wote' : 'All'} ({dealers.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Active')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'Active'
              ? 'bg-[#006948] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isSw ? 'Active' : 'Active'} ({activeDealersCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Inactive')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'Inactive'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isSw ? 'Inactive' : 'Inactive'} ({inactiveDealersCount})
        </button>
      </div>

      {/* City Dropdown */}
      {allCities.length > 0 && (
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
        >
          <option value="ALL">{isSw ? 'Miji Yote' : 'All Cities'}</option>
          {allCities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}
    </div>
  );

  if (selectedDealerDetail) {
    return (
      <DealerDetailView
        dealer={selectedDealerDetail}
        units={allUnits}
        sales={allSales}
        branches={branches || []}
        teamMembers={teamMembers}
        onBack={() => setSelectedDealerDetail(null)}
        onImpersonateDealer={onImpersonateDealer}
        onOpenEditModal={(d) => {
          setSelectedDealerDetail(null);
          handleOpenEditModal(d);
        }}
        onOpenResetPasswordModal={(d) => {
          setSelectedDealerDetail(null);
          setResetPwDealer(d);
          setNewPassword(d.password || '123456');
        }}
        isDarkMode={isDarkMode}
        language={language}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-950/20 border border-emerald-400/40 animate-bounce">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Reusable Clean Page Header Banner */}
      <PageHeaderBanner
        icon="corporate_fare"
        title={isSw ? 'Ma-Dealer Wote' : 'All Dealers'}
        subtitle={
          isSw
            ? 'Orodha na usimamizi wa ma-dealer wote na matawi yao nchini.'
            : 'Directory and administrative management of all nationwide dealers.'
        }
        theme="admin"
        badge={{
          text: `${totalDealersCount} ${isSw ? 'Wamesajiliwa' : 'Registered'}`,
          variant: 'amber',
          pulse: true,
        }}
        actions={
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0 min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>{isSw ? 'Ongeza Dealer Mpya' : 'Add New Dealer'}</span>
          </button>
        }
      />

      {/* METRIC STAT CARDS (Strict Rule: 2 cards per row on mobile, col-6/grid-cols-2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Dealers */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isSw ? 'Jumla ya Ma-Dealer' : 'Total Dealers'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">hub</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {totalDealersCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">{isSw ? 'kampuni' : 'dealers'}</span>
          </div>
        </div>

        {/* Card 2: Active Dealers */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isSw ? 'Walio Kazini (Active)' : 'Active Dealers'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">verified</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-500">
              {activeDealersCount}
            </span>
            <span className="text-[11px] font-medium text-emerald-600/80">
              {totalDealersCount > 0 ? `${Math.round((activeDealersCount / totalDealersCount) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Card 3: Inactive / Suspended */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isSw ? 'Waliositishwa (Inactive)' : 'Inactive / Suspended'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">block</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-500">
              {inactiveDealersCount}
            </span>
            <span className="text-[11px] font-medium text-rose-400">{isSw ? 'imezimwa' : 'locked'}</span>
          </div>
        </div>

        {/* Card 4: Total Branches */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isSw ? 'Matawi Yote Mtandaoni' : 'Total Branches'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">storefront</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {totalBranchesCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">{isSw ? 'matawi' : 'branches'}</span>
          </div>
        </div>
      </div>

      {/* Reusable Enterprise DataTable */}
      <DataTable<Dealer>
        data={filteredDealers}
        columns={dealerColumns}
        keyExtractor={(d) => d.id}
        language={language}
        title={isSw ? 'Orodha Kuu ya Ma-Dealer' : 'Master Dealer Directory'}
        searchPlaceholder={isSw ? 'Tafuta kwa Jina, Code, Simu, Mkoa, Mwakilishi...' : 'Search Name, Code, Phone, Dealer, City...'}
        filterComponent={dealerFilters}
        exportFileName="orodha-ya-ma-dealer"
      />

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW DEALER */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-xl rounded-3xl border p-6 sm:p-8 shadow-2xl relative my-8 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <span className="material-symbols-outlined">add_business</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {isSw ? 'Sajili Dealer Mpya kwenye Mfumo' : 'Register New Dealer'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isSw ? 'Unda akaunti ya dealer na weka mipaka ya matawi yake.' : 'Create dealer account and configure parameters.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddDealer} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Dealer Code (Kitambulisho) *' : 'Dealer Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white font-mono text-sm uppercase focus:border-emerald-500 outline-none"
                    placeholder="e.g. C-ARU-A00123"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Jina la Biashara / Kampuni *' : 'Dealership Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none"
                    placeholder="e.g. Arusha Super Bikers Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Jina Kamili la Dealer (Mwakilishi) *' : 'Dealer / Representative Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none"
                    placeholder="e.g. Josephat Minja"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Namba ya Simu ya Dealer *' : 'Dealer Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm font-mono focus:border-emerald-500 outline-none"
                    placeholder="e.g. 0755 123 456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Barua Pepe (Email) *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none"
                    placeholder="e.g. info@dealership.co.tz"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Nenosiri la Awali la Kuingilia (Password) *' : 'Initial Login Password *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm font-mono focus:border-emerald-500 outline-none"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Mji / Mkoa' : 'City / Region'}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none"
                    placeholder="e.g. Arusha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Idadi ya Matawi ya Awali' : 'Initial Branches'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.branchesCount}
                    onChange={(e) => setFormData({ ...formData, branchesCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Hali ya Akaunti' : 'Account Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Active">{isSw ? 'Kazini (Active)' : 'Active'}</option>
                    <option value="Inactive">{isSw ? 'Imesitishwa (Inactive)' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {isSw ? 'Maelezo / Mkataba (Notes)' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs focus:border-emerald-500 outline-none"
                  placeholder={isSw ? 'Taarifa za mkataba, maeneo anayouza...' : 'Contract terms, territory...'}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs cursor-pointer"
                >
                  {isSw ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {isSw ? 'Sajili Dealer' : 'Save Dealer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT DEALER */}
      {/* ======================================================== */}
      {editingDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-xl rounded-3xl border p-6 sm:p-8 shadow-2xl relative my-8 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold">
                  {isSw ? `Hariri Taarifa: ${editingDealer.name}` : `Edit Dealer: ${editingDealer.name}`}
                </h2>
                <span className="font-mono text-xs text-emerald-400">{editingDealer.code}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingDealer(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditDealer} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Jina la Biashara / Dealer' : 'Dealership Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Jina la Dealer (Mwakilishi)' : 'Dealer / Representative Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Namba ya Simu' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Barua Pepe (Email)' : 'Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Mji / Mkoa' : 'City / Region'}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Idadi ya Matawi' : 'Branches Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.branchesCount}
                    onChange={(e) => setFormData({ ...formData, branchesCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {isSw ? 'Hali ya Akaunti' : 'Account Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Active">{isSw ? 'Kazini (Active)' : 'Active'}</option>
                    <option value="Inactive">{isSw ? 'Imesitishwa (Inactive)' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {isSw ? 'Maelezo / Mkataba (Notes)' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDealer(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs cursor-pointer"
                >
                  {isSw ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {isSw ? 'Hifadhi Mabadiliko' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: RESET PASSWORD */}
      {/* ======================================================== */}
      {resetPwDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <span className="material-symbols-outlined">lock_reset</span>
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {isSw ? 'Weka Nenosiri Upya' : 'Reset Dealer Password'}
                </h3>
                <p className="text-xs text-slate-400">{resetPwDealer.name} ({resetPwDealer.ownerName})</p>
              </div>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {isSw ? 'Nenosiri Jipya la Kuingilia (New Password) *' : 'New Login Password *'}
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono text-sm focus:border-amber-500 outline-none"
                  placeholder="e.g. 123456"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {isSw
                    ? 'Mmiliki ataweza kuingia kwenye mfumo kwa kutumia nenosiri hili jipya mara moja.'
                    : 'The owner will immediately be able to log in using this password.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPwDealer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  {isSw ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isSw ? 'Hifadhi Nenosiri' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {deletingDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {isSw ? 'Thibitisha Kufuta Dealer' : 'Confirm Delete Dealer'}
                </h3>
                <span className="text-xs text-slate-400 font-mono">{deletingDealer.code}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed">
              {isSw
                ? `Je, una uhakika unataka kumfuta kabisa Dealer "${deletingDealer.name}" (${deletingDealer.ownerName}) kwenye mtandao wa DMS? Hatua hii itafuta uwezo wake wa kuingia kwenye mfumo.`
                : `Are you sure you want to permanently delete "${deletingDealer.name}" from the network? This will remove their system access.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingDealer(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                {isSw ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                {isSw ? 'Ndio, Futa' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
