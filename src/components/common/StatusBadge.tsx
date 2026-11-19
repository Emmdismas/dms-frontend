import React from 'react';
import { Language } from '../../types';

export interface StatusBadgeProps {
  status: string;
  language?: Language;
  size?: 'xs' | 'sm';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  language = 'sw',
  size = 'xs',
  showPulse = false,
}) => {
  const norm = (status || '').toUpperCase().trim();
  const isSw = language === 'sw';

  // Config mapping for styling & labels
  let label = status;
  let bgClass = 'bg-slate-100 dark:bg-slate-800';
  let textClass = 'text-slate-700 dark:text-slate-300';
  let borderClass = 'border-slate-200 dark:border-slate-700';
  let dotClass = 'bg-slate-400';
  let pulse = showPulse;

  switch (norm) {
    // 1. ACTIVE / INACTIVE
    case 'ACTIVE':
    case 'KAZINI':
      label = isSw ? 'Inafanya Kazi' : 'Active';
      bgClass = 'bg-emerald-50 dark:bg-emerald-950/60';
      textClass = 'text-emerald-700 dark:text-emerald-300 font-bold';
      borderClass = 'border-emerald-200/80 dark:border-emerald-800/60';
      dotClass = 'bg-emerald-500';
      pulse = true;
      break;

    case 'INACTIVE':
    case 'IMESITISHWA':
      label = isSw ? 'Imesitishwa' : 'Inactive';
      bgClass = 'bg-rose-50 dark:bg-rose-950/60';
      textClass = 'text-rose-700 dark:text-rose-300 font-bold';
      borderClass = 'border-rose-200/80 dark:border-rose-800/60';
      dotClass = 'bg-rose-500';
      break;

    // 2. VEHICLE INVENTORY STATUSES
    case 'IN STOCK':
    case 'IN_STOCK':
    case 'STOO':
      label = isSw ? 'Ipo Stoo' : 'In Stock';
      bgClass = 'bg-emerald-50 dark:bg-emerald-950/60';
      textClass = 'text-emerald-700 dark:text-emerald-300 font-bold';
      borderClass = 'border-emerald-200/80 dark:border-emerald-800/60';
      dotClass = 'bg-emerald-500';
      pulse = true;
      break;

    case 'SOLD':
    case 'IMEAUZWA':
      label = isSw ? 'Imeuzwa' : 'Sold';
      bgClass = 'bg-blue-50 dark:bg-blue-950/60';
      textClass = 'text-blue-700 dark:text-blue-300 font-bold';
      borderClass = 'border-blue-200/80 dark:border-blue-800/60';
      dotClass = 'bg-blue-500';
      break;

    case 'RESERVED':
    case 'IMETENGWA':
      label = isSw ? 'Imewekwa Oda' : 'Reserved';
      bgClass = 'bg-amber-50 dark:bg-amber-950/60';
      textClass = 'text-amber-800 dark:text-amber-300 font-bold';
      borderClass = 'border-amber-200/80 dark:border-amber-800/60';
      dotClass = 'bg-amber-500';
      break;

    case 'TRANSFERRED':
    case 'IMEHAMISHWA':
      label = isSw ? 'Imehamishwa' : 'Transferred';
      bgClass = 'bg-purple-50 dark:bg-purple-950/60';
      textClass = 'text-purple-700 dark:text-purple-300 font-bold';
      borderClass = 'border-purple-200/80 dark:border-purple-800/60';
      dotClass = 'bg-purple-500';
      break;

    case 'DAMAGED':
    case 'MBOVU':
      label = isSw ? 'Imeharibika' : 'Damaged';
      bgClass = 'bg-red-50 dark:bg-red-950/60';
      textClass = 'text-red-700 dark:text-red-300 font-bold';
      borderClass = 'border-red-200/80 dark:border-red-800/60';
      dotClass = 'bg-red-500';
      break;

    // 3. PAYMENT STATUSES
    case 'PAID':
    case 'IMELIPWA':
      label = isSw ? 'Imelipwa Kamili' : 'Paid Full';
      bgClass = 'bg-emerald-50 dark:bg-emerald-950/60';
      textClass = 'text-emerald-700 dark:text-emerald-300 font-bold';
      borderClass = 'border-emerald-200/80 dark:border-emerald-800/60';
      dotClass = 'bg-emerald-500';
      break;

    case 'PARTIAL':
    case 'NUSU':
      label = isSw ? 'Malipo Nusu' : 'Partial';
      bgClass = 'bg-amber-50 dark:bg-amber-950/60';
      textClass = 'text-amber-800 dark:text-amber-300 font-bold';
      borderClass = 'border-amber-200/80 dark:border-amber-800/60';
      dotClass = 'bg-amber-500';
      pulse = true;
      break;

    // 4. SUPPLIER ORDERS
    case 'RECEIVED':
    case 'IMEPOKELEWA':
      label = isSw ? 'Imepokelewa' : 'Received';
      bgClass = 'bg-emerald-50 dark:bg-emerald-950/60';
      textClass = 'text-emerald-700 dark:text-emerald-300 font-bold';
      borderClass = 'border-emerald-200/80 dark:border-emerald-800/60';
      dotClass = 'bg-emerald-500';
      break;

    case 'IN_TRANSIT':
    case 'SAFARINI':
      label = isSw ? 'Safarini' : 'In Transit';
      bgClass = 'bg-sky-50 dark:bg-sky-950/60';
      textClass = 'text-sky-700 dark:text-sky-300 font-bold';
      borderClass = 'border-sky-200/80 dark:border-sky-800/60';
      dotClass = 'bg-sky-500';
      pulse = true;
      break;

    case 'ORDERED':
    case 'IMEAGIZWA':
      label = isSw ? 'Imeagizwa' : 'Ordered';
      bgClass = 'bg-slate-100 dark:bg-slate-800';
      textClass = 'text-slate-700 dark:text-slate-300 font-bold';
      borderClass = 'border-slate-200 dark:border-slate-700';
      dotClass = 'bg-slate-400';
      break;

    default:
      label = status;
      break;
  }

  const py = size === 'xs' ? 'py-0.5' : 'py-1';
  const px = size === 'xs' ? 'px-2' : 'px-2.5';
  const textSz = size === 'xs' ? 'text-[10.5px]' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${py} ${px} rounded-md ${textSz} font-medium border ${bgClass} ${textClass} ${borderClass} whitespace-nowrap shadow-2xs select-none`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotClass} ${
          pulse ? 'animate-pulse' : ''
        }`}
      />
      <span>{label}</span>
    </span>
  );
};
