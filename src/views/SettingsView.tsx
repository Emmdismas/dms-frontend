import React, { useState } from 'react';
import { DEALER_INFO } from '../data/mockData';
import { AuthUser, NavTab } from '../types';
import { Language } from '../i18n/translations';
import { authService } from '../services/authService';
import { ApiError } from '../services/api';

interface SettingsViewProps {
  currentUser: AuthUser | null;
  onResetDemoData?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  language: Language;
  onChangeLanguage: (newLang: Language) => void;
  onLogout: () => void;
  onSelectTab?: (tab: NavTab) => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  isDarkMode,
  onToggleTheme,
  language,
  onChangeLanguage,
  onLogout,
  onSelectTab,
  onInstallPwa,
}) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // User initials
  const userName = currentUser?.name || DEALER_INFO.name;
  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError(language === 'sw' ? 'Tafadhali jaza sehemu zote.' : 'Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(language === 'sw' ? 'Nenosiri jipya linapaswa kuwa na angalau herufi 6.' : 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(language === 'sw' ? 'Nenosiri mpya hazilingani. Tafadhali hakiki tena.' : 'New passwords do not match. Please check again.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      setPasswordSuccess(language === 'sw' ? 'Hongera! Nenosiri limebadilishwa kikamilifu.' : 'Congratulations! Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(null);
      }, 2500);
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.field('current_password') || err.field('password') || err.message);
      } else {
        setPasswordError(language === 'sw' ? 'Imeshindwa kubadilisha nenosiri.' : 'Failed to change password.');
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      
      {/* 1. EXECUTIVE SETTINGS HEADER (Clean & Minimalist) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#006948] via-[#005a3e] to-[#00422c] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 ring-4 ring-emerald-500/10 shrink-0">
            <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              {language === 'sw' ? 'Wasifu & Mipangilio ya Mfumo' : 'Profile & System Settings'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'sw' 
                ? 'Dhibiti akaunti yako, mandhari ya muonekano, na programu' 
                : 'Manage your account profile, display preferences, and PWA app'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 1. User Profile Card (mkataba style) ── */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10 min-w-0">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl border-2 border-[#006948] dark:border-emerald-500 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-black text-[#006948] dark:text-emerald-400">
                {initials}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {userName}
            </h3>
            <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
              {currentUser?.phone || currentUser?.email || DEALER_INFO.phone}
            </p>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#006948] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="material-symbols-outlined text-[12px]">corporate_fare</span>
                <span>
                  {currentUser?.role === 'dealer' || currentUser?.role === 'owner' 
                    ? (language === 'sw' ? '🏢 Dealer Mkuu' : '🏢 Dealer')
                    : currentUser?.role === 'super_admin'
                    ? (language === 'sw' ? '🛡️ Super Admin' : '🛡️ Super Admin')
                    : (language === 'sw' ? `Meneja wa Tawi: ${currentUser?.branchCode}` : `Branch Manager: ${currentUser?.branchCode}`)}
                </span>
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[12px] text-[#006948] dark:text-emerald-400">
                  verified
                </span>
                <span>{language === 'sw' ? 'Imethibitishwa' : 'Verified'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Branch / Code */}
        <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end gap-1">
          <span className="text-[10px] uppercase text-slate-400 font-bold">{language === 'sw' ? 'Msimbo:' : 'Dealer Code:'}</span>
          <span className="font-bold text-[#006948] dark:text-emerald-400">{DEALER_INFO.code}</span>
        </div>
      </div>

      {/* ── 2. System Settings (Theme & Language) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="material-symbols-outlined text-[#006948] dark:text-emerald-400 text-xl">
            tune
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {language === 'sw' ? 'Mipangilio ya Mfumo' : 'System Preferences'}
          </h3>
        </div>

        {/* Theme Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-[#006948] dark:text-emerald-400 shrink-0">
              <span className="material-symbols-outlined">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'sw' ? 'Mandhari ya Muonekano' : 'Display Theme'}
              </p>
              <p className="text-xs text-slate-500">
                {isDarkMode 
                  ? (language === 'sw' ? 'Giza (Dark Mode)' : 'Dark Mode') 
                  : (language === 'sw' ? 'Mwanga (Light Mode)' : 'Light Mode')}
              </p>
            </div>
          </div>

          {/* Light / Dark Toggle Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => isDarkMode && onToggleTheme()}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isDarkMode
                  ? 'bg-white text-[#006948] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">light_mode</span>
              <span>{language === 'sw' ? 'Mwanga' : 'Light'}</span>
            </button>
            <button
              type="button"
              onClick={() => !isDarkMode && onToggleTheme()}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">dark_mode</span>
              <span>{language === 'sw' ? 'Giza' : 'Dark'}</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:border-slate-800" />

        {/* Language Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <span className="material-symbols-outlined">translate</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'sw' ? 'Lugha ya Programu' : 'App Language'}
              </p>
              <p className="text-xs text-slate-500">
                {language === 'sw' ? '🇹🇿 Kiswahili (Chaguo-msingi)' : '🇬🇧 English (Active)'}
              </p>
            </div>
          </div>

          {/* Language Switcher Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onChangeLanguage('sw')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'sw'
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇹🇿</span>
              <span>Kiswahili</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('en')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2.5. All System Modules Directory (Clean Quick Navigation for Mobile & Desktop) ── */}
      {onSelectTab && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] dark:text-emerald-400 text-xl">
                apps
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {language === 'sw' ? 'Moduli Zote za Mfumo' : 'All System Modules'}
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              {language === 'sw' ? 'Nenda moja kwa moja' : 'Direct Navigation'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
            {[
              { id: 'dashboard' as NavTab, label: language === 'sw' ? 'Dashibodi Kuu' : 'Dashboard', icon: 'grid_view', color: 'emerald' },
              { id: 'branches' as NavTab, label: language === 'sw' ? 'Matawi Yote' : 'Branches', icon: 'storefront', color: 'teal' },
              { id: 'inventory' as NavTab, label: language === 'sw' ? 'Stoo ya Pikipiki' : 'Inventory', icon: 'two_wheeler', color: 'blue' },
              { id: 'receive-stock' as NavTab, label: language === 'sw' ? 'Pokea Mzigo' : 'Receive Stock', icon: 'add_shopping_cart', color: 'emerald' },
              { id: 'sales' as NavTab, label: language === 'sw' ? 'Daftari la Mauzo' : 'Sales Ledger', icon: 'point_of_sale', color: 'indigo' },
              { id: 'pricing' as NavTab, label: language === 'sw' ? 'Orodha ya Bei' : 'Pricing Model', icon: 'price_change', color: 'amber' },
              { id: 'expenses' as NavTab, label: language === 'sw' ? 'Matumizi' : 'Expenses', icon: 'receipt_long', color: 'rose' },
              { id: 'orders' as NavTab, label: language === 'sw' ? 'Mizigo ya Kiwanda' : 'Factory Orders', icon: 'inventory_2', color: 'cyan' },
              { id: 'customers' as NavTab, label: language === 'sw' ? 'Wateja & Madeni' : 'Customers', icon: 'group', color: 'purple' },
              { id: 'transfers' as NavTab, label: language === 'sw' ? 'Uhamisho Stoo' : 'Transfers', icon: 'swap_horiz', color: 'orange' },
              { id: 'reports' as NavTab, label: language === 'sw' ? 'Ripoti & Takwimu' : 'Analytics & Reports', icon: 'analytics', color: 'emerald' },
              { id: 'team' as NavTab, label: language === 'sw' ? 'Wafanyakazi & Timu' : 'Team & Roles', icon: 'badge', color: 'slate' },
            ].map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => onSelectTab(mod.id)}
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 hover:border-[#006948]/50 transition-all text-left cursor-pointer active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#006948] dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{mod.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#006948] dark:group-hover:text-emerald-400">
                    {mod.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 2.8. PWA App Installation (Add to Home Screen / Desktop App) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-emerald-200/80 dark:border-emerald-900/60 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-emerald-400 text-xl">
              install_mobile
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'sw' ? 'Sakinisha Kama App (PWA App)' : 'Install as Application (PWA)'}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#006948] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {language === 'sw' ? 'PWA Tayari' : 'PWA Ready'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3.5">
            <img 
              src="/DMS-logo.png" 
              alt="DMS Logo" 
              className="w-12 h-12 rounded-2xl object-contain bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0" 
            />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'sw' ? 'Weka DMS kwenye Skrini ya Simu au PC' : 'Install DMS on Home Screen / Desktop'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'sw' 
                  ? 'Fungua kama app kamili bila kupitia browser, inafanya kazi haraka na nje ya mtandao.' 
                  : 'Open as standalone app without browser URL bar, fast loading and offline ready.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onInstallPwa}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#006948] via-[#007a54] to-[#00855d] hover:from-[#005a3e] hover:to-[#00704e] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
            <span>{language === 'sw' ? 'Sakinisha App Sasa' : 'Install DMS App'}</span>
          </button>
        </div>

        {/* Step by step guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
              <span className="material-symbols-outlined text-sm text-[#006948] dark:text-emerald-400">android</span>
              <span>Android (Chrome)</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'sw' ? 'Bonyeza menyu (⋮) juu kulia kisha chagua "Install app" au "Add to Home screen".' : 'Tap (⋮) top right and choose "Install app" or "Add to Home screen".'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
              <span className="material-symbols-outlined text-sm text-[#006948] dark:text-emerald-400">phone_iphone</span>
              <span>iPhone (Safari)</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'sw' ? 'Bonyeza kitufe cha Share (⎋) chini kisha chagua "Add to Home Screen".' : 'Tap Share button (⎋) at the bottom and choose "Add to Home Screen".'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
              <span className="material-symbols-outlined text-sm text-[#006948] dark:text-emerald-400">laptop_mac</span>
              <span>Windows / Mac (Chrome/Edge)</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'sw' ? 'Bonyeza alama ya App (⊕) kwenye URL bar ya browser juu kulia.' : 'Click the Install icon (⊕) on the right side of the browser URL bar.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Security & Password ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-emerald-400 text-xl">
              lock
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'sw' ? 'Usalama na Nenosiri' : 'Security & Password'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPasswordForm(!showPasswordForm);
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            className="text-xs font-bold text-[#006948] dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>{showPasswordForm ? (language === 'sw' ? 'Funga' : 'Close') : (language === 'sw' ? 'Badilisha Nenosiri' : 'Change Password')}</span>
            <span className="material-symbols-outlined text-[16px]">
              {showPasswordForm ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[#006948] dark:text-emerald-400 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span className="font-semibold">{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            <span className="font-semibold">{passwordError}</span>
          </div>
        )}

        {showPasswordForm ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1 animate-in fade-in">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'sw' ? 'Nenosiri la Sasa' : 'Current Password'}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={language === 'sw' ? 'Weka nenosiri la sasa (mfano: 123456)' : 'Enter current password'}
                  className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showCurrentPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'sw' ? 'Nenosiri Jipya' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'sw' ? 'Angalau herufi 4' : 'Minimum 4 characters'}
                    className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewPw ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'sw' ? 'Thibitisha Nenosiri Jipya' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'sw' ? 'Rudia nenosiri jipya' : 'Repeat new password'}
                    className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#006948]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPw ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="mt-2 px-5 py-2.5 bg-[#006948] hover:bg-[#005a3e] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/20 cursor-pointer active:scale-95"
            >
              {isSavingPassword
                ? (language === 'sw' ? 'Inahifadhi...' : 'Saving...')
                : (language === 'sw' ? 'Hifadhi Nenosiri Jipya' : 'Save New Password')}
            </button>
          </form>
        ) : (
          <p className="text-xs text-slate-500">
            {language === 'sw'
              ? 'Nenosiri lako limelindwa kwa usalama wa kiwango cha juu cha encryption ya mfumo.'
              : 'Your account password is encrypted and securely protected.'}
          </p>
        )}
      </div>

      {/* ── 4. Dealership Particulars ── */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006948] to-[#00855d] text-white flex items-center justify-center shadow-md shadow-emerald-950/20">
            <span className="material-symbols-outlined text-xl">storefront</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{DEALER_INFO.name}</h3>
            <p className="text-xs text-[#006948] dark:text-emerald-400 font-semibold">{DEALER_INFO.type}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {language === 'sw' ? 'Msimbo Mkuu:' : 'Primary Code:'}
            </span>
            <span className="font-mono font-black text-xs sm:text-sm text-[#006948] dark:text-emerald-400">{DEALER_INFO.code}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {language === 'sw' ? 'Msimbo wa Pili:' : 'Secondary Code:'}
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{DEALER_INFO.secondaryCode}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {language === 'sw' ? 'Simu ya Biashara:' : 'Business Phone:'}
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{DEALER_INFO.phone}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {language === 'sw' ? 'Matawi ya Biashara:' : 'Active Branches:'}
            </span>
            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">5 (Dar & Zanzibar)</span>
          </div>
        </div>
      </div>

      {/* ── 5. Support & Contact ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="material-symbols-outlined text-[#006948] dark:text-emerald-400 text-xl">
            support_agent
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {language === 'sw' ? 'Msaada na Mawasiliano' : 'Help & Support'}
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          {language === 'sw'
            ? 'Wasiliana na timu ya usaidizi kwa maulizo au msaada wa haraka wa mfumo.'
            : 'Contact technical support for any assistance or inquiries regarding the system.'}
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <a
            href="tel:+255754000111"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm text-emerald-600">call</span>
            <span>+255 754 000 111</span>
          </a>

          <a
            href="mailto:support@dealersystem.tz"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm text-blue-600">mail</span>
            <span>support@dealersystem.tz</span>
          </a>
        </div>
      </div>

      {/* ── 6. Logout Button ── */}
      <div className="pt-2">
        {showLogoutConfirm ? (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 space-y-3 animate-in fade-in">
            <p className="text-xs font-bold text-red-700 dark:text-red-300">
              {language === 'sw' ? 'Je, una uhakika unataka kuondoka kwenye mfumo?' : 'Are you sure you want to log out of the system?'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'sw' ? 'Ndio, Ondoka' : 'Yes, Log Out'}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3 px-4 rounded-2xl border-2 border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>{language === 'sw' ? 'Ondoka Kwenye Akaunti' : 'Log Out from System'}</span>
          </button>
        )}
      </div>

      {/* App Version Footer */}
      <div className="text-center py-3 text-[11px] text-slate-400">
        <p>DMS Enterprise ERP v2.4.0 • {language === 'sw' ? 'Salama na Imethibitishwa' : 'Secure & Certified'}</p>
      </div>

    </div>
  );
};

export default SettingsView;
