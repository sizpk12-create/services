/**
 * You Want Services - Customer Service Request Service
 * Phase 4 Architecture
 *
 * Implements:
 * - Persistent service requests with unique public IDs (YS-2026-XXXXXX)
 * - Safe file attachment validation & metadata storage
 * - Structured activities timeline for requests
 * - Customer privacy & strict authorization checks
 * - Draft creation and customer cancellation workflow
 * - In-app notification creation upon submission & cancellation
 * - Audit logging
 */

import {
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestUrgency,
  PreferredTimeOfDay,
  ScheduleFlexibility,
  ProblemStartTimeline,
  ServiceRequestAttachment,
  ServiceRequestActivity,
  User,
  CustomerProfile,
  Notification,
} from '../types/database';
import { INITIAL_SERVICE_REQUESTS, INITIAL_NOTIFICATIONS } from './mockData';
import { auditLogger } from './auditLogger';

export interface CreateServiceRequestInput {
  id?: string;
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
  preferredDate?: string;
  preferredTime?: PreferredTimeOfDay;
  specificTime?: string;
  flexibility?: ScheduleFlexibility;
  additionalNotes?: string;
  estimatedBudget?: string;
  attachments?: Omit<ServiceRequestAttachment, 'id' | 'serviceRequestId' | 'createdAt'>[];
}

const STORAGE_REQUESTS_KEY = 'yws_service_requests_v4';
const STORAGE_NOTIFICATIONS_KEY = 'yws_notifications_v4';
const STORAGE_COUNTER_KEY = 'yws_request_counter_v4';

class ServiceRequestService {
  private requests: Map<string, ServiceRequest> = new Map();
  private notifications: Notification[] = [];
  private currentSequence: number = 103;

  constructor() {
    this.initStore();
  }

  private initStore() {
    // 1. Seed demo requests
    INITIAL_SERVICE_REQUESTS.forEach((req) => {
      this.requests.set(req.id, { ...req });
    });

    // Seed demo notifications
    this.notifications = [...INITIAL_NOTIFICATIONS];

    // 2. Load from localStorage
    try {
      const savedCounter = localStorage.getItem(STORAGE_COUNTER_KEY);
      if (savedCounter) {
        this.currentSequence = parseInt(savedCounter, 10) || 103;
      }

      const savedRequests = localStorage.getItem(STORAGE_REQUESTS_KEY);
      if (savedRequests) {
        const parsed: ServiceRequest[] = JSON.parse(savedRequests);
        parsed.forEach((req) => {
          this.requests.set(req.id, req);
        });
      }

      const savedNotifs = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (savedNotifs) {
        const parsedNotifs: Notification[] = JSON.parse(savedNotifs);
        this.notifications = parsedNotifs;
      }
    } catch (err) {
      console.warn('Failed to load service requests from localStorage', err);
    }
  }

  private saveToStorage() {
    try {
      const requestsArray = Array.from(this.requests.values());
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requestsArray));
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_COUNTER_KEY, this.currentSequence.toString());
    } catch (err) {
      console.warn('Failed to save service requests to localStorage', err);
    }
  }

  /**
   * Generates a unique, formatted public request ID: YS-2026-000001
   */
  private generatePublicRequestId(): string {
    const year = 2026;
    const seq = this.currentSequence++;
    const padded = String(seq).padStart(6, '0');
    return `YS-${year}-${padded}`;
  }

  /**
   * Validates file upload constraints:
   * - Max 5MB
   * - JPG, JPEG, PNG, WebP only
   * - Rejects executables, scripts, HTML
   */
  public validateAttachmentFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_MIME_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `"${file.name}" exceeds the 5MB maximum file size limit.`,
      };
    }

    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());

    if (!hasValidExt && !hasValidMime) {
      return {
        valid: false,
        error: `"${file.name}" is not a supported image format. Please upload JPG, PNG, or WebP.`,
      };
    }

    // Explicit rejection of dangerous extensions
    const DANGEROUS = ['.exe', '.sh', '.bat', '.cmd', '.js', '.ts', '.html', '.htm', '.php', '.svg'];
    if (DANGEROUS.some((d) => lowerName.endsWith(d))) {
      return {
        valid: false,
        error: 'Unsupported or unsafe file type.',
      };
    }

    return { valid: true };
  }

  /**
   * Retrieve all requests belonging to a specific customer.
   * Authorization rule: Customers only see their own requests.
   */
  public getRequestsForCustomer(customerId: string): ServiceRequest[] {
    if (!customerId) return [];
    return Array.from(this.requests.values())
      .filter((r) => r.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Retrieve all requests for administrative inspection.
   */
  public getAllRequests(): ServiceRequest[] {
    return Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Retrieve a request by ID or Public Request ID with strict ownership validation.
   */
  public getRequestById(
    identifier: string,
    currentUserId?: string,
    currentUserRole?: string
  ): { authorized: boolean; request: ServiceRequest | null; reason?: string } {
    if (!identifier) {
      return { authorized: false, request: null, reason: 'Identifier is required.' };
    }

    const request = Array.from(this.requests.values()).find(
      (r) => r.id === identifier || r.publicRequestId === identifier
    );

    if (!request) {
      return { authorized: false, request: null, reason: 'Service request not found.' };
    }

    // Role-based check: Admins can inspect any request
    if (currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN') {
      return { authorized: true, request };
    }

    // Customer ownership validation:
    if (!currentUserId || request.customerId !== currentUserId) {
      return {
        authorized: false,
        request: null,
        reason: 'You are not authorized to view this service request.',
      };
    }

    return { authorized: true, request };
  }

  /**
   * Creates and submits a formal service request.
   */
  public createServiceRequest(
    input: CreateServiceRequestInput,
    currentUser: User,
    profile?: CustomerProfile
  ): { success: boolean; request?: ServiceRequest; error?: string } {
    if (!currentUser || currentUser.role !== 'CUSTOMER') {
      return {
        success: false,
        error: 'Only authenticated customers can submit service requests.',
      };
    }

    if (!input.categoryId) {
      return { success: false, error: 'Please select a service category.' };
    }

    if (!input.title || input.title.trim().length < 3) {
      return { success: false, error: 'Project title must be at least 3 characters.' };
    }

    if (!input.description || input.description.trim().length < 10) {
      return { success: false, error: 'Please provide a detailed description (at least 10 characters).' };
    }

    if (!input.address || !input.city || !input.state || !input.zipCode) {
      return { success: false, error: 'Complete service location address is required.' };
    }

    const requestId = input.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const publicId = this.generatePublicRequestId();
    const now = new Date().toISOString();

    const attachments: ServiceRequestAttachment[] = (input.attachments || []).map((att, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      serviceRequestId: requestId,
      fileName: att.fileName,
      fileReference: att.fileReference,
      fileType: att.fileType,
      fileSize: att.fileSize,
      createdAt: now,
    }));

    const activities: ServiceRequestActivity[] = [
      {
        id: `act-${Date.now()}-1`,
        serviceRequestId: requestId,
        activityType: 'REQUEST_SUBMITTED',
        description: 'Service request created and submitted.',
        createdAt: now,
        createdBy: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Customer',
        details: {
          category: input.categoryId,
          urgency: input.urgency,
        },
      },
    ];

    const newRequest: ServiceRequest = {
      id: requestId,
      publicRequestId: publicId,
      customerId: currentUser.id,
      categoryId: input.categoryId,
      serviceSubcategoryId: input.serviceSubcategoryId,
      title: input.title.trim(),
      description: input.description.trim(),
      urgency: input.urgency || 'FLEXIBLE',
      isUrgent: !!input.isUrgent,
      urgencyDetails: input.urgencyDetails?.trim(),
      problemStarted: input.problemStarted || 'NOT_APPLICABLE',
      address: input.address.trim(),
      unit: input.unit?.trim(),
      city: input.city.trim(),
      state: input.state.trim().toUpperCase(),
      zipCode: input.zipCode.trim(),
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime || 'FLEXIBLE',
      specificTime: input.specificTime,
      flexibility: input.flexibility || 'FLEXIBLE',
      additionalNotes: input.additionalNotes?.trim(),
      status: 'SUBMITTED',
      preferredScheduleDate: input.preferredDate,
      estimatedBudget: input.estimatedBudget,
      attachments,
      activities,
      isDemo: currentUser.isDemo || false,
      createdAt: now,
      updatedAt: now,
      submittedAt: now,
    };

    this.requests.set(newRequest.id, newRequest);

    // Create in-app customer notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Service Request Submitted',
      message: `Your service request ${publicId} has been submitted successfully.`,
      type: 'SUCCESS',
      read: false,
      link: 'customer-my-requests',
      isDemo: currentUser.isDemo || false,
      createdAt: now,
    };
    this.notifications.unshift(newNotif);

    // Audit log
    auditLogger.log({
      actorId: currentUser.id,
      actorRole: currentUser.role,
      action: 'SERVICE_REQUEST_SUBMITTED',
      entityType: 'SERVICE_REQUEST',
      entityId: newRequest.id,
      details: {
        publicRequestId: publicId,
        categoryId: input.categoryId,
        urgency: input.urgency,
      },
      isDemo: currentUser.isDemo || false,
    });

    this.saveToStorage();

    return { success: true, request: newRequest };
  }

  /**
   * Saves a draft service request for the customer.
   */
  public saveDraft(
    input: CreateServiceRequestInput,
    currentUser: User
  ): { success: boolean; request?: ServiceRequest; error?: string } {
    if (!currentUser || currentUser.role !== 'CUSTOMER') {
      return { success: false, error: 'Authentication required to save drafts.' };
    }

    const requestId = input.id || `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const publicId = this.generatePublicRequestId();
    const now = new Date().toISOString();

    const attachments: ServiceRequestAttachment[] = (input.attachments || []).map((att, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      serviceRequestId: requestId,
      fileName: att.fileName,
      fileReference: att.fileReference,
      fileType: att.fileType,
      fileSize: att.fileSize,
      createdAt: now,
    }));

    const activities: ServiceRequestActivity[] = [
      {
        id: `act-${Date.now()}-draft`,
        serviceRequestId: requestId,
        activityType: 'DRAFT_SAVED',
        description: 'Service request saved as draft.',
        createdAt: now,
        createdBy: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Customer',
      },
    ];

    const draftRequest: ServiceRequest = {
      id: requestId,
      publicRequestId: publicId,
      customerId: currentUser.id,
      categoryId: input.categoryId || 'cat-handyman',
      serviceSubcategoryId: input.serviceSubcategoryId,
      title: input.title?.trim() || 'Untitled Draft Request',
      description: input.description?.trim() || 'Draft details in progress.',
      urgency: input.urgency || 'FLEXIBLE',
      isUrgent: !!input.isUrgent,
      urgencyDetails: input.urgencyDetails?.trim(),
      problemStarted: input.problemStarted || 'NOT_APPLICABLE',
      address: input.address?.trim() || '',
      unit: input.unit?.trim(),
      city: input.city?.trim() || '',
      state: input.state?.trim() || '',
      zipCode: input.zipCode?.trim() || '',
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime || 'FLEXIBLE',
      specificTime: input.specificTime,
      flexibility: input.flexibility || 'FLEXIBLE',
      additionalNotes: input.additionalNotes?.trim(),
      status: 'DRAFT',
      attachments,
      activities,
      isDemo: currentUser.isDemo || false,
      createdAt: now,
      updatedAt: now,
    };

    this.requests.set(draftRequest.id, draftRequest);
    this.saveToStorage();

    return { success: true, request: draftRequest };
  }

  /**
   * Cancels an active or submitted service request.
   * Can only cancel if status is SUBMITTED or DRAFT.
   */
  public cancelServiceRequest(
    requestId: string,
    reason: string,
    notes: string,
    currentUser: User
  ): { success: boolean; request?: ServiceRequest; error?: string } {
    const existing = this.requests.get(requestId);
    if (!existing) {
      return { success: false, error: 'Service request not found.' };
    }

    // Ownership validation:
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      if (existing.customerId !== currentUser.id) {
        return { success: false, error: 'You are not authorized to cancel this request.' };
      }
    }

    // State validation: only SUBMITTED, UNDER_REVIEW, or DRAFT can be cancelled by customer
    const cancellableStatuses: ServiceRequestStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'DRAFT'];
    if (!cancellableStatuses.includes(existing.status)) {
      return {
        success: false,
        error: `Requests in "${existing.status}" status cannot be cancelled directly. Please contact support.`,
      };
    }

    const now = new Date().toISOString();
    const updatedActivities: ServiceRequestActivity[] = [
      ...(existing.activities || []),
      {
        id: `act-${Date.now()}-cancel`,
        serviceRequestId: requestId,
        activityType: 'REQUEST_CANCELLED',
        description: `Request cancelled by customer. Reason: ${reason}`,
        createdAt: now,
        createdBy: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Customer',
        details: { reason, notes },
      },
    ];

    const updatedRequest: ServiceRequest = {
      ...existing,
      status: 'CANCELLED',
      cancellationReason: reason,
      cancellationNotes: notes,
      cancelledAt: now,
      updatedAt: now,
      activities: updatedActivities,
    };

    this.requests.set(requestId, updatedRequest);

    // Add notification
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: existing.customerId,
      title: 'Service Request Cancelled',
      message: `Your request ${existing.publicRequestId} has been cancelled.`,
      type: 'WARNING',
      read: false,
      link: 'customer-my-requests',
      isDemo: currentUser.isDemo || false,
      createdAt: now,
    };
    this.notifications.unshift(notif);

    // Audit log
    auditLogger.log({
      actorId: currentUser.id,
      actorRole: currentUser.role,
      action: 'SERVICE_REQUEST_CANCELLED',
      entityType: 'SERVICE_REQUEST',
      entityId: requestId,
      details: {
        publicRequestId: existing.publicRequestId,
        reason,
        notes,
      },
      isDemo: currentUser.isDemo || false,
    });

    this.saveToStorage();

    return { success: true, request: updatedRequest };
  }

  /**
   * Notifications management for the user
   */
  public getNotificationsForUser(userId: string): Notification[] {
    if (!userId) return [];
    return this.notifications.filter((n) => n.userId === userId);
  }

  public markNotificationRead(notificationId: string): void {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      this.saveToStorage();
    }
  }

  /**
   * Updates status of service request from lead lifecycle transitions
   */
  public updateStatus(
    requestId: string,
    status: ServiceRequestStatus | string,
    actorName?: string,
    notes?: string
  ): boolean {
    const existing = this.requests.get(requestId);
    if (!existing) return false;

    // Validate or cast status safely
    existing.status = status as ServiceRequestStatus;
    existing.updatedAt = new Date().toISOString();

    if (actorName) {
      if (!existing.activities) {
        existing.activities = [];
      }
      existing.activities.push({
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        serviceRequestId: requestId,
        activityType: 'STATUS_CHANGED',
        description: notes || `Request status transitioned to ${status}`,
        createdAt: new Date().toISOString(),
        createdBy: actorName,
      });
    }

    this.requests.set(requestId, existing);
    this.saveToStorage();
    return true;
  }
}

export const serviceRequestService = new ServiceRequestService();
