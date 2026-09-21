/**
 * You Want Services - Admin Contractor Memberships & Subscriptions Control Center
 * Prompt #10 Architecture
 *
 * Implements:
 * - Contractor Subscription Tiers Overview (Starter, Pro, Elite)
 * - Live MRR & Plan Distribution Metrics
 * - Contractor Subscriptions Roster & Search
 * - Tier Upgrade / Downgrade / Suspend / Cancel Controls
 * - Free Lead Allocation & Custom Discount Modifiers
 */

import React, { useState, useMemo } from 'react';
import {
  marketplaceFinanceService,
  MEMBERSHIP_TIER_CONFIG,
} from '../../services/marketplaceFinanceService';
import { ContractorSubscription, MembershipTier, MembershipStatus } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Zap,
  Shield,
  Building,
  Edit,
  PauseCircle,
  PlayCircle,
  XCircle,
  Gift,
  DollarSign,
  X,
} from 'lucide-react';

export const AdminMembershipsView: React.FC = () => {
  const { navigate } = useNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedSub, setSelectedSub] = useState<ContractorSubscription | null>(null);

  // Modal edit form
  const [targetTier, setTargetTier] = useState<MembershipTier>('PRO');
  const [targetStatus, setTargetStatus] = useState<MembershipStatus>('ACTIVE');
  const [targetAllowance, setTargetAllowance] = useState<number>(2);
  const [actionNotes, setActionNotes] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Live subscriptions
  const [subscriptions, setSubscriptions] = useState<ContractorSubscription[]>(
    marketplaceFinanceService.getAllSubscriptions()
  );

  const refreshSubscriptions = () => {
    setSubscriptions([...marketplaceFinanceService.getAllSubscriptions()]);
  };

  // Live metrics
  const metrics = useMemo(() => {
    return marketplaceFinanceService.getSubscriptionMetrics();
  }, [subscriptions]);

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      if (tierFilter !== 'ALL' && s.tier !== tierFilter) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches =
          s.businessName.toLowerCase().includes(term) ||
          s.contractorId.toLowerCase().includes(term) ||
          s.id.toLowerCase().includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [subscriptions, tierFilter, statusFilter, searchTerm]);

  // Handle open modal
  const handleOpenEditModal = (sub: ContractorSubscription) => {
    setSelectedSub(sub);
    setTargetTier(sub.tier);
    setTargetStatus(sub.status);
    setTargetAllowance(sub.monthlyFreeLeads);
    setActionNotes('');
    setActionSuccessMessage(null);
  };

  // Handle tier save
  const handleSaveTierChange = () => {
    if (!selectedSub) return;

    const updated = marketplaceFinanceService.updateSubscription(
      selectedSub.contractorId,
      targetTier,
      targetStatus,
      'admin-usr-1',
      'System Administrator',
      actionNotes || `Updated to ${targetTier} plan by admin`
    );

    if (targetAllowance !== MEMBERSHIP_TIER_CONFIG[targetTier].freeLeadsPerMonth) {
      marketplaceFinanceService.updateSubscriptionAllowance(
        selectedSub.contractorId,
        targetAllowance,
        'admin-usr-1'
      );
    }

    refreshSubscriptions();
    const refreshed = marketplaceFinanceService.getSubscription(selectedSub.contractorId);
    if (refreshed) setSelectedSub(refreshed);
    setActionSuccessMessage(`Subscription updated to ${targetTier} plan successfully.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Quick suspend / activate / cancel actions
  const handleQuickStatusChange = (status: MembershipStatus) => {
    if (!selectedSub) return;
    const updated = marketplaceFinanceService.updateSubscription(
      selectedSub.contractorId,
      selectedSub.tier,
      status,
      'admin-usr-1',
      'System Administrator',
      actionNotes || `Status changed to ${status} by admin`
    );

    refreshSubscriptions();
    setSelectedSub(updated);
    setActionSuccessMessage(`Subscription status changed to ${status}.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Contractor Memberships & Subscriptions
          </h1>
          <p className="text-xs text-slate-500">
            Monetization tiers, Monthly Recurring Revenue (MRR), contractor allotments, and plan upgrades.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Subscribers</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.activeSubscribers}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Rec. Revenue</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">${metrics.monthlyRecurringRevenue}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Starter Tier</div>
            <div className="text-2xl font-black text-slate-700 mt-1">{metrics.starterCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pro Tier</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{metrics.proCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Elite Tier</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.eliteCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Plan Tiers Reference Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(MEMBERSHIP_TIER_CONFIG) as MembershipTier[]).map((tierKey) => {
          const plan = MEMBERSHIP_TIER_CONFIG[tierKey];
          return (
            <Card key={tierKey} className="p-4 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tierKey === 'ELITE' ? (
                    <Crown className="w-5 h-5 text-amber-500" />
                  ) : tierKey === 'PRO' ? (
                    <Zap className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Shield className="w-5 h-5 text-slate-500" />
                  )}
                  <h3 className="font-black text-slate-900 text-sm">{plan.name}</h3>
                </div>
                <span className="text-base font-black text-slate-900">${plan.monthlyPrice}/mo</span>
              </div>

              <p className="text-xs text-slate-500">{plan.description}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Included Free Leads:</span>
                <span className="font-bold text-slate-900">{plan.freeLeadsPerMonth} / month</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Lead Discount:</span>
                <span className="font-bold text-emerald-600">{plan.leadDiscountPercent}% OFF</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search & Filters */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Input
              placeholder="Search by business name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Membership Tiers</option>
              <option value="STARTER">Starter Tier ($0/mo)</option>
              <option value="PRO">Pro Tier ($49/mo)</option>
              <option value="ELITE">Elite Tier ($99/mo)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Subscription Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PAST_DUE">PAST DUE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Contractor Subscriptions Roster */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Contractor / Business</th>
                <th className="py-3.5 px-4">Current Plan</th>
                <th className="py-3.5 px-4">Monthly Rate</th>
                <th className="py-3.5 px-4">Remaining Free Leads</th>
                <th className="py-3.5 px-4">Subscription Status</th>
                <th className="py-3.5 px-4">Current Period End</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No contractor subscriptions match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sub.businessName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ID: {sub.contractorId}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 font-bold">
                        {sub.tier === 'ELITE' ? (
                          <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-300">
                            <Crown className="w-3 h-3 inline mr-1" />
                            ELITE
                          </Badge>
                        ) : sub.tier === 'PRO' ? (
                          <Badge variant="info">
                            <Zap className="w-3 h-3 inline mr-1" />
                            PRO
                          </Badge>
                        ) : (
                          <Badge variant="neutral">STARTER</Badge>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${sub.monthlyFee}
                      <span className="text-[11px] font-normal text-slate-400">/mo</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {sub.remainingFreeLeads} / {sub.monthlyFreeLeads} remaining
                      </div>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (sub.remainingFreeLeads / (sub.monthlyFreeLeads || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          sub.status === 'ACTIVE'
                            ? 'success'
                            : sub.status === 'SUSPENDED'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                        : 'Rolling'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(sub)}
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                      >
                        Manage Tier
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Subscription Management Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Manage Subscription
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSub.businessName}</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {actionSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {/* Current Status Overview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Current Tier</span>
                  <div className="font-bold text-sm text-slate-900">{selectedSub.tier} Plan</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Status</span>
                  <div>
                    <Badge
                      variant={
                        selectedSub.status === 'ACTIVE'
                          ? 'success'
                          : selectedSub.status === 'SUSPENDED'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {selectedSub.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Monthly Fee</span>
                  <div className="font-bold text-sm text-slate-900">${selectedSub.monthlyFee}/mo</div>
                </div>
              </div>

              {/* Modify Tier Form */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Select New Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STARTER', 'PRO', 'ELITE'] as MembershipTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        setTargetTier(tier);
                        setTargetAllowance(MEMBERSHIP_TIER_CONFIG[tier].freeLeadsPerMonth);
                      }}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                        targetTier === tier
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tier}
                      <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                        ${MEMBERSHIP_TIER_CONFIG[tier].monthlyPrice}/mo
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Status */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Subscription Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as MembershipStatus)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="PAST_DUE">PAST DUE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              {/* Custom Free Lead Allowance */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Included Free Leads / Month
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={targetAllowance}
                  onChange={(e) => setTargetAllowance(parseInt(e.target.value) || 0)}
                  leftIcon={<Gift className="w-4 h-4 text-slate-400" />}
                />
                <span className="text-[11px] text-slate-400">
                  Standard for {targetTier} is {MEMBERSHIP_TIER_CONFIG[targetTier].freeLeadsPerMonth} leads.
                </span>
              </div>

              {/* Admin Note */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Admin Override Note
                </label>
                <Input
                  placeholder="Reason for change..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" className="w-full" onClick={handleSaveTierChange}>
                  Save Plan & Allowance Changes
                </Button>
              </div>

              {/* Quick Status Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Quick Actions
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {selectedSub.status !== 'SUSPENDED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickStatusChange('SUSPENDED')}
                      leftIcon={<PauseCircle className="w-3.5 h-3.5 text-amber-600" />}
                    >
                      Suspend
                    </Button>
                  )}

                  {selectedSub.status !== 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickStatusChange('ACTIVE')}
                      leftIcon={<PlayCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    >
                      Activate
                    </Button>
                  )}

                  {selectedSub.status !== 'CANCELLED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleQuickStatusChange('CANCELLED')}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setSelectedSub(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
