/**
 * You Want Services - Customer Dashboard
 * Phase 3 Architecture
 *
 * Implements:
 * - Personalized "Welcome, [First Name]" header
 * - Prominent "Request a Service" primary CTA
 * - "My Requests" list/table with Request ID, Category/Title, Date, and Status
 * - "Quick Actions" panel (Request a Service, View My Requests, Edit Profile, Account Settings)
 * - "Notifications" section with "You're all caught up." empty state
 * - Clean homeowner presentation without internal administrative leaks
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { INITIAL_SERVICE_REQUESTS, INITIAL_NOTIFICATIONS } from '../../services/mockData';
import { INITIAL_SERVICE_CATEGORIES } from '../../config/categories';
import { Button, Card, Badge } from '../../components/common/UIComponents';
import { EmptyState } from '../../components/common/StateViews';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Bell,
  User,
  Settings,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const CustomerDashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  const requests = INITIAL_SERVICE_REQUESTS;
  const [notifications, setNotifications] = useState(
    INITIAL_NOTIFICATIONS.filter((n) => n.userId === currentUser?.id || n.userId === 'demo-usr-customer-1')
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCHING':
        return <Badge variant="warning">Matching Pros</Badge>;
      case 'SUBMITTED':
        return <Badge variant="info">Submitted</Badge>;
      case 'SCHEDULED':
        return <Badge variant="success">Scheduled</Badge>;
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header with Welcome, [First Name] and Primary CTA */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-blue-600/50 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-100">
            <span>Customer Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Welcome, {currentUser?.firstName || 'Neighbor'}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            Manage your home projects, monitor contractor quotes, and get work completed by verified local specialists.
          </p>
        </div>

        <Button
          id="customer-primary-request-cta"
          variant="secondary"
          size="lg"
          onClick={() => navigate('customer-request-service')}
          leftIcon={<PlusCircle className="w-5 h-5 text-blue-800" />}
          className="bg-white text-blue-950 hover:bg-blue-50 shrink-0 shadow-md font-extrabold text-sm"
        >
          Request a Service
        </Button>
      </div>

      {/* 2. Quick Actions Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('customer-request-service')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-left space-y-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900">Request a Service</p>
              <p className="text-[11px] text-slate-500">Post a new project</p>
            </div>
          </button>

          <button
            onClick={() => navigate('customer-my-requests')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-left space-y-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900">View My Requests</p>
              <p className="text-[11px] text-slate-500">Track quotes & status</p>
            </div>
          </button>

          <button
            onClick={() => navigate('customer-profile')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-left space-y-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900">Edit Profile</p>
              <p className="text-[11px] text-slate-500">Contact & address</p>
            </div>
          </button>

          <button
            onClick={() => navigate('customer-settings')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-left space-y-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900">Account Settings</p>
              <p className="text-[11px] text-slate-500">Security & preferences</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 3. My Requests Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">My Requests</h3>
              <p className="text-xs text-slate-500">Projects you have submitted for contractor matching.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('customer-my-requests')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View All
            </Button>
          </div>

          {requests.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Category / Project</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((req) => {
                      const cat = INITIAL_SERVICE_CATEGORIES.find((c) => c.id === req.categoryId);
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                            {req.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{req.title}</div>
                            <div className="text-[11px] text-slate-500">
                              {cat?.name || 'Home Service'} • {req.city}, {req.state}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDate(req.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(req.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => navigate('customer-my-requests')}
                              className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="You don't have any service requests yet."
              description="Submit your first repair or installation request to receive quotes from verified local trade contractors."
              actionLabel="Request a Service"
              onAction={() => navigate('customer-request-service')}
            />
          )}
        </div>

        {/* 4. Notifications Area */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Notifications</h3>
              {notifications.some((n) => !n.read) && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleClearNotifications}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkNotificationAsRead(notif.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      notif.read
                        ? 'bg-white border-slate-100 opacity-80'
                        : 'bg-blue-50/50 border-blue-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Bell className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{notif.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    {notif.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(notif.link as any);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                      >
                        <span>View Request</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-800">You&apos;re all caught up.</p>
                <p className="text-xs text-slate-500">
                  New project updates and contractor quote notifications will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
