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
  onToggleTheme?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  isDarkMode,
  language,
  onToggleLanguage,
  onToggleTheme,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSw = language === 'sw';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await authService.login(
        identifier.trim(),
        password,
        language,
      );

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(
          res.error ||
            (isSw
              ? 'Taarifa za kuingia si sahihi. Tafadhali hakiki na ujaribu tena.'
              : 'Invalid credentials. Please verify and try again.'),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* ========================================================================= */}
      {/* 1. BRIGHT REAL AUTOMOTIVE BACKGROUND (Sunlit Dealership, Pikipiki & Bajaji)*/}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/dms-hero-bg.jpg"
          alt="DMS Dealership Vehicles - Pikipiki & Bajaji"
          className="w-full h-full object-cover object-center scale-100 filter brightness-95 contrast-[1.02] saturate-[1.08] transition-transform duration-700"
        />
        {/* Soft, natural daylight scrim: light & clear so the sunny photo shines through */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isDarkMode
              ? 'bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/80'
              : 'bg-gradient-to-r from-black/45 via-black/15 to-black/35'
          }`}
        />
        {/* Subtle top & bottom vignette */}
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? 'bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50'
              : 'bg-gradient-to-t from-black/50 via-transparent to-black/20'
          }`}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP GLASS NAVIGATION BAR (Logo, Language, Dark/Light Mode Toggle)     */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/20 rounded-2xl px-4 sm:px-6 py-2.5 shadow-lg shadow-black/20">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md shadow-black/20 flex items-center justify-center shrink-0 border border-white/40">
              <img
                src="/DMS-logo.png"
                alt="DMS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
                Dealer <span className="text-emerald-400">Management</span> System
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase font-mono">
                2W & 3W ERP • Tanzania
              </div>
            </div>
          </div>

          {/* Right Controls: Dark/Light Mode & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark / Light Mode Toggle Button */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title={isDarkMode ? 'Switch to Bright Light Mode' : 'Switch to Dark Mode'}
                className="p-2 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-300">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )}

            {/* Frosted Glass Language Switcher */}
            <div className="flex items-center bg-white/10 backdrop-blur-md p-0.5 rounded-xl border border-white/20 shadow-inner">
              <button
                type="button"
                onClick={() => language !== 'en' && onToggleLanguage()}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <BritishFlag className="w-4 h-2.5" />
                <span className="hidden sm:inline">EN</span>
              </button>
              <button
                type="button"
                onClick={() => language !== 'sw' && onToggleLanguage()}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  language === 'sw'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <TanzaniaFlag className="w-4 h-2.5" />
                <span className="hidden sm:inline">SW</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN HERO CONTENT (Simple, Clean Left Showcase + Right Glassmorphism)  */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* LEFT: SIMPLE, ELEGANT HERO BRANDING (Over Bright Photo)   */}
          {/* ========================================================= */}
          <div className="order-2 lg:order-1 w-full lg:col-span-7 xl:col-span-7 space-y-6 text-white text-center lg:text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/15 border border-white/25 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-black/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isSw ? 'Mfumo Rasmi wa Ma-Dealer' : 'Official Dealership ERP'}</span>
              <span className="text-white/40">•</span>
              <span>Tanzania</span>
            </div>

            {/* Clean Inspiring Title (Friendly & Bold, like Image 2) */}
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-[1.18] drop-shadow-md">
              {isSw ? (
                <>
                  Usimamizi wa Kisasa wa{' '}
                  <span className="text-emerald-400">Pikipiki</span> na{' '}
                  <span className="text-teal-300">Bajaji</span> Nchini
                </>
              ) : (
                <>
                  The Modern Operating System for{' '}
                  <span className="text-emerald-400">Motorcycle</span> &{' '}
                  <span className="text-teal-300">Tricycle</span> Dealerships
                </>
              )}
            </h1>

            {/* Short, Simple Subtext (No Overwhelming Clutter) */}
            <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed font-normal mx-auto lg:mx-0 drop-shadow-sm">
              {isSw
                ? 'Jukwaa la kidijitali la kudhibiti namba za Chassis (VIN), stoo ya matawi nchini, na mauzo ya mikopo na taslimu kwa uwazi na usalama.'
                : 'Comprehensive digital platform tracking 17-digit Chassis VINs, branch allocations, customer registries, and cash & credit sales.'}
            </p>

            {/* Simple Vehicle Type Chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white text-xs font-semibold shadow-xs">
                <span className="text-base">🛵</span>
                <span>2W Pikipiki</span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-300 font-mono text-[11px]">Boxer & TVS HLX</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white text-xs font-semibold shadow-xs">
                <span className="text-base">🛺</span>
                <span>3W Bajaji</span>
                <span className="text-white/40">•</span>
                <span className="text-teal-300 font-mono text-[11px]">TVS King & Bajaj RE</span>
              </div>
            </div>

            {/* Trust Highlights (Clean Bottom Row, like Image 2) */}
            <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>17-Digit VIN Tracking</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Matawi Nchini Kote</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>TRA & Risiti Tayari</span>
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: SLEEK FLOATING GLASSMORPHISM LOGIN CARD (Matching Image 2 Style)   */}
          {/* ========================================================================= */}
          <div className="order-1 lg:order-2 w-full lg:col-span-5 xl:col-span-5 max-w-md mx-auto lg:max-w-none">
            <div className="relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-slate-900/40 dark:bg-black/55 border border-white/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/15 overflow-hidden">
              {/* Inner ambient glass reflection */}
              <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 mb-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full backdrop-blur-md bg-white/15 border border-white/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isSw ? 'Ingia Kwenye Akaunti' : 'Sign in to Portal'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {isSw ? 'Karibu Kwenye Mfumo' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-white/70 mt-1 font-normal">
                  {isSw
                    ? 'Weka barua pepe, namba ya simu au kodi ya dealer.'
                    : 'Enter your credentials to access your dealership.'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="relative z-10 mb-4 p-3.5 rounded-2xl backdrop-blur-md bg-red-500/20 border border-red-400/40 text-red-100 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-lg text-red-300 shrink-0 mt-0.5">error</span>
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Glassmorphic Form Fields */}
              <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                {/* 1. Identifier Field */}
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs font-semibold text-white/90 mb-1.5 cursor-pointer"
                  >
                    {isSw ? 'Email / Simu / Dealer Code' : 'Email / Phone / Dealer Code'}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-white/60 text-lg pointer-events-none select-none">
                      account_circle
                    </span>
                    <input
                      id="login-identifier"
                      name="identifier"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        isSw
                          ? 'Email, 0713759553, au C-DAR-N00988'
                          : 'Email, Phone, or Dealer Code'
                      }
                      className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/25 rounded-2xl text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 focus:bg-white/20 transition-all font-medium shadow-inner"
                    />
                  </div>
                </div>

                {/* 2. Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-white/90 cursor-pointer"
                    >
                      {isSw ? 'Nenosiri (Password)' : 'Password'}
                    </label>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-white/60 text-lg pointer-events-none select-none">
                      lock
                    </span>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 text-xs sm:text-sm backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/25 rounded-2xl text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 focus:bg-white/20 transition-all font-medium shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-2.5 text-white/60 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Vibrant High-Energy CTA Button (Matching Image 2 Style) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-black/40 hover:shadow-emerald-500/30 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 mt-5 border border-white/25"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>{isSw ? 'Inahakiki...' : 'Authenticating...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSw ? 'Ingia Kwenye Mfumo' : 'Sign In to Portal'}</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Frosted Card Footer */}
              <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span>SSL Encrypted</span>
                </span>
                <span className="font-mono text-[11px] text-white/60">v2.6 Enterprise</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. CLEAN BOTTOM BAR                                                       */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full py-3 px-4 sm:px-8 text-center text-xs text-white/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 pt-3">
          <div>© 2026 Dealer Management System (DMS) • Tanzania Operations</div>
          <div className="font-mono text-[11px] text-white/60">
            TVS & Bajaj Authorized Dealerships Platform
          </div>
        </div>
      </footer>
    </div>
  );
};