import React from 'react';
import { NavTab, AuthUser } from '../types';
import { Language, translations } from '../i18n/translations';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenRecordSaleModal: () => void;
  currentUser: AuthUser | null;
  isDarkMode: boolean;
  onOpenMoreMenu: () => void;
  language?: Language;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenRecordSaleModal,
  currentUser,
  isDarkMode,
  onOpenMoreMenu,
  language = 'sw',
}) => {
  const safeLang = language && translations[language] ? language : 'sw';
  const t = translations[safeLang] || translations.sw;

  return (
    <nav 
      className={`md:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-xl px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around transition-colors duration-200 shadow-lg ${
        isDarkMode 
          ? 'bg-[#0B1120]/95 border-slate-800/80 text-slate-300 shadow-black/40' 
          : 'bg-white/95 border-slate-200/90 text-slate-700 shadow-slate-300/30'
      }`}
      aria-label="Mobile Navigation"
    >
      {/* 1. Dealers (For Super Admin) or Dashboard */}
      {currentUser?.role === 'super_admin' ? (
        <button
          type="button"
          onClick={() => onSelectTab('dealers')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[54px] min-h-[44px] transition-all cursor-pointer ${
            currentTab === 'dealers' 
              ? 'text-rose-500 dark:text-rose-400 font-bold scale-105' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${currentTab === 'dealers' ? 'font-bold' : ''}`}>
            admin_panel_settings
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight">{language === 'sw' ? 'Madealer' : 'Dealers'}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[54px] min-h-[44px] transition-all cursor-pointer ${
            currentTab === 'dashboard' 
              ? 'text-[#006948] dark:text-emerald-400 font-bold scale-105' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${currentTab === 'dashboard' ? 'font-bold' : ''}`}>
            grid_view
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight">{t.navOverview}</span>
        </button>
      )}

      {/* 2. Sales */}
      <button
        type="button"
        onClick={() => onSelectTab('sales')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[54px] min-h-[44px] transition-all cursor-pointer ${
          currentTab === 'sales' 
            ? 'text-[#006948] dark:text-emerald-400 font-bold scale-105' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <span className={`material-symbols-outlined text-[22px] ${currentTab === 'sales' ? 'font-bold' : ''}`}>
          point_of_sale
        </span>
        <span className="text-[10px] mt-0.5 tracking-tight">{t.navSales}</span>
      </button>

      {/* 3. CENTER CTA: RECORD SALE FOR STAFF OR REPORTS FOR DEALER */}
      {currentUser?.role === 'dealer' || currentUser?.role === 'owner' ? (
        <button
          type="button"
          onClick={() => onSelectTab('reports')}
          className="flex flex-col items-center justify-center -mt-5 min-w-[50px] min-h-[50px] w-12.5 h-12.5 rounded-2xl bg-gradient-to-tr from-[#006948] via-[#007a54] to-[#00855d] text-white shadow-lg shadow-emerald-950/40 active:scale-95 transition-transform border-2 border-white dark:border-[#0B1120] cursor-pointer"
          title={language === 'sw' ? 'Ripoti & Takwimu' : 'Reports & Analytics'}
          aria-label={language === 'sw' ? 'Ripoti & Takwimu' : 'Reports & Analytics'}
        >
          <span className="material-symbols-outlined text-[24px]">analytics</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenRecordSaleModal}
          className="flex flex-col items-center justify-center -mt-5 min-w-[50px] min-h-[50px] w-12.5 h-12.5 rounded-2xl bg-gradient-to-tr from-[#006948] to-[#00855d] text-white shadow-lg shadow-emerald-950/40 active:scale-95 transition-transform border-2 border-white dark:border-[#0B1120] cursor-pointer"
          title={t.quickRecordSale}
          aria-label={t.quickRecordSale}
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
        </button>
      )}

      {/* 4. Inventory */}
      <button
        type="button"
        onClick={() => onSelectTab('inventory')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[54px] min-h-[44px] transition-all cursor-pointer ${
          currentTab === 'inventory' 
            ? 'text-[#006948] dark:text-emerald-400 font-bold scale-105' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <span className={`material-symbols-outlined text-[22px] ${currentTab === 'inventory' ? 'font-bold' : ''}`}>
          two_wheeler
        </span>
        <span className="text-[10px] mt-0.5 tracking-tight">{t.navInventory}</span>
      </button>

      {/* 5. Settings / Profile */}
      <button
        type="button"
        onClick={() => onSelectTab('settings')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[54px] min-h-[44px] transition-all cursor-pointer ${
          currentTab === 'settings'
            ? 'text-[#006948] dark:text-emerald-400 font-bold scale-105' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <span className={`material-symbols-outlined text-[22px] ${currentTab === 'settings' ? 'font-bold' : ''}`}>
          settings
        </span>
        <span className="text-[10px] mt-0.5 tracking-tight">{language === 'sw' ? 'Mipangilio' : 'Settings'}</span>
      </button>
    </nav>
  );
};

