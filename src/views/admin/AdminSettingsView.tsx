/**
 * You Want Services - Admin System Settings View
 * Phase 1 Architecture
 *
 * Settings:
 * - Marketplace fee configuration
 * - Demo Mode controls
 * - Notification settings
 */

import React, { useState } from 'react';
import { Card, Input, Button, Badge } from '../../components/common/UIComponents';
import { useDemoMode } from '../../context/DemoContext';
import { Settings, DollarSign, ToggleLeft, ToggleRight, Bell, Shield } from 'lucide-react';
import { auditLogger } from '../../services/auditLogger';

export const AdminSettingsView: React.FC = () => {
  const { isDemoMode, setDemoMode } = useDemoMode();

  const [leadFeeStandard, setLeadFeeStandard] = useState('35.00');
  const [leadFeeEmergency, setLeadFeeEmergency] = useState('65.00');
  const [membershipMonthly, setMembershipMonthly] = useState('99.00');
  const [notifyAdminNewRequests, setNotifyAdminNewRequests] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    auditLogger.log({
      actorId: 'admin',
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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          System & Marketplace Settings
        </h2>
        <p className="text-xs text-slate-500">
          Global fee structures, sandbox environments, and dispatch rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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
            When Demo Mode is active, mock datasets are utilized, real Stripe charges are blocked, and all test user accounts (Customer, Contractor, Admin, Super Admin) can be toggled without third-party dependencies.
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

        {/* Notification Settings */}
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

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600">
              Marketplace settings saved & logged to audit ledger!
            </span>
          ) : <span />}
          <Button type="submit" variant="primary" size="md">
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
