/**
 * You Want Services - Database & Data Model Foundation
 * Phase 1 Architecture
 */

export type UserRole =
  | 'CUSTOMER'
  | 'CONTRACTOR'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  // Extensible role architecture reserved for future phases
  | 'DISPATCHER'
  | 'CALL_CENTER_AGENT'
  | 'SALES_REP'
  | 'VERIFICATION_SPECIALIST'
  | 'FINANCE_STAFF'
  | 'SUPPORT_STAFF';

export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'INACTIVE';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  isDemo?: boolean;
  // Authentication, security & consent metadata
  passwordHash?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  privacyVersion?: string;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  preferredContactMethod?: 'PHONE' | 'EMAIL' | 'SMS';
  serviceInterests?: string[];
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  serviceRequestNotifications?: boolean;
  marketingCommunications?: boolean;
  onboardingCompleted?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type VerificationStatus = 'UNVERIFIED' | 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
export type MembershipStatus =
  | 'INACTIVE'
  | 'ACTIVE'
  | 'TRIAL'
  | 'SUSPENDED'
  | 'NOT_SUBSCRIBED'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'REGISTRATION_INCOMPLETE'
  | 'PENDING_ONBOARDING';

export type ContractorBusinessType =
  | 'Sole Proprietor'
  | 'LLC'
  | 'Corporation'
  | 'Partnership'
  | 'Other';

export type ContractorOnboardingStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'ACTION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type VerificationCategoryStatus =
  | 'NOT_STARTED'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'FAILED'
  | 'EXPIRED'
  | 'NOT_APPLICABLE';

export type VerificationCategory = 'BUSINESS' | 'LICENSE' | 'INSURANCE' | 'DOCUMENTS' | 'PROFILE';

export type VerificationMethod =
  | 'DOCUMENT_REVIEW'
  | 'MANUAL_LOOKUP'
  | 'EXTERNAL_API'
  | 'ADMIN_CONFIRMATION'
  | 'OTHER';

export type DocumentReviewStatus = 'UPLOADED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type DocumentRejectionReason =
  | 'Document unreadable'
  | 'Missing information'
  | 'Expired'
  | 'Incorrect document type'
  | 'Information does not match'
  | 'Other';

export type ContractorRejectionReason =
  | 'Missing information'
  | 'Invalid information'
  | 'Required documentation missing'
  | 'Documentation unacceptable'
  | 'License issue'
  | 'Insurance issue'
  | 'Business information incomplete'
  | 'Other';

export type AdminContractorPermission =
  | 'VIEW_CONTRACTORS'
  | 'REVIEW_DOCUMENTS'
  | 'VERIFY_LICENSE'
  | 'VERIFY_INSURANCE'
  | 'APPROVE_CONTRACTOR'
  | 'REJECT_CONTRACTOR'
  | 'SUSPEND_CONTRACTOR'
  | 'MANAGE_CONTRACTORS';

export interface ContractorBusinessHoursDay {
  closed: boolean;
  is24Hours?: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface ContractorPrimaryContact {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface ContractorProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType?: ContractorBusinessType;
  businessPhone?: string;
  businessEmail?: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  businessDescription?: string;
  yearsInBusiness?: number | string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  primaryServiceZip?: string;
  serviceRadius?: number | string;
  serviceRadiusMiles: number;
  specificZipCodes?: string[];
  serviceCategories: string[]; // Primary Category IDs
  primaryServiceCategory?: string;
  profileLogo?: string;
  primaryContact?: ContractorPrimaryContact;
  businessHours?: Record<string, ContractorBusinessHoursDay>;
  preferredContactMethods?: ('PHONE' | 'EMAIL' | 'SMS')[];
  licenseNumber?: string;
  licenseType?: string;
  licenseState?: string;
  licenseExpiration?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceCoverageType?: string;
  insuranceExpiration?: string;
  verificationStatus: VerificationStatus;
  membershipStatus: MembershipStatus;
  onboardingStatus?: ContractorOnboardingStatus;
  profileCompletion?: number;
  rating: number;
  reviewCount: number;
  // Verification details & lifecycle metadata
  verifications?: Partial<Record<VerificationCategory, ContractorVerification>>;
  overallVerificationStatus?: VerificationCategoryStatus;
  correctionRequest?: {
    items: string[];
    instructions: string;
    requestedAt: string;
    requestedBy: string;
    requestedByName?: string;
  };
  rejectionReason?: ContractorRejectionReason;
  rejectionNotes?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspendedByName?: string;
  approvalNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  deactivationReason?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorService {
  id: string;
  contractorId: string;
  serviceCategoryId: string;
  serviceSubcategoryId?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface ContractorServiceArea {
  id: string;
  contractorId: string;
  zipCode: string;
  city: string;
  state: string;
  radius: number;
  createdAt: string;
}

export interface ContractorLicense {
  id: string;
  contractorId: string;
  licenseType: string;
  licenseNumber: string;
  issuingState: string;
  expirationDate: string;
  verificationStatus: VerificationCategoryStatus | 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationMethod?: VerificationMethod;
  verifiedBy?: string;
  verifiedByName?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorInsurance {
  id: string;
  contractorId: string;
  provider: string;
  policyNumber: string;
  coverageType: string;
  expirationDate: string;
  verificationStatus: VerificationCategoryStatus | 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationMethod?: VerificationMethod;
  verifiedBy?: string;
  verifiedByName?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorDocument {
  id: string;
  contractorId: string;
  documentType: 'BUSINESS_LICENSE' | 'CONTRACTOR_LICENSE' | 'CERTIFICATE_OF_INSURANCE' | 'OTHER';
  fileName: string;
  fileReference: string; // Data URL or storage reference
  fileType: string;
  fileSize: number;
  verificationStatus: 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  status?: DocumentReviewStatus;
  rejectionReason?: DocumentRejectionReason;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

export interface ContractorVerification {
  id: string;
  contractorId: string;
  category: VerificationCategory;
  status: VerificationCategoryStatus;
  verificationMethod?: VerificationMethod;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  expirationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationReview {
  id: string;
  contractorId: string;
  reviewerId: string;
  reviewerName: string;
  category: VerificationCategory | 'OVERALL';
  action:
    | 'APPROVE'
    | 'REJECT'
    | 'REQUEST_CORRECTION'
    | 'SUSPEND'
    | 'DEACTIVATE'
    | 'VERIFY'
    | 'FAIL'
    | 'MARK_EXPIRED'
    | 'DOCUMENT_ACCEPTED'
    | 'DOCUMENT_REJECTED';
  status: string;
  reason?: string;
  notes?: string;
  correctionItems?: string[];
  createdAt: string;
}

export interface VerificationRequirement {
  id: string;
  category: VerificationCategory | 'OVERALL';
  requirement: string;
  required: boolean;
  active: boolean;
  description?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Lucide icon identifier
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSubcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  displayOrder: number;
}

export type ServiceRequestUrgency = 'EMERGENCY' | 'WITHIN_24_HOURS' | 'THIS_WEEK' | 'FLEXIBLE';

export type ServiceRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MATCHING'
  | 'CONTRACTOR_CONTACTED'
  | 'CONTRACTOR_ACCEPTED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CLOSED';

export type PreferredTimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FLEXIBLE';
export type ScheduleFlexibility = 'FLEXIBLE' | 'SOMEWHAT_FLEXIBLE' | 'SPECIFIC_TIME';
export type ProblemStartTimeline =
  | 'TODAY'
  | 'FEW_DAYS'
  | 'PAST_WEEK'
  | 'OVER_WEEK'
  | 'NOT_APPLICABLE';

export interface ServiceRequestAttachment {
  id: string;
  serviceRequestId: string;
  fileName: string;
  fileReference: string; // sanitized data URL or safe storage reference
  fileType: string;
  fileSize: number; // bytes
  createdAt: string;
}

export type ServiceRequestActivityType =
  | 'DRAFT_SAVED'
  | 'REQUEST_SUBMITTED'
  | 'REQUEST_UPDATED'
  | 'REQUEST_CANCELLED'
  | 'ATTACHMENT_ADDED'
  | 'STATUS_CHANGED';

export interface ServiceRequestActivity {
  id: string;
  serviceRequestId: string;
  activityType: ServiceRequestActivityType;
  description: string;
  createdAt: string;
  createdBy: string;
  details?: Record<string, any>;
}

export interface ServiceRequest {
  id: string;
  publicRequestId: string; // Format: YS-2026-000001
  customerId: string;
  categoryId: string;
  serviceSubcategoryId?: string;
  title: string;
  description: string;
  urgency: ServiceRequestUrgency;
  isUrgent?: boolean;
  urgencyDetails?: string;
  problemStarted?: ProblemStartTimeline;
  address: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  preferredDate?: string; // YYYY-MM-DD
  preferredTime?: PreferredTimeOfDay;
  specificTime?: string;
  flexibility?: ScheduleFlexibility;
  additionalNotes?: string;
  status: ServiceRequestStatus;
  preferredScheduleDate?: string; // Backward compatibility
  estimatedBudget?: string;
  attachments?: ServiceRequestAttachment[];
  activities?: ServiceRequestActivity[];
  cancellationReason?: string;
  cancellationNotes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  cancelledAt?: string;
}

export type LeadStatus =
  | 'NEW'
  | 'AVAILABLE'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CONTACT_PENDING'
  | 'CONTACTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'CLOSED'
  | 'PURCHASED'; // Kept for backward compatibility

export type LeadDeclineReason =
  | 'OUTSIDE_SERVICE_AREA'
  | 'SERVICE_NOT_OFFERED'
  | 'SCHEDULE_UNAVAILABLE'
  | 'TOO_FAR'
  | 'PROJECT_NOT_SUITABLE'
  | 'OTHER';

export type LeadAssignmentType = 'MANUAL' | 'RULE_BASED' | 'DEMO';

export type LeadAssignmentStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'REASSIGNED';

export interface LeadAssignment {
  id: string;
  leadId: string;
  contractorId: string;
  contractorName?: string;
  businessName?: string;
  assignedBy: string; // admin user ID or 'SYSTEM'
  assignmentType: LeadAssignmentType;
  status: LeadAssignmentStatus;
  assignedAt: string;
  viewedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: LeadDeclineReason | string;
  declineNotes?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadActivityAction =
  | 'LEAD_CREATED'
  | 'LEAD_ASSIGNED'
  | 'LEAD_VIEWED'
  | 'LEAD_ACCEPTED'
  | 'LEAD_DECLINED'
  | 'LEAD_REASSIGNED'
  | 'STATUS_CHANGED'
  | 'NOTE_ADDED'
  | 'LEAD_COMPLETED'
  | 'LEAD_CLOSED';

export interface LeadActivity {
  id: string;
  leadId: string;
  actorId: string;
  actorName?: string;
  actorRole: UserRole | 'SYSTEM';
  action: LeadActivityAction;
  description: string;
  details?: string;
  timestamp?: string;
  previousStatus?: LeadStatus;
  newStatus?: LeadStatus;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export type ContractorLeadNoteCategory =
  | 'CUSTOMER_CONTACTED'
  | 'ESTIMATE_REQUESTED'
  | 'APPOINTMENT_SCHEDULED'
  | 'FOLLOW_UP_NEEDED'
  | 'WAITING_FOR_CUSTOMER'
  | 'GENERAL';

export interface ContractorLeadNote {
  id: string;
  leadId: string;
  contractorId: string;
  authorName: string;
  category?: ContractorLeadNoteCategory;
  note: string;
  createdAt: string;
}

export interface AdminLeadNote {
  id: string;
  leadId: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  leadNumber: string; // Format: YL-2026-000001
  serviceRequestId: string;
  customerId: string;
  contractorId?: string; // Currently active/accepted contractor
  serviceCategoryId: string;
  categoryId?: string; // Compatibility alias
  serviceSubcategoryId?: string;
  serviceSubcategory?: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType?: string;
  projectDescription: string;
  estimatedBudget?: string;
  requestedDate?: string;
  requestedTimeWindow?: string;
  urgency: ServiceRequestUrgency;
  status: LeadStatus;
  assignmentStatus?: LeadAssignmentStatus;
  leadPrice: number; // Stored centrally for future monetization ($20 standard)
  isDemo?: boolean;

  // Masked or Unlocked Customer Information
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  fullAddress?: string;

  // Assigned Contractor info
  assignedContractorName?: string;
  assignedBusinessName?: string;

  // Timestamps & Outcomes
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: LeadDeclineReason | string;
  declineNotes?: string;
  completedAt?: string;
  purchasedAt?: string; // For backward compatibility

  // Rich timeline & notes
  assignments?: LeadAssignment[];
  activities?: LeadActivity[];
  privateNotes?: ContractorLeadNote[];
  adminNotes?: AdminLeadNote[];

  createdAt: string;
  updatedAt: string;
}

export const MEMBERSHIP_PRICE = 29.99;
export const DEFAULT_LEAD_PRICE = 20.00;

export type JobStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Job {
  id: string;
  serviceRequestId: string;
  customerId: string;
  contractorId: string;
  leadId?: string;
  title: string;
  status: JobStatus;
  scheduledDate?: string;
  completedDate?: string;
  agreedPrice?: number;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentType = 'LEAD_FEE' | 'MEMBERSHIP' | 'SERVICE_PAYMENT';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';

export interface Payment {
  id: string;
  jobId?: string;
  leadId?: string;
  payerId: string;
  payeeId?: string;
  payerName?: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  description?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  isDemo: boolean;
  createdAt: string;
}

export type RefundReason =
  | 'INVALID_CONTACT_INFO'
  | 'OUTSIDE_SERVICE_AREA'
  | 'DUPLICATE_LEAD'
  | 'CUSTOMER_CANCELLED'
  | 'SERVICE_MISMATCH'
  | 'OTHER';

export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RefundRequest {
  id: string;
  paymentId: string;
  contractorId: string;
  contractorName: string;
  businessName?: string;
  leadId?: string;
  leadNumber?: string;
  amount: number;
  reason: RefundReason;
  reasonDetails?: string;
  status: RefundStatus;
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolutionNotes?: string;
}

export type MembershipTier = 'STARTER' | 'PRO' | 'ELITE';

export interface ContractorSubscription {
  id: string;
  contractorId: string;
  contractorName: string;
  businessName: string;
  tier: MembershipTier;
  monthlyFee: number;
  leadDiscountPercent: number;
  monthlyFreeLeads: number;
  remainingFreeLeads: number;
  status: MembershipStatus;
  startedAt: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodMasked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPricingRule {
  categoryId: string;
  categoryName: string;
  basePrice: number;
  rushMultiplier: number;
  emergencyMultiplier: number;
  isActive: boolean;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  isDemo?: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  link?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  isDemo: boolean;
  createdAt: string;
}
