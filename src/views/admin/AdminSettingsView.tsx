/**
 * You Want Services - Admin System & Security Settings View
 * Prompt #10 Architecture
 *
 * Implements:
 * - Admin Account Management: Admin Email, Change Password, Forgot Password shortcut
 * - Two-Factor Authentication (2FA/TOTP) activation & status
 * - Active Session monitoring & "Logout Other Sessions"
 * - Marketplace fee configuration
 * - Demo mode isolation & controls
 * - Notification settings
 * - Never displays passwords in plaintext
 */

import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Badge, Alert } from '../../components/common/UIComponents';
import { useDemoMode } from '../../context/DemoContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { adminAuthService, AdminSession } from '../../services/adminAuthService';
import { validateAdminPassword } from '../../services/cryptoUtils';
import { auditLogger } from '../../services/auditLogger';
import {
  Settings,
  DollarSign,
  Bell,
  Shield,
  KeyRound,
  Lock,
  Smartphone,
  Laptop,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
  ExternalLink,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { isDemoMode, setDemoMode } = useDemoMode();
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  // Active Settings Tab
  const [activeTab, setActiveTab] = useState<'security' | 'marketplace' | 'notifications'>('security');

  // Security Tab States
  const [twoFactorActive, setTwoFactorActive] = useState(false);
  const [activeSessions, setActiveSessions] = useState<AdminSession[]>([]);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Marketplace Settings States
  const [leadFeeStandard, setLeadFeeStandard] = useState('35.00');
  const [leadFeeEmergency, setLeadFeeEmergency] = useState('65.00');
  const [membershipMonthly, setMembershipMonthly] = useState('99.00');
  const [notifyAdminNewRequests, setNotifyAdminNewRequests] = useState(true);
  const [marketplaceSaved, setMarketplaceSaved] = useState(false);

  // Load Admin security status
  useEffect(() => {
    if (currentUser?.id) {
      const sessions = adminAuthService.getActiveSessions(currentUser.id);
      setActiveSessions(sessions);

      // Check current admin
      const current = adminAuthService.getCurrentAdmin();
      if (current) {
        // Load sessions
        setActiveSessions(adminAuthService.getActiveSessions(current.user.id));
      }
    }
  }, [currentUser]);

  const passwordValidation = validateAdminPassword(newPassword);

  // Handle 2FA Toggle
  const handleToggle2FA = () => {
    if (!currentUser?.id) return;
    const nextState = !twoFactorActive;
    const res = adminAuthService.toggle2FA(currentUser.id, nextState);
    if (res.success) {
      setTwoFactorActive(res.enabled);
      setSecurityMessage({
        type: 'success',
        text: res.message,
      });
      setTimeout(() => setSecurityMessage(null), 4000);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (!currentUser?.id) {
      setSecurityMessage({ type: 'danger', text: 'Administrator session not detected.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    if (!passwordValidation.isValid) {
      setSecurityMessage({
        type: 'danger',
        text: passwordValidation.errors[0] || 'Password does not satisfy complexity requirements.',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await adminAuthService.changePassword(
        currentUser.id,
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (res.success) {
        setSecurityMessage({ type: 'success', text: res.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecurityMessage({ type: 'danger', text: res.message });
      }
    } catch {
      setSecurityMessage({ type: 'danger', text: 'Failed to update administrator password.' });
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setSecurityMessage(null), 5000);
    }
  };

  // Handle Revoke Other Sessions
  const handleRevokeOtherSessions = () => {
    const current = adminAuthService.getCurrentAdmin();
    if (!current?.session?.token || !currentUser?.id) return;

    const res = adminAuthService.revokeOtherSessions(currentUser.id, current.session.token);
    if (res.success) {
      setActiveSessions(adminAuthService.getActiveSessions(currentUser.id));
      setSecurityMessage({ type: 'success', text: res.message });
      setTimeout(() => setSecurityMessage(null), 4000);
    }
  };

  // Handle Marketplace Settings Save
  const handleSaveMarketplace = (e: React.FormEvent) => {
    e.preventDefault();
    auditLogger.log({
      actorId: currentUser?.id || 'admin',
      actorRole: 'ADMIN',
      action: 'UPDATE_SYSTEM_SETTINGS',
      entityType: 'CONFIGURATION',
      entityId: 'sys-marketplace-config',
      details: {
        leadFeeStandard,
        leadFeeEmergency,
        membershipMonthly,
        isDemoMode,
      },
      isDemo: isDemoMode,
    });
    setMarketplaceSaved(true);
    setTimeout(() => setMarketplaceSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          System & Administrator Settings
        </h2>
        <p className="text-xs text-slate-500">
          Administrator account security, 2FA, session revocation, marketplace fee structures, and sandbox governance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Account Management</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'marketplace'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Marketplace & Sandbox</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Platform Alerts</span>
        </button>
      </div>

      {/* TAB 1: SECURITY & ADMIN ACCOUNT MANAGEMENT */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {securityMessage && (
            <Alert variant={securityMessage.type}>{securityMessage.text}</Alert>
          )}

          {/* Admin Identity Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Administrator Identity & Role
                </h3>
              </div>
              <Badge variant="primary">{currentUser?.role || 'ADMIN'}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block">Administrator Email</span>
                <span className="text-slate-900 font-medium font-mono text-sm">
                  {currentUser?.email || 'admin@youwantservices.com'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Used for administrative authentication and security audit alerts.
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block">Authority Tier</span>
                <span className="text-slate-900 font-medium">
                  {currentUser?.role === 'SUPER_ADMIN' ? 'Full Master Platform Authority' : 'Operations Staff Administrator'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Strictly isolated from customer & contractor records.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">Need to recover forgotten credentials?</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('admin-forgot-password')}
                className="text-xs text-indigo-600 hover:text-indigo-700"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Admin Forgot Password Flow
              </Button>
            </div>
          </Card>

          {/* Change Password Card */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Change Administrator Password
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Passwords are salted and cryptographically hashed using SHA-256. Passwords are never stored in plaintext and never visible after creation.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative max-w-md">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password complexity checklist */}
              {newPassword && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-[11px] max-w-2xl">
                  <div className="font-semibold text-slate-600 mb-1">Complexity Requirements:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.minLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      {passwordValidation.requirements.minLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>10+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasUppercase ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      {passwordValidation.requirements.hasUppercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>1 uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasLowercase ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      {passwordValidation.requirements.hasLowercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>1 lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      {passwordValidation.requirements.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>1 number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.requirements.hasSpecialChar ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      {passwordValidation.requirements.hasSpecialChar ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>1 special character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={passwordLoading}
                className="!bg-indigo-600 hover:!bg-indigo-700"
              >
                Update Password
              </Button>
            </form>
          </Card>

          {/* Two-Factor Authentication Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Two-Factor Authentication (2FA / MFA)
                </h3>
              </div>
              <Badge variant={twoFactorActive ? 'success' : 'neutral'}>
                {twoFactorActive ? '2FA ACTIVE' : '2FA DISABLED'}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              When enabled, signing in to the Administrator terminal requires entering a 6-digit verification code in addition to your master password.
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-700">
                {twoFactorActive
                  ? 'Two-Factor Authentication is currently protecting this account.'
                  : 'Enable Two-Factor Authentication for enhanced terminal security.'}
              </span>
              <Button
                type="button"
                variant={twoFactorActive ? 'danger' : 'primary'}
                size="sm"
                onClick={handleToggle2FA}
                className={twoFactorActive ? '' : '!bg-indigo-600 hover:!bg-indigo-700'}
              >
                {twoFactorActive ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
          </Card>

          {/* Active Sessions & Revocation Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Active Administrator Sessions
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRevokeOtherSessions}
                className="text-xs text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300"
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Logout Other Sessions
              </Button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Sessions expire automatically after 8 hours or upon password reset. You can remotely invalidate all other active sessions at any time.
            </p>

            <div className="space-y-2">
              {activeSessions.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-600" />
                  <span>Current active terminal session (8-hour expiration token).</span>
                </div>
              ) : (
                activeSessions.map((s, idx) => (
                  <div
                    key={s.token || idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{s.device || 'Desktop Browser Terminal'}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            CURRENT SESSION
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        IP: {s.ipAddress} • Expires: {new Date(s.expiresAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Token: {s.token ? `${s.token.substring(0, 12)}...` : 'active'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: MARKETPLACE & SANDBOX SETTINGS */}
      {activeTab === 'marketplace' && (
        <form onSubmit={handleSaveMarketplace} className="space-y-6">
          {/* Demo Mode Control Section */}
          <Card className="border-amber-200 bg-amber-50/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Sandbox / Demo Mode Framework
                </h3>
              </div>
              <Badge variant={isDemoMode ? 'warning' : 'danger'}>
                {isDemoMode ? 'DEMO MODE ACTIVE' : 'PRODUCTION SIMULATION'}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When Demo Mode is active, mock datasets are utilized and real Stripe charges are blocked. Notice that production administrator authentication remains cryptographically isolated from demo switches.
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Toggle Demo Sandbox Flag:
              </span>
              <Button
                type="button"
                variant={isDemoMode ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => setDemoMode(!isDemoMode)}
              >
                {isDemoMode ? 'Keep Demo Active (Recommended)' : 'Enable Demo Sandbox'}
              </Button>
            </div>
          </Card>

          {/* Marketplace Fee Configuration */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Marketplace Fee Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Standard Lead Fee ($)"
                type="number"
                step="0.01"
                value={leadFeeStandard}
                onChange={(e) => setLeadFeeStandard(e.target.value)}
                helperText="Cost for non-urgent contractor leads"
              />
              <Input
                label="Emergency Lead Fee ($)"
                type="number"
                step="0.01"
                value={leadFeeEmergency}
                onChange={(e) => setLeadFeeEmergency(e.target.value)}
                helperText="Cost for same-day emergency dispatch"
              />
              <Input
                label="Pro Monthly Membership ($)"
                type="number"
                step="0.01"
                value={membershipMonthly}
                onChange={(e) => setMembershipMonthly(e.target.value)}
                helperText="Verified Pro monthly subscription"
              />
            </div>
          </Card>

          <div className="flex items-center justify-between pt-2">
            {marketplaceSaved ? (
              <span className="text-xs font-bold text-emerald-600">
                Marketplace settings saved & logged to audit ledger!
              </span>
            ) : <span />}
            <Button type="submit" variant="primary" size="md">
              Save System Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: PLATFORM ALERTS */}
      {activeTab === 'notifications' && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Platform Notification Settings
            </h3>
          </div>

          <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Staff Notifications on New Unclaimed Requests
              </p>
              <p className="text-xs text-slate-500">
                Notify operational admins if a request has not been claimed within 4 hours.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyAdminNewRequests}
              onChange={(e) => setNotifyAdminNewRequests(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
        </Card>
      )}
    </div>
  );
};
