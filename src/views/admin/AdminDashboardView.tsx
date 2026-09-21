/**
 * You Want Services - Admin Control Center & Operations Dashboard
 * Prompt #10 Architecture
 *
 * Implements:
 * - Live KPI Metrics calculated from real service databases
 * - Direct Quick-Action shortcuts to operational queues
 * - Critical Attention Alerts (Pending Verifications, Unassigned Leads, Disputes)
 * - Operational Activity Snapshot
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import { marketplaceFinanceService, MarketplaceKPIs } from '../../services/marketplaceFinanceService';
import { contractorService } from '../../services/contractorService';
import { leadService } from '../../services/leadService';
import { auditLogger } from '../../services/auditLogger';
import {
  Users,
  Building2,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Inbox,
  CheckCircle2,
  DollarSign,
  Layers,
  RefreshCcw,
  ArrowRight,
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { navigate } = useNavigation();

  // Load live data
  const [kpis, setKpis] = useState<MarketplaceKPIs>(marketplaceFinanceService.getMarketplaceKPIs());
  const [recentLogs, setRecentLogs] = useState(auditLogger.getLogs().slice(0, 5));
  const [pendingContractors, setPendingContractors] = useState(
    contractorService.getAllProfiles().filter(
      (p) => p.onboardingStatus === 'PENDING_REVIEW' || p.onboardingStatus === 'SUBMITTED'
    )
  );
  const [pendingRefunds, setPendingRefunds] = useState(
    marketplaceFinanceService.getAllRefunds('PENDING')
  );
  const [unclaimedLeads, setUnclaimedLeads] = useState(
    leadService.getAllLeads().filter((l) => l.status === 'AVAILABLE' || l.status === 'NEW')
  );

  const refreshDashboard = () => {
    setKpis(marketplaceFinanceService.getMarketplaceKPIs());
    setRecentLogs(auditLogger.getLogs().slice(0, 5));
    setPendingContractors(
      contractorService.getAllProfiles().filter(
        (p) => p.onboardingStatus === 'PENDING_REVIEW' || p.onboardingStatus === 'SUBMITTED'
      )
    );
    setPendingRefunds(marketplaceFinanceService.getAllRefunds('PENDING'));
    setUnclaimedLeads(
      leadService.getAllLeads().filter((l) => l.status === 'AVAILABLE' || l.status === 'NEW')
    );
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Admin Control Center
            </span>
            <Badge variant="success">System Operational</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Marketplace Operations & Intelligence
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Real-time oversight of customer requests, contractor verification queues, lead dispatching, and monetization channels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDashboard}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
            leftIcon={<Activity className="w-4 h-4 text-emerald-400" />}
          >
            Live Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('admin-reports')}
            leftIcon={<TrendingUp className="w-4 h-4" />}
          >
            Reports & Analytics
          </Button>
        </div>
      </div>

      {/* Critical Operational Alerts Banner (if items require attention) */}
      {(pendingContractors.length > 0 || pendingRefunds.length > 0 || unclaimedLeads.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingContractors.length > 0 && (
            <div
              onClick={() => navigate('admin-contractor-review')}
              className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-200/60 flex items-center justify-center text-amber-800 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    {pendingContractors.length} Contractor Verification{pendingContractors.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-[11px] text-amber-700">Awaiting admin document & license approval</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </div>
          )}

          {pendingRefunds.length > 0 && (
            <div
              onClick={() => navigate('admin-refunds')}
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between cursor-pointer hover:bg-rose-100/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-200/60 flex items-center justify-center text-rose-800 shrink-0">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-900">
                    {pendingRefunds.length} Pending Refund Dispute{pendingRefunds.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-[11px] text-rose-700">${kpis.pendingRefundsAmount.toFixed(2)} requested credits</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-700" />
            </div>
          )}

          {unclaimedLeads.length > 0 && (
            <div
              onClick={() => navigate('admin-leads')}
              className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between cursor-pointer hover:bg-blue-100/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-200/60 flex items-center justify-center text-blue-800 shrink-0">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900">
                    {unclaimedLeads.length} Unclaimed Open Lead{unclaimedLeads.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-[11px] text-blue-700">Ready for contractor claim or admin assign</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-700" />
            </div>
          )}
        </div>
      )}

      {/* 12 Live KPI Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Marketplace Vitals & Monetization
          </h2>
          <span className="text-xs text-slate-400 font-medium">Auto-derived from live records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Customers */}
          <Card
            onClick={() => navigate('admin-customers')}
            className="hover:border-blue-400 transition cursor-pointer p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Customers</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{kpis.totalCustomers}</div>
              <p className="text-xs text-slate-500 mt-0.5">Verified homeowner accounts</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
              <span>View Roster</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Card 2: Total Contractors & Status */}
          <Card
            onClick={() => navigate('admin-contractors')}
            className="hover:border-emerald-400 transition cursor-pointer p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Contractors</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{kpis.totalContractors}</div>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-semibold">{kpis.verifiedContractors} Verified</span> • {kpis.pendingContractors} Pending
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
              <span>Contractor Directory</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Card 3: Pending Approvals */}
          <Card
            onClick={() => navigate('admin-contractor-review')}
            className={`transition cursor-pointer p-5 flex flex-col justify-between ${
              kpis.pendingContractors > 0
                ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                : 'hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Verification Queue</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{kpis.pendingContractors}</div>
              <p className="text-xs text-slate-500 mt-0.5">Licenses & insurance reviews</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
              <span>Open Queue</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Card 4: Service Requests */}
          <Card
            onClick={() => navigate('admin-service-requests')}
            className="hover:border-indigo-400 transition cursor-pointer p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Service Requests</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{kpis.totalServiceRequests}</div>
              <p className="text-xs text-slate-500 mt-0.5">Homeowner submissions</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
              <span>View Requests</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Card 5: Total Leads */}
          <Card
            onClick={() => navigate('admin-leads')}
            className="hover:border-amber-400 transition cursor-pointer p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Leads</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{kpis.totalLeads}</div>
              <p className="text-xs text-slate-500 mt-0.5">
                {kpis.availableLeads} Open • {kpis.claimedLeads} Claimed
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
              <span>Lead Dispatch Center</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Card 6: Lead Conversion Rate */}
          <Card
            onClick={() => navigate('admin-reports')}
            className="hover:border-purple-400 transition cursor-pointer p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Claim & Conversion Rate</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{kpis.leadConversionRate}%</div>
              <p className="text-xs text-slate-500 mt-0.5">{kpis.claimedLeads} of {kpis.totalLeads} claimed</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-600 font-semibold">
              <span>Conversion Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Card 7: Lead Sales Revenue */}
          <Card
            onClick={() => navigate('admin-payments')}
            className="hover:border-teal-400 transition cursor-pointer p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Lead Sales Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-teal-700 tracking-tight">
                ${kpis.totalLeadSalesRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">From claimed lead fees</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
              <span>View Payments Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>

          {/* Card 8: Monthly Recurring Revenue (MRR) */}
          <Card
            onClick={() => navigate('admin-memberships')}
            className="hover:border-blue-400 transition cursor-pointer p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Monthly Recurring (MRR)</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-blue-800 tracking-tight">
                ${kpis.monthlyRecurringRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{kpis.activeSubscribersCount} active paid contractors</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700 font-semibold">
              <span>Manage Memberships</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Action Shortcuts Panel */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Executive Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin-contractor-review')}
            className="justify-start py-2.5 px-3 h-auto text-xs"
            leftIcon={<ShieldCheck className="w-4 h-4 text-amber-600" />}
          >
            Review Queue
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin-leads')}
            className="justify-start py-2.5 px-3 h-auto text-xs"
            leftIcon={<Inbox className="w-4 h-4 text-blue-600" />}
          >
            Dispatch Lead
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin-pricing')}
            className="justify-start py-2.5 px-3 h-auto text-xs"
            leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
          >
            Adjust Pricing
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin-refunds')}
            className="justify-start py-2.5 px-3 h-auto text-xs"
            leftIcon={<RefreshCcw className="w-4 h-4 text-rose-600" />}
          >
            Disputes ({kpis.pendingRefundsCount})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin-reports')}
            className="justify-start py-2.5 px-3 h-auto text-xs"
            leftIcon={<TrendingUp className="w-4 h-4 text-purple-600" />}
          >
            Revenue Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin-audit-logs')}
            className="justify-start py-2.5 px-3 h-auto text-xs"
            leftIcon={<Activity className="w-4 h-4 text-slate-600" />}
          >
            Audit Trail
          </Button>
        </div>
      </Card>

      {/* Operational Summaries: Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Contractors Awaiting Verification */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Contractors Awaiting Review
            </h3>
            <Badge variant={pendingContractors.length > 0 ? 'warning' : 'success'}>
              {pendingContractors.length} Pending
            </Badge>
          </div>

          {pendingContractors.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All contractor verification applications are up to date!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingContractors.slice(0, 4).map((contractor) => (
                <div
                  key={contractor.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100/70 transition cursor-pointer"
                  onClick={() => navigate('admin-contractor-review')}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900">
                      {contractor.businessName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {contractor.city}, {contractor.state} • {contractor.businessType || 'General Trade'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">{contractor.onboardingStatus}</Badge>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right: Live Audit Log Snapshot */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              System Activity Snapshot
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('admin-audit-logs')}
              className="text-[11px] py-1 h-auto"
            >
              Full Log
            </Button>
          </div>

          <div className="space-y-2.5">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg border border-slate-100 text-xs flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {log.action}
                    </code>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {log.actorRole} ({log.actorId.substring(0, 12)})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Target: {log.entityType} #{log.entityId.substring(0, 10)}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
