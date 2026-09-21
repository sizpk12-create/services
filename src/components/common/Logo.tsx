/**
 * You Want Services - Reusable Logo Component
 * Phase 1 Architecture
 *
 * Designed to work seamlessly across:
 * - Desktop header
 * - Mobile header
 * - Login & Registration pages
 * - Customer & Contractor & Admin dashboards
 * - Footer
 * - Marketing pages
 */

import React from 'react';

interface LogoProps {
  variant?: 'default' | 'light' | 'dark' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  showTagline = false,
  className = '',
  onClick,
}) => {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg font-extrabold tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
  };

  return (
    <div
      id="brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Professional Architectural Roofline & Shield Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-sm ${
          isLight
            ? 'bg-amber-400 text-slate-900 shadow-amber-400/20'
            : 'bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-blue-900/20'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/8 h-5/8"
        >
          {/* Precise house gable roofline */}
          <path d="M3 10.5L12 3l9 7.5" />
          {/* Solid foundation body */}
          <path d="M5 9.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.5" />
          {/* Trusted checkmark/keystone verification emblem */}
          <path d="M9.5 13.5l1.8 1.8 3.5-3.8" strokeWidth="2.5" />
        </svg>
      </div>

      {variant !== 'compact' && (
        <div className="flex flex-col leading-none">
          <div className={`flex items-baseline gap-1.5 ${titleSizes[size]}`}>
            <span
              className={
                isLight
                  ? 'text-white'
                  : 'text-slate-900'
              }
            >
              YOU WANT
            </span>
            <span
              className={
                isLight
                  ? 'text-amber-400 font-black'
                  : 'text-blue-700 font-black'
              }
            >
              SERVICES
            </span>
          </div>
          {showTagline && (
            <span
              className={`text-[11px] font-medium tracking-wide mt-1 ${
                isLight ? 'text-slate-300' : 'text-slate-550'
              }`}
            >
              Trusted Home-Service Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );
};
