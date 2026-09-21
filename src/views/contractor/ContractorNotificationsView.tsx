/**
 * You Want Services - Contractor Notifications Center View
 * Phase 7 Architecture
 *
 * Implements:
 * - Dedicated full-page notification manager for contractors
 * - Notification filtering (All, Unread, Read)
 * - Bulk actions (Mark All Read, Clear Read)
 * - Deep linking to relevant views (Leads, Profile, Verification)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types/database';
import { Card, Badge, Button } from '../../components/common/UIComponents';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Inbox,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Filter,
} from 'lucide-react';

export const ContractorNotificationsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  const userId = currentUser?.id || 'demo-usr-contractor-1';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = () => {
    setNotifications(notificationService.getNotificationsForUser(userId));
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(userId);
    loadNotifications();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'ERROR':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleNotificationAction = (n: Notification) => {
    handleMarkAsRead(n.id);
    if (n.link) {
      navigate(n.link as any);
    } else if (n.title.toLowerCase().includes('lead')) {
      navigate('contractor-leads');
    } else if (n.title.toLowerCase().includes('verification') || n.title.toLowerCase().includes('application')) {
      navigate('contractor-profile');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch updates, lead assignments, compliance notifications, and account alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
            filter === 'unread'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
            filter === 'read'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No notifications in this folder.</p>
          </Card>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start gap-4 ${
                !n.read
                  ? 'bg-white border-blue-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    {n.title}
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    )}
                  </h3>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                <div className="pt-2 flex items-center gap-3 text-xs">
                  <button
                    onClick={() => handleNotificationAction(n)}
                    className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
