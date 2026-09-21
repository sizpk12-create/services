/**
 * You Want Services - Contractor Lead Detail View
 * Phase 7 Architecture
 *
 * Implements:
 * - Comprehensive lead inspection (request scope, urgency, property type, location)
 * - Privacy protection with unmasking upon lead acceptance
 * - Full customer contact tools (call, email, address navigation)
 * - Lead lifecycle progression (Contacted, Scheduled, In Progress, Completed)
 * - Contractor private project notes
 * - Detailed audit trail & activity log
 * - Status gating if contractor is unapproved
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { leadService } from '../../services/leadService';
import { contractorService } from '../../services/contractorService';
import {
  Lead,
  LeadStatus,
  LeadActivity,
  LeadDeclineReason,
  ContractorProfile,
} from '../../types/database';
import { Card, Badge, Button, Modal, Alert } from '../../components/common/UIComponents';
import { ContractorStatusBadge } from '../../components/admin/ContractorStatusBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Home,
  DollarSign,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  MessageSquare,
  FileText,
  User,
  Sparkles,
  ChevronRight,
  Check,
  X,
  History,
  Send,
} from 'lucide-react';

export const ContractorLeadDetailView: React.FC = () => {
  const { currentUser, currentProfile } = useAuth();
  const { navigate } = useNavigation();

  const contractorId = currentUser?.id || 'demo-usr-contractor-1';
  const profile =
    (currentUser ? contractorService.getProfile(currentUser.id) : null) ||
    (currentProfile as ContractorProfile) ||
    ({} as ContractorProfile);

  const onboardingStatus = profile.onboardingStatus || 'PENDING_REVIEW';
  const isApproved = onboardingStatus === 'APPROVED';

  // Retrieve lead ID from session or fallback
  const [leadId, setLeadId] = useState<string | null>(() => {
    return sessionStorage.getItem('yws_current_lead_id');
  });

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Modals state
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [agreeToContact, setAgreeToContact] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState<LeadDeclineReason>('SCHEDULE_UNAVAILABLE');
  const [declineNotes, setDeclineNotes] = useState('');

  // Status progression modal
  const [statusUpdateTarget, setStatusUpdateTarget] = useState<LeadStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');

  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    loadLead();
  }, [leadId, contractorId]);

  const loadLead = () => {
    let targetId = leadId;

    if (!targetId) {
      // Fallback to first available or accepted lead
      const myLeads = leadService.getLeadsForContractor(contractorId, { tab: 'all' });
      if (myLeads.length > 0) {
        targetId = myLeads[0].id;
        setLeadId(targetId);
        sessionStorage.setItem('yws_current_lead_id', targetId);
      }
    }

    if (targetId) {
      const data = leadService.getLeadById(targetId, contractorId);
      if (data) {
        setLead(data);
        setActivities(leadService.getActivitiesForLead(targetId));
      }
    }
  };

  const handleAcceptLead = () => {
    if (!lead) return;
    if (!agreeToContact) {
      setFeedbackError('Please confirm agreement to contact homeowner.');
      return;
    }

    const actorName = `${currentUser?.firstName || 'Contractor'} ${currentUser?.lastName || ''}`.trim();
    const res = leadService.acceptLead(lead.id, contractorId, actorName);

    if (res.success) {
      setFeedbackSuccess('Lead accepted successfully! Customer contact information is now unlocked.');
      setIsAcceptModalOpen(false);
      loadLead();
      setTimeout(() => setFeedbackSuccess(null), 6000);
    } else {
      setFeedbackError(res.message || 'Failed to accept lead.');
    }
  };

  const handleDeclineLead = () => {
    if (!lead) return;

    const actorName = `${currentUser?.firstName || 'Contractor'} ${currentUser?.lastName || ''}`.trim();
    const res = leadService.declineLead(lead.id, contractorId, actorName, declineReason, declineNotes);

    if (res.success) {
      setFeedbackSuccess('Lead declined.');
      setIsDeclineModalOpen(false);
      loadLead();
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } else {
      setFeedbackError(res.message || 'Failed to decline lead.');
    }
  };

  const handleConfirmStatusUpdate = () => {
    if (!lead || !statusUpdateTarget) return;

    const actorName = `${currentUser?.firstName || 'Contractor'} ${currentUser?.lastName || ''}`.trim();
    const res = leadService.updateLeadStatus(
      lead.id,
      statusUpdateTarget as LeadStatus,
      contractorId,
      actorName,
      statusNote || `Updated status to ${statusUpdateTarget}`
    );

    if (res.success) {
      setFeedbackSuccess(`Lead status updated to ${statusUpdateTarget.replace(/_/g, ' ')}.`);
      setStatusUpdateTarget(null);
      setStatusNote('');
      loadLead();
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } else {
      setFeedbackError(res.message || 'Failed to update status.');
    }
  };

  const handleAddNote = () => {
    if (!lead || !newNote.trim()) return;

    const actorName = `${currentUser?.firstName || 'Contractor'} ${currentUser?.lastName || ''}`.trim();
    leadService.addLeadActivity(
      lead.id,
      'NOTE_ADDED',
      contractorId,
      actorName,
      newNote.trim()
    );

    setNewNote('');
    setIsAddingNote(false);
    setActivities(leadService.getActivitiesForLead(lead.id));
    setFeedbackSuccess('Private contractor note recorded.');
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Lead Not Found</h2>
        <p className="text-xs text-slate-500">The requested service lead could not be located.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('contractor-leads')}>
          Return to Marketplace
        </Button>
      </div>
    );
  }

  const isAccepted = ['ACCEPTED', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS'].includes(lead.status);
  const isCompleted = lead.status === 'COMPLETED';
  const isAvailable = lead.status === 'AVAILABLE' || lead.status === 'NEW';
  const isDeclined = lead.status === 'DECLINED';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('contractor-leads')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Back to leads list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                {lead.leadNumber}
              </span>
              <Badge
                variant={
                  isAccepted
                    ? 'info'
                    : isCompleted
                    ? 'success'
                    : isDeclined
                    ? 'danger'
                    : 'warning'
                }
              >
                {lead.status.replace(/_/g, ' ')}
              </Badge>
              <Badge variant={lead.urgency === 'EMERGENCY' ? 'danger' : 'neutral'}>
                {lead.urgency.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {lead.serviceSubcategory || 'Service Request Detail'}
            </h1>
          </div>
        </div>

        {/* Lead action buttons */}
        <div className="flex items-center gap-2">
          {isAvailable && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeclineModalOpen(true)}
                className="text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!isApproved}
                onClick={() => {
                  setAgreeToContact(false);
                  setIsAcceptModalOpen(true);
                }}
                leftIcon={<Check className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Accept Lead
              </Button>
            </>
          )}

          {isAccepted && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
                Update Status:
              </span>
              {lead.status === 'ACCEPTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusUpdateTarget('CONTACTED')}
                  className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
                >
                  Mark Contacted
                </Button>
              )}
              {lead.status === 'CONTACTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusUpdateTarget('SCHEDULED')}
                  className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
                >
                  Mark Scheduled
                </Button>
              )}
              {(lead.status === 'CONTACTED' || lead.status === 'SCHEDULED') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusUpdateTarget('IN_PROGRESS')}
                  className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
                >
                  Mark In Progress
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStatusUpdateTarget('COMPLETED')}
                className="bg-emerald-600 hover:bg-emerald-700"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Complete Job
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {feedbackSuccess && (
        <Alert
          type="success"
          title="Updated"
          message={feedbackSuccess}
          onClose={() => setFeedbackSuccess(null)}
        />
      )}
      {feedbackError && (
        <Alert
          type="error"
          title="Error"
          message={feedbackError}
          onClose={() => setFeedbackError(null)}
        />
      )}

      {/* Lead Status Workflow Stepper */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Lead Lifecycle
          </div>
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1">
            <div
              className={`flex items-center gap-1.5 font-bold ${
                lead.status !== 'NEW' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  lead.status !== 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                1
              </div>
              <span>Available</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            <div
              className={`flex items-center gap-1.5 font-bold ${
                isAccepted || isCompleted ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isAccepted || isCompleted ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <span>Accepted</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            <div
              className={`flex items-center gap-1.5 font-bold ${
                lead.status === 'CONTACTED' || lead.status === 'SCHEDULED' || lead.status === 'IN_PROGRESS' || isCompleted
                  ? 'text-blue-600'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  lead.status === 'CONTACTED' || lead.status === 'SCHEDULED' || lead.status === 'IN_PROGRESS' || isCompleted
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </div>
              <span>Contacted</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            <div
              className={`flex items-center gap-1.5 font-bold ${
                isCompleted ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                4
              </div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Project Details & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Scope Card */}
          <Card className="p-6 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Service Request Overview
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Scope & Requirements
              </h2>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
                Homeowner Description
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {lead.projectDescription}
              </p>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Urgency
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {lead.urgency.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Target Date
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {lead.requestedDate || 'Flexible Schedule'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  Property Type
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {lead.propertyType || 'Single Family'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Time Window
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {lead.requestedTimeWindow || 'Morning (8am - 12pm)'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Estimated Budget
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {lead.estimatedBudget || '$300 - $800'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  Standard Lead Fee
                </span>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">
                  $0.00 (Demo Sandbox)
                </p>
              </div>
            </div>
          </Card>

          {/* Activity Log & Internal Notes */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                <h3 className="font-bold text-base text-slate-900">
                  Audit History & Contractor Notes
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNote(!isAddingNote)}
                leftIcon={<FileText className="w-3.5 h-3.5" />}
              >
                {isAddingNote ? 'Cancel Note' : 'Add Note'}
              </Button>
            </div>

            {/* Note input form */}
            {isAddingNote && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-xs text-slate-700 block">
                  Private Internal Note:
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record customer call outcomes, diagnostic findings, quote details..."
                  rows={3}
                  className="w-full p-3 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            )}

            {/* Activities list */}
            <div className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3">No activity records logged.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      {act.action === 'NOTE_ADDED' ? (
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                      ) : act.action === 'LEAD_ACCEPTED' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : act.action === 'LEAD_DECLINED' ? (
                        <X className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <History className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {act.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(act.timestamp || act.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{act.details}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Logged by: {act.actorName}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Customer Info / Privacy Masking Card */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Information
              </span>
              {isAccepted || isCompleted ? (
                <Badge variant="success">Contact Unlocked</Badge>
              ) : (
                <Badge variant="neutral">Privacy Masked</Badge>
              )}
            </div>

            {isAccepted || isCompleted ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                    {lead.customerName ? lead.customerName[0] : 'C'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {lead.customerName || 'Customer'}
                    </h3>
                    <p className="text-xs text-slate-500">Verified Homeowner</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-semibold">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${lead.customerPhone}`}
                      className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-4 h-4" />
                      {lead.customerPhone || '(916) 555-0144'}
                    </a>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-semibold">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${lead.customerEmail}`}
                      className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                    >
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{lead.customerEmail || 'customer@example.com'}</span>
                    </a>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-semibold">
                      Service Address
                    </span>
                    <div className="font-bold text-slate-900 text-xs mt-0.5 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{lead.fullAddress || `${lead.city}, ${lead.state} ${lead.zipCode}`}</span>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        lead.fullAddress || `${lead.city}, ${lead.state}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 mt-2 font-semibold"
                    >
                      Open in Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    Contact Information Protected
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">
                    To respect homeowner privacy and ensure direct contractor assignment, full address, phone number, and email unlock immediately upon accepting this lead.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Area:</span>
                    <span className="font-bold text-slate-800">{lead.city}, CA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ZIP Code:</span>
                    <span className="font-bold text-slate-800">{lead.zipCode}</span>
                  </div>
                </div>

                {isAvailable && (
                  <Button
                    variant="primary"
                    size="md"
                    disabled={!isApproved}
                    onClick={() => {
                      setAgreeToContact(false);
                      setIsAcceptModalOpen(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    Accept Lead & Unlock Contact
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Lead Dispatch Notes */}
          <Card className="p-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                You Want Services Standard
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All leads generated on the platform are verified residential property requests. Contractors are expected to acknowledge new customer tickets within their stated urgency window.
            </p>
          </Card>
        </div>
      </div>

      {/* ACCEPTANCE MODAL */}
      {isAcceptModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAcceptModalOpen(false)}
          title={`Accept Lead #${lead.leadNumber}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
              <h4 className="font-bold text-sm text-emerald-900">Confirm Lead Acceptance</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                By claiming this lead, homeowner contact information (phone, email, exact address) will be unlocked for direct dispatch and scheduling.
              </p>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 border border-blue-100 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToContact}
                onChange={(e) => setAgreeToContact(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700">
                I agree to promptly contact this customer and provide service in accordance with You Want Services policies.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setIsAcceptModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!agreeToContact}
                onClick={handleAcceptLead}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm & Unlock
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DECLINE MODAL */}
      {isDeclineModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsDeclineModalOpen(false)}
          title={`Decline Lead #${lead.leadNumber}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-xs text-slate-600">
              Please specify the reason for declining this lead:
            </p>

            <select
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value as LeadDeclineReason)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="SCHEDULE_UNAVAILABLE">Schedule Unavailable / Fully Booked</option>
              <option value="TOO_FAR">Too Far / Travel Distance Outside Range</option>
              <option value="OUTSIDE_SERVICE_AREA">Outside Active Dispatch Territory</option>
              <option value="SERVICE_NOT_OFFERED">Specific Service Trade Not Offered</option>
              <option value="PROJECT_NOT_SUITABLE">Project Scope / Budget Not Suitable</option>
              <option value="OTHER">Other Reason</option>
            </select>

            <textarea
              value={declineNotes}
              onChange={(e) => setDeclineNotes(e.target.value)}
              placeholder="Optional additional notes..."
              rows={3}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setIsDeclineModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeclineLead}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Submit Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* STATUS UPDATE MODAL */}
      {statusUpdateTarget && (
        <Modal
          isOpen={true}
          onClose={() => setStatusUpdateTarget(null)}
          title={`Update Status to ${statusUpdateTarget.replace(/_/g, ' ')}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-xs text-slate-600">
              Update the active progress status for Lead #{lead.leadNumber}. This update will be recorded in the audit trail.
            </p>

            <div className="space-y-1">
              <label className="font-bold text-xs text-slate-700 block">
                Status Note / Milestone Description:
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder={`Describe action taken (e.g. called customer, confirmed appointment for Thursday at 10 AM, etc.)...`}
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setStatusUpdateTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmStatusUpdate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Status Change
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
