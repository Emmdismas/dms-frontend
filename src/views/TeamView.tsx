import React, { useState } from 'react';
import { TeamMember, Branch, AuthUser } from '../types';
import { Language, translations } from '../i18n/translations';
import { AddTeamMemberModal } from '../components/modals/AddTeamMemberModal';
import { Pagination } from '../components/Pagination';

import { CreateTeamMemberInput } from '../services/authService';

interface TeamViewProps {
  teamMembers: TeamMember[];
  branches: Branch[];
  currentUser: AuthUser | null;
  onAddTeamMember: (newMember: CreateTeamMemberInput) => Promise<void> | void;
  isDarkMode: boolean;
  language: Language;
}

const formatTeamRole = (role: string, lang: Language): string => {
  const r = role.toLowerCase();
  if (r.includes('manager') || r.includes('meneja')) {
    return lang === 'sw' ? 'Meneja wa Tawi' : 'Branch Manager';
  }
  if (r.includes('sales') || r.includes('mauzo')) {
    return lang === 'sw' ? 'Afisa Mauzo' : 'Sales Person';
  }
  if (r.includes('store') || r.includes('stoo')) {
    return lang === 'sw' ? 'Msimamizi wa Stoo' : 'Storekeeper';
  }
  if (r.includes('admin') || r.includes('mfumo')) {
    return lang === 'sw' ? 'Msimamizi wa Mfumo' : 'System Admin';
  }
  return role;
};

const getRoleBadgeClasses = (role: string): string => {
  const r = role.toLowerCase();
  if (r.includes('manager') || r.includes('meneja')) {
    return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
  }
  if (r.includes('sales') || r.includes('mauzo')) {
    return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  }
  if (r.includes('store') || r.includes('stoo')) {
    return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/70';
  }
  if (r.includes('admin') || r.includes('mfumo')) {
    return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
  }
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
};

const getRoleIcon = (role: string): string => {
  const r = role.toLowerCase();
  if (r.includes('manager') || r.includes('meneja')) return 'admin_panel_settings';
  if (r.includes('sales') || r.includes('mauzo')) return 'point_of_sale';
  if (r.includes('store') || r.includes('stoo')) return 'inventory_2';
  if (r.includes('admin') || r.includes('mfumo')) return 'shield_person';
  return 'badge';
};

export const TeamView: React.FC<TeamViewProps> = ({
  teamMembers,
  branches,
  currentUser,
  onAddTeamMember,
  isDarkMode,
  language,
}) => {
  const t = translations[language];
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  const isOwner = currentUser?.role === 'dealer' || currentUser?.role === 'owner' || isSuperAdmin;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter internal team members (excluding dealers who have their own dedicated table)
  const filteredMembers = teamMembers.filter((m) => {
    const roleLower = m.role.toLowerCase();
    
    // Safety: ignore any dealer records
    if (roleLower.includes('dealer') || roleLower.includes('owner') || roleLower.includes('mkurugenzi') || roleLower.includes('mmiliki')) {
      return false;
    }

    if (selectedBranch !== 'ALL' && m.branchName !== selectedBranch) {
      return false;
    }

    if (selectedRole !== 'ALL') {
      if (selectedRole === 'Manager' && !(roleLower.includes('manager') || roleLower.includes('meneja'))) {
        return false;
      }
      if (selectedRole === 'Sales' && !(roleLower.includes('sales') || roleLower.includes('mauzo'))) {
        return false;
      }
      if (selectedRole === 'Store' && !(roleLower.includes('store') || roleLower.includes('stoo'))) {
        return false;
      }
      if (selectedRole === 'Admin' && !(roleLower.includes('admin') || roleLower.includes('mfumo'))) {
        return false;
      }
    }

    if (selectedStatus !== 'ALL' && m.status !== selectedStatus) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const localizedRole = formatTeamRole(m.role, language).toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchPhone = m.phone.includes(q);
      const matchBranch = m.branchName.toLowerCase().includes(q);
      const matchEmail = (m.email || '').toLowerCase().includes(q);
      const matchRole = roleLower.includes(q) || localizedRole.includes(q);
      return matchName || matchPhone || matchBranch || matchEmail || matchRole;
    }

    return true;
  });

  const activeFiltersCount = [
    selectedBranch !== 'ALL',
    selectedRole !== 'ALL',
    selectedStatus !== 'ALL',
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0 || Boolean(searchTerm);

  const handleResetFilters = () => {
    setSelectedBranch('ALL');
    setSelectedRole('ALL');
    setSelectedStatus('ALL');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      {/* 1. EXECUTIVE TEAM HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#006948] via-[#005a3e] to-[#00422c] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 ring-4 ring-emerald-500/10 shrink-0">
            <span className="material-symbols-outlined text-[24px]">badge</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                {language === 'sw' ? 'Wafanyakazi & Wasimamizi wa Matawi' : 'Internal Staff & Team Members'}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {filteredMembers.length} {language === 'sw' ? 'Wafanyakazi' : 'Staff Members'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] sm:text-xs border border-slate-200/70 dark:border-slate-700/60">
                <span className="material-symbols-outlined text-[14px] text-slate-400">storefront</span>
                <span>
                  {language === 'sw' ? `${branches.length} Matawi ya Biashara` : `${branches.length} Dealership Branches`}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-300 font-bold text-[11px] sm:text-xs border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs">
                <span className="material-symbols-outlined text-[14px] text-emerald-600 dark:text-emerald-400">verified_user</span>
                <span>
                  {language === 'sw' ? 'Matawi & Mauzo' : 'Branch Staff & Roles'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Register new team member */}
        {isOwner && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#006948] via-[#007a54] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 hover:shadow-emerald-950/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer ring-1 ring-white/20 whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>{language === 'sw' ? 'Sajili Mfanyakazi' : 'Add Team Member'}</span>
          </button>
        )}
      </div>

      {/* 2. SEARCH & COLLAPSIBLE FILTERS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder={language === 'sw' ? 'Tafuta mfanyakazi kwa jina, simu, barua pepe, tawi au cheo...' : 'Search staff by name, phone, email, branch, or role...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-[#006948] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Action Buttons: Toggle Filters & Quick Reset */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>{language === 'sw' ? 'Vichujio' : 'Filters'}</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#006948] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
                keyboard_arrow_down
              </span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span className="hidden sm:inline">{t.clearFilters}</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filters Drawer */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Branch Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'sw' ? 'Chuja kwa Tawi:' : 'Filter by Branch:'}
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-[#006948]"
                >
                  <option value="ALL">{language === 'sw' ? 'Matawi Yote' : 'All Branches'}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'sw' ? 'Chuja kwa Cheo/Jukumu:' : 'Filter by Role:'}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-[#006948]"
                >
                  <option value="ALL">{language === 'sw' ? 'Nafasi Zote' : 'All Roles'}</option>
                  <option value="Manager">{language === 'sw' ? 'Wasimamizi wa Matawi' : 'Branch Managers'}</option>
                  <option value="Sales">{language === 'sw' ? 'Maafisa Mauzo' : 'Sales Persons'}</option>
                  <option value="Store">{language === 'sw' ? 'Wasimamizi wa Stoo' : 'Storekeepers'}</option>
                  <option value="Admin">{language === 'sw' ? 'Wasimamizi wa Mfumo' : 'System Admins'}</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'sw' ? 'Chuja kwa Hali:' : 'Filter by Status:'}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-[#006948]"
                >
                  <option value="ALL">{language === 'sw' ? 'Hali Zote' : 'All Status'}</option>
                  <option value="Active">{language === 'sw' ? 'Hai (Active)' : 'Active'}</option>
                  <option value="Inactive">{language === 'sw' ? 'Haitumiki (Inactive)' : 'Inactive'}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. STANDARD ENTERPRISE DATA TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-medium">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600 block">search_off</span>
            <p className="text-xs">
              {language === 'sw' 
                ? 'Hakuna wafanyakazi waliopatikana kwa vigezo hivi.' 
                : 'No staff members found matching your selected criteria.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#006948] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>{t.clearFilters}</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) with sticky header */}
            <div className="hidden md:block overflow-x-auto enterprise-scrollbar w-full max-h-[520px]">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead className="sticky top-0 z-10 font-bold text-xs border-b-2 border-[#004d34] bg-[#006948] text-white">
                  <tr className="whitespace-nowrap">
                    <th className="py-3.5 px-3 border-r border-white/15 w-12 text-center">#</th>
                    <th className="py-3.5 px-4 border-r border-white/15">{language === 'sw' ? 'Jina la Mfanyakazi' : 'Staff Name'}</th>
                    <th className="py-3.5 px-4 border-r border-white/15">{language === 'sw' ? 'Barua Pepe' : 'Email'}</th>
                    <th className="py-3.5 px-4 border-r border-white/15">{language === 'sw' ? 'Cheo / Wadhifa' : 'Role & Designation'}</th>
                    <th className="py-3.5 px-4 border-r border-white/15">{language === 'sw' ? 'Tawi Lililopangiwa' : 'Assigned Branch'}</th>
                    <th className="py-3.5 px-4 border-r border-white/15 font-mono">{language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}</th>
                    <th className="py-3.5 px-4 border-r border-white/15 text-center">{language === 'sw' ? 'Mauzo ya Mwezi' : 'MTD Sales'}</th>
                    <th className="py-3.5 px-4 border-r border-white/15 text-center">{language === 'sw' ? 'Hali' : 'Status'}</th>
                    <th className="py-3.5 px-3 text-center w-28">{language === 'sw' ? 'Mawasiliano' : 'Contact'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                  {paginatedMembers.map((member, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    const isActive = member.status === 'Active';
                    const displayRole = formatTeamRole(member.role, language);
                    const roleBadgeClass = getRoleBadgeClasses(member.role);

                    return (
                      <tr
                        key={member.id}
                        className={`transition-colors border-b border-slate-100 dark:border-slate-800/80 ${
                          idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-900/50'
                        } hover:bg-emerald-50/40 dark:hover:bg-slate-800/60`}
                      >
                        {/* 1. SN */}
                        <td className="py-3 px-3 border-r border-slate-100 dark:border-slate-800 text-center font-mono font-bold text-slate-400">
                          {rowNumber}
                        </td>

                        {/* 2. Staff Member Name */}
                        <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                            {member.name}
                          </span>
                        </td>

                        {/* 3. Email */}
                        <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                          {member.email ? (
                            <a
                              href={`mailto:${member.email}`}
                              className="text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
                            >
                              {member.email}
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        {/* 4. Role / Designation Badge */}
                        <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                          <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md ${roleBadgeClass}`}>
                            {displayRole}
                          </span>
                        </td>

                        {/* 5. Branch Name */}
                        <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                          <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                            {member.branchName}
                          </span>
                        </td>

                        {/* 6. Phone Number */}
                        <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap font-mono">
                          <a
                            href={`tel:${member.phone}`}
                            className="font-semibold text-[#006948] dark:text-emerald-400 hover:underline text-xs"
                          >
                            {member.phone}
                          </a>
                        </td>

                        {/* 7. MTD Sales */}
                        <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800 text-center whitespace-nowrap">
                          {member.mtdSalesCount !== undefined ? (
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs border border-blue-200/50 dark:border-blue-900">
                              {member.mtdSalesCount} {t.units}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* 8. Status */}
                        <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isActive ? (language === 'sw' ? 'Hai' : 'Active') : (language === 'sw' ? 'Haitumiki' : 'Inactive')}
                          </span>
                        </td>

                        {/* 9. Quick Contact Actions */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`tel:${member.phone}`}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors"
                              title={language === 'sw' ? `Piga: ${member.phone}` : `Call: ${member.phone}`}
                            >
                              <span className="material-symbols-outlined text-[15px]">call</span>
                            </a>
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                                title={language === 'sw' ? `Barua Pepe: ${member.email}` : `Email: ${member.email}`}
                              >
                                <span className="material-symbols-outlined text-[15px]">mail</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 768px) adhering to responsive protocol */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedMembers.map((member, idx) => {
                const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                const isActive = member.status === 'Active';
                const displayRole = formatTeamRole(member.role, language);
                const roleBadgeClass = getRoleBadgeClasses(member.role);
                const roleIcon = getRoleIcon(member.role);

                return (
                  <div key={member.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#006948] to-[#004d34] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                            {member.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            #{rowNumber} • {member.branchName}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{isActive ? (language === 'sw' ? 'Hai' : 'Active') : (language === 'sw' ? 'Haitumiki' : 'Inactive')}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${roleBadgeClass}`}>
                        <span className="material-symbols-outlined text-[13px]">{roleIcon}</span>
                        <span>{displayRole}</span>
                      </span>

                      {member.mtdSalesCount !== undefined && (
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200/40">
                          {member.mtdSalesCount} {t.units}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <a href={`tel:${member.phone}`} className="font-mono font-semibold text-[#006948] dark:text-emerald-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>{member.phone}</span>
                      </a>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="font-mono text-slate-500 dark:text-slate-400 text-[10px] truncate max-w-[150px]">
                          {member.email}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredMembers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              language={language}
            />
          </>
        )}
      </div>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        branches={branches}
        currentUser={currentUser}
        onAddTeamMember={onAddTeamMember}
        language={language}
      />
    </div>
  );
};
