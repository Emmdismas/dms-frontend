import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AuthUser } from '../types';
import { Language } from '../i18n/translations';
import { BritishFlag, TanzaniaFlag } from '../components/Flags';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  isDarkMode: boolean;
  language: Language;
  onToggleLanguage: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  isDarkMode,
  language,
  onToggleLanguage,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await authService.login(identifier, password, language);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(
          res.error ||
            (language === 'sw'
              ? 'Taarifa za kuingia si sahihi. Tafadhali hakiki na ujaribu tena.'
              : 'Invalid credentials. Please verify and try again.'),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-[#060910] text-slate-100' : 'bg-slate-950 text-white'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-lg relative z-10 my-6">
        <div className="backdrop-blur-2xl bg-slate-900/90 border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/80">
          {/* Top Bar: Security & Language Switcher */}
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'sw' ? 'Portal ya Mfumo' : 'Enterprise Portal'}</span>
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/80 shadow-2xs">
              <button
                type="button"
                onClick={() => language !== 'en' && onToggleLanguage()}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BritishFlag className="w-4 h-2.5" />
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => language !== 'sw' && onToggleLanguage()}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  language === 'sw'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TanzaniaFlag className="w-4 h-2.5" />
                <span>SW</span>
              </button>
            </div>
          </div>

          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-emerald-950/60 mb-3 border border-emerald-400/30">
              <img
                src="/DMS-logo.png"
                alt="DMS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans">
              Dealer <span className="text-emerald-400">Management</span> System
            </h1>
            <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mt-1">
              Multi-Dealer Enterprise Platform • <span className="font-mono text-emerald-300">2W & 3W ERP</span>
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {language === 'sw'
                ? 'Portal kuu ya kudhibiti Madealer wote, matawi, stoo na mauzo nchini kote.'
                : 'Central Portal for Platform Super Admin, Dealers, Branches, and Staff.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-lg text-red-400 shrink-0 mt-0.5">error</span>
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* SINGLE UNIFIED LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Universal Identifier Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'sw' ? 'Email / Simu / Dealer Code' : 'Email / Phone / Dealer Code'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">
                  account_circle
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    language === 'sw'
                      ? 'owner@nassor.co.tz, 0713 759 553, au C-DAR-N00988'
                      : 'owner@nassor.co.tz, 0713 759 553, or C-DAR-N00988'
                  }
                  className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-emerald-400">verified_user</span>
                <span>
                  {language === 'sw'
                    ? 'Ingia kwa barua pepe, namba ya simu, au kodi ya Dealer.'
                    : 'Sign in using your registered email, phone number, or dealer code.'}
                </span>
              </p>
            </div>

            {/* 2. Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {language === 'sw' ? 'Nenosiri (Password)' : 'Password'}
                </label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 text-xs sm:text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#006948] via-[#007a53] to-[#008f62] hover:from-[#005a3e] hover:to-[#00704e] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 mt-3"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'sw' ? 'Inahakiki Taarifa...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'sw' ? 'Ingia kwenye Mfumo' : 'Sign In to Portal'}</span>
                  <span className="material-symbols-outlined text-base">login</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>© 2026 Dealer Management System</span>
            <span className="font-mono text-[10px] text-slate-600">Production ERP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
