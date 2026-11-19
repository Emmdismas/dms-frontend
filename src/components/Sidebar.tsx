import React from 'react';
import { NavTab, AuthUser, UserRole } from '../types';
import { Language, translations } from '../i18n/translations';
import { DEALER_INFO } from '../data/mockData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenRecordSaleModal: () => void;
  currentUser: AuthUser | null;
  isDarkMode: boolean;
  totalInStockCount?: number;
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenRecordSaleModal,
  currentUser,
  isDarkMode,
  language,
}) => {
  const isOwner = currentUser?.role === 'dealer' || currentUser?.role === 'owner' || currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const t = translations[language];

  const navItems: { id: NavTab; label: string; icon: string; badge?: number; visibleFor: UserRole[] }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: 'dashboard', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin'] 
    },
    { 
      id: 'dealers', 
      label: language === 'sw' ? 'Ma-Dealer Wote' : 'All Dealers', 
      icon: 'corporate_fare', 
      visibleFor: ['super_admin'] 
    },
    { 
      id: 'branches', 
      label: t.navBranches, 
      icon: 'storefront', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'admin'] 
    },
    { 
      id: 'sales', 
      label: t.navSales, 
      icon: 'point_of_sale', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin'] 
    },
    { 
      id: 'inventory', 
      label: t.navInventory, 
      icon: 'two_wheeler', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin'] 
    },
    { 
      id: 'pricing', 
      label: t.navPricing, 
      icon: 'price_change', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin'] 
    },
    { 
      id: 'expenses', 
      label: t.navExpenses, 
      icon: 'receipt_long', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin'] 
    },
    { 
      id: 'transfers', 
      label: t.navTransfers, 
      icon: 'local_shipping', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin'] 
    },
    { 
      id: 'orders', 
      label: t.navOrders, 
      icon: 'inventory_2', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'admin'] 
    },
    { 
      id: 'customers', 
      label: t.navCustomers, 
      icon: 'groups', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin'] 
    },
    { 
      id: 'reports', 
      label: t.navReports, 
      icon: 'analytics', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin'] 
    },
    { 
      id: 'team', 
      label: t.navTeam, 
      icon: 'badge', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'admin'] 
    },
    { 
      id: 'settings', 
      label: t.navSettings, 
      icon: 'settings', 
      visibleFor: ['super_admin', 'dealer', 'owner', 'branch_manager', 'admin', 'storekeeper'] 
    },
  ];

  const visibleItems = navItems.filter((item) =>
    currentUser ? item.visibleFor.includes(currentUser.role) : true
  );

  return (
    <>
      {/* Desktop Main Sidebar (Hidden on Mobile) */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] flex-col z-40 shadow-xl border-r transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode 
            ? 'bg-[#0B1120] text-slate-300 border-slate-800' 
            : 'bg-white text-slate-800 border-slate-200'
        }`}
        aria-label={language === 'sw' ? 'Menyu Kuu ya Mfumo' : 'Main Navigation'}
      >
        {/* Brand Header with Close Button */}
        <div className={`p-5 pb-4 flex items-center justify-between border-b ${
          isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
        }`}>
          <div
            className="flex items-center gap-3 cursor-pointer min-w-0"
            onClick={() => {
              onSelectTab('dashboard');
              if (window.innerWidth < 768) onClose();
            }}
          >
            <img 
              src="/DMS-logo.png" 
              alt="DMS Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-md shrink-0" 
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-tight leading-none truncate font-sans">
                  <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Dealer </span>
                  <span className="text-[#006948] dark:text-emerald-400">Management</span>{' '}
                  <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>System</span>
                </h1>
              </div>
              <p className={`text-[10px] font-mono mt-1 truncate ${
                isSuperAdmin 
                  ? 'text-rose-400 font-bold tracking-wider' 
                  : isDarkMode ? 'text-emerald-400' : 'text-emerald-700 font-semibold'
              }`}>
                {isSuperAdmin 
                  ? 'SUPER ADMIN PORTAL' 
                  : currentUser?.dealerName 
                    ? `${currentUser.dealerName} • ${currentUser.branchName || (language === 'sw' ? 'Matawi Yote' : 'All Branches')}`
                    : (currentUser?.branchCode || 'ERP SYSTEM')}
              </p>
            </div>
          </div>

          {/* Dedicated Close Button */}
          <button
            type="button"
            onClick={onClose}
            className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ml-1 ${
              isDarkMode 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/80' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={language === 'sw' ? 'Funga Menyu (Close)' : 'Close Sidebar'}
            aria-label={language === 'sw' ? 'Funga Menyu' : 'Close Sidebar'}
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1 scrollbar-hide">
          <div className={`px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {language === 'sw' ? 'Orodha Kuu' : 'Main Navigation'}
          </div>

          {visibleItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#006948] text-white font-semibold shadow-md shadow-emerald-950/30'
                    : isDarkMode 
                      ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${
                      isActive 
                        ? 'text-white' 
                        : isDarkMode 
                          ? 'text-slate-400 group-hover:text-slate-200' 
                          : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate text-xs font-semibold">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive 
                        ? 'bg-white text-[#006948]' 
                        : isDarkMode 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Profile Footer */}
        <div className={`p-3.5 border-t flex items-center justify-between gap-2 ${
          isDarkMode 
            ? 'border-slate-800/80 bg-slate-900/80' 
            : 'border-slate-200/80 bg-slate-50/80'
        }`}>
          <div 
            onClick={() => {
              onSelectTab('settings');
              if (window.innerWidth < 768) onClose();
            }}
            className={`flex items-center gap-3 min-w-0 flex-1 p-1.5 rounded-xl cursor-pointer transition-colors group ${
              isDarkMode ? 'hover:bg-slate-800/80' : 'hover:bg-slate-200/60'
            }`}
            title={t.navSettings}
          >
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
              alt={currentUser?.name || 'User'}
              className={`w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0 ${
                isDarkMode ? 'border border-slate-700' : 'border border-slate-200'
              }`}
            />
            <div className="min-w-0 flex-1">
              <h2 className={`text-xs font-bold transition-colors truncate ${
                isDarkMode 
                  ? 'text-white group-hover:text-emerald-400' 
                  : 'text-slate-900 group-hover:text-emerald-700'
              }`}>
                {currentUser?.name || DEALER_INFO.name}
              </h2>
              <p className={`text-[11px] font-medium truncate ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                {currentUser?.role === 'owner' ? (language === 'sw' ? '👑 Mmiliki Mkuu' : '👑 Main Owner') : currentUser?.branchName || 'Branch Manager'}
              </p>
            </div>
          </div>

          <button
            title={t.navSettings}
            onClick={() => {
              onSelectTab('settings');
              if (window.innerWidth < 768) onClose();
            }}
            className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer border ${
              isDarkMode 
                ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/60 border-transparent hover:border-emerald-800/50' 
                : 'text-slate-500 hover:text-[#006948] hover:bg-emerald-50 border-transparent hover:border-emerald-200'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
