import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectBoxProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  icon?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  wrapperClassName?: string;
}

/**
 * Enterprise Reusable SelectBox Component
 * - Uniform height & typography across desktop and mobile
 * - Replaces default browser select arrows with custom styled chevron
 * - Supports prefix icons, floating helper text, and error validation states
 */
export const SelectBox = forwardRef<HTMLSelectElement, SelectBoxProps>(
  (
    {
      label,
      icon,
      options,
      children,
      error,
      helperText,
      size = 'md',
      fullWidth = true,
      className = '',
      wrapperClassName = '',
      disabled,
      id,
      ...rest
    },
    ref
  ) => {
    // Height & padding variants
    const sizeClasses = {
      sm: 'h-[34px] py-1 text-xs',
      md: 'h-[38px] py-1.5 text-xs sm:text-sm',
      lg: 'h-[44px] py-2 text-sm sm:text-base',
    }[size];

    const paddingClasses = icon ? 'pl-9 pr-9' : 'pl-3.5 pr-9';

    const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Prefix Icon */}
          {icon && (
            <span className="material-symbols-outlined absolute left-2.5 text-slate-400 dark:text-slate-500 text-[18px] pointer-events-none select-none">
              {icon}
            </span>
          )}

          {/* Core HTML Select with custom styling */}
          <select
            id={generatedId}
            ref={ref}
            disabled={disabled}
            className={`
              w-full appearance-none rounded-xl font-semibold transition-all duration-150 cursor-pointer
              bg-white dark:bg-slate-800/95 text-slate-900 dark:text-slate-100
              border border-slate-300 dark:border-slate-700/80
              hover:border-emerald-500 dark:hover:border-emerald-500
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600
              disabled:opacity-55 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900/60
              shadow-2xs
              [background-image:none]!
              ${sizeClasses}
              ${paddingClasses}
              ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600' : ''}
              ${className}
            `}
            {...rest}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Custom Styled Dropdown Chevron Arrow */}
          <div className="absolute right-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400 select-none">
            <span className="material-symbols-outlined text-[18px] leading-none transition-transform">
              unfold_more
            </span>
          </div>
        </div>

        {/* Validation Error / Helper Text */}
        {error ? (
          <p className="text-[11px] font-medium text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">error</span>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

SelectBox.displayName = 'SelectBox';
