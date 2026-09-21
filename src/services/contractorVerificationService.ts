/**
 * You Want Services - Contractor Verification, Review & Approval Service
 * Phase 6 Architecture
 *
 * Implements:
 * - Independent verification status per category (Business, License, Insurance, Documents, Profile)
 * - Contractor lifecycle status transitions (NOT_STARTED, IN_PROGRESS, SUBMITTED, PENDING_REVIEW, ACTION_REQUIRED, APPROVED, REJECTED, SUSPENDED, DEACTIVATED)
 * - License review with Verification Method & California Foundation interface (LicenseVerificationProvider)
 * - Insurance review with policy & expiration tracking
 * - Expiration awareness engine (Valid, Expiring Soon, Expired with 30-day default)
 * - Objective profile completeness criteria (Complete vs. Missing)
 * - Secure document review workflow with rejection reasons & notes
 * - Administrative decision workflows (Approve, Request Correction, Reject, Suspend, Deactivate)
 * - Complete audit logging for all compliance actions
 * - Verification history tracking (immutable records)
 * - In-app contractor notifications
 * - Permission enforcement for administrative actors
 */

import {
  ContractorProfile,
  ContractorDocument,
  ContractorLicense,
  ContractorInsurance,
  ContractorVerification,
  VerificationReview,
  VerificationRequirement,
  VerificationCategory,
  VerificationCategoryStatus,
  VerificationMethod,
  ContractorOnboardingStatus,
  ContractorRejectionReason,
  DocumentReviewStatus,
  DocumentRejectionReason,
  AdminContractorPermission,
  User,
  AuditLog,
} from '../types/database';
import { contractorService } from './contractorService';
import { accountService } from './accountService';
import { auditLogger } from './auditLogger';
import { notificationService } from './notificationService';

// Storage keys
const STORAGE_VERIFICATION_REVIEWS_KEY = 'yws_verification_reviews_v6';
const STORAGE_VERIFICATION_REQUIREMENTS_KEY = 'yws_verification_reqs_v6';

// Expiration threshold
export const DEFAULT_EXPIRATION_THRESHOLD_DAYS = 30;

export type ExpirationStanding = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_PROVIDED';

export interface ExpirationCheckResult {
  standing: ExpirationStanding;
  daysRemaining: number | null;
  formattedText: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'neutral';
}

/**
 * Calculate expiration standing for licenses and insurance policies
 */
export function evaluateExpirationStanding(
  expirationDate?: string,
  thresholdDays: number = DEFAULT_EXPIRATION_THRESHOLD_DAYS
): ExpirationCheckResult {
  if (!expirationDate) {
    return {
      standing: 'NOT_PROVIDED',
      daysRemaining: null,
      formattedText: 'No expiration date recorded',
      badgeVariant: 'neutral',
    };
  }

  const targetDate = new Date(expirationDate);
  if (isNaN(targetDate.getTime())) {
    return {
      standing: 'NOT_PROVIDED',
      daysRemaining: null,
      formattedText: 'Invalid date format',
      badgeVariant: 'neutral',
    };
  }

  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      standing: 'EXPIRED',
      daysRemaining: diffDays,
      formattedText: `Expired (${Math.abs(diffDays)}d ago)`,
      badgeVariant: 'danger',
    };
  } else if (diffDays <= thresholdDays) {
    return {
      standing: 'EXPIRING_SOON',
      daysRemaining: diffDays,
      formattedText: `Expiring Soon (${diffDays}d left)`,
      badgeVariant: 'warning',
    };
  } else {
    return {
      standing: 'VALID',
      daysRemaining: diffDays,
      formattedText: `Valid (${diffDays}d remaining)`,
      badgeVariant: 'success',
    };
  }
}

// ============================================================================
// LICENSE VERIFICATION PROVIDER INTERFACE & CALIFORNIA FOUNDATION
// ============================================================================

export interface LicenseVerificationResult {
  verified: boolean;
  status: 'VERIFIED' | 'FAILED' | 'EXPIRED' | 'NOT_FOUND';
  provider: string;
  referenceId?: string;
  verificationTimestamp: string;
  notes?: string;
  rawResponse?: Record<string, unknown>;
  demoTag: string; // "DEMO VERIFICATION - Manual / Simulated"
}

export interface LicenseVerificationProvider {
  providerId: string;
  providerName: string;
  supportedStates: string[];
  verifyLicense(params: {
    licenseNumber: string;
    state: string;
    licenseType?: string;
    businessName?: string;
    adminNotes?: string;
  }): Promise<LicenseVerificationResult>;
}

/**
 * Manual License Lookup Provider
 * Records administrator lookup via state registry boards
 */
export class ManualReviewLicenseProvider implements LicenseVerificationProvider {
  public providerId = 'MANUAL_LOOKUP';
  public providerName = 'Administrative Manual Registry Lookup';
  public supportedStates = ['*'];

  public async verifyLicense(params: {
    licenseNumber: string;
    state: string;
    licenseType?: string;
    businessName?: string;
    adminNotes?: string;
  }): Promise<LicenseVerificationResult> {
    const timestamp = new Date().toISOString();
    return {
      verified: true,
      status: 'VERIFIED',
      provider: 'Administrative Manual Registry Lookup',
      referenceId: `manual-audit-${Date.now()}`,
      verificationTimestamp: timestamp,
      notes: params.adminNotes || `Manual registry verification logged for state ${params.state}.`,
      demoTag: 'DEMO VERIFICATION - Manual Lookup Simulated',
    };
  }
}

/**
 * California License Foundation Provider (CSLB Architecture Stub)
 * Prepared for future California State Contractors License Board (CSLB) official API integration.
 * In Demo Mode: Does NOT scrape or claim real validation. Clearly tagged as DEMO VERIFICATION.
 */
export class CaliforniaLicenseProviderFoundation implements LicenseVerificationProvider {
  public providerId = 'CALIFORNIA_CSLB_FOUNDATION';
  public providerName = 'California CSLB Licensing Interface Foundation';
  public supportedStates = ['CA'];

  public async verifyLicense(params: {
    licenseNumber: string;
    state: string;
    licenseType?: string;
    businessName?: string;
    adminNotes?: string;
  }): Promise<LicenseVerificationResult> {
    const timestamp = new Date().toISOString();
    const cleanNum = params.licenseNumber.trim().toUpperCase();

    // Structural validation for California contractor licenses (typically 6-8 digits)
    const isValidFormat = /^[A-Z0-9-]{4,12}$/.test(cleanNum);

    if (!isValidFormat) {
      return {
        verified: false,
        status: 'FAILED',
        provider: 'California CSLB Licensing Foundation',
        verificationTimestamp: timestamp,
        notes: `License format '${cleanNum}' does not conform to California CSLB classification structure.`,
        demoTag: 'DEMO VERIFICATION - Simulated Foundation Check',
      };
    }

    return {
      verified: true,
      status: 'VERIFIED',
      provider: 'California CSLB Licensing Foundation',
      referenceId: `cslb-ref-sim-${Date.now()}`,
      verificationTimestamp: timestamp,
      notes: `Verified against California licensing standards (Simulated in Demo Mode). Admin notes: ${params.adminNotes || 'None'}.`,
      demoTag: 'DEMO VERIFICATION - Simulated CSLB Foundation',
      rawResponse: {
        entityStatus: 'ACTIVE',
        workersCompCompliant: true,
        bondOnRecord: true,
      },
    };
  }
}

/**
 * Provider Registry
 */
export class LicenseVerificationProviderRegistry {
  private providers: Map<string, LicenseVerificationProvider> = new Map();

  constructor() {
    this.register(new ManualReviewLicenseProvider());
    this.register(new CaliforniaLicenseProviderFoundation());
  }

  public register(provider: LicenseVerificationProvider) {
    this.providers.set(provider.providerId, provider);
  }

  public getProvider(providerId: string): LicenseVerificationProvider | undefined {
    return this.providers.get(providerId);
  }

  public getProvidersForState(state: string): LicenseVerificationProvider[] {
    const list: LicenseVerificationProvider[] = [];
    this.providers.forEach((p) => {
      if (p.supportedStates.includes('*') || p.supportedStates.includes(state.toUpperCase())) {
        list.push(p);
      }
    });
    return list;
  }
}

export const licenseVerificationRegistry = new LicenseVerificationProviderRegistry();

// ============================================================================
// DEFAULT VERIFICATION REQUIREMENTS
// ============================================================================

export const INITIAL_VERIFICATION_REQUIREMENTS: VerificationRequirement[] = [
  {
    id: 'req-account',
    category: 'PROFILE',
    requirement: 'Account Complete',
    description: 'Contractor user account details, verified email & direct telephone recorded.',
    required: true,
    active: true,
  },
  {
    id: 'req-business',
    category: 'BUSINESS',
    requirement: 'Business Profile Complete',
    description: 'Legal business entity, dispatch contact, and verified physical address.',
    required: true,
    active: true,
  },
  {
    id: 'req-services',
    category: 'BUSINESS',
    requirement: 'Service Selection Complete',
    description: 'At least one primary trade service category assigned.',
    required: true,
    active: true,
  },
  {
    id: 'req-service-area',
    category: 'BUSINESS',
    requirement: 'Service Area Configured',
    description: 'Dispatch center ZIP code and coverage radius (miles) provided.',
    required: true,
    active: true,
  },
  {
    id: 'req-license',
    category: 'LICENSE',
    requirement: 'Trade License Verified',
    description: 'Active license number recorded, verified by authorized review and non-expired.',
    required: true,
    active: true,
  },
  {
    id: 'req-insurance',
    category: 'INSURANCE',
    requirement: 'General Liability Insurance Verified',
    description: 'Active commercial general liability policy verified with non-expired standing.',
    required: true,
    active: true,
  },
  {
    id: 'req-documents',
    category: 'DOCUMENTS',
    requirement: 'Credentials Documents Audited',
    description: 'All required trade license and insurance documents inspected and accepted.',
    required: true,
    active: true,
  },
  {
    id: 'req-admin-audit',
    category: 'OVERALL',
    requirement: 'Admin Review Completed',
    description: 'Compliance administrator has audited application and confirmed eligibility.',
    required: true,
    active: true,
  },
];

// ============================================================================
// OBJECTIVE PROFILE COMPLETION EVALUATION
// ============================================================================

export interface ObjectiveCheckItem {
  id: string;
  label: string;
  category: VerificationCategory;
  isComplete: boolean;
  details?: string;
}

export interface ObjectiveCompletionReport {
  isFullyComplete: boolean;
  completedCount: number;
  totalCount: number;
  items: ObjectiveCheckItem[];
  missingLabels: string[];
}

export function evaluateObjectiveProfileCompletion(
  user?: User | null,
  profile?: ContractorProfile | null,
  documents?: ContractorDocument[]
): ObjectiveCompletionReport {
  const items: ObjectiveCheckItem[] = [
    {
      id: 'acc-details',
      label: 'Account Information',
      category: 'PROFILE',
      isComplete: !!(user?.firstName && user?.lastName && user?.email && user?.phone),
      details: user?.email ? `${user.firstName} ${user.lastName} (${user.email})` : 'Missing details',
    },
    {
      id: 'biz-entity',
      label: 'Business Information',
      category: 'BUSINESS',
      isComplete: !!(profile?.businessName && profile?.businessType && profile?.address),
      details: profile?.businessName ? `${profile.businessName} (${profile.businessType || 'Entity'})` : 'Missing business name/address',
    },
    {
      id: 'trade-services',
      label: 'Service Selection',
      category: 'BUSINESS',
      isComplete: !!(profile?.serviceCategories && profile.serviceCategories.length > 0),
      details: profile?.serviceCategories?.length ? `${profile.serviceCategories.length} category/categories selected` : 'No services selected',
    },
    {
      id: 'dispatch-area',
      label: 'Service Territory',
      category: 'BUSINESS',
      isComplete: !!((profile?.primaryServiceZip || profile?.zipCode) && profile?.serviceRadiusMiles),
      details: profile?.primaryServiceZip ? `ZIP ${profile.primaryServiceZip} (${profile.serviceRadiusMiles || 25} mi radius)` : 'No service area provided',
    },
    {
      id: 'trade-license',
      label: 'License Information',
      category: 'LICENSE',
      isComplete: !!(profile?.licenseNumber && profile?.licenseState),
      details: profile?.licenseNumber ? `${profile.licenseState} License #${profile.licenseNumber}` : 'License details missing',
    },
    {
      id: 'gen-insurance',
      label: 'Insurance Information',
      category: 'INSURANCE',
      isComplete: !!(profile?.insuranceProvider && profile?.insurancePolicyNumber),
      details: profile?.insuranceProvider ? `${profile.insuranceProvider} (#${profile.insurancePolicyNumber})` : 'Insurance details missing',
    },
    {
      id: 'uploaded-docs',
      label: 'Required Documents',
      category: 'DOCUMENTS',
      isComplete: !!(documents && documents.length > 0),
      details: documents && documents.length > 0 ? `${documents.length} document(s) uploaded` : 'No documents uploaded',
    },
  ];

  const completedCount = items.filter((i) => i.isComplete).length;
  const missingLabels = items.filter((i) => !i.isComplete).map((i) => i.label);

  return {
    isFullyComplete: completedCount === items.length,
    completedCount,
    totalCount: items.length,
    items,
    missingLabels,
  };
}

// ============================================================================
// CONTRACTOR VERIFICATION SERVICE MANAGER
// ============================================================================

class ContractorVerificationService {
  private reviews: VerificationReview[] = [];
  private requirements: VerificationRequirement[] = [...INITIAL_VERIFICATION_REQUIREMENTS];

  constructor() {
    this.initStore();
  }

  private initStore() {
    try {
      const savedReviews = localStorage.getItem(STORAGE_VERIFICATION_REVIEWS_KEY);
      if (savedReviews) {
        this.reviews = JSON.parse(savedReviews);
      }

      const savedReqs = localStorage.getItem(STORAGE_VERIFICATION_REQUIREMENTS_KEY);
      if (savedReqs) {
        this.requirements = JSON.parse(savedReqs);
      }
    } catch (e) {
      console.warn('Failed to load verification state from localStorage', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_VERIFICATION_REVIEWS_KEY, JSON.stringify(this.reviews));
      localStorage.setItem(STORAGE_VERIFICATION_REQUIREMENTS_KEY, JSON.stringify(this.requirements));
    } catch (e) {
      console.warn('Failed to save verification state to localStorage', e);
    }
  }

  /**
   * Helper: Check if current administrative user has permission
   */
  public assertAdminPermission(actor: User | null | undefined, permission: AdminContractorPermission): void {
    if (!actor) {
      throw new Error('Authentication required to perform administrative action.');
    }
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new Error(`Unauthorized: User does not possess administrative privileges (${permission}).`);
    }
  }

  /**
   * Evaluates overall and category-specific verification status for a contractor
   */
  public evaluateContractorStatusMatrix(contractor: ContractorProfile): {
    businessStatus: VerificationCategoryStatus;
    licenseStatus: VerificationCategoryStatus;
    insuranceStatus: VerificationCategoryStatus;
    documentsStatus: VerificationCategoryStatus;
    profileStatus: VerificationCategoryStatus;
    overallStatus: ContractorOnboardingStatus;
  } {
    const docs = contractorService.getDocuments(contractor.id);

    // 1. Business Category
    let businessStatus: VerificationCategoryStatus = 'PENDING_REVIEW';
    if (!contractor.businessName || !contractor.address) {
      businessStatus = 'NOT_STARTED';
    } else if (contractor.verifications?.BUSINESS?.status) {
      businessStatus = contractor.verifications.BUSINESS.status;
    } else {
      businessStatus = 'SUBMITTED';
    }

    // 2. License Category
    let licenseStatus: VerificationCategoryStatus = 'NOT_STARTED';
    if (!contractor.licenseNumber) {
      licenseStatus = 'NOT_STARTED';
    } else {
      const exp = evaluateExpirationStanding(contractor.licenseExpiration);
      if (exp.standing === 'EXPIRED') {
        licenseStatus = 'EXPIRED';
      } else if (contractor.verifications?.LICENSE?.status) {
        licenseStatus = contractor.verifications.LICENSE.status;
      } else {
        licenseStatus = 'PENDING_REVIEW';
      }
    }

    // 3. Insurance Category
    let insuranceStatus: VerificationCategoryStatus = 'NOT_STARTED';
    if (!contractor.insurancePolicyNumber) {
      insuranceStatus = 'NOT_STARTED';
    } else {
      const exp = evaluateExpirationStanding(contractor.insuranceExpiration);
      if (exp.standing === 'EXPIRED') {
        insuranceStatus = 'EXPIRED';
      } else if (contractor.verifications?.INSURANCE?.status) {
        insuranceStatus = contractor.verifications.INSURANCE.status;
      } else {
        insuranceStatus = 'PENDING_REVIEW';
      }
    }

    // 4. Documents Category
    let documentsStatus: VerificationCategoryStatus = 'NOT_STARTED';
    if (docs.length === 0) {
      documentsStatus = 'NOT_STARTED';
    } else {
      const allAccepted = docs.every((d) => d.status === 'ACCEPTED');
      const anyRejected = docs.some((d) => d.status === 'REJECTED');
      if (anyRejected) {
        documentsStatus = 'FAILED';
      } else if (allAccepted) {
        documentsStatus = 'VERIFIED';
      } else {
        documentsStatus = 'PENDING_REVIEW';
      }
    }

    // 5. Profile Completeness Category
    const user = accountService.getUserById(contractor.userId);
    const objectiveReport = evaluateObjectiveProfileCompletion(user, contractor, docs);
    const profileStatus: VerificationCategoryStatus = objectiveReport.isFullyComplete
      ? 'VERIFIED'
      : 'PENDING_REVIEW';

    const overallStatus: ContractorOnboardingStatus = contractor.onboardingStatus || 'PENDING_REVIEW';

    return {
      businessStatus,
      licenseStatus,
      insuranceStatus,
      documentsStatus,
      profileStatus,
      overallStatus,
    };
  }

  // ============================================================================
  // DOCUMENT AUDIT ACTIONS
  // ============================================================================

  public reviewDocument(
    contractorId: string,
    documentId: string,
    params: {
      action: 'ACCEPT' | 'REJECT' | 'SET_UNDER_REVIEW';
      rejectionReason?: DocumentRejectionReason;
      reviewNotes?: string;
      reviewer: User;
    }
  ): { success: boolean; document?: ContractorDocument; message: string } {
    this.assertAdminPermission(params.reviewer, 'REVIEW_DOCUMENTS');

    const docs = contractorService.getDocuments(contractorId);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      return { success: false, message: 'Document not found.' };
    }

    const now = new Date().toISOString();
    let newStatus: DocumentReviewStatus = 'UNDER_REVIEW';

    if (params.action === 'ACCEPT') {
      newStatus = 'ACCEPTED';
      doc.status = 'ACCEPTED';
      doc.verificationStatus = 'VERIFIED';
      doc.rejectionReason = undefined;
    } else if (params.action === 'REJECT') {
      if (!params.rejectionReason) {
        return { success: false, message: 'A structured rejection reason is required to reject a document.' };
      }
      newStatus = 'REJECTED';
      doc.status = 'REJECTED';
      doc.verificationStatus = 'REJECTED';
      doc.rejectionReason = params.rejectionReason;
    } else {
      newStatus = 'UNDER_REVIEW';
      doc.status = 'UNDER_REVIEW';
      doc.verificationStatus = 'PENDING';
    }

    doc.reviewedBy = params.reviewer.id;
    doc.reviewedByName = `${params.reviewer.firstName} ${params.reviewer.lastName}`;
    doc.reviewedAt = now;
    doc.reviewNotes = params.reviewNotes;

    // Save document updates in contractorService
    contractorService.saveDocuments(contractorId, docs);

    // Record Verification Review entry
    const reviewEntry: VerificationReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      reviewerId: params.reviewer.id,
      reviewerName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      category: 'DOCUMENTS',
      action: params.action === 'ACCEPT' ? 'DOCUMENT_ACCEPTED' : 'DOCUMENT_REJECTED',
      status: newStatus,
      reason: params.rejectionReason,
      notes: params.reviewNotes,
      createdAt: now,
    };
    this.reviews.unshift(reviewEntry);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: params.reviewer.id,
      actorRole: params.reviewer.role,
      action: params.action === 'ACCEPT' ? 'DOCUMENT_AUDIT_ACCEPTED' : 'DOCUMENT_AUDIT_REJECTED',
      entityType: 'CONTRACTOR_DOCUMENT',
      entityId: documentId,
      details: {
        contractorId,
        fileName: doc.fileName,
        documentType: doc.documentType,
        action: params.action,
        rejectionReason: params.rejectionReason,
        notes: params.reviewNotes,
      },
      isDemo: true,
    });

    // Notify contractor if rejected
    const contractor = contractorService.getProfileById(contractorId);
    if (contractor && params.action === 'REJECT') {
      notificationService.notifyUser({
        userId: contractor.userId,
        title: 'Document Update Required',
        message: `Your document (${doc.fileName}) was reviewed and rejected. Reason: ${params.rejectionReason}. Please re-upload an updated copy.`,
        type: 'WARNING',
        link: '/contractor/profile',
      });
    }

    return {
      success: true,
      document: doc,
      message: `Document has been marked as ${newStatus}.`,
    };
  }

  // ============================================================================
  // LICENSE VERIFICATION ACTIONS
  // ============================================================================

  public reviewLicense(
    contractorId: string,
    params: {
      action: 'VERIFY' | 'FAIL' | 'MARK_EXPIRED' | 'REQUEST_CORRECTION';
      method: VerificationMethod;
      notes: string;
      reviewer: User;
    }
  ): { success: boolean; message: string; contractor?: ContractorProfile } {
    this.assertAdminPermission(params.reviewer, 'VERIFY_LICENSE');

    const contractor = contractorService.getProfileById(contractorId);
    if (!contractor) {
      return { success: false, message: 'Contractor record not found.' };
    }

    if (params.method === 'MANUAL_LOOKUP' && (!params.notes || params.notes.trim().length < 5)) {
      return { success: false, message: 'Manual verification requires explanatory notes of registry verification.' };
    }

    const now = new Date().toISOString();
    let newStatus: VerificationCategoryStatus = 'PENDING_REVIEW';

    switch (params.action) {
      case 'VERIFY':
        newStatus = 'VERIFIED';
        break;
      case 'FAIL':
        newStatus = 'FAILED';
        break;
      case 'MARK_EXPIRED':
        newStatus = 'EXPIRED';
        break;
      case 'REQUEST_CORRECTION':
        newStatus = 'PENDING_REVIEW';
        break;
    }

    // Update contractor profile verifications
    const updatedVerifications = {
      ...(contractor.verifications || {}),
      LICENSE: {
        id: `ver-lic-${Date.now()}`,
        contractorId,
        category: 'LICENSE' as VerificationCategory,
        status: newStatus,
        verificationMethod: params.method,
        verifiedBy: params.reviewer.id,
        verifiedByName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
        verifiedAt: now,
        notes: params.notes,
        expirationDate: contractor.licenseExpiration,
        createdAt: contractor.verifications?.LICENSE?.createdAt || now,
        updatedAt: now,
      },
    };

    contractorService.updateProfileInternal(contractor.userId, {
      verifications: updatedVerifications,
      verificationStatus: newStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
    });

    // Record review history
    const reviewEntry: VerificationReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      reviewerId: params.reviewer.id,
      reviewerName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      category: 'LICENSE',
      action: params.action,
      status: newStatus,
      notes: `[Method: ${params.method}] ${params.notes}`,
      createdAt: now,
    };
    this.reviews.unshift(reviewEntry);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: params.reviewer.id,
      actorRole: params.reviewer.role,
      action: `LICENSE_VERIFICATION_${params.action}`,
      entityType: 'CONTRACTOR_LICENSE',
      entityId: contractorId,
      details: {
        licenseNumber: contractor.licenseNumber,
        state: contractor.licenseState,
        action: params.action,
        method: params.method,
        notes: params.notes,
        newStatus,
      },
      isDemo: true,
    });

    return {
      success: true,
      message: `License verification status updated to ${newStatus}.`,
      contractor: contractorService.getProfileById(contractorId),
    };
  }

  // ============================================================================
  // INSURANCE VERIFICATION ACTIONS
  // ============================================================================

  public reviewInsurance(
    contractorId: string,
    params: {
      action: 'VERIFY' | 'FAIL' | 'MARK_EXPIRED' | 'REQUEST_CORRECTION';
      method: VerificationMethod;
      notes: string;
      reviewer: User;
    }
  ): { success: boolean; message: string; contractor?: ContractorProfile } {
    this.assertAdminPermission(params.reviewer, 'VERIFY_INSURANCE');

    const contractor = contractorService.getProfileById(contractorId);
    if (!contractor) {
      return { success: false, message: 'Contractor record not found.' };
    }

    if (params.method === 'MANUAL_LOOKUP' && (!params.notes || params.notes.trim().length < 5)) {
      return { success: false, message: 'Verification requires explanatory review notes.' };
    }

    const now = new Date().toISOString();
    let newStatus: VerificationCategoryStatus = 'PENDING_REVIEW';

    switch (params.action) {
      case 'VERIFY':
        newStatus = 'VERIFIED';
        break;
      case 'FAIL':
        newStatus = 'FAILED';
        break;
      case 'MARK_EXPIRED':
        newStatus = 'EXPIRED';
        break;
      case 'REQUEST_CORRECTION':
        newStatus = 'PENDING_REVIEW';
        break;
    }

    // Update contractor profile verifications
    const updatedVerifications = {
      ...(contractor.verifications || {}),
      INSURANCE: {
        id: `ver-ins-${Date.now()}`,
        contractorId,
        category: 'INSURANCE' as VerificationCategory,
        status: newStatus,
        verificationMethod: params.method,
        verifiedBy: params.reviewer.id,
        verifiedByName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
        verifiedAt: now,
        notes: params.notes,
        expirationDate: contractor.insuranceExpiration,
        createdAt: contractor.verifications?.INSURANCE?.createdAt || now,
        updatedAt: now,
      },
    };

    contractorService.updateProfileInternal(contractor.userId, {
      verifications: updatedVerifications,
    });

    // Record review history
    const reviewEntry: VerificationReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      reviewerId: params.reviewer.id,
      reviewerName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      category: 'INSURANCE',
      action: params.action,
      status: newStatus,
      notes: `[Method: ${params.method}] ${params.notes}`,
      createdAt: now,
    };
    this.reviews.unshift(reviewEntry);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: params.reviewer.id,
      actorRole: params.reviewer.role,
      action: `INSURANCE_VERIFICATION_${params.action}`,
      entityType: 'CONTRACTOR_INSURANCE',
      entityId: contractorId,
      details: {
        provider: contractor.insuranceProvider,
        policyNumber: contractor.insurancePolicyNumber,
        action: params.action,
        method: params.method,
        notes: params.notes,
        newStatus,
      },
      isDemo: true,
    });

    return {
      success: true,
      message: `Insurance verification status updated to ${newStatus}.`,
      contractor: contractorService.getProfileById(contractorId),
    };
  }

  // ============================================================================
  // ADMINISTRATIVE DECISION PIPELINE (APPROVE, CORRECTION, REJECT, SUSPEND, DEACTIVATE)
  // ============================================================================

  /**
   * Approve contractor for marketplace functionality
   */
  public approveContractor(
    contractorId: string,
    params: {
      reviewer: User;
      approvalNotes?: string;
    }
  ): { success: boolean; message: string; contractor?: ContractorProfile } {
    this.assertAdminPermission(params.reviewer, 'APPROVE_CONTRACTOR');

    const contractor = contractorService.getProfileById(contractorId);
    if (!contractor) {
      return { success: false, message: 'Contractor record not found.' };
    }

    const previousStatus = contractor.onboardingStatus || 'PENDING_REVIEW';
    const now = new Date().toISOString();

    // Update contractor profile
    const updated = contractorService.updateProfileInternal(contractor.userId, {
      onboardingStatus: 'APPROVED',
      verificationStatus: 'VERIFIED',
      overallVerificationStatus: 'VERIFIED',
      membershipStatus: 'ACTIVE',
      approvedAt: now,
      approvedBy: params.reviewer.id,
      approvedByName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      approvalNotes: params.approvalNotes || 'Full administrative approval granted.',
      // Clear previous correction request if resolved
      correctionRequest: undefined,
    });

    // Record review history
    const reviewEntry: VerificationReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      reviewerId: params.reviewer.id,
      reviewerName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      category: 'OVERALL',
      action: 'APPROVE',
      status: 'APPROVED',
      notes: params.approvalNotes || 'Application successfully audited and approved.',
      createdAt: now,
    };
    this.reviews.unshift(reviewEntry);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: params.reviewer.id,
      actorRole: params.reviewer.role,
      action: 'CONTRACTOR_APPROVED',
      entityType: 'CONTRACTOR_PROFILE',
      entityId: contractorId,
      details: {
        previousStatus,
        newStatus: 'APPROVED',
        approvedBy: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
        notes: params.approvalNotes,
      },
      isDemo: true,
    });

    // In-app notification to contractor
    notificationService.notifyUser({
      userId: contractor.userId,
      title: 'Contractor Account Approved!',
      message: 'Your contractor account has been approved. You are now authorized to receive matched customer requests.',
      type: 'SUCCESS',
      link: '/contractor/dashboard',
    });

    return {
      success: true,
      message: `${contractor.businessName} has been approved.`,
      contractor: updated.profile,
    };
  }

  /**
   * Request correction from contractor
   */
  public requestCorrection(
    contractorId: string,
    params: {
      reviewer: User;
      items: string[];
      instructions: string;
    }
  ): { success: boolean; message: string; contractor?: ContractorProfile } {
    this.assertAdminPermission(params.reviewer, 'MANAGE_CONTRACTORS');

    const contractor = contractorService.getProfileById(contractorId);
    if (!contractor) {
      return { success: false, message: 'Contractor record not found.' };
    }

    if (!params.items || params.items.length === 0) {
      return { success: false, message: 'Please select at least one item requiring correction.' };
    }

    if (!params.instructions || params.instructions.trim().length < 10) {
      return { success: false, message: 'Detailed instructions to the contractor are required (min 10 characters).' };
    }

    const previousStatus = contractor.onboardingStatus || 'PENDING_REVIEW';
    const now = new Date().toISOString();

    const correctionData = {
      items: params.items,
      instructions: params.instructions.trim(),
      requestedAt: now,
      requestedBy: params.reviewer.id,
      requestedByName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
    };

    const updated = contractorService.updateProfileInternal(contractor.userId, {
      onboardingStatus: 'ACTION_REQUIRED',
      correctionRequest: correctionData,
    });

    // Record review history
    const reviewEntry: VerificationReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      reviewerId: params.reviewer.id,
      reviewerName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      category: 'OVERALL',
      action: 'REQUEST_CORRECTION',
      status: 'ACTION_REQUIRED',
      correctionItems: params.items,
      notes: params.instructions,
      createdAt: now,
    };
    this.reviews.unshift(reviewEntry);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: params.reviewer.id,
      actorRole: params.reviewer.role,
      action: 'CONTRACTOR_CORRECTION_REQUESTED',
      entityType: 'CONTRACTOR_PROFILE',
      entityId: contractorId,
      details: {
        previousStatus,
        newStatus: 'ACTION_REQUIRED',
        items: params.items,
        instructions: params.instructions,
      },
      isDemo: true,
    });

    // In-app notification
    notificationService.notifyUser({
      userId: contractor.userId,
      title: 'Action Required: Information Requested',
      message: 'Additional information is required to continue your contractor onboarding. Please review the admin notice in your dashboard.',
      type: 'WARNING',
      link: '/contractor/dashboard',
    });

    return {
      success: true,
      message: 'Correction request dispatched to contractor.',
      contractor: updated.profile,
    };
  }

  /**
   * Reject contractor application
   */
  public rejectContractor(
    contractorId: string,
    params: {
      reviewer: User;
      reason: ContractorRejectionReason;
      notes: string;
    }
  ): { success: boolean; message: string; contractor?: ContractorProfile } {
    this.assertAdminPermission(params.reviewer, 'REJECT_CONTRACTOR');

    const contractor = contractorService.getProfileById(contractorId);
    if (!contractor) {
      return { success: false, message: 'Contractor record not found.' };
    }

    if (!params.reason) {
      return { success: false, message: 'A structured rejection reason is required.' };
    }

    const previousStatus = contractor.onboardingStatus || 'PENDING_REVIEW';
    const now = new Date().toISOString();

    const updated = contractorService.updateProfileInternal(contractor.userId, {
      onboardingStatus: 'REJECTED',
      rejectionReason: params.reason,
      rejectionNotes: params.notes,
      rejectedAt: now,
      rejectedBy: params.reviewer.id,
      rejectedByName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
    });

    // Record review history
    const reviewEntry: VerificationReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      reviewerId: params.reviewer.id,
      reviewerName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      category: 'OVERALL',
      action: 'REJECT',
      status: 'REJECTED',
      reason: params.reason,
      notes: params.notes,
      createdAt: now,
    };
    this.reviews.unshift(reviewEntry);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: params.reviewer.id,
      actorRole: params.reviewer.role,
      action: 'CONTRACTOR_REJECTED',
      entityType: 'CONTRACTOR_PROFILE',
      entityId: contractorId,
      details: {
        previousStatus,
        newStatus: 'REJECTED',
        reason: params.reason,
        notes: params.notes,
      },
      isDemo: true,
    });

    // In-app notification
    notificationService.notifyUser({
      userId: contractor.userId,
      title: 'Contractor Application Update',
      message: 'Your contractor application requires attention. Please review the information provided.',
      type: 'ALERT',
      link: '/contractor/dashboard',
    });

    return {
      success: true,
      message: `${contractor.businessName} has been rejected.`,
      contractor: updated.profile,
    };
  }

  /**
   * Suspend approved contractor
   */
  public suspendContractor(
    contractorId: string,
    params: {
      reviewer: User;
      reason: string;
    }
  ): { success: boolean; message: string; contractor?: ContractorProfile } {
    this.assertAdminPermission(params.reviewer, 'SUSPEND_CONTRACTOR');

    const contractor = contractorService.getProfileById(contractorId);
    if (!contractor) {
      return { success: false, message: 'Contractor record not found.' };
    }

    if (!params.reason || params.reason.trim().length < 5) {
      return { success: false, message: 'A specific reason for account suspension is required.' };
    }

    const previousStatus = contractor.onboardingStatus || 'APPROVED';
    const now = new Date().toISOString();

    const updated = contractorService.updateProfileInternal(contractor.userId, {
      onboardingStatus: 'SUSPENDED',
      membershipStatus: 'SUSPENDED',
      suspensionReason: params.reason.trim(),
      suspendedAt: now,
      suspendedBy: params.reviewer.id,
      suspendedByName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
    });

    // Record review history
    const reviewEntry: VerificationReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      reviewerId: params.reviewer.id,
      reviewerName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      category: 'OVERALL',
      action: 'SUSPEND',
      status: 'SUSPENDED',
      reason: params.reason,
      createdAt: now,
    };
    this.reviews.unshift(reviewEntry);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: params.reviewer.id,
      actorRole: params.reviewer.role,
      action: 'CONTRACTOR_SUSPENDED',
      entityType: 'CONTRACTOR_PROFILE',
      entityId: contractorId,
      details: {
        previousStatus,
        newStatus: 'SUSPENDED',
        reason: params.reason,
      },
      isDemo: true,
    });

    // In-app notification
    notificationService.notifyUser({
      userId: contractor.userId,
      title: 'Contractor Account Notice: Account Suspended',
      message: 'Your contractor account has been temporarily suspended. Please review the account notice for details.',
      type: 'ALERT',
      link: '/contractor/dashboard',
    });

    return {
      success: true,
      message: `${contractor.businessName} has been suspended.`,
      contractor: updated.profile,
    };
  }

  /**
   * Deactivate contractor account
   */
  public deactivateContractor(
    contractorId: string,
    params: {
      reviewer: User;
      reason: string;
    }
  ): { success: boolean; message: string; contractor?: ContractorProfile } {
    this.assertAdminPermission(params.reviewer, 'MANAGE_CONTRACTORS');

    const contractor = contractorService.getProfileById(contractorId);
    if (!contractor) {
      return { success: false, message: 'Contractor record not found.' };
    }

    if (!params.reason || params.reason.trim().length < 5) {
      return { success: false, message: 'A specific reason for account deactivation is required.' };
    }

    const previousStatus = contractor.onboardingStatus || 'IN_PROGRESS';
    const now = new Date().toISOString();

    const updated = contractorService.updateProfileInternal(contractor.userId, {
      onboardingStatus: 'DEACTIVATED',
      membershipStatus: 'INACTIVE',
      deactivationReason: params.reason.trim(),
      deactivatedAt: now,
      deactivatedBy: params.reviewer.id,
    });

    // Also deactivate the user record
    const user = accountService.getUserById(contractor.userId);
    if (user) {
      user.status = 'INACTIVE';
    }

    // Record review history
    const reviewEntry: VerificationReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      reviewerId: params.reviewer.id,
      reviewerName: `${params.reviewer.firstName} ${params.reviewer.lastName}`,
      category: 'OVERALL',
      action: 'DEACTIVATE',
      status: 'DEACTIVATED',
      reason: params.reason,
      createdAt: now,
    };
    this.reviews.unshift(reviewEntry);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: params.reviewer.id,
      actorRole: params.reviewer.role,
      action: 'CONTRACTOR_DEACTIVATED',
      entityType: 'CONTRACTOR_PROFILE',
      entityId: contractorId,
      details: {
        previousStatus,
        newStatus: 'DEACTIVATED',
        reason: params.reason,
      },
      isDemo: true,
    });

    return {
      success: true,
      message: `${contractor.businessName} has been deactivated.`,
      contractor: updated.profile,
    };
  }

  // ============================================================================
  // QUERY METHODS & AUDIT HISTORIES
  // ============================================================================

  public getVerificationHistory(contractorId: string): VerificationReview[] {
    return this.reviews.filter((r) => r.contractorId === contractorId);
  }

  public getRequirements(): VerificationRequirement[] {
    return this.requirements;
  }

  public getAuditLogsForContractor(contractorId: string): AuditLog[] {
    const all = auditLogger.getLogs(100);
    return all.filter((l) => {
      const details = l.details as Record<string, unknown> | undefined;
      return (
        l.entityId === contractorId ||
        details?.contractorId === contractorId ||
        (details?.entityId && details.entityId === contractorId)
      );
    });
  }
}

export const contractorVerificationService = new ContractorVerificationService();
