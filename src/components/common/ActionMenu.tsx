import React, { useState, useEffect, useRef } from 'react';

export interface ActionMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerLabel?: string;
  triggerIcon?: string;
  align?: 'left' | 'right';
  className?: string;
  language?: any;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  triggerLabel,
  triggerIcon = 'more_vert',
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`h-7 px-2 rounded-lg border text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer select-none ${
          isOpen
            ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
            : 'bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs'
        }`}
        title="Chaguzi za Ziada (Actions)"
      >
        {triggerLabel && <span>{triggerLabel}</span>}
        <span className="material-symbols-outlined text-[16px]">
          {triggerIcon}
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1 w-44 rounded-xl border bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-800`}
        >
          <div className="py-0.5">
            {items.map((item, idx) => {
              if (item.divider) {
                return (
                  <div
                    key={idx}
                    className="my-1 border-t border-slate-100 dark:border-slate-800"
                  />
                );
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    item.onClick();
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                    item.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : item.danger
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#006948] dark:hover:text-emerald-400'
                  }`}
                >
                  {item.icon && (
                    <span
                      className={`material-symbols-outlined text-[16px] shrink-0 ${
                        item.danger
                          ? 'text-rose-500'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-[#006948]'
                      }`}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
