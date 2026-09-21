/**
 * You Want Services - Contractor Dashboard Shell & Onboarding Status
 * Phase 5 & 6 Architecture
 *
 * Implements:
 * - Dynamic Status Banners (Approved, Action Required, Pending Review, Suspended, Rejected)
 * - Action Required Alert Card with detailed instructions & direct section edit CTAs
 * - Category Credential Verification Indicators (License, Insurance, Business Profile, Documents)
 * - Profile Completion calculation with score and remaining items
 * - In-App Notification Center with read/unread tracking
 * - Preserved Leads, Jobs, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { contractorService } from '../../services/contractorService';
import { contractorVerificationService } from '../../services/contractorVerificationService';
import { notificationService } from '../../services/notificationService';
import { leadService } from '../../services/leadService';
import { INITIAL_JOBS } from '../../services/mockData';
import { Card, Badge, Button, Alert } from '../../components/common/UIComponents';
import { ContractorStatusBadge } from '../../components/admin/ContractorStatusBadge';
import { ContractorProfile, Notification, Lead } from '../../types/database';
import {
  Inbox,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileCheck2,
  Building2,
  Sliders,
  Sparkles,
  Settings,
  HelpCircle,
  Bell,
  CheckCheck,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  FileText,
  Lock,
  History,
  Check,
} from 'lucide-react';

export const ContractorDashboardView: React.FC = () => {
  const { currentUser, currentProfile } = useAuth();
  const { navigate } = useNavigation();

  // Retrieve current active profile from service
  const profile =
    (currentUser ? contractorService.getProfile(currentUser.id) : null) ||
    (currentProfile as ContractorProfile) ||
    ({} as ContractorProfile);

  const contractorId = currentUser?.id || 'demo-usr-contractor-1';
  const onboardingStatus = profile.onboardingStatus || 'PENDING_REVIEW';
  const isApproved = onboardingStatus === 'APPROVED';

  // Real contractor statistics & leads from leadService
  const [stats, setStats] = useState(() => leadService.getContractorStats(contractorId));
  const [recentLeads, setRecentLeads] = useState<Lead[]>(() =>
    leadService.getLeadsForContractor(contractorId, { tab: 'available' }).slice(0, 3)
  );

  const jobs = INITIAL_JOBS;

  // Real Profile Completion Calculation
  const completionResult = contractorService.calculateProfileCompletion(currentUser, profile);
  const score = completionResult.score;
  const missingItems = completionResult.missingItems;

  // Verification category statuses
  const statusMatrix = contractorVerificationService.evaluateContractorStatusMatrix(profile);

  // In-app notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      refreshLeadsData();
    }
  }, [currentUser]);

  const refreshLeadsData = () => {
    setStats(leadService.getContractorStats(contractorId));
    setRecentLeads(
      leadService.getLeadsForContractor(contractorId, { tab: 'available' }).slice(0, 3)
    );
  };

  const loadNotifications = () => {
    if (!currentUser) return;
    const notifs = notificationService.getNotificationsForUser(currentUser.id);
    setNotifications(notifs);
    setUnreadCount(notificationService.getUnreadCount(currentUser.id));
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      notificationService.markAllAsRead(currentUser.id);
      loadNotifications();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Contractor Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Contractor Portal
            </span>
            <ContractorStatusBadge status={onboardingStatus} type="onboarding" />
            <Badge variant="neutral">
              Verification: {statusMatrix.overallStatus || 'PENDING'}
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {profile.businessName || `${currentUser?.firstName}'s Home Services`}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            {profile.city || 'Sacramento'}, {profile.state || 'CA'} • {profile.serviceRadiusMiles || 35} Mile Dispatch Radius • {profile.businessType || 'Trade Contractor'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <button
            onClick={() => navigate('contractor-notifications')}
            className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <Button
            id="dash-edit-profile-btn"
            variant="primary"
            size="md"
            onClick={() => navigate('contractor-profile')}
            leftIcon={<Building2 className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-500 shadow-sm"
          >
            Manage Profile
          </Button>
        </div>
      </div>

      {/* In-App Notifications Drawer / Box */}
      {showNotifications && (
        <Card className="p-5 border-blue-200 bg-blue-50/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-700" />
              <h3 className="font-bold text-sm text-slate-900">Compliance & Account Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No notifications at this time.</p>
          ) : (
            <div className="divide-y divide-blue-100/80 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-2.5 px-2 flex items-start justify-between gap-3 text-xs transition rounded-lg ${
                    !n.read ? 'bg-white/80 font-medium' : 'opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer shrink-0"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* DYNAMIC LIFECYCLE STATUS BANNERS */}

      {/* 1. APPROVED BANNER */}
      {onboardingStatus === 'APPROVED' && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-emerald-900">Application Approved & Verified</h3>
                <Badge variant="success">Active Marketplace Contractor</Badge>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Your contractor account and credentials have been verified by compliance. You have full access to view, accept, and manage homeowner service leads in your dispatch territory.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('contractor-leads')}
              className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Available Leads ({stats.availableLeads})
            </Button>
          </div>
        </div>
      )}

      {/* 2. ACTION REQUIRED BANNER */}
      {onboardingStatus === 'ACTION_REQUIRED' && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-4 shadow-sm">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-amber-900">Action Required: Corrections Requested</h3>
                  <Badge variant="danger">Marketplace Locked</Badge>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Our compliance team reviewed your application and requested updates before granting lead access.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('contractor-profile')}
              className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shrink-0"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Update Information Now
            </Button>
          </div>

          {/* Details & Flagged Items */}
          <div className="bg-white/90 rounded-xl p-4 border border-amber-200 space-y-3 text-xs">
            {profile.correctionRequest?.items && profile.correctionRequest.items.length > 0 && (
              <div>
                <span className="font-bold text-slate-800 block mb-1">Sections Requiring Attention:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.correctionRequest.items.map((it: string) => (
                    <span
                      key={it}
                      className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px] border border-amber-200"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.correctionRequest?.instructions && (
              <div>
                <span className="font-bold text-slate-800 block mb-1">Administrator Instructions:</span>
                <p className="text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100 italic leading-relaxed">
                  "{profile.correctionRequest.instructions}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PENDING REVIEW BANNER */}
      {(onboardingStatus === 'PENDING_REVIEW' || onboardingStatus === 'SUBMITTED') && (
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-blue-900">Application Under Compliance Review</h3>
                <Badge variant="warning">Pending Approval</Badge>
              </div>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                Your trade credentials and documents are currently being audited by an administrator. Lead marketplace access will unlock once approved. Estimated timeline: 1 business day.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('contractor-profile')}
            className="border-blue-300 text-blue-800 hover:bg-blue-100 shrink-0"
          >
            Review Submitted Details
          </Button>
        </div>
      )}

      {/* 4. SUSPENDED BANNER */}
      {onboardingStatus === 'SUSPENDED' && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-rose-900">Account Temporarily Suspended</h3>
                <Badge variant="danger">Suspended</Badge>
              </div>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                Your profile has been suspended from receiving customer leads. Reason:{' '}
                <strong>{profile.suspensionReason || 'Compliance review pending.'}</strong>. Please contact support or update your credentials to resolve.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('contractor-profile')}
            className="border-rose-300 text-rose-900 hover:bg-rose-100 shrink-0"
          >
            Manage Credentials
          </Button>
        </div>
      )}

      {/* 5. REJECTED BANNER */}
      {onboardingStatus === 'REJECTED' && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-rose-900">Application Not Approved</h3>
                <Badge variant="danger">Rejected</Badge>
              </div>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                Reason: {profile.rejectionReason || 'Requirements not satisfied'}. {profile.rejectionNotes ? `Notes: "${profile.rejectionNotes}"` : ''}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('contractor-profile')}
            className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
          >
            View Account Profile
          </Button>
        </div>
      )}

      {/* Metrics Row (Real metrics from leadService) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="flex items-center gap-4 cursor-pointer hover:border-blue-300 transition"
          onClick={() => navigate('contractor-leads')}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Available Leads</span>
            <p className="text-2xl font-black text-slate-900">{isApproved ? stats.availableLeads : 0}</p>
            {!isApproved && (
              <span className="text-[10px] text-amber-600 font-medium">Locked until approval</span>
            )}
          </div>
        </Card>

        <Card
          className="flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition"
          onClick={() => navigate('contractor-leads')}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Accepted Leads</span>
            <p className="text-2xl font-black text-slate-900">{stats.acceptedLeads}</p>
          </div>
        </Card>

        <Card
          className="flex items-center gap-4 cursor-pointer hover:border-purple-300 transition"
          onClick={() => navigate('contractor-jobs')}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Active Jobs</span>
            <p className="text-2xl font-black text-slate-900">{stats.activeJobs}</p>
          </div>
        </Card>

        <Card
          className="flex items-center gap-4 cursor-pointer hover:border-slate-300 transition"
          onClick={() => navigate('contractor-lead-history')}
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">Completed Jobs</span>
            <p className="text-2xl font-black text-slate-900">{stats.completedJobs}</p>
          </div>
        </Card>
      </div>

      {/* Profile Completion Card & Missing Items Checklist */}
      <Card className="p-6 sm:p-8 space-y-5 border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Profile Strength & Credential Readiness
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Your Profile is {score}% Complete
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive business profiles receive priority in customer matching and dispatch reviews.
            </p>
          </div>

          <div className="text-right sm:text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('contractor-profile')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Update Profile Details
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              score >= 80 ? 'bg-emerald-600' : score >= 50 ? 'bg-blue-600' : 'bg-amber-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Missing or Completed checklist */}
        {missingItems.length > 0 ? (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Items Remaining to Reach 100%:
            </span>
            <div className="flex flex-wrap gap-2">
              {missingItems.map((item, idx) => (
                <span
                  key={idx}
                  onClick={() => navigate('contractor-profile')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 cursor-pointer hover:bg-amber-100 transition"
                  title="Click to complete this item in your profile"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Excellent! All recommended profile fields and credentials have been completed.</span>
          </div>
        )}
      </Card>

      {/* Quick Action Dispatch Center */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('contractor-leads')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer space-y-2 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Inbox className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Available Leads</h4>
            <p className="text-[11px] text-slate-500">View and accept inquiries</p>
          </div>

          <div
            onClick={() => navigate('contractor-lead-history')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer space-y-2 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <History className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Lead History</h4>
            <p className="text-[11px] text-slate-500">Past & archived leads</p>
          </div>

          <div
            onClick={() => navigate('contractor-profile')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer space-y-2 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Service Territory</h4>
            <p className="text-[11px] text-slate-500">Sacramento metro hub</p>
          </div>

          <div
            onClick={() => navigate('contractor-notifications')}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer space-y-2 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
            <p className="text-[11px] text-slate-500">Alerts & review status</p>
          </div>
        </div>
      </div>

      {/* Active Jobs & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">New Leads In Territory</h3>
              <p className="text-xs text-slate-500">Matching your trade specialties & dispatch area</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('contractor-leads')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse All Leads
            </Button>
          </div>

          {!isApproved ? (
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Lead Marketplace Locked</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your contractor credentials must be verified and approved before you can browse and accept customer leads.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('contractor-profile')}
              >
                Check Onboarding Status
              </Button>
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 text-xs italic">
              No new matching leads currently available in your territory. Check back soon!
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 hover:border-blue-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                      {lead.leadNumber}
                    </span>
                    <Badge variant={lead.urgency === 'EMERGENCY' ? 'danger' : 'warning'}>
                      {lead.urgency.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {lead.serviceSubcategory || 'Service Request'} • {lead.city}, {lead.state} ({lead.zipCode})
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {lead.projectDescription}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Requested: {lead.requestedDate || 'Flexible'}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('contractor-leads')}
                    >
                      View & Accept Lead
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Scheduled Jobs</h3>
              <p className="text-xs text-slate-500">Confirmed upcoming appointments</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('contractor-jobs')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              All Jobs
            </Button>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="info">{job.status}</Badge>
                  <span className="text-xs font-bold text-emerald-600">
                    Agreed: ${job.agreedPrice?.toFixed(2)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(job.scheduledDate || '').toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Sacramento, CA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
