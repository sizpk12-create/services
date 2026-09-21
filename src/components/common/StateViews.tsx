/**
 * You Want Services - Reusable Error, Loading & Empty States
 * Phase 1 Architecture
 */

import React from 'react';
import {
  AlertTriangle,
  Loader2,
  FolderOpen,
  CheckCircle2,
  ShieldAlert,
  FileQuestion,
  ArrowLeft,
} from 'lucide-react';
import { Button } from './UIComponents';

// ======================= LOADING STATE =======================
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
  size = 'md',
  fullPage = false,
}) => {
  const spinnerSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-600">
      <Loader2 className={`${spinnerSizes[size]} animate-spin text-blue-600 mb-3`} />
      <p className="text-sm font-medium tracking-wide">{message}</p>
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[50vh] flex items-center justify-center">{content}</div>;
  }
  return content;
};

// ======================= ERROR STATE =======================
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`bg-rose-50/70 border border-rose-200 rounded-xl p-6 text-center max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-rose-900 mb-1">{title}</h4>
      <p className="text-sm text-rose-700 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

// ======================= EMPTY STATE =======================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`border border-dashed border-slate-300 rounded-xl p-10 text-center bg-slate-50/50 max-w-xl mx-auto my-6 ${className}`}
    >
      <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || <FolderOpen className="w-7 h-7 text-slate-400" />}
      </div>
      <h4 className="text-lg font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-550 mb-6 leading-relaxed max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// ======================= SUCCESS STATE =======================
interface SuccessNoticeProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SuccessNotice: React.FC<SuccessNoticeProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-emerald-900 mb-1">{title}</h4>
      <p className="text-sm text-emerald-700 mb-4 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// ======================= UNAUTHORIZED STATE =======================
interface UnauthorizedStateProps {
  requiredRole?: string;
  onNavigateHome?: () => void;
}

export const UnauthorizedState: React.FC<UnauthorizedStateProps> = ({
  requiredRole,
  onNavigateHome,
}) => {
  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-8 text-center max-w-md mx-auto my-12">
      <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-amber-900 mb-1">Access Restricted</h3>
      <p className="text-sm text-amber-800 mb-5 leading-relaxed">
        {requiredRole
          ? `This area requires a ${requiredRole} account role. Please switch your role using the demo bar above to preview this section.`
          : 'You do not have permission to access this resource.'}
      </p>
      {onNavigateHome && (
        <Button variant="secondary" size="sm" onClick={onNavigateHome} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Marketplace Home
        </Button>
      )}
    </div>
  );
};

// ======================= NOT FOUND STATE =======================
interface NotFoundStateProps {
  onNavigateHome?: () => void;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({ onNavigateHome }) => {
  return (
    <div className="border border-slate-200 rounded-xl p-10 text-center max-w-md mx-auto my-12 bg-white">
      <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Page Not Found</h3>
      <p className="text-sm text-slate-500 mb-5">
        The requested screen or module route does not exist or has moved.
      </p>
      {onNavigateHome && (
        <Button variant="primary" size="sm" onClick={onNavigateHome}>
          Go to Home
        </Button>
      )}
    </div>
  );
};
