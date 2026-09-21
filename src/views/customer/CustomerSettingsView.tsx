/**
 * You Want Services - Customer Account Settings View
 * Phase 3 Architecture
 *
 * Implements:
 * - Account Information overview (Member since, status, role)
 * - Password change with current password validation
 * - Notification preferences toggles with sandbox delivery notes
 * - Account security overview (2FA notice, active sessions)
 * - Safe Danger Zone account deactivation workflow with confirmation
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Card, Button, Input, Badge, Alert } from '../../components/common/UIComponents';
import { CustomerProfile } from '../../types/database';
import {
  Bell,
  Lock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  UserCheck,
  Smartphone,
  Mail,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export const CustomerSettingsView: React.FC = () => {
  const { currentUser, currentProfile, changePassword, updateCustomerProfile, deactivateAccount } =
    useAuth();
  const { navigate } = useNavigation();

  const profile = currentProfile as CustomerProfile | null;

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification state
  const [emailAlerts, setEmailAlerts] = useState(profile?.emailNotifications ?? true);
  const [smsAlerts, setSmsAlerts] = useState(profile?.smsNotifications ?? true);
  const [requestAlerts, setRequestAlerts] = useState(profile?.serviceRequestNotifications ?? true);
  const [marketingAlerts, setMarketingAlerts] = useState(profile?.marketingCommunications ?? false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  // Deactivation modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (!/[0-9]/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      setPasswordError('New password must contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess('Your password has been changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 5000);
      } else {
        setPasswordError(res.message);
      }
    } catch {
      setPasswordError('An unexpected error occurred while changing your password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifLoading(true);
    setNotifSuccess(null);
    try {
      await updateCustomerProfile({
        emailNotifications: emailAlerts,
        smsNotifications: smsAlerts,
        serviceRequestNotifications: requestAlerts,
        marketingCommunications: marketingAlerts,
      });
      setNotifSuccess('Notification preferences saved successfully.');
      setTimeout(() => setNotifSuccess(null), 4000);
    } catch {
      // Handled quietly
    } finally {
      setNotifLoading(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DEACTIVATE') {
      setDeactivateError('Please type DEACTIVATE in capital letters to confirm.');
      return;
    }

    setDeactivateLoading(true);
    setDeactivateError(null);
    try {
      const res = await deactivateAccount();
      if (res.success) {
        setShowDeactivateModal(false);
        navigate('home');
      } else {
        setDeactivateError(res.message);
      }
    } catch {
      setDeactivateError('Failed to deactivate account.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Recent';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your login credentials, notifications, account security, and privacy preferences.
        </p>
      </div>

      {/* 1. Account Information */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <UserCheck className="w-5 h-5 text-blue-700" />
          <h2 className="text-base font-bold text-slate-900">Account Overview</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Account Role</span>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5">Homeowner / Customer</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Account Status</span>
            <div className="mt-1">
              <Badge variant={currentUser?.status === 'ACTIVE' ? 'success' : 'warning'}>
                {currentUser?.status || 'ACTIVE'}
              </Badge>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Member Since</span>
            <p className="font-bold text-slate-800 text-xs mt-1">
              {formatDate(currentUser?.createdAt)}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Verified customer account with terms acceptance (v1.0-2026).</span>
        </div>
      </Card>

      {/* 2. Password & Authentication */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-5 h-5 text-blue-700" />
          <h2 className="text-base font-bold text-slate-900">Change Password</h2>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && <Alert variant="danger">{passwordError}</Alert>}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            helperText="Default demo account password is: DemoPass123!"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={passwordLoading}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Notification Preferences */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
          </div>
          {notifSuccess && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
              {notifSuccess}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Email Notifications</p>
              <p className="text-xs text-slate-500">
                Receive quote updates, contractor acceptance alerts, and receipt summaries.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">SMS / Text Alerts</p>
              <p className="text-xs text-slate-500">
                Get mobile text messages when a technician is on the way or responds to your scope.
              </p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Service Request Notifications</p>
              <p className="text-xs text-slate-500">
                Receive notifications when new matching contractors review your project.
              </p>
            </div>
            <input
              type="checkbox"
              checked={requestAlerts}
              onChange={(e) => setRequestAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Marketing & Seasonal Tips</p>
              <p className="text-xs text-slate-500">
                Occasional homeowner maintenance checklists (e.g. winterization and spring AC tune-up).
              </p>
            </div>
            <input
              type="checkbox"
              checked={marketingAlerts}
              onChange={(e) => setMarketingAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
          <span>
            ℹ️ <strong>Sandbox Note:</strong> Live email and SMS dispatch requires production SMTP/Twilio configuration. Settings are safely recorded in your account profile.
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={notifLoading}
            onClick={handleSaveNotifications}
          >
            Save Notification Preferences
          </Button>
        </div>
      </Card>

      {/* 4. Account Security */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-blue-700" />
          <h2 className="text-base font-bold text-slate-900">Account Security</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 text-sm">Two-Factor Authentication (2FA)</p>
              <p className="text-slate-500">
                Require an additional authentication code on new device sign-ins.
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              Available in future release
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 text-sm">Active Session</p>
              <p className="text-slate-500">Web Browser • Sandbox Cloud Preview (127.0.0.1)</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Active Now
            </span>
          </div>
        </div>
      </Card>

      {/* 5. Danger Zone - Deactivate Account */}
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold">Danger Zone: Deactivate Account</h2>
        </div>

        <p className="text-xs text-rose-800 leading-relaxed max-w-xl">
          Deactivating your account disables all active notifications and withdraws pending service requests from contractor matching. In compliance with data preservation safeguards, accounts are safely marked as inactive rather than permanently destroyed on a single click.
        </p>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => {
            setConfirmInput('');
            setDeactivateError(null);
            setShowDeactivateModal(true);
          }}
        >
          Deactivate Account
        </Button>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Confirm Account Deactivation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This action will immediately log you out and deactivate your customer profile.
                </p>
              </div>
            </div>

            {deactivateError && <Alert variant="danger">{deactivateError}</Alert>}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Type <span className="font-mono text-rose-600">DEACTIVATE</span> below to confirm:
              </label>
              <Input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DEACTIVATE"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeactivateModal(false)}
                disabled={deactivateLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deactivateLoading}
                onClick={handleConfirmDeactivate}
              >
                Confirm Deactivation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
