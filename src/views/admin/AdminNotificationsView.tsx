/**
 * You Want Services - Admin System Notifications & Broadcast Center
 * Prompt #10 Architecture
 *
 * Implements:
 * - Real-Time Broadcast Dispatch to Contractors, Customers, or Entire Platform
 * - In-App Notification Stream Audit
 * - Notification Severity Controls (Info, Success, Warning, Alert)
 */

import React, { useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import {
  Bell,
  Send,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Users,
  Building,
  Globe,
  Clock,
} from 'lucide-react';

export const AdminNotificationsView: React.FC = () => {
  // Broadcast Form
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'CONTRACTOR' | 'CUSTOMER'>('ALL');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT'>('INFO');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live notifications
  const [notifications, setNotifications] = useState<Notification[]>(
    notificationService.getAllNotifications()
  );

  const refreshNotifications = () => {
    setNotifications([...notificationService.getAllNotifications()]);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setErrorMessage('Please provide both a broadcast title and message.');
      return;
    }

    const res = notificationService.broadcastNotification({
      targetRole: broadcastTarget,
      title: broadcastTitle,
      message: broadcastMessage,
      type: broadcastType,
      link: broadcastLink.trim() || undefined,
    });

    refreshNotifications();
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastLink('');
    setErrorMessage(null);
    setSuccessMessage(`System broadcast dispatched successfully to ${res.count} account(s).`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            System Broadcasts & In-App Alerts
          </h1>
          <p className="text-xs text-slate-500">
            Dispatch announcements, policy updates, maintenance bulletins, and track platform notifications.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Broadcast Form Card */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">
              Dispatch Platform Broadcast
            </h3>
            <p className="text-xs text-slate-500">
              Transmit an instant notification banner to user dashboards across the application.
            </p>
          </div>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBroadcastTarget('ALL')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    broadcastTarget === 'ALL'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  All Users
                </button>

                <button
                  type="button"
                  onClick={() => setBroadcastTarget('CONTRACTOR')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    broadcastTarget === 'CONTRACTOR'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  Contractors
                </button>

                <button
                  type="button"
                  onClick={() => setBroadcastTarget('CUSTOMER')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    broadcastTarget === 'CUSTOMER'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Customers
                </button>
              </div>
            </div>

            {/* Notification Severity */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Notification Severity
              </label>
              <select
                value={broadcastType}
                onChange={(e) =>
                  setBroadcastType(e.target.value as 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT')
                }
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INFO">INFO (Standard Announcement)</option>
                <option value="SUCCESS">SUCCESS (Positive Update)</option>
                <option value="WARNING">WARNING (Maintenance / Action Notice)</option>
                <option value="ALERT">ALERT (Urgent Bulletin)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Notification Title
            </label>
            <Input
              placeholder="e.g. Scheduled Platform Maintenance this Sunday at 2 AM EST"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Broadcast Message Content
            </label>
            <textarea
              rows={3}
              placeholder="Detailed message description delivered to user notification drawers..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Optional Target Link
            </label>
            <Input
              placeholder="e.g. /contractor/leads or /customer/requests"
              value={broadcastLink}
              onChange={(e) => setBroadcastLink(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Broadcast Now
            </Button>
          </div>
        </form>
      </Card>

      {/* Dispatched Notification Stream */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-600" />
            <h3 className="font-black text-slate-900 text-sm">
              Dispatched Notifications Log ({notifications.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No notifications dispatched yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 flex items-start gap-3 hover:bg-slate-50/80 transition text-xs"
              >
                <div className="shrink-0 mt-0.5">
                  {notif.type === 'ALERT' ? (
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  ) : notif.type === 'WARNING' ? (
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : notif.type === 'SUCCESS' ? (
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{notif.title}</h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={notif.read ? 'neutral' : 'info'}>
                      {notif.read ? 'READ' : 'UNREAD'}
                    </Badge>
                    <span className="font-mono text-slate-400 text-[10px]">
                      User: {notif.userId}
                    </span>
                    {notif.link && (
                      <span className="font-mono text-blue-600 text-[10px]">
                        Link: {notif.link}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
