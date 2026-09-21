/**
 * You Want Services - Navigation & Route Guard Context
 * Phase 1 Architecture
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppRoute, RouteDefinition } from '../types/navigation';
import { UserRole } from '../types/database';
import { useAuth } from './AuthContext';

export const ROUTES: Record<AppRoute, RouteDefinition> = {
  // Public Routes
  home: {
    id: 'home',
    label: 'Home',
    path: '/',
    category: 'public',
  },
  services: {
    id: 'services',
    label: 'Services',
    path: '/services',
    category: 'public',
  },
  'how-it-works': {
    id: 'how-it-works',
    label: 'How It Works',
    path: '/how-it-works',
    category: 'public',
  },
  about: {
    id: 'about',
    label: 'About',
    path: '/about',
    category: 'public',
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    category: 'public',
  },
  login: {
    id: 'login',
    label: 'Sign In',
    path: '/login',
    category: 'public',
  },
  register: {
    id: 'register',
    label: 'Register',
    path: '/register',
    category: 'public',
  },
  'forgot-password': {
    id: 'forgot-password',
    label: 'Forgot Password',
    path: '/forgot-password',
    category: 'public',
  },
  'reset-password': {
    id: 'reset-password',
    label: 'Reset Password',
    path: '/reset-password',
    category: 'public',
  },
  terms: {
    id: 'terms',
    label: 'Terms of Service',
    path: '/terms',
    category: 'public',
  },
  privacy: {
    id: 'privacy',
    label: 'Privacy Policy',
    path: '/privacy',
    category: 'public',
  },
  'become-a-contractor': {
    id: 'become-a-contractor',
    label: 'Become a Contractor',
    path: '/become-a-contractor',
    category: 'public',
  },
  'contractor-landing': {
    id: 'contractor-landing',
    label: 'Become a Contractor',
    path: '/contractors',
    category: 'public',
  },

  // Customer Routes
  'customer-onboarding': {
    id: 'customer-onboarding',
    label: 'Customer Onboarding',
    path: '/customer/onboarding',
    category: 'customer',
    requiredRole: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  },
  'customer-dashboard': {
    id: 'customer-dashboard',
    label: 'Customer Dashboard',
    path: '/customer/dashboard',
    category: 'customer',
    requiredRole: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  },
  'customer-request-service': {
    id: 'customer-request-service',
    label: 'Request a Service',
    path: '/customer/request',
    category: 'customer',
    requiredRole: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  },
  'customer-my-requests': {
    id: 'customer-my-requests',
    label: 'My Requests',
    path: '/customer/requests',
    category: 'customer',
    requiredRole: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  },
  'customer-request-detail': {
    id: 'customer-request-detail',
    label: 'Request Details',
    path: '/customer/requests/detail',
    category: 'customer',
    requiredRole: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  },
  'customer-messages': {
    id: 'customer-messages',
    label: 'Messages',
    path: '/customer/messages',
    category: 'customer',
    requiredRole: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  },
  'customer-profile': {
    id: 'customer-profile',
    label: 'Profile',
    path: '/customer/profile',
    category: 'customer',
    requiredRole: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  },
  'customer-settings': {
    id: 'customer-settings',
    label: 'Settings',
    path: '/customer/settings',
    category: 'customer',
    requiredRole: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  },

  // Contractor Routes
  'contractor-registration': {
    id: 'contractor-registration',
    label: 'Contractor Registration',
    path: '/contractor/register',
    category: 'contractor',
    description: 'Future major module placeholder for Phase 6',
  },
  'contractor-dashboard': {
    id: 'contractor-dashboard',
    label: 'Contractor Dashboard',
    path: '/contractor/dashboard',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },
  'contractor-leads': {
    id: 'contractor-leads',
    label: 'Leads',
    path: '/contractor/leads',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },
  'contractor-lead-detail': {
    id: 'contractor-lead-detail',
    label: 'Lead Details',
    path: '/contractor/leads/:leadId',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },
  'contractor-lead-history': {
    id: 'contractor-lead-history',
    label: 'Lead History',
    path: '/contractor/leads/history',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },
  'contractor-notifications': {
    id: 'contractor-notifications',
    label: 'Notifications',
    path: '/contractor/notifications',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },
  'contractor-jobs': {
    id: 'contractor-jobs',
    label: 'Jobs',
    path: '/contractor/jobs',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },
  'contractor-messages': {
    id: 'contractor-messages',
    label: 'Messages',
    path: '/contractor/messages',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },
  'contractor-profile': {
    id: 'contractor-profile',
    label: 'Profile',
    path: '/contractor/profile',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },
  'contractor-settings': {
    id: 'contractor-settings',
    label: 'Business Settings',
    path: '/contractor/settings',
    category: 'contractor',
    requiredRole: ['CONTRACTOR', 'ADMIN', 'SUPER_ADMIN'],
  },

  // Admin Routes
  'admin-dashboard': {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    path: '/admin/dashboard',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-customers': {
    id: 'admin-customers',
    label: 'Customers',
    path: '/admin/customers',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-contractors': {
    id: 'admin-contractors',
    label: 'Contractors',
    path: '/admin/contractors',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-contractor-review': {
    id: 'admin-contractor-review',
    label: 'Contractor Verification Review',
    path: '/admin/contractors/review',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-categories': {
    id: 'admin-categories',
    label: 'Service Categories',
    path: '/admin/categories',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-leads': {
    id: 'admin-leads',
    label: 'Leads',
    path: '/admin/leads',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-jobs': {
    id: 'admin-jobs',
    label: 'Jobs',
    path: '/admin/jobs',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-payments': {
    id: 'admin-payments',
    label: 'Payments',
    path: '/admin/payments',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-reports': {
    id: 'admin-reports',
    label: 'Reports',
    path: '/admin/reports',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-service-requests': {
    id: 'admin-service-requests',
    label: 'Service Requests',
    path: '/admin/service-requests',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-memberships': {
    id: 'admin-memberships',
    label: 'Memberships',
    path: '/admin/memberships',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-refunds': {
    id: 'admin-refunds',
    label: 'Refunds & Disputes',
    path: '/admin/refunds',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-pricing': {
    id: 'admin-pricing',
    label: 'Pricing Engine',
    path: '/admin/pricing',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-notifications': {
    id: 'admin-notifications',
    label: 'Admin Notifications',
    path: '/admin/notifications',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-audit-logs': {
    id: 'admin-audit-logs',
    label: 'Audit Trail',
    path: '/admin/audit-logs',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
  'admin-settings': {
    id: 'admin-settings',
    label: 'Settings',
    path: '/admin/settings',
    category: 'admin',
    requiredRole: ['ADMIN', 'SUPER_ADMIN'],
  },
};

interface NavigationContextType {
  currentRoute: AppRoute;
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  routeParams: Record<string, string>;
  activeRouteDef: RouteDefinition;
  canAccessRoute: (route: AppRoute, userRole?: UserRole | null) => boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();

  const getInitialRoute = (): AppRoute => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && hash in ROUTES) {
      return hash as AppRoute;
    }
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash && hash in ROUTES) {
        setCurrentRoute(hash as AppRoute);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const canAccessRoute = (route: AppRoute, userRole?: UserRole | null): boolean => {
    const routeDef = ROUTES[route];
    if (!routeDef || !routeDef.requiredRole) return true;

    if (!userRole) return false;

    if (Array.isArray(routeDef.requiredRole)) {
      return routeDef.requiredRole.includes(userRole);
    }
    return routeDef.requiredRole === userRole;
  };

  const navigate = (route: AppRoute, params?: Record<string, string>) => {
    if (params) {
      setRouteParams(params);
    } else {
      setRouteParams({});
    }

    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        navigate,
        routeParams,
        activeRouteDef: ROUTES[currentRoute] || ROUTES.home,
        canAccessRoute,
        mobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
