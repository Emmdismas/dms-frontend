import React, { useState, useRef, useEffect } from 'react';
import { NavTab, AuthUser } from '../types';
import { Language, translations } from '../i18n/translations';
import { DEALER_INFO } from '../data/mockData';
import { BritishFlag, TanzaniaFlag } from './Flags';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isDarkMode,
  onToggleTheme,
  language,
  onToggleLanguage,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileMenu]);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Format user role display
  const getRoleDisplay = () => {
    if (!currentUser) return 'ADMIN';
    if (currentUser.role === 'super_admin') {
      return language === 'sw' ? 'MSIMAMIZI MKUU' : 'SUPER ADMIN';
    }
    if (currentUser.role === 'dealer' || currentUser.role === 'owner') {
      return language === 'sw' ? 'DEALER MKUU' : 'DEALER';
    }
    if (currentUser.role === 'branch_manager') {
      return currentUser.branchName ? `${currentUser.branchName.toUpperCase()}` : (language === 'sw' ? 'MENEJA WA TAWI' : 'BRANCH MANAGER');
    }
    if (currentUser.role === 'admin') return 'ADMIN';
    if (currentUser.role === 'storekeeper') return language === 'sw' ? 'MTUNZA STOO' : 'STOREKEEPER';
    if (currentUser.role === 'sales_person') return language === 'sw' ? 'AFISA MAUZO' : 'SALES OFFICER';
    return String(currentUser.role).toUpperCase();
  };

  return (
    <header className={`sticky top-0 z-20 backdrop-blur-md border-b px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-200 gap-3 relative ${
      isDarkMode 
        ? 'bg-[#0F172A]/95 border-slate-800 text-slate-100' 
        : 'bg-white/95 border-[#bccac0]/30 text-[#191c1e]'
    }`}>
      {/* Left: Desktop Sidebar Toggle & Mobile Clean Brand Badge */}
      <div className="flex items-center gap-2.5 shrink-0 z-10">
        {/* Desktop Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`hidden md:flex min-w-[42px] min-h-[42px] p-2 rounded-xl items-center justify-center transition-all cursor-pointer shrink-0 ${
            isDarkMode
              ? 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
          title={isSidebarOpen ? (language === 'sw' ? 'Kunja Menyu (Collapse)' : 'Collapse Sidebar') : (language === 'sw' ? 'Panua Menyu (Expand)' : 'Expand Sidebar')}
          aria-label={isSidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isSidebarOpen ? 'menu_open' : 'menu'}
          </span>
        </button>

        {/* Mobile Brand Logo Icon */}
        <div 
          onClick={() => onSelectTab('dashboard')}
          className="flex md:hidden items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <img 
            src="/DMS-logo.png" 
            alt="DMS Logo" 
            className="w-9 h-9 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0" 
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-xs tracking-tight truncate max-w-[170px] leading-tight font-sans">
              <span className="text-slate-900 dark:text-white">Dealer </span>
              <span className="text-[#006948] dark:text-emerald-400">Management</span>
            </span>
            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate">
              {isSuperAdmin 
                ? 'SUPER ADMIN' 
                : (currentUser?.dealerName || currentUser?.branchCode || 'ERP SYSTEM')}
            </span>
          </div>
        </div>
      </div>

      {/* Center: System Name centered in remaining space (Desktop only) */}
      <div className="hidden md:flex flex-1 items-center justify-center min-w-0 px-2 sm:px-4">
        <span className="text-base sm:text-lg md:text-xl font-black tracking-tight font-sans select-none truncate">
          <span className="text-slate-900 dark:text-white">Dealer </span>
          <span className="text-[#006948] dark:text-emerald-400">Management</span>{' '}
          <span className="text-slate-900 dark:text-white">System</span>
        </span>
      </div>

      {/* Right Controls: Theme Toggle (PC only), Language Switcher (PC only), and User Profile Dropdown */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto z-30">
        
        {/* PC ONLY: Dark/Night Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className={`hidden md:flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer select-none ${
            isDarkMode
              ? 'bg-slate-800/90 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
          }`}
          title={
            isDarkMode 
              ? (language === 'sw' ? 'Washa Muonekano Mweupe' : 'Switch to Light Mode') 
              : (language === 'sw' ? 'Washa Muonekano wa Usiku (Dark Mode)' : 'Switch to Dark Mode')
          }
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* PC ONLY: Language Switcher (EN / SW) */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 select-none shadow-2xs">
          <button
            type="button"
            onClick={() => language !== 'en' && onToggleLanguage()}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              language === 'en'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="English"
          >
            <BritishFlag className="w-3.5 h-2.5" />
            <span>EN</span>
          </button>
          <button
            type="button"
            onClick={() => language !== 'sw' && onToggleLanguage()}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              language === 'sw'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Kiswahili"
          >
            <TanzaniaFlag className="w-3.5 h-2.5" />
            <span>SW</span>
          </button>
        </div>

        {/* User Profile Dropdown (visible on both PC & mobile) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
              showProfileMenu
                ? 'border-emerald-600/60 ring-2 ring-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                : currentTab === 'settings'
                  ? 'border-[#006948] ring-2 ring-[#006948]/20 bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-emerald-300'
                  : isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-100' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900 shadow-2xs'
            }`}
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
            title={currentUser?.name || (language === 'sw' ? 'Wasifu' : 'Profile')}
          >
          <img
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
            alt={currentUser?.name || 'User'}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-600/30 shrink-0"
          />
          <span className="text-xs font-semibold hidden md:inline truncate max-w-[120px]">
            {currentUser?.name?.split(' ')[0]}
          </span>
          <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-200 ${
            showProfileMenu ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}>
            expand_more
          </span>
        </button>

        {/* Dropdown Popup Menu */}
        {showProfileMenu && (
          <div className={`absolute right-0 top-full mt-2 w-56 sm:w-64 rounded-2xl border shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
            isDarkMode 
              ? 'bg-[#0F172A] border-slate-800 text-slate-100 shadow-black/60' 
              : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-300/50'
          }`}>
            {/* Header: User Info */}
            <div className="px-3.5 py-3 border-b border-slate-100 dark:border-slate-800/80">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {currentUser?.name || (language === 'sw' ? 'Mtumiaji wa Mfumo' : 'Admin User')}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5 truncate">
                {getRoleDisplay()}
              </p>
            </div>

            {/* Menu Items */}
            <div className="pt-1.5 space-y-1">
              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('settings');
                  setShowProfileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-left ${
                  currentTab === 'settings'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#006948] dark:text-emerald-300'
                    : isDarkMode
                      ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-slate-500 dark:text-slate-400">
                  settings
                </span>
                <span>{language === 'sw' ? 'Mipangilio' : 'Settings'}</span>
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <span className="material-symbols-outlined text-[20px] text-red-500 dark:text-red-400">
                  logout
                </span>
                <span>{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

    </header>
  );
};

