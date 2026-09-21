/**
 * You Want Services - Contractor Leads Marketplace View
 * Phase 7 Architecture
 *
 * Implements:
 * - Status-gated marketplace access (locked for unapproved/suspended contractors)
 * - Tab filters (All, Available, Accepted, Declined, Completed, Expired)
 * - Keyword search (Lead ID, service, city, ZIP, description)
 * - Category and Urgency filters
 * - Privacy protection: customer contact masked until accepted
 * - Acceptance workflow modal with customer contact agreement
 * - Decline workflow modal with required reason capture
 * - Direct navigation to Lead Detail view
 * - Real-time statistics counters
 * - Demo mode monetization note ($20 value, free during Phase 7)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { leadService } from '../../services/leadService';
import { contractorService } from '../../services/contractorService';
import { Lead, LeadStatus, LeadDeclineReason, ContractorProfile } from '../../types/database';
import { Card, Badge, Button, Input, Select, Modal, Alert } from '../../components/common/UIComponents';
import { ContractorStatusBadge } from '../../components/admin/ContractorStatusBadge';
import {
  Inbox,
  Search,
  Filter,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  Lock,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  Home,
  Tag,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type TabKey = 'all' | 'available' | 'accepted' | 'declined' | 'completed' | 'expired';

export const ContractorLeadsView: React.FC = () => {
  const { currentUser, currentProfile } = useAuth();
  const { navigate } = useNavigation();

  const contractorId = currentUser?.id || 'demo-usr-contractor-1';
  const profile =
    (currentUser ? contractorService.getProfile(currentUser.id) : null) ||
    (currentProfile as ContractorProfile) ||
    ({} as ContractorProfile);

  const onboardingStatus = profile.onboardingStatus || 'PENDING_REVIEW';
  const isApproved = onboardingStatus === 'APPROVED';

  const [activeTab, setActiveTab] = useState<TabKey>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState(() => leadService.getContractorStats(contractorId));

  // Modals state
  const [acceptModalLead, setAcceptModalLead] = useState<Lead | null>(null);
  const [declineModalLead, setDeclineModalLead] = useState<Lead | null>(null);
  const [declineReason, setDeclineReason] = useState<LeadDeclineReason>('SCHEDULE_UNAVAILABLE');
  const [declineNotes, setDeclineNotes] = useState('');
  const [agreeToContact, setAgreeToContact] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, [contractorId, activeTab, searchQuery, selectedCategory, selectedUrgency]);

  const loadLeads = () => {
    const rawLeads = leadService.getLeadsForContractor(contractorId, {
      tab: activeTab,
      search: searchQuery,
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    });

    // Client-side urgency filter
    const filtered = rawLeads.filter((l) => {
      if (selectedUrgency !== 'ALL' && l.urgency !== selectedUrgency) return false;
      if (selectedCategory !== 'ALL' && l.serviceCategoryId !== selectedCategory) return false;
      return true;
    });

    setLeads(filtered);
    setStats(leadService.getContractorStats(contractorId));
  };

  const handleOpenAcceptModal = (lead: Lead) => {
    setActionError(null);
    setAgreeToContact(false);
    setAcceptModalLead(lead);
  };

  const handleConfirmAccept = () => {
    if (!acceptModalLead) return;
    if (!agreeToContact) {
      setActionError('Please confirm your agreement to contact the homeowner.');
      return;
    }

    const actorName = `${currentUser?.firstName || 'Contractor'} ${currentUser?.lastName || ''}`.trim();
    const res = leadService.acceptLead(acceptModalLead.id, contractorId, actorName);

    if (res.success) {
      setActionSuccess(`Lead #${acceptModalLead.leadNumber} accepted successfully! Homeowner contact information unlocked.`);
      setAcceptModalLead(null);
      loadLeads();
      setTimeout(() => setActionSuccess(null), 6000);
    } else {
      setActionError(res.message || 'Failed to accept lead.');
    }
  };

  const handleOpenDeclineModal = (lead: Lead) => {
    setActionError(null);
    setDeclineReason('SCHEDULE_UNAVAILABLE');
    setDeclineNotes('');
    setDeclineModalLead(lead);
  };

  const handleConfirmDecline = () => {
    if (!declineModalLead) return;

    const actorName = `${currentUser?.firstName || 'Contractor'} ${currentUser?.lastName || ''}`.trim();
    const res = leadService.declineLead(
      declineModalLead.id,
      contractorId,
      actorName,
      declineReason,
      declineNotes
    );

    if (res.success) {
      setActionSuccess(`Lead #${declineModalLead.leadNumber} declined.`);
      setDeclineModalLead(null);
      loadLeads();
      setTimeout(() => setActionSuccess(null), 5000);
    } else {
      setActionError(res.message || 'Failed to decline lead.');
    }
  };

  const handleViewLeadDetail = (leadId: string) => {
    // Store selected lead ID in sessionStorage for LeadDetailView
    sessionStorage.setItem('yws_current_lead_id', leadId);
    navigate('contractor-lead-detail');
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return <Badge variant="danger">Emergency</Badge>;
      case 'WITHIN_24_HOURS':
        return <Badge variant="warning">Within 24h</Badge>;
      case 'THIS_WEEK':
        return <Badge variant="info">This Week</Badge>;
      default:
        return <Badge variant="neutral">Flexible</Badge>;
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'AVAILABLE':
      case 'NEW':
        return <Badge variant="success">Available</Badge>;
      case 'ACCEPTED':
      case 'CONTACTED':
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return <Badge variant="info">{status.replace(/_/g, ' ')}</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'DECLINED':
        return <Badge variant="danger">Declined</Badge>;
      case 'EXPIRED':
      case 'CLOSED':
        return <Badge variant="neutral">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Lead Marketplace
            </h1>
            <Badge variant="neutral">Phase 7 Workflow</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, claim, and quote on verified residential service requests in your service area.
          </p>
        </div>

        {/* Lead monetization status indicator */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span>Standard Lead Fee: <strong>$20.00</strong></span>
            <span className="text-[10px] text-emerald-400 block font-normal">
              Demo Mode: 100% Free during Phase 7 preview
            </span>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {actionSuccess && (
        <Alert
          type="success"
          title="Action Completed"
          message={actionSuccess}
          onClose={() => setActionSuccess(null)}
        />
      )}

      {/* Access Gating Alert if not Approved */}
      {!isApproved && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-amber-900">
                  Marketplace Gated: Account {onboardingStatus.replace(/_/g, ' ')}
                </h3>
                <ContractorStatusBadge status={onboardingStatus} type="onboarding" />
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Only verified and approved contractors can browse and accept new homeowner leads.
                {onboardingStatus === 'ACTION_REQUIRED' && ' Please review requested corrections to activate your account.'}
                {onboardingStatus === 'PENDING_REVIEW' && ' Your trade credentials are currently in the compliance review queue.'}
                {onboardingStatus === 'SUSPENDED' && ' Your account is temporarily suspended. Contact compliance support to resolve.'}
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('contractor-profile')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  View Verification Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>All Leads</span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'available'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Available</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'available' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isApproved ? stats.availableLeads : 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('accepted')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'accepted'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Accepted / In Progress</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'accepted' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {stats.acceptedLeads}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('declined')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'declined'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Declined</span>
          {stats.declinedLeads > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'declined' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {stats.declinedLeads}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Completed</span>
          {stats.completedJobs > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'completed' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {stats.completedJobs}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'expired'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Expired / Closed</span>
        </button>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Lead ID (e.g. YL-2026-000201), city, ZIP, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="cat-plumbing">Plumbing</option>
            <option value="cat-hvac">HVAC & Mechanical</option>
            <option value="cat-electrical">Electrical</option>
            <option value="cat-roofing">Roofing</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Urgency Levels</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="WITHIN_24_HOURS">Within 24 Hours</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="FLEXIBLE">Flexible</option>
          </select>
        </div>
      </div>

      {/* Leads List Feed */}
      <div className="space-y-4">
        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">No Leads Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {activeTab === 'available' && !isApproved
                ? 'Your contractor account must be approved before leads become available.'
                : 'No leads match your active filters or search criteria. Try broadening your search or check back later.'}
            </p>
          </div>
        ) : (
          leads.map((lead) => {
            const isAccepted = ['ACCEPTED', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS'].includes(lead.status);
            const isCompleted = lead.status === 'COMPLETED';
            const isDeclined = lead.status === 'DECLINED';
            const isAvailable = (lead.status === 'AVAILABLE' || lead.status === 'NEW') && !isDeclined;

            return (
              <Card
                key={lead.id}
                className="p-5 sm:p-6 space-y-4 hover:border-blue-300 transition shadow-2xs"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                      {lead.leadNumber}
                    </span>
                    {getStatusBadge(lead.status)}
                    {getUrgencyBadge(lead.urgency)}
                    <span className="text-xs text-slate-400">
                      Posted {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-right">
                      <span className="text-slate-500 block text-[11px]">Lead Value</span>
                      <span className="font-extrabold text-slate-900">
                        ${lead.leadPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Body */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {lead.serviceSubcategory || 'Home Service Inquiry'}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {lead.city}, {lead.state} ({lead.zipCode})
                        </span>
                        {lead.propertyType && (
                          <span className="flex items-center gap-1">
                            <Home className="w-3.5 h-3.5 text-slate-400" />
                            {lead.propertyType}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Target: {lead.requestedDate || 'Flexible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 line-clamp-3">
                    {lead.projectDescription}
                  </p>
                </div>

                {/* Privacy or Unlocked Customer Info Section */}
                <div className="bg-slate-50 rounded-xl p-3.5 text-xs border border-slate-200">
                  {isAccepted || isCompleted ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          Homeowner
                        </span>
                        <span className="font-bold text-slate-900">
                          {lead.customerName || 'David Miller'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          Contact Phone
                        </span>
                        <a
                          href={`tel:${lead.customerPhone}`}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {lead.customerPhone || '(916) 555-0144'}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                          Full Property Address
                        </span>
                        <span className="font-bold text-slate-900 truncate block">
                          {lead.fullAddress || `${lead.city}, ${lead.state} ${lead.zipCode}`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          <strong>Customer Privacy Protected:</strong> Exact property address, phone number, and email unlock immediately upon lead acceptance.
                        </span>
                      </div>
                      <span className="text-[11px] text-blue-600 font-semibold shrink-0">
                        General Area: {lead.city}, CA ({lead.zipCode})
                      </span>
                    </div>
                  )}
                </div>

                {/* Declined Note Banner */}
                {isDeclined && lead.declineReason && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <strong>Declined by you:</strong> Reason: {lead.declineReason.replace(/_/g, ' ')}
                      {lead.declineNotes && ` — "${lead.declineNotes}"`}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-400">
                    {lead.requestedTimeWindow ? `Preferred Window: ${lead.requestedTimeWindow}` : 'Schedule: Contact homeowner'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLeadDetail(lead.id)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View Full Details
                    </Button>

                    {/* Actions for Available Leads */}
                    {isAvailable && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDeclineModal(lead)}
                          className="text-rose-700 border-rose-200 hover:bg-rose-50"
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!isApproved}
                          onClick={() => handleOpenAcceptModal(lead)}
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Accept Lead
                        </Button>
                      </>
                    )}

                    {/* Quick navigation for accepted leads */}
                    {isAccepted && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewLeadDetail(lead.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        Manage & Contact
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* LEAD ACCEPTANCE MODAL */}
      {acceptModalLead && (
        <Modal
          isOpen={true}
          onClose={() => setAcceptModalLead(null)}
          title={`Accept Lead #${acceptModalLead.leadNumber}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
              <h4 className="font-bold text-sm text-emerald-900">
                Claim Service Request
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Accepting this lead assigns you as the primary contractor for this homeowner.
                Full contact information (phone, email, exact address) will unlock immediately.
              </p>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Service Category:</span>
                <span className="font-bold text-slate-900">{acceptModalLead.serviceSubcategory}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-900">{acceptModalLead.city}, {acceptModalLead.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Urgency:</span>
                <span className="font-bold text-slate-900">{acceptModalLead.urgency.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Phase 7 Lead Fee:</span>
                <span className="font-bold text-emerald-700">$0.00 (Demo Mode - Standard: $20.00)</span>
              </div>
            </div>

            {actionError && (
              <Alert type="error" message={actionError} onClose={() => setActionError(null)} />
            )}

            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 border border-blue-100 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToContact}
                onChange={(e) => setAgreeToContact(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700">
                I agree to reach out to the customer within the requested urgency window and uphold the You Want Services quality standard.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setAcceptModalLead(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAccept}
                disabled={!agreeToContact}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm & Unlock Lead
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* LEAD DECLINE MODAL */}
      {declineModalLead && (
        <Modal
          isOpen={true}
          onClose={() => setDeclineModalLead(null)}
          title={`Decline Lead #${declineModalLead.leadNumber}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-xs text-slate-600">
              Please specify the reason for declining this lead. This helps our dispatch system optimize future lead matching for your territory.
            </p>

            <div className="space-y-1">
              <label className="font-bold text-xs text-slate-700 block">
                Primary Decline Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value as LeadDeclineReason)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="SCHEDULE_UNAVAILABLE">Schedule Unavailable / Fully Booked</option>
                <option value="TOO_FAR">Too Far / Travel Distance Outside Range</option>
                <option value="OUTSIDE_SERVICE_AREA">Outside Active Dispatch Territory</option>
                <option value="SERVICE_NOT_OFFERED">Specific Service Trade Not Offered</option>
                <option value="PROJECT_NOT_SUITABLE">Project Scope / Budget Not Suitable</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-xs text-slate-700 block">
                Optional Notes for Dispatch Administrator:
              </label>
              <textarea
                value={declineNotes}
                onChange={(e) => setDeclineNotes(e.target.value)}
                placeholder="Add any specific context regarding this decline..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {actionError && (
              <Alert type="error" message={actionError} onClose={() => setActionError(null)} />
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setDeclineModalLead(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDecline}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Submit Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
