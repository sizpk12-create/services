/**
 * You Want Services - Reusable UI Components & Design System
 * Phase 1 Architecture
 */

import React from 'react';

// ======================= BUTTON =======================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  // Math rule: horizontal padding is 2x vertical padding
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3 gap-1.5 focus:ring-blue-500',
    md: 'text-sm py-2.5 px-5 gap-2 focus:ring-blue-600',
    lg: 'text-base py-3.5 px-7 gap-2.5 focus:ring-blue-600 font-bold',
  };

  const variantStyles = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm focus:ring-blue-600 active:bg-blue-900',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm focus:ring-slate-700',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-blue-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

// ======================= BADGE =======================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// ======================= CARD =======================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  id,
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm ${
        onClick ? 'cursor-pointer hover:border-slate-300 transition' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// ======================= INPUT =======================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 8)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
            leftIcon ? 'pl-9' : ''
          } ${rightIcon ? 'pr-9' : ''} ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

// ======================= SELECT =======================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 8)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-slate-800 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white transition focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

// ======================= ALERT =======================
interface AlertProps {
  title?: string;
  children?: React.ReactNode;
  message?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'error';
  type?: 'info' | 'success' | 'warning' | 'danger' | 'error';
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  message,
  variant,
  type,
  onClose,
  className = '',
}) => {
  const rawVariant = variant || type || 'info';
  const actualVariant = rawVariant === 'error' ? 'danger' : rawVariant;
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-rose-50 border-rose-200 text-rose-900',
  };

  return (
    <div className={`p-4 rounded-xl border text-sm flex items-start justify-between gap-3 ${styles[actualVariant]} ${className}`}>
      <div className="flex-1">
        {title && <h5 className="font-bold mb-1 tracking-tight">{title}</h5>}
        <div className="leading-relaxed">{children || message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer p-1"
          title="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ======================= MODAL =======================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full ${maxWidthStyles[maxWidth]} p-6 border border-slate-200`}
        >
          {title && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

