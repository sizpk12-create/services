/**
 * You Want Services - Unified Dashboard Shell Layout
 * Phase 1 Architecture
 *
 * Supports Customer, Contractor, and Admin shells with consistent responsive ergonomics.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Logo } from '../common/Logo';
import { Badge, Button } from '../common/UIComponents';
import { AppRoute } from '../../types/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  MessageSquare,
  User,
  Settings,
  Users,
  Briefcase,
  Layers,
  Inbox,
  CreditCard,
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Building2,
  History,
  Bell,
  ShieldCheck,
  RefreshCcw,
  DollarSign,
  FileText,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

import { UserRole } from '../../types/database';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: UserRole;
  activeTab?: AppRoute;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  role: propRole,
  activeTab: propActiveTab,
  title,
  subtitle,
  actions,
}) => {
  const { currentUser, role: authRole, logout } = useAuth();
  const { currentRoute, navigate } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const effectiveRole = propRole || authRole || currentUser?.role || 'CUSTOMER';
  const activeTab = propActiveTab || currentRoute;

  // Define sidebar links based on role
  const getNavItems = () => {
    if (effectiveRole === 'ADMIN' || effectiveRole === 'SUPER_ADMIN') {
      const unreadNotifs = currentUser ? notificationService.getUnreadCount(currentUser.id) : 0;
      return [
        { id: 'admin-dashboard' as AppRoute, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-customers' as AppRoute, label: 'Customers', icon: Users },
        { id: 'admin-contractors' as AppRoute, label: 'Contractors', icon: Building2 },
        { id: 'admin-contractor-review' as AppRoute, label: 'Verification Queue', icon: ShieldCheck },
        { id: 'admin-service-requests' as AppRoute, label: 'Service Requests', icon: ClipboardList },
        { id: 'admin-leads' as AppRoute, label: 'Leads & Dispatch', icon: Inbox },
        { id: 'admin-memberships' as AppRoute, label: 'Memberships', icon: Layers },
        { id: 'admin-payments' as AppRoute, label: 'Payments Ledger', icon: CreditCard },
        { id: 'admin-refunds' as AppRoute, label: 'Refunds & Disputes', icon: RefreshCcw },
        { id: 'admin-pricing' as AppRoute, label: 'Pricing Engine', icon: DollarSign },
        { id: 'admin-reports' as AppRoute, label: 'Business Reports', icon: BarChart3 },
        { id: 'admin-notifications' as AppRoute, label: 'Notifications', icon: Bell, count: unreadNotifs },
        { id: 'admin-audit-logs' as AppRoute, label: 'Audit Trail', icon: FileText },
        { id: 'admin-settings' as AppRoute, label: 'Settings', icon: Settings },
      ];
    }

    if (effectiveRole === 'CONTRACTOR') {
      const unreadNotifs = currentUser ? notificationService.getUnreadCount(currentUser.id) : 0;
      return [
        { id: 'contractor-dashboard' as AppRoute, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'contractor-leads' as AppRoute, label: 'Leads', icon: Inbox },
        { id: 'contractor-lead-history' as AppRoute, label: 'Lead History', icon: History },
        { id: 'contractor-jobs' as AppRoute, label: 'Jobs', icon: Briefcase },
        { id: 'contractor-messages' as AppRoute, label: 'Messages', icon: MessageSquare, badge: 'Soon' },
        { id: 'contractor-notifications' as AppRoute, label: 'Notifications', icon: Bell, count: unreadNotifs },
        { id: 'contractor-profile' as AppRoute, label: 'Company Profile', icon: User },
        { id: 'contractor-settings' as AppRoute, label: 'Business Settings', icon: Settings },
      ];
    }

    // Default Customer items
    return [
      { id: 'customer-dashboard' as AppRoute, label: 'Overview', icon: LayoutDashboard },
      { id: 'customer-request-service' as AppRoute, label: 'Request a Service', icon: PlusCircle },
      { id: 'customer-my-requests' as AppRoute, label: 'My Requests', icon: ClipboardList },
      { id: 'customer-messages' as AppRoute, label: 'Messages', icon: MessageSquare },
      { id: 'customer-profile' as AppRoute, label: 'Profile', icon: User },
      { id: 'customer-settings' as AppRoute, label: 'Settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const getRoleBadgeVariant = () => {
    if (effectiveRole === 'SUPER_ADMIN') return 'danger';
    if (effectiveRole === 'ADMIN') return 'warning';
    if (effectiveRole === 'CONTRACTOR') return 'success';
    return 'info';
  };


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Logo size="sm" onClick={() => navigate('home')} />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 overflow-y-auto">
          {/* Logo & Section Marker */}
          <div className="mb-6">
            <Logo variant="light" size="sm" onClick={() => navigate('home')} className="cursor-pointer" />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {effectiveRole ? `${effectiveRole.replace('_', ' ')} PORTAL` : 'PORTAL'}
              </span>
              <Badge variant={getRoleBadgeVariant()}>{effectiveRole || 'USER'}</Badge>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`side-nav-${item.id}`}
                  onClick={() => {
                    navigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white shrink-0">
                      {item.count}
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-800 text-slate-400 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-800 text-blue-200 flex items-center justify-center font-bold text-xs">
              {currentUser?.firstName?.[0] || 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="side-exit-to-marketplace"
              onClick={() => navigate('home')}
              className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 py-1.5 px-2 rounded transition cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Public View</span>
            </button>
            <button
              id="side-logout-btn"
              onClick={() => {
                logout();
                navigate('login');
              }}
              className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 py-1.5 px-2 rounded transition cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Content Body */}
        <div className="p-6 flex-1">{children}</div>
      </main>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </div>
  );
};
