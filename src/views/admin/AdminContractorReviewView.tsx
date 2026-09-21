/**
 * You Want Services - Contractor Verification Review View
 * Phase 6 Architecture
 *
 * Implements:
 * - Detailed contractor verification interface
 * - Category verification matrix (Business, License, Insurance, Documents, Profile)
 * - License review with California CSLB Foundation provider test
 * - Insurance policy review with expiration engine (Valid, Expiring Soon, Expired)
 * - Interactive document inspection modal integration
 * - Objective profile completeness criteria
 * - Chronological audit log & verification history
 * - Comprehensive administrative decision workflows (Approve, Request Correction, Reject, Suspend, Deactivate)
 */

import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { contractorService } from '../../services/contractorService';
import { accountService } from '../../services/accountService';
import {
  contractorVerificationService,
  evaluateExpirationStanding,
  evaluateObjectiveProfileCompletion,
  licenseVerificationRegistry,
} from '../../services/contractorVerificationService';
import {
  ContractorProfile,
  ContractorDocument,
  VerificationCategory,
  VerificationMethod,
  User,
  AuditLog,
  VerificationReview,
} from '../../types/database';
import { ContractorStatusBadge } from '../../components/admin/ContractorStatusBadge';
import { ContractorDocumentViewerModal } from '../../components/admin/ContractorDocumentViewerModal';
import {
  ContractorDecisionModal,
  DecisionType,
} from '../../components/admin/ContractorDecisionModal';
import { Card, Button, Badge } from '../../components/common/UIComponents';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Building2,
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Eye,
  ExternalLink,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  Check,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AdminContractorReviewView: React.FC = () => {
  const { routeParams, navigate } = useNavigation();
  const { currentUser: currentAdmin } = useAuth();

  const [allProfiles, setAllProfiles] = useState<ContractorProfile[]>([]);
  const [selectedContractorId, setSelectedContractorId] = useState<string>('');
  const [contractor, setContractor] = useState<ContractorProfile | null>(null);
  const [contractorUser, setContractorUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<ContractorDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'business' | 'license' | 'insurance' | 'documents' | 'history'>('matrix');

  // Document modal state
  const [selectedDoc, setSelectedDoc] = useState<ContractorDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Decision modal state
  const [activeDecision, setActiveDecision] = useState<DecisionType | null>(null);

  // License verification inputs
  const [licenseMethod, setLicenseMethod] = useState<VerificationMethod>('MANUAL_LOOKUP');
  const [licenseNotes, setLicenseNotes] = useState('');
  const [isLicenseProcessing, setIsLicenseProcessing] = useState(false);
  const [cslbSimResult, setCslbSimResult] = useState<string | null>(null);

  // Insurance verification inputs
  const [insuranceMethod, setInsuranceMethod] = useState<VerificationMethod>('DOCUMENT_REVIEW');
  const [insuranceNotes, setInsuranceNotes] = useState('');
  const [isInsuranceProcessing, setIsInsuranceProcessing] = useState(false);

  // Status feedback toast/banner
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Audit history
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reviewHistory, setReviewHistory] = useState<VerificationReview[]>([]);

  // Load profiles on mount
  useEffect(() => {
    loadContractorData();
  }, [routeParams.contractorId]);

  const loadContractorData = () => {
    const profiles = contractorService.getAllProfiles();
    setAllProfiles(profiles);

    // Identify target contractor
    const paramId = routeParams.contractorId;
    let target = profiles.find((p) => p.id === paramId || p.userId === paramId);

    // If none found or not specified, choose the first pending contractor or first available
    if (!target && profiles.length > 0) {
      target = profiles.find((p) => p.onboardingStatus === 'PENDING_REVIEW') || profiles[0];
    }

    if (target) {
      setSelectedContractorId(target.id);
      setContractor(target);
      const u = accountService.getUserById(target.userId);
      setContractorUser(u || null);
      const docs = contractorService.getDocuments(target.id);
      setDocuments(docs);
      refreshHistories(target.id);
    }
  };

  const refreshHistories = (cId: string) => {
    const logs = contractorVerificationService.getAuditLogsForContractor(cId);
    setAuditLogs(logs);
    const reviews = contractorVerificationService.getVerificationHistory(cId);
    setReviewHistory(reviews);
  };

  const handleSelectContractor = (id: string) => {
    setSelectedContractorId(id);
    const target = allProfiles.find((p) => p.id === id);
    if (target) {
      setContractor(target);
      const u = accountService.getUserById(target.userId);
      setContractorUser(u || null);
      const docs = contractorService.getDocuments(target.id);
      setDocuments(docs);
      refreshHistories(target.id);
      setCslbSimResult(null);
    }
  };

  if (!contractor) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Contractor Records Found</h3>
        <p className="text-xs text-slate-500 mb-4">No registered contractors were located in the directory.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('admin-contractors')}>
          Return to Contractor Directory
        </Button>
      </div>
    );
  }

  // Calculate status matrices & objective requirements
  const statusMatrix = contractorVerificationService.evaluateContractorStatusMatrix(contractor);
  const objectiveReport = evaluateObjectiveProfileCompletion(contractorUser, contractor, documents);
  const licenseExp = evaluateExpirationStanding(contractor.licenseExpiration);
  const insuranceExp = evaluateExpirationStanding(contractor.insuranceExpiration);

  // Handle License Audit Action
  const handleLicenseAction = async (action: 'VERIFY' | 'FAIL' | 'MARK_EXPIRED' | 'REQUEST_CORRECTION') => {
    if (!currentAdmin) return;
    setIsLicenseProcessing(true);
    setActionFeedback(null);
    try {
      const res = contractorVerificationService.reviewLicense(contractor.id, {
        action,
        method: licenseMethod,
        notes: licenseNotes || `Administrative license verification set to ${action}.`,
        reviewer: currentAdmin,
      });

      if (res.success && res.contractor) {
        setContractor(res.contractor);
        setActionFeedback({ type: 'success', message: res.message });
        refreshHistories(contractor.id);
      } else {
        setActionFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update license verification.' });
    } finally {
      setIsLicenseProcessing(false);
    }
  };

  // Handle Simulated California CSLB Check
  const handleRunCaliforniaCslbCheck = async () => {
    if (!contractor.licenseNumber) return;
    setIsLicenseProcessing(true);
    try {
      const provider = licenseVerificationRegistry.getProvider('CALIFORNIA_CSLB_FOUNDATION');
      if (provider) {
        const result = await provider.verifyLicense({
          licenseNumber: contractor.licenseNumber,
          state: contractor.licenseState || 'CA',
          businessName: contractor.businessName,
          adminNotes: 'Automated simulated CSLB foundation inspection check triggered by admin.',
        });
        setCslbSimResult(
          `${result.demoTag}: Status=${result.status} • Reference=${result.referenceId} • ${result.notes}`
        );
        setLicenseMethod('EXTERNAL_API');
        setLicenseNotes(result.notes || 'CSLB registry test successful.');
      }
    } catch (err: any) {
      setCslbSimResult(`CSLB Check Failed: ${err.message}`);
    } finally {
      setIsLicenseProcessing(false);
    }
  };

  // Handle Insurance Audit Action
  const handleInsuranceAction = async (action: 'VERIFY' | 'FAIL' | 'MARK_EXPIRED' | 'REQUEST_CORRECTION') => {
    if (!currentAdmin) return;
    setIsInsuranceProcessing(true);
    setActionFeedback(null);
    try {
      const res = contractorVerificationService.reviewInsurance(contractor.id, {
        action,
        method: insuranceMethod,
        notes: insuranceNotes || `Administrative insurance verification set to ${action}.`,
        reviewer: currentAdmin,
      });

      if (res.success && res.contractor) {
        setContractor(res.contractor);
        setActionFeedback({ type: 'success', message: res.message });
        refreshHistories(contractor.id);
      } else {
        setActionFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update insurance verification.' });
    } finally {
      setIsInsuranceProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('admin-contractors')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Directory
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {contractor.businessName}
              </h1>
              <ContractorStatusBadge status={contractor.onboardingStatus} type="onboarding" />
            </div>
            <p className="text-xs text-slate-500">
              Contractor ID: <span className="font-mono text-slate-700">{contractor.id}</span> •
              Registered {new Date(contractor.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Contractor Quick Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Switch Provider:</span>
          <select
            value={selectedContractorId}
            onChange={(e) => handleSelectContractor(e.target.value)}
            className="text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-600"
          >
            {allProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.businessName} ({p.onboardingStatus || 'PENDING'}) - {p.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs font-bold underline cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Required Banner if active */}
      {contractor.onboardingStatus === 'ACTION_REQUIRED' && contractor.correctionRequest && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Active Correction Request Pending Contractor Response
          </div>
          <p className="text-amber-800 text-[11px] mb-2 leading-relaxed">
            Requested on {new Date(contractor.correctionRequest.requestedAt).toLocaleString()} by {contractor.correctionRequest.requestedByName || 'Admin'}.
          </p>
          <div className="bg-white/80 p-3 rounded-lg border border-amber-200 space-y-1.5">
            <div className="font-semibold text-amber-950">Flagged Sections:</div>
            <div className="flex flex-wrap gap-1.5">
              {contractor.correctionRequest.items.map((it) => (
                <span key={it} className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                  {it}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-slate-700 italic pt-1">
              "{contractor.correctionRequest.instructions}"
            </div>
          </div>
        </div>
      )}

      {/* Suspended Notice if active */}
      {contractor.onboardingStatus === 'SUSPENDED' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs text-orange-950">
          <div className="flex items-center gap-2 font-bold text-orange-900 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            Contractor Account Suspended
          </div>
          <p className="text-orange-800 text-[11px] leading-relaxed">
            Reason: {contractor.suspensionReason || 'Compliance review pending.'} (Suspended {new Date(contractor.suspendedAt || '').toLocaleDateString()})
          </p>
        </div>
      )}

      {/* Rejection Notice if active */}
      {contractor.onboardingStatus === 'REJECTED' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950">
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <XCircle className="w-4 h-4 text-rose-600" />
            Application Rejected
          </div>
          <p className="text-rose-800 text-[11px] leading-relaxed">
            Reason: {contractor.rejectionReason} • Notes: {contractor.rejectionNotes}
          </p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Verification Matrix & Hub
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'business'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Business & Dispatch Profile
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'license'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Trade License</span>
            <ContractorStatusBadge status={statusMatrix.licenseStatus} type="verification" className="text-[10px] py-0 px-1.5" />
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'insurance'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Insurance</span>
            <ContractorStatusBadge status={statusMatrix.insuranceStatus} type="verification" className="text-[10px] py-0 px-1.5" />
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Documents ({documents.length})</span>
            <ContractorStatusBadge status={statusMatrix.documentsStatus} type="verification" className="text-[10px] py-0 px-1.5" />
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History ({reviewHistory.length + auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VERIFICATION MATRIX & HUB */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Verification Status Cards (5 Distinct Categories) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Category 1: Business */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Business</span>
                  <ContractorStatusBadge status={statusMatrix.businessStatus} type="verification" />
                </div>
                <div className="font-bold text-slate-900 text-sm">{contractor.businessType || 'Entity'}</div>
                <div className="text-[11px] text-slate-500 truncate">{contractor.address || 'Address unrecorded'}</div>
              </div>
              <button
                onClick={() => setActiveTab('business')}
                className="mt-3 text-[11px] text-blue-600 hover:text-blue-800 font-semibold text-left cursor-pointer"
              >
                Inspect Details →
              </button>
            </div>

            {/* Category 2: License */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2. License</span>
                  <ContractorStatusBadge status={statusMatrix.licenseStatus} type="verification" />
                </div>
                <div className="font-bold text-slate-900 text-sm font-mono">{contractor.licenseNumber || 'None'}</div>
                <div className="text-[11px] text-slate-500">
                  {contractor.licenseState} • {licenseExp.formattedText}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('license')}
                className="mt-3 text-[11px] text-blue-600 hover:text-blue-800 font-semibold text-left cursor-pointer"
              >
                Audit License →
              </button>
            </div>

            {/* Category 3: Insurance */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">3. Insurance</span>
                  <ContractorStatusBadge status={statusMatrix.insuranceStatus} type="verification" />
                </div>
                <div className="font-bold text-slate-900 text-sm truncate">{contractor.insuranceProvider || 'No Policy'}</div>
                <div className="text-[11px] text-slate-500">
                  {insuranceExp.formattedText}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('insurance')}
                className="mt-3 text-[11px] text-blue-600 hover:text-blue-800 font-semibold text-left cursor-pointer"
              >
                Audit Policy →
              </button>
            </div>

            {/* Category 4: Documents */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">4. Documents</span>
                  <ContractorStatusBadge status={statusMatrix.documentsStatus} type="verification" />
                </div>
                <div className="font-bold text-slate-900 text-sm">{documents.length} File(s) Uploaded</div>
                <div className="text-[11px] text-slate-500">
                  {documents.filter((d) => d.status === 'ACCEPTED').length} Accepted
                </div>
              </div>
              <button
                onClick={() => setActiveTab('documents')}
                className="mt-3 text-[11px] text-blue-600 hover:text-blue-800 font-semibold text-left cursor-pointer"
              >
                Inspect Files →
              </button>
            </div>

            {/* Category 5: Profile Completeness */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">5. Completeness</span>
                  <Badge variant={objectiveReport.isFullyComplete ? 'success' : 'warning'}>
                    {objectiveReport.completedCount}/{objectiveReport.totalCount} Complete
                  </Badge>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {objectiveReport.isFullyComplete ? 'Fully Complete' : `${objectiveReport.missingLabels.length} Missing`}
                </div>
                <div className="text-[11px] text-slate-500">
                  {contractor.profileCompletion || 0}% weighted score
                </div>
              </div>
              <button
                onClick={() => setActiveTab('business')}
                className="mt-3 text-[11px] text-blue-600 hover:text-blue-800 font-semibold text-left cursor-pointer"
              >
                View Checklist →
              </button>
            </div>
          </div>

          {/* Requirements Checklist Card */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Marketplace Verification Requirements Checklist
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Objective Platform Compliance Standard
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {objectiveReport.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 transition ${
                    item.isComplete
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[11px] opacity-80">{item.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Document Access Strip */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                Uploaded Trade Credentials Documents ({documents.length})
              </h3>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('documents')}>
                Inspect in Document Vault
              </Button>
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No documents uploaded yet by this contractor.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setIsDocModalOpen(true);
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{doc.fileName}</div>
                        <div className="text-[10px] text-slate-500">{doc.documentType.replace(/_/g, ' ')}</div>
                      </div>
                    </div>
                    <ContractorStatusBadge status={doc.status || doc.verificationStatus} type="document" className="text-[10px] ml-2 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: BUSINESS & DISPATCH PROFILE */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Legal Business Entity & Contact Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Legal Business Name</span>
                <span className="font-bold text-slate-900 text-sm">{contractor.businessName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Entity Classification</span>
                <span className="font-semibold text-slate-800">{contractor.businessType || 'LLC'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Registered Principal Contact</span>
                <span className="font-semibold text-slate-800">
                  {contractorUser ? `${contractorUser.firstName} ${contractorUser.lastName}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Years in Business</span>
                <span className="font-semibold text-slate-800">{contractor.yearsInBusiness || 1} year(s)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Dispatch Phone</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {contractor.contactPhone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Dispatch Email</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {contractor.contactEmail}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 block text-[11px] mb-0.5">Physical Operating Address</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {contractor.address}, {contractor.city}, {contractor.state} {contractor.zipCode}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 block text-[11px] mb-0.5">Business Description</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {contractor.businessDescription || 'No description provided.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Trade Services & Territory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Service Trade Categories</h3>
              <div className="flex flex-wrap gap-2">
                {contractor.serviceCategories && contractor.serviceCategories.length > 0 ? (
                  contractor.serviceCategories.map((c) => (
                    <span key={c} className="bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded-lg text-xs border border-blue-200">
                      {c.replace('cat-', '').toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No categories assigned.</span>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Dispatch Territory</h3>
              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Base Dispatch ZIP:</span>
                  <span className="font-mono font-bold text-slate-800">{contractor.primaryServiceZip || contractor.zipCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service Coverage Radius:</span>
                  <span className="font-semibold text-slate-800">{contractor.serviceRadiusMiles || 25} miles</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: TRADE LICENSE REVIEW */}
      {activeTab === 'license' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Trade License Credential Review
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect state registration, verify active standing, and record official audit findings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <ContractorStatusBadge status={statusMatrix.licenseStatus} type="verification" />
                <Badge variant={licenseExp.badgeVariant}>{licenseExp.formattedText}</Badge>
              </div>
            </div>

            {/* License Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">License Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {contractor.licenseNumber || 'None Recorded'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Classification</span>
                <span className="font-semibold text-slate-800">
                  {contractor.licenseType || 'General Trade License'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Issuing Jurisdiction</span>
                <span className="font-semibold text-slate-800">
                  {contractor.licenseState || 'State Board'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Expiration Date</span>
                <span className="font-semibold text-slate-800">
                  {contractor.licenseExpiration || 'No expiration date'}
                </span>
              </div>
            </div>

            {/* California CSLB Foundation Feature Box if State is CA */}
            {contractor.licenseState === 'CA' && (
              <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    California CSLB Licensing Integration Foundation (Phase 6 Architecture)
                  </div>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    DEMO SIMULATED
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  This system architecture includes an official foundation interface for the California State Contractors License Board (CSLB). In Demo Mode, it performs structural parsing and simulated registry validation without unapproved scraping.
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunCaliforniaCslbCheck}
                    isLoading={isLicenseProcessing}
                    className="border-blue-300 text-blue-800 hover:bg-blue-100"
                  >
                    Simulate CSLB Registry Check
                  </Button>
                  {cslbSimResult && (
                    <span className="text-[11px] text-blue-900 font-mono">
                      {cslbSimResult}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Audit Form */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Record License Audit Action
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Method *
                  </label>
                  <select
                    value={licenseMethod}
                    onChange={(e) => setLicenseMethod(e.target.value as VerificationMethod)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="MANUAL_LOOKUP">Administrative Manual Registry Lookup</option>
                    <option value="DOCUMENT_REVIEW">Official Document Review (PDF / COI Inspection)</option>
                    <option value="EXTERNAL_API">External Registry API / CSLB Foundation</option>
                    <option value="ADMIN_CONFIRMATION">Admin Direct Confirmation</option>
                    <option value="OTHER">Other Compliance Source</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Auditor Verification Notes *
                  </label>
                  <input
                    type="text"
                    value={licenseNotes}
                    onChange={(e) => setLicenseNotes(e.target.value)}
                    placeholder="e.g. Verified active status via state portal; bond in good standing..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLicenseAction('VERIFY')}
                  isLoading={isLicenseProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Mark License Verified
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLicenseAction('FAIL')}
                  isLoading={isLicenseProcessing}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Mark Verification Failed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLicenseAction('MARK_EXPIRED')}
                  isLoading={isLicenseProcessing}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  Mark Expired
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLicenseAction('REQUEST_CORRECTION')}
                  isLoading={isLicenseProcessing}
                  leftIcon={<AlertTriangle className="w-4 h-4" />}
                >
                  Flag for Correction
                </Button>
              </div>

              {/* Verification Metadata attribution */}
              {contractor.verifications?.LICENSE && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>
                    Last audited by <strong>{contractor.verifications.LICENSE.verifiedByName || 'Administrator'}</strong> via {contractor.verifications.LICENSE.verificationMethod}
                  </span>
                  <span>{new Date(contractor.verifications.LICENSE.verifiedAt || '').toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: INSURANCE AUDIT */}
      {activeTab === 'insurance' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Commercial General Liability Insurance Review
                </h3>
                <p className="text-xs text-slate-500">
                  Verify commercial general liability policy numbers, carrier validity, and coverage expiration.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <ContractorStatusBadge status={statusMatrix.insuranceStatus} type="verification" />
                <Badge variant={insuranceExp.badgeVariant}>{insuranceExp.formattedText}</Badge>
              </div>
            </div>

            {/* Insurance Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Insurance Carrier</span>
                <span className="font-bold text-slate-900 text-sm">
                  {contractor.insuranceProvider || 'None Recorded'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Policy Number</span>
                <span className="font-mono font-semibold text-slate-800">
                  {contractor.insurancePolicyNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Coverage Limits</span>
                <span className="font-semibold text-slate-800">
                  {contractor.insuranceCoverageType || 'Commercial General Liability'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Policy Expiration</span>
                <span className="font-semibold text-slate-800">
                  {contractor.insuranceExpiration || 'No expiration date'}
                </span>
              </div>
            </div>

            {/* Audit Form */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Record Insurance Audit Action
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Method *
                  </label>
                  <select
                    value={insuranceMethod}
                    onChange={(e) => setInsuranceMethod(e.target.value as VerificationMethod)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="DOCUMENT_REVIEW">Certificate of Insurance (COI) Document Inspection</option>
                    <option value="MANUAL_LOOKUP">Carrier / Broker Telephone Confirmation</option>
                    <option value="ADMIN_CONFIRMATION">Admin Direct Confirmation</option>
                    <option value="OTHER">Other Compliance Source</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Auditor Verification Notes *
                  </label>
                  <input
                    type="text"
                    value={insuranceNotes}
                    onChange={(e) => setInsuranceNotes(e.target.value)}
                    placeholder="e.g. Valid COI on file with $1M/$2M aggregates confirmed..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleInsuranceAction('VERIFY')}
                  isLoading={isInsuranceProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Mark Insurance Verified
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsuranceAction('FAIL')}
                  isLoading={isInsuranceProcessing}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Mark Verification Failed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsuranceAction('MARK_EXPIRED')}
                  isLoading={isInsuranceProcessing}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  Mark Policy Expired
                </Button>
              </div>

              {/* Verification Metadata attribution */}
              {contractor.verifications?.INSURANCE && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>
                    Last audited by <strong>{contractor.verifications.INSURANCE.verifiedByName || 'Administrator'}</strong> via {contractor.verifications.INSURANCE.verificationMethod}
                  </span>
                  <span>{new Date(contractor.verifications.INSURANCE.verifiedAt || '').toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: DOCUMENTS VAULT */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Contractor Documents Vault</h3>
                <p className="text-xs text-slate-500">
                  Inspect uploaded legal licenses and policy binders in the secure document viewer.
                </p>
              </div>
              <Badge variant="neutral">{documents.length} Uploaded</Badge>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                No documents uploaded for this contractor.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <ContractorStatusBadge status={doc.status || doc.verificationStatus} type="document" />
                      </div>

                      <div className="font-bold text-xs text-slate-900 truncate mb-1">
                        {doc.fileName}
                      </div>
                      <div className="text-[11px] text-slate-500 mb-2">
                        {doc.documentType.replace(/_/g, ' ')}
                      </div>

                      {doc.rejectionReason && (
                        <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] mb-2 font-medium">
                          Rejected: {doc.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setIsDocModalOpen(true);
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Inspect & Audit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 6: AUDIT HISTORY & DECISION TIMELINE */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Chronological Audit Trail & Decision Logs
            </h3>
            <p className="text-xs text-slate-500 mb-6 pb-3 border-b border-slate-100">
              Immutable record of all verification submissions, administrator reviews, and compliance actions.
            </p>

            {/* Combined Timeline */}
            <div className="space-y-4">
              {reviewHistory.length === 0 && auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No historical audit records found for this contractor.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {/* Review Decisions */}
                  {reviewHistory.map((rev) => (
                    <div key={rev.id} className="py-3 flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {rev.action} • {rev.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-slate-600 mt-0.5">
                          By: <span className="font-semibold text-slate-800">{rev.reviewerName}</span> • Status: <Badge variant="neutral" className="text-[10px]">{rev.status}</Badge>
                        </div>
                        {rev.reason && (
                          <div className="text-rose-700 font-medium text-[11px] mt-1">
                            Reason: {rev.reason}
                          </div>
                        )}
                        {rev.notes && (
                          <div className="text-slate-500 italic text-[11px] mt-0.5">
                            "{rev.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* System Audit Logs */}
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 flex items-start gap-3 opacity-90">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 font-mono text-[11px]">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Actor: {log.actorRole} ({log.actorId})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Sticky Bottom Administrative Decision Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Contractor Eligibility Decision:</span>
            <ContractorStatusBadge status={contractor.onboardingStatus} type="onboarding" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveDecision('APPROVE')}
              className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Approve Contractor
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDecision('REQUEST_CORRECTION')}
              className="border-amber-300 text-amber-800 hover:bg-amber-50"
              leftIcon={<AlertTriangle className="w-4 h-4" />}
            >
              Request Correction
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDecision('REJECT')}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveDecision('SUSPEND')}
              className="text-orange-700 hover:bg-orange-50"
            >
              Suspend
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveDecision('DEACTIVATE')}
              className="text-slate-500 hover:text-slate-700"
            >
              Deactivate
            </Button>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <ContractorDocumentViewerModal
        isOpen={isDocModalOpen}
        onClose={() => {
          setIsDocModalOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        contractorId={contractor.id}
        onDocumentUpdated={(updatedDoc) => {
          setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
          refreshHistories(contractor.id);
        }}
      />

      {/* Decision Modal */}
      <ContractorDecisionModal
        isOpen={!!activeDecision}
        onClose={() => setActiveDecision(null)}
        decisionType={activeDecision}
        contractor={contractor}
        onDecisionCompleted={(updated) => {
          if (updated) {
            setContractor(updated);
          }
          refreshHistories(contractor.id);
          setActionFeedback({
            type: 'success',
            message: `Decision successfully executed for ${contractor.businessName}.`,
          });
        }}
      />
    </div>
  );
};
