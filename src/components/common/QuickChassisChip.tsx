import React, { useState } from 'react';

export interface QuickChassisChipProps {
  value?: string;
  chassisNumber?: string;
  language?: any;
  label?: string;
  prefixIcon?: string | null;
  className?: string;
}

export const QuickChassisChip: React.FC<QuickChassisChipProps> = ({
  value,
  chassisNumber,
  language,
  label,
  prefixIcon,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const targetValue = value || chassisNumber || '';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetValue) return;
    navigator.clipboard?.writeText(targetValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Bofya kunakili (Click to copy)"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold border transition-all cursor-pointer group select-all ${
        copied
          ? 'bg-emerald-500 text-white border-emerald-600 scale-102 shadow-xs'
          : 'bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-[#006948] dark:hover:text-emerald-400 border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-600/60 shadow-2xs'
      } ${className}`}
    >
      {copied && (
        <span className="material-symbols-outlined text-[12px] text-white">
          check
        </span>
      )}
      {prefixIcon && !copied && (
        <span className="material-symbols-outlined text-[12px] opacity-60 group-hover:opacity-100">
          {prefixIcon}
        </span>
      )}
      <span>{label || targetValue}</span>
      <span className="material-symbols-outlined text-[11px] opacity-0 group-hover:opacity-60 transition-opacity">
        {copied ? 'done_all' : 'content_copy'}
      </span>
    </button>
  );
};
