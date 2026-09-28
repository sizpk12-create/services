/**
 * You Want Services - Navigation & Route Architecture
 * Phase 1 Architecture
 */

import { UserRole } from './database';

export type PublicRoute =
  | 'home'
  | 'services'
  | 'how-it-works'
  | 'about'
  | 'contact'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'terms'
  | 'privacy'
  | 'become-a-contractor'
  | 'contractor-landing';

export type CustomerRoute =
  | 'customer-dashboard'
  | 'customer-request-service'
  | 'customer-my-requests'
  | 'customer-request-detail'
  | 'customer-messages'
  | 'customer-profile'
  | 'customer-settings'
  | 'customer-onboarding';

export type ContractorRoute =
  | 'contractor-registration'
  | 'contractor-dashboard'
  | 'contractor-leads'
  | 'contractor-lead-detail'
  | 'contractor-lead-history'
  | 'contractor-notifications'
  | 'contractor-jobs'
  | 'contractor-messages'
  | 'contractor-profile'
  | 'contractor-settings';

export type AdminRoute =
  | 'admin-login'
  | 'admin-forgot-password'
  | 'admin-reset-password'
  | 'admin-dashboard'
  | 'admin-customers'
  | 'admin-contractors'
  | 'admin-contractor-review'
  | 'admin-service-requests'
  | 'admin-categories'
  | 'admin-leads'
  | 'admin-jobs'
  | 'admin-memberships'
  | 'admin-payments'
  | 'admin-refunds'
  | 'admin-pricing'
  | 'admin-reports'
  | 'admin-notifications'
  | 'admin-audit-logs'
  | 'admin-settings';

export type AppRoute = PublicRoute | CustomerRoute | ContractorRoute | AdminRoute;

export interface RouteDefinition {
  id: AppRoute;
  label: string;
  path: string;
  requiredRole?: UserRole | UserRole[];
  category: 'public' | 'customer' | 'contractor' | 'admin';
  icon?: string;
  description?: string;
}

/**
 * Checks if a given role is authorized to view a route
 */
export function canAccessRoute(route: AppRoute, userRole?: UserRole): boolean {
  // Public routes accessible by anyone
  const publicRoutes: AppRoute[] = [
    'home',
    'services',
    'how-it-works',
    'about',
    'contact',
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'terms',
    'privacy',
    'become-a-contractor',
    'contractor-landing',
    'contractor-registration',
    'customer-request-service',
    'admin-login',
    'admin-forgot-password',
    'admin-reset-password',
  ];

  if (publicRoutes.includes(route)) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  // Super Admin can access all routes
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // Admin routes require ADMIN
  if (route.startsWith('admin-')) {
    return userRole === 'ADMIN';
  }

  // Contractor routes
  if (route.startsWith('contractor-')) {
    return userRole === 'CONTRACTOR' || userRole === 'ADMIN';
  }

  // Customer routes
  if (route.startsWith('customer-')) {
    return userRole === 'CUSTOMER' || userRole === 'ADMIN';
  }

  return true;
}

