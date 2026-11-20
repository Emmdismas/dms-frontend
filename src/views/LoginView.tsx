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

/** Vector SVG Illustration for Commercial Motorcycle (Pikipiki 2W - Boxer / TVS HLX) */
const MotorcycleVector: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 280 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Pikipiki 2-Wheeler Illustration"
  >
    <defs>
      <linearGradient id="motoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <radialGradient id="glowG" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Ground glow */}
    <ellipse cx="140" cy="148" rx="110" ry="8" fill="url(#glowG)" />

    {/* Rear Wheel (Left) */}
    <g transform="translate(52, 114)">
      <circle cx="0" cy="0" r="32" stroke="#334155" strokeWidth="6" fill="#0f172a" />
      <circle cx="0" cy="0" r="23" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="0" cy="0" r="10" fill="url(#metalGrad)" stroke="#1e293b" strokeWidth="2" />
      {/* Spokes */}
      <line x1="-22" y1="0" x2="22" y2="0" stroke="#64748b" strokeWidth="1.5" />
      <line x1="0" y1="-22" x2="0" y2="22" stroke="#64748b" strokeWidth="1.5" />
      <line x1="-15" y1="-15" x2="15" y2="15" stroke="#64748b" strokeWidth="1.5" />
      <line x1="-15" y1="15" x2="15" y2="-15" stroke="#64748b" strokeWidth="1.5" />
      {/* Brake drum */}
      <circle cx="0" cy="0" r="5" fill="#10b981" />
    </g>

    {/* Front Wheel (Right) */}
    <g transform="translate(225, 114)">
      <circle cx="0" cy="0" r="32" stroke="#334155" strokeWidth="6" fill="#0f172a" />
      <circle cx="0" cy="0" r="23" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="0" cy="0" r="10" fill="url(#metalGrad)" stroke="#1e293b" strokeWidth="2" />
      {/* Spokes */}
      <line x1="-22" y1="0" x2="22" y2="0" stroke="#64748b" strokeWidth="1.5" />
      <line x1="0" y1="-22" x2="0" y2="22" stroke="#64748b" strokeWidth="1.5" />
      <line x1="-15" y1="-15" x2="15" y2="15" stroke="#64748b" strokeWidth="1.5" />
      <line x1="-15" y1="15" x2="15" y2="-15" stroke="#64748b" strokeWidth="1.5" />
      {/* Disc Caliper */}
      <path d="M 6 -12 A 13 13 0 0 1 12 -4 L 8 -2 A 9 9 0 0 0 4 -8 Z" fill="#ef4444" />
      <circle cx="0" cy="0" r="5" fill="#10b981" />
    </g>

    {/* Rear Mudguard / Fender */}
    <path d="M 24 112 C 24 86, 50 78, 76 84 L 72 90 C 54 86, 32 94, 30 114 Z" fill="#1e293b" />

    {/* Exhaust Pipe & Muffler (Lower Chassis) */}
    <path d="M 125 120 L 165 120 L 80 126 L 40 126" stroke="url(#metalGrad)" strokeWidth="6" strokeLinecap="round" />
    <rect x="42" y="122" width="46" height="8" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

    {/* Engine Block / Crankcase */}
    <rect x="110" y="98" width="40" height="26" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
    <line x1="114" y1="104" x2="146" y2="104" stroke="#64748b" strokeWidth="1.5" />
    <line x1="114" y1="110" x2="146" y2="110" stroke="#64748b" strokeWidth="1.5" />
    <line x1="114" y1="116" x2="146" y2="116" stroke="#64748b" strokeWidth="1.5" />
    <circle cx="120" cy="111" r="5" fill="#10b981" />

    {/* Main Diamond Frame (Chassis Bars) */}
    <line x1="52" y1="114" x2="112" y2="104" stroke="#475569" strokeWidth="4" />
    <line x1="112" y1="104" x2="146" y2="76" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
    <line x1="112" y1="104" x2="196" y2="60" stroke="#334155" strokeWidth="5" />
    <line x1="52" y1="114" x2="94" y2="78" stroke="#334155" strokeWidth="3.5" />
    <line x1="94" y1="78" x2="146" y2="76" stroke="#334155" strokeWidth="3.5" />

    {/* Front Telescopic Fork Suspension */}
    <line x1="196" y1="56" x2="225" y2="114" stroke="url(#metalGrad)" strokeWidth="5" strokeLinecap="round" />
    <line x1="192" y1="62" x2="221" y2="114" stroke="#475569" strokeWidth="2" />

    {/* Front Mudguard */}
    <path d="M 204 90 C 218 80, 240 84, 248 100" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />

    {/* Fuel Tank (Boxer / HLX Style) */}
    <path
      d="M 136 74 C 142 56, 178 52, 196 64 C 192 74, 180 80, 146 80 Z"
      fill="url(#motoGrad)"
      stroke="#047857"
      strokeWidth="2"
    />
    {/* Tank Cap & Chrome Stripe */}
    <ellipse cx="166" cy="62" rx="4" ry="2" fill="#e2e8f0" />
    <path d="M 148 70 Q 170 66 188 72" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />

    {/* Long Dual Seat (Boda Boda / Commercial) */}
    <path
      d="M 82 78 C 86 70, 102 68, 142 74 L 140 84 L 84 84 Z"
      fill="#0f172a"
      stroke="#334155"
      strokeWidth="1.5"
    />
    <path d="M 85 75 Q 115 72 140 76" stroke="#475569" strokeWidth="1" strokeDasharray="3 2" />

    {/* Rear Passenger Carrier / Heavy Duty Rack */}
    <line x1="64" y1="78" x2="84" y2="78" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
    <line x1="66" y1="78" x2="66" y2="92" stroke="#94a3b8" strokeWidth="2.5" />
    <line x1="74" y1="78" x2="74" y2="92" stroke="#94a3b8" strokeWidth="2.5" />

    {/* Handlebars & Controls */}
    <path d="M 196 56 L 190 42 L 180 44" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="178" cy="44" r="2" fill="#0f172a" />
    {/* Rear-view Mirror */}
    <line x1="188" y1="42" x2="182" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
    <ellipse cx="180" cy="28" rx="4" ry="3" fill="#38bdf8" stroke="#475569" strokeWidth="1" />

    {/* Round Headlight with Beam */}
    <circle cx="206" cy="58" r="7" fill="#fef08a" stroke="#e2e8f0" strokeWidth="2" />
    <polygon points="214,54 274,38 274,78 214,62" fill="url(#glowG)" opacity="0.6" />
  </svg>
);

/** Vector SVG Illustration for Commercial 3-Wheeler Bajaji (TVS King / Bajaj RE) */
const BajajiVector: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 280 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Bajaji 3-Wheeler Illustration"
  >
    <defs>
      <linearGradient id="bajajBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
      </linearGradient>
      <radialGradient id="bajajGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Ground glow */}
    <ellipse cx="140" cy="148" rx="120" ry="8" fill="url(#bajajGlow)" />

    {/* Rear Wheels (Tricycle Stance) */}
    <g transform="translate(68, 122)">
      <circle cx="0" cy="0" r="24" stroke="#334155" strokeWidth="6" fill="#0f172a" />
      <circle cx="0" cy="0" r="16" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="8" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="3" fill="#10b981" />
    </g>

    {/* Front Wheel (Single Steering Wheel) */}
    <g transform="translate(226, 124)">
      <circle cx="0" cy="0" r="22" stroke="#334155" strokeWidth="5.5" fill="#0f172a" />
      <circle cx="0" cy="0" r="14" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="7" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="3" fill="#10b981" />
    </g>

    {/* Chassis Underbody & Mudguards */}
    <path d="M 44 122 L 92 122" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
    <path d="M 92 124 L 210 124" stroke="#334155" strokeWidth="4" />
    <path d="M 212 110 L 226 124" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

    {/* Main Passenger Body Tub (Lower Hull) */}
    <path
      d="M 46 116 L 46 72 C 46 64, 52 58, 62 58 L 148 58 L 184 76 L 222 84 C 230 86, 234 94, 232 104 L 228 116 C 226 120, 220 122, 214 122 L 54 122 C 48 122, 46 118, 46 116 Z"
      fill="url(#bajajBody)"
      stroke="#047857"
      strokeWidth="2"
    />

    {/* Front Apron / Nose Cowl & Mudguard */}
    <path
      d="M 184 76 L 222 84 C 232 87, 238 98, 234 112 L 214 114"
      fill="#059669"
      stroke="#047857"
      strokeWidth="1.5"
    />

    {/* Characteristic Bajaji Canopy / Soft Top Roof */}
    <path
      d="M 40 68 C 40 40, 52 28, 76 26 L 168 26 C 182 26, 192 32, 196 46 L 204 74 L 180 74 L 176 42 C 174 38, 168 36, 160 36 L 68 36 C 54 36, 48 44, 48 68 Z"
      fill="url(#canopyGrad)"
      stroke="#334155"
      strokeWidth="2"
    />

    {/* Windshield with Glass Reflection */}
    <polygon points="172,40 194,48 182,74 162,74" fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="1" />
    <line x1="174" y1="44" x2="168" y2="70" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" strokeLinecap="round" />

    {/* Canopy Support Pillars (Thin Steel Tube Frame) */}
    <line x1="50" y1="62" x2="50" y2="34" stroke="#64748b" strokeWidth="2.5" />
    <line x1="116" y1="58" x2="116" y2="32" stroke="#64748b" strokeWidth="2.5" />
    <line x1="168" y1="42" x2="162" y2="74" stroke="#64748b" strokeWidth="2.5" />

    {/* Passenger Open Side Entry / Doorway Cutout */}
    <rect x="74" y="62" width="46" height="42" rx="4" fill="#0f172a" stroke="#047857" strokeWidth="1.5" />
    {/* Passenger Cushioned Bench */}
    <rect x="52" y="86" width="36" height="14" rx="2" fill="#334155" />
    <rect x="50" y="74" width="8" height="24" rx="2" fill="#1e293b" />

    {/* Driver Seat & Handlebar Steering */}
    <rect x="136" y="88" width="22" height="12" rx="2" fill="#1e293b" />
    <path d="M 164 82 L 174 72 L 180 74" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Front Headlamp with Amber Indicator */}
    <circle cx="230" cy="94" r="6" fill="#fef08a" stroke="#e2e8f0" strokeWidth="1.5" />
    <polygon points="236,90 274,76 274,112 236,98" fill="url(#bajajGlow)" opacity="0.6" />
    <circle cx="228" cy="106" r="3" fill="#f59e0b" />

    {/* Rear Tail Light */}
    <rect x="42" y="82" width="4" height="10" rx="1" fill="#ef4444" />

    {/* Commercial License / Plate Badge */}
    <rect x="206" y="104" width="16" height="7" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
    <line x1="209" y1="107" x2="219" y2="107" stroke="#1e293b" strokeWidth="1" />
  </svg>
);

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

  const isSw = language === 'sw';

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
    <div
      className={`min-h-screen w-full relative overflow-x-hidden flex flex-col justify-between transition-colors duration-300 ${
        isDarkMode ? 'bg-[#060910] text-slate-100' : 'bg-slate-950 text-white'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* LEFT / MAIN COLUMN: AUTHENTICATION FORM (Desktop & Mobile) */}
          {/* ========================================================= */}
          <div className="w-full lg:col-span-5 xl:col-span-5">
            <div className="backdrop-blur-2xl bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/80">
              
              {/* Top Bar: Security Badge & Language Switcher */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isSw ? 'Portal ya Mfumo' : 'Enterprise Portal'}</span>
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
              <div className="text-center sm:text-left mb-6">
                {/* Mobile Quick 2W & 3W Pill */}
                <div className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-3">
                  <span>🛵 2W Pikipiki</span>
                  <span className="text-slate-600">•</span>
                  <span>🛺 3W Bajaji ERP</span>
                </div>

                <div className="flex items-center gap-3.5 mb-3 text-left">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-emerald-950/60 shrink-0 border border-emerald-400/30">
                    <img
                      src="/DMS-logo.png"
                      alt="DMS Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight font-sans">
                      Dealer <span className="text-emerald-400">Management</span> System
                    </h1>
                    <p className="text-[10px] sm:text-[11px] text-emerald-400 font-bold tracking-wider uppercase mt-0.5 font-mono">
                      2W & 3W ERP • Multi-Dealer Platform
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed text-left">
                  {isSw
                    ? 'Portal kuu ya kudhibiti Madealer wa Pikipiki na Bajaji, stoo ya namba za Chassis, na mauzo nchini kote.'
                    : 'Central Portal for Managing Motorcycle & Tricycle Dealerships, VIN/Chassis Inventory, and Sales.'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-lg text-red-400 shrink-0 mt-0.5">error</span>
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
              )}

              {/* SINGLE UNIFIED LOGIN FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Universal Identifier Input */}
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs font-bold text-slate-200 mb-1.5 cursor-pointer"
                  >
                    {isSw ? 'Email / Simu / Dealer Code' : 'Email / Phone / Dealer Code'}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg pointer-events-none select-none">
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
                      className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400 shrink-0">verified_user</span>
                    <span>
                      {isSw
                        ? 'Tumia barua pepe, simu, au kodi rasmi ya Dealer.'
                        : 'Sign in using your email, phone, or dealer code.'}
                    </span>
                  </p>
                </div>

                {/* 2. Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-slate-200 cursor-pointer"
                    >
                      {isSw ? 'Nenosiri (Password)' : 'Password'}
                    </label>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg pointer-events-none select-none">
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
                      className="w-full pl-11 pr-11 py-3 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white p-1 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
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
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#006948] via-[#007a53] to-[#008f62] hover:from-[#005a3e] hover:to-[#00704e] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/70 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 mt-4 border border-emerald-500/30"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isSw ? 'Inahakiki Taarifa...' : 'Authenticating...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isSw ? 'Ingia kwenye Mfumo' : 'Sign In to Portal'}</span>
                      <span className="material-symbols-outlined text-base">login</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer inside login card */}
              <div className="mt-6 pt-4 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span>{isSw ? 'Ulinzi wa SSL / TLS' : 'SSL Encrypted'}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400 font-semibold">v2.6 Enterprise</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: PIKIPIKI & BAJAJI ENTERPRISE SHOWCASE (Desktop / PC Only)   */}
          {/* ========================================================================= */}
          <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-center space-y-6 pl-0 xl:pl-4">
            
            {/* Top Showcase Banner */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3">
                <span className="material-symbols-outlined text-sm text-emerald-400">two_wheeler</span>
                <span>TVS & BAJAJ COMMERCIAL DEALERSHIPS • TANZANIA</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                {isSw ? (
                  <>
                    Usimamizi Kamili wa <span className="text-emerald-400">Pikipiki</span> na <span className="text-teal-300">Bajaji</span> Nchini Kote
                  </>
                ) : (
                  <>
                    Complete ERP for <span className="text-emerald-400">Motorcycle</span> & <span className="text-teal-300">Tricycle</span> Dealerships
                  </>
                )}
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                {isSw
                  ? 'Jukwaa maalum la kudhibiti uagizaji wa mzigo, namba za Chassis (VIN) na Engine, stoo za matawi, mauzo ya mikopo na taslimu, pamoja na vibali vya TRA.'
                  : 'Tailored enterprise ERP tracking commercial 2-Wheelers and 3-Wheelers: 17-digit Chassis verification, branch inventory, cash & lease sales, and tax receipts.'}
              </p>
            </div>

            {/* TWO SHOWCASE CARDS: PIKIPIKI (2W) & BAJAJI (3W) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              
              {/* CARD 1: PIKIPIKI (2-WHEELERS) */}
              <div className="group relative rounded-2xl p-5 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/50 shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                    2W • Pikipiki
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">110cc – 160cc</span>
                </div>
                
                <h3 className="text-base font-black text-white tracking-tight mb-1">
                  Boxer & TVS HLX Series
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  {isSw ? 'BM150, HLX 125, Apache RTR, Star City+' : 'BM150, HLX 125, Apache RTR, Star City+'}
                </p>

                {/* Vector Motorcycle Illustration */}
                <div className="h-28 w-full flex items-center justify-center py-1 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-3 overflow-hidden">
                  <MotorcycleVector className="w-full h-full max-h-24 transition-transform group-hover:scale-105 duration-300" />
                </div>

                {/* Spec Pills */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[10px] font-semibold border border-slate-700">
                    Boda Boda Fleet
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[10px] font-semibold border border-slate-700">
                    Chassis & Engine VIN
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-900/40 text-emerald-300 text-[10px] font-semibold border border-emerald-700/50">
                    Live Stock
                  </span>
                </div>
              </div>

              {/* CARD 2: BAJAJI (3-WHEELERS) */}
              <div className="group relative rounded-2xl p-5 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-teal-950/40 border border-teal-500/20 hover:border-teal-500/50 shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-mono text-[11px] font-extrabold uppercase tracking-wider border border-teal-500/30">
                    3W • Bajaji
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">200cc 4S EFI</span>
                </div>
                
                <h3 className="text-base font-black text-white tracking-tight mb-1">
                  TVS King & Bajaj RE 4S
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  {isSw ? 'King Deluxe, Bajaj RE 4S, King Kargo 200' : 'King Deluxe, Bajaj RE 4S, King Kargo 200'}
                </p>

                {/* Vector Bajaji Illustration */}
                <div className="h-28 w-full flex items-center justify-center py-1 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-3 overflow-hidden">
                  <BajajiVector className="w-full h-full max-h-24 transition-transform group-hover:scale-105 duration-300" />
                </div>

                {/* Spec Pills */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[10px] font-semibold border border-slate-700">
                    Passenger & Cargo
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[10px] font-semibold border border-slate-700">
                    PDI Inspection
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-900/40 text-teal-300 text-[10px] font-semibold border border-teal-700/50">
                    TRA Ready
                  </span>
                </div>
              </div>

            </div>

            {/* 4 ENTERPRISE CAPABILITY HIGHLIGHTS */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5">pin</span>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Chassis & VIN</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isSw ? 'Uthibitisho wa tarakimu 17' : '17-digit serial lock'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5">storefront</span>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Matawi Nchini</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isSw ? 'Stoo ya Dar, Mwanza, Arusha...' : 'Multi-branch sync'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5">receipt_long</span>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Mikataba & Mauzo</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isSw ? 'Taslimu, mikopo & risiti' : 'Cash & lease contracts'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5">verified</span>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Ukaguzi wa PDI</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isSw ? 'Pre-Delivery & Waranti' : 'PDI warranty audits'}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Global Bottom Bar */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-3 px-4 sm:px-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="font-semibold text-slate-300">© 2026 Dealer Management System (DMS)</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span>Automotive ERP Platform</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-4 text-[11px] text-slate-400 font-mono">
          <span>TVS & Bajaj Certified Dealers</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-emerald-400">Tanzania Operations</span>
        </div>
      </footer>
    </div>
  );
};
