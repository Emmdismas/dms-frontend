import React from 'react';

export type BannerTheme = 'dealer' | 'admin' | 'emerald' | 'slate';

export interface PageHeaderBannerProps {
  icon: string;
  title: string;
  subtitle?: string;
  theme?: BannerTheme;
  badge?: {
    text: string;
    variant?: 'emerald' | 'rose' | 'blue' | 'amber' | 'slate' | 'white';
    pulse?: boolean;
  };
  badgeText?: string;
  badgeVariant?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  icon,
  title,
  subtitle,
  theme = 'dealer',
  badge,
  badgeText,
  badgeVariant,
  meta,
  actions,
  className = '',
}) => {
  const isDealerTheme = theme === 'dealer' || theme === 'emerald';
  const isAdminTheme = theme === 'admin';

  const activeBadge = badge || (badgeText ? {
    text: badgeText,
    variant: (badgeVariant as 'emerald' | 'rose' | 'blue' | 'amber' | 'slate' | 'white') || (isDealerTheme ? 'white' : 'amber'),
    pulse: true,
  } : undefined);

  // Background and borders based on theme
  const getBannerContainerStyles = () => {
    if (isAdminTheme) {
      // Super Admin / Admin Executive Theme: Midnight Slate
      return 'bg-slate-900 border-slate-800 text-white shadow-xs';
    }

    if (isDealerTheme) {
      // Dealer & Dealership Operations: Rich Enterprise Emerald Green
      return 'bg-[#004d34] border-[#005a3e] text-white shadow-xs';
    }

    // Default neutral slate fallback
    return 'bg-slate-900 border-slate-800 text-white shadow-xs';
  };

  // Icon container badge styling
  const getIconStyles = () => {
    if (isAdminTheme) {
      return 'bg-slate-800 text-amber-400 border border-slate-700 shadow-2xs';
    }
    // Dealer: Clean white container with emerald icon
    return 'bg-white text-[#006948] shadow-xs border border-white/20';
  };

  // Subtitle text color
  const getSubtitleStyles = () => {
    if (isAdminTheme) {
      return 'text-slate-300 font-normal';
    }
    return 'text-emerald-100/85 font-normal';
  };

  // Status Badge styling on top of the background
  const getBadgeColors = () => {
    if (isAdminTheme) {
      return 'bg-slate-800 text-amber-300 border-slate-700';
    }
    return 'bg-white/15 text-white border-white/20';
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${getBannerContainerStyles()} ${className}`}
    >

      <div className="flex items-start sm:items-center gap-3.5 min-w-0 relative z-10">
        {/* Brand Icon Badge with Role Theme */}
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${getIconStyles()}`}>
          <span className="material-symbols-outlined text-[24px] sm:text-[26px]">
            {icon}
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white font-sans truncate">
              {title}
            </h1>

            {activeBadge && (
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium tracking-normal px-2.5 py-0.5 rounded-full border shadow-2xs ${getBadgeColors()}`}
              >
                {activeBadge.pulse !== false && (
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAdminTheme ? 'bg-amber-400' : 'bg-emerald-300'}`} />
                )}
                <span>{activeBadge.text}</span>
              </span>
            )}
          </div>

          {subtitle && (
            <p className={`text-xs leading-relaxed line-clamp-2 ${getSubtitleStyles()}`}>
              {subtitle}
            </p>
          )}

          {meta && <div className="pt-1">{meta}</div>}
        </div>
      </div>

      {/* Right Side Actions Slot */}
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0 w-full sm:w-auto relative z-10">
          {actions}
        </div>
      )}
    </div>
  );
};
