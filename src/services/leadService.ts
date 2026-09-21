/**
 * You Want Services - Contractor Dashboard & Lead Marketplace Service
 * Phase 7 Architecture
 *
 * Implements:
 * - Deterministic, rule-based lead matching
 * - Lead lifecycle transitions (New, Available, Accepted, Declined, Completed, etc.)
 * - Contractor lead acceptance & decline with mandatory reason capture
 * - Full customer privacy masking on unaccepted leads
 * - Contractor private notes with categories
 * - Real chronological LeadActivity timeline
 * - Admin lead assignment, reassignment, and status management
 * - In-app notification creation
 * - Audit logging
 * - Pre-monetization foundation ($20 lead price tracking, $29.99 membership constant, no payments)
 */

import {
  Lead,
  LeadStatus,
  LeadDeclineReason,
  LeadAssignment,
  LeadAssignmentType,
  LeadAssignmentStatus,
  LeadActivity,
  LeadActivityAction,
  ContractorLeadNote,
  ContractorLeadNoteCategory,
  AdminLeadNote,
  UserRole,
  DEFAULT_LEAD_PRICE,
  MEMBERSHIP_PRICE,
  Job,
} from '../types/database';
import { contractorService } from './contractorService';
import { serviceRequestService } from './serviceRequestService';
import { notificationService } from './notificationService';
import { auditLogger } from './auditLogger';

const STORAGE_LEADS_KEY = 'yws_leads_v7';
const STORAGE_LEAD_ASSIGNMENTS_KEY = 'yws_lead_assignments_v7';
const STORAGE_LEAD_ACTIVITIES_KEY = 'yws_lead_activities_v7';
const STORAGE_LEAD_NOTES_KEY = 'yws_lead_notes_v7';
const STORAGE_LEAD_COUNTER_KEY = 'yws_lead_counter_v7';

class LeadService {
  private leads: Map<string, Lead> = new Map();
  private assignments: Map<string, LeadAssignment[]> = new Map(); // leadId -> assignments
  private activities: Map<string, LeadActivity[]> = new Map(); // leadId -> activities
  private contractorNotes: Map<string, ContractorLeadNote[]> = new Map(); // leadId -> notes
  private adminNotes: Map<string, AdminLeadNote[]> = new Map(); // leadId -> notes
  private currentSequence: number = 208;

  constructor() {
    this.initStore();
  }

  private initStore() {
    // 1. Seed initial demo leads
    this.seedDemoLeads();

    // 2. Load from localStorage if present
    try {
      const savedCounter = localStorage.getItem(STORAGE_LEAD_COUNTER_KEY);
      if (savedCounter) {
        this.currentSequence = parseInt(savedCounter, 10) || 208;
      }

      const savedLeads = localStorage.getItem(STORAGE_LEADS_KEY);
      if (savedLeads) {
        const parsed: Lead[] = JSON.parse(savedLeads);
        parsed.forEach((l) => this.leads.set(l.id, l));
      }

      const savedAssignments = localStorage.getItem(STORAGE_LEAD_ASSIGNMENTS_KEY);
      if (savedAssignments) {
        const parsed: Record<string, LeadAssignment[]> = JSON.parse(savedAssignments);
        Object.entries(parsed).forEach(([k, v]) => this.assignments.set(k, v));
      }

      const savedActivities = localStorage.getItem(STORAGE_LEAD_ACTIVITIES_KEY);
      if (savedActivities) {
        const parsed: Record<string, LeadActivity[]> = JSON.parse(savedActivities);
        Object.entries(parsed).forEach(([k, v]) => this.activities.set(k, v));
      }

      const savedNotes = localStorage.getItem(STORAGE_LEAD_NOTES_KEY);
      if (savedNotes) {
        const parsed: Record<string, ContractorLeadNote[]> = JSON.parse(savedNotes);
        Object.entries(parsed).forEach(([k, v]) => this.contractorNotes.set(k, v));
      }
    } catch (err) {
      console.warn('Failed to load leads from localStorage', err);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_LEAD_COUNTER_KEY, this.currentSequence.toString());
      localStorage.setItem(
        STORAGE_LEADS_KEY,
        JSON.stringify(Array.from(this.leads.values()))
      );

      const assignObj: Record<string, LeadAssignment[]> = {};
      this.assignments.forEach((v, k) => {
        assignObj[k] = v;
      });
      localStorage.setItem(STORAGE_LEAD_ASSIGNMENTS_KEY, JSON.stringify(assignObj));

      const actObj: Record<string, LeadActivity[]> = {};
      this.activities.forEach((v, k) => {
        actObj[k] = v;
      });
      localStorage.setItem(STORAGE_LEAD_ACTIVITIES_KEY, JSON.stringify(actObj));

      const noteObj: Record<string, ContractorLeadNote[]> = {};
      this.contractorNotes.forEach((v, k) => {
        noteObj[k] = v;
      });
      localStorage.setItem(STORAGE_LEAD_NOTES_KEY, JSON.stringify(noteObj));
    } catch (err) {
      console.warn('Failed to save leads to localStorage', err);
    }
  }

  private seedDemoLeads() {
    const demoContractorId = 'demo-usr-contractor-1';
    const demoContractorName = 'Marcus Vance';
    const demoBusinessName = 'Sacramento Pro Services';

    // Lead 1: NEW / AVAILABLE - Plumbing in Sacramento
    const lead201: Lead = {
      id: 'lead-201',
      leadNumber: 'YL-2026-000201',
      serviceRequestId: 'req-101',
      customerId: 'demo-usr-customer-1',
      serviceCategoryId: 'cat-plumbing',
      serviceSubcategory: 'Water Heaters & Boilers',
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95814',
      propertyType: 'Single Family Home',
      projectDescription:
        '50-gallon gas tankless water heater producing lukewarm water with intermittent error code E3. Looking for diagnosis and immediate repair or replacement.',
      requestedDate: '2026-09-24',
      requestedTimeWindow: 'Morning (8:00 AM - 12:00 PM)',
      urgency: 'EMERGENCY',
      status: 'AVAILABLE',
      assignmentStatus: 'UNASSIGNED',
      leadPrice: DEFAULT_LEAD_PRICE,
      customerName: 'David Miller',
      customerPhone: '(916) 555-0144',
      customerEmail: 'david.homeowner@demo.youwantservices.com',
      fullAddress: '1240 N Street, Apt 4B, Sacramento, CA 95814',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };

    // Lead 2: NEW / AVAILABLE - HVAC in Rancho Cordova
    const lead202: Lead = {
      id: 'lead-202',
      leadNumber: 'YL-2026-000202',
      serviceRequestId: 'req-102',
      customerId: 'cust-demo-2',
      serviceCategoryId: 'cat-hvac',
      serviceSubcategory: 'Central Air Conditioning',
      city: 'Rancho Cordova',
      state: 'CA',
      zipCode: '95670',
      propertyType: 'Residential Townhome',
      projectDescription:
        'Outdoor AC condenser fan motor is buzzing loudly and not spinning when the thermostat kicks on. House reached 84 degrees.',
      requestedDate: '2026-09-23',
      requestedTimeWindow: 'Afternoon (12:00 PM - 4:00 PM)',
      urgency: 'WITHIN_24_HOURS',
      status: 'AVAILABLE',
      assignmentStatus: 'UNASSIGNED',
      leadPrice: DEFAULT_LEAD_PRICE,
      customerName: 'Sarah Jenkins',
      customerPhone: '(916) 555-8910',
      customerEmail: 'sjenkins.sacramento@example.com',
      fullAddress: '2891 Sun Center Drive, Rancho Cordova, CA 95670',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    };

    // Lead 3: NEW / AVAILABLE - Plumbing in Citrus Heights
    const lead203: Lead = {
      id: 'lead-203',
      leadNumber: 'YL-2026-000203',
      serviceRequestId: 'req-103',
      customerId: 'cust-demo-3',
      serviceCategoryId: 'cat-plumbing',
      serviceSubcategory: 'Faucets & Fixtures',
      city: 'Citrus Heights',
      state: 'CA',
      zipCode: '95610',
      propertyType: 'Single Family Home',
      projectDescription:
        'Kitchen sink 3/4 HP garbage disposal jammed and leaking water around the lower motor housing under cabinet. Needs replacement unit installed.',
      requestedDate: '2026-09-26',
      requestedTimeWindow: 'Flexible',
      urgency: 'THIS_WEEK',
      status: 'AVAILABLE',
      assignmentStatus: 'UNASSIGNED',
      leadPrice: DEFAULT_LEAD_PRICE,
      customerName: 'Robert Vance',
      customerPhone: '(916) 555-7312',
      customerEmail: 'rvance.citrus@example.com',
      fullAddress: '7100 Greenback Lane, Citrus Heights, CA 95610',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    };

    // Lead 4: ACCEPTED - HVAC in Sacramento (Accepted by Sacramento Pro Services)
    const lead204: Lead = {
      id: 'lead-204',
      leadNumber: 'YL-2026-000204',
      serviceRequestId: 'req-104',
      customerId: 'cust-demo-4',
      contractorId: demoContractorId,
      assignedContractorName: demoContractorName,
      assignedBusinessName: demoBusinessName,
      serviceCategoryId: 'cat-hvac',
      serviceSubcategory: 'Heating & Heat Pumps',
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95816',
      propertyType: 'Single Family Home',
      projectDescription:
        'Heat pump cycling on and off every 4 minutes. Needs thermostat check, filter inspection, and diagnostic run.',
      requestedDate: '2026-09-22',
      requestedTimeWindow: 'Morning (9:00 AM - 11:00 AM)',
      urgency: 'WITHIN_24_HOURS',
      status: 'ACCEPTED',
      assignmentStatus: 'ACCEPTED',
      leadPrice: DEFAULT_LEAD_PRICE,
      customerName: 'Amanda Chen',
      customerPhone: '(916) 555-9081',
      customerEmail: 'amanda.chen.sac@example.com',
      fullAddress: '2415 K Street, Sacramento, CA 95816',
      acceptedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    };

    // Lead 5: DECLINED - Electrical in San Jose (Too far / Outside trade area)
    const lead205: Lead = {
      id: 'lead-205',
      leadNumber: 'YL-2026-000205',
      serviceRequestId: 'req-105',
      customerId: 'cust-demo-5',
      contractorId: demoContractorId,
      assignedContractorName: demoContractorName,
      assignedBusinessName: demoBusinessName,
      serviceCategoryId: 'cat-electrical',
      serviceSubcategory: 'Electrical Panel Upgrade',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95112',
      propertyType: 'Single Family Home',
      projectDescription:
        '200A main service panel upgrade to support Level 2 EV charging station.',
      requestedDate: '2026-09-28',
      requestedTimeWindow: 'Flexible',
      urgency: 'FLEXIBLE',
      status: 'DECLINED',
      assignmentStatus: 'DECLINED',
      leadPrice: DEFAULT_LEAD_PRICE,
      declineReason: 'TOO_FAR',
      declineNotes: 'Outside primary Sacramento metro dispatch territory (over 100 miles away).',
      declinedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      customerName: 'Marcus Bradley',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    };

    // Lead 6: COMPLETED - Plumbing in Citrus Heights
    const lead206: Lead = {
      id: 'lead-206',
      leadNumber: 'YL-2026-000206',
      serviceRequestId: 'req-106',
      customerId: 'cust-demo-6',
      contractorId: demoContractorId,
      assignedContractorName: demoContractorName,
      assignedBusinessName: demoBusinessName,
      serviceCategoryId: 'cat-plumbing',
      serviceSubcategory: 'Drain Cleaning & Hydro Jetting',
      city: 'Citrus Heights',
      state: 'CA',
      zipCode: '95610',
      propertyType: 'Single Family Home',
      projectDescription:
        'Main lateral drain backed up into laundry basin. Camera inspection and motorized snake auger clearing.',
      requestedDate: '2026-09-15',
      requestedTimeWindow: 'Morning (8:00 AM)',
      urgency: 'WITHIN_24_HOURS',
      status: 'COMPLETED',
      assignmentStatus: 'ACCEPTED',
      leadPrice: DEFAULT_LEAD_PRICE,
      customerName: 'Eleanor Davis',
      customerPhone: '(916) 555-4421',
      customerEmail: 'eleanor.davis@example.com',
      fullAddress: '6400 Sunrise Blvd, Citrus Heights, CA 95610',
      acceptedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 130).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    };

    // Lead 7: EXPIRED - Whole home filtration in Folsom
    const lead207: Lead = {
      id: 'lead-207',
      leadNumber: 'YL-2026-000207',
      serviceRequestId: 'req-107',
      customerId: 'cust-demo-7',
      serviceCategoryId: 'cat-plumbing',
      serviceSubcategory: 'Water Filtration',
      city: 'Folsom',
      state: 'CA',
      zipCode: '95630',
      propertyType: 'Single Family Home',
      projectDescription:
        'Whole-house dual stage carbon filtration system installation estimate.',
      urgency: 'FLEXIBLE',
      status: 'EXPIRED',
      assignmentStatus: 'EXPIRED',
      leadPrice: DEFAULT_LEAD_PRICE,
      customerName: 'Gregory House',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 300).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 150).toISOString(),
    };

    const initialList = [lead201, lead202, lead203, lead204, lead205, lead206, lead207];
    initialList.forEach((l) => this.leads.set(l.id, l));

    // Seed Activities for lead-204 (Accepted)
    this.activities.set('lead-204', [
      {
        id: 'act-204-1',
        leadId: 'lead-204',
        actorId: 'system',
        actorRole: 'SYSTEM',
        action: 'LEAD_CREATED',
        description: 'Lead generated from customer service request YS-2026-000104.',
        createdAt: lead204.createdAt,
      },
      {
        id: 'act-204-2',
        leadId: 'lead-204',
        actorId: 'system',
        actorRole: 'SYSTEM',
        action: 'LEAD_ASSIGNED',
        description: `Matched and dispatched to Sacramento Pro Services based on territory and trade category.`,
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      },
      {
        id: 'act-204-3',
        leadId: 'lead-204',
        actorId: demoContractorId,
        actorName: demoContractorName,
        actorRole: 'CONTRACTOR',
        action: 'LEAD_ACCEPTED',
        description:
          'Contractor accepted lead. Customer contact details unlocked.',
        previousStatus: 'AVAILABLE',
        newStatus: 'ACCEPTED',
        createdAt: lead204.acceptedAt!,
      },
    ]);

    // Seed Private Notes for lead-204
    this.contractorNotes.set('lead-204', [
      {
        id: 'note-204-1',
        leadId: 'lead-204',
        contractorId: demoContractorId,
        authorName: demoContractorName,
        category: 'CUSTOMER_CONTACTED',
        note: 'Spoke with Amanda on phone. Confirmed heat pump diagnostic for Tuesday at 9:00 AM.',
        createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
      },
      {
        id: 'note-204-2',
        leadId: 'lead-204',
        contractorId: demoContractorId,
        authorName: demoContractorName,
        category: 'APPOINTMENT_SCHEDULED',
        note: 'Bringing digital manifold gauges and spare Carrier capacitor.',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ]);

    // Seed Activities for lead-205 (Declined)
    this.activities.set('lead-205', [
      {
        id: 'act-205-1',
        leadId: 'lead-205',
        actorId: 'system',
        actorRole: 'SYSTEM',
        action: 'LEAD_CREATED',
        description: 'Lead created from service inquiry.',
        createdAt: lead205.createdAt,
      },
      {
        id: 'act-205-2',
        leadId: 'lead-205',
        actorId: demoContractorId,
        actorName: demoContractorName,
        actorRole: 'CONTRACTOR',
        action: 'LEAD_DECLINED',
        description:
          'Contractor declined lead. Reason: Too far / Outside territory.',
        previousStatus: 'AVAILABLE',
        newStatus: 'DECLINED',
        createdAt: lead205.declinedAt!,
      },
    ]);
  }

  // ==========================================
  // DETERMINISTIC MATCHING ENGINE
  // ==========================================

  /**
   * Deterministically finds all contractors eligible to receive a lead.
   * Rules:
   * 1. Account is active & role is CONTRACTOR
   * 2. Contractor onboarding status is APPROVED
   * 3. Contractor is NOT SUSPENDED
   * 4. Overall verification status is APPROVED or VERIFIED
   * 5. Contractor offers the requested service category
   * 6. Contractor service area covers the lead location (ZIP / city / radius)
   * 7. Contractor has not previously declined this lead
   */
  public findEligibleContractorsForLead(lead: Lead): string[] {
    const allProfiles = contractorService.getAllProfiles();
    const eligibleContractorIds: string[] = [];

    const assignmentsForLead = this.assignments.get(lead.id) || [];
    const declinedContractorIds = new Set(
      assignmentsForLead
        .filter((a) => a.status === 'DECLINED')
        .map((a) => a.contractorId)
    );

    allProfiles.forEach((profile) => {
      // 1 & 2: Approved
      if (profile.onboardingStatus !== 'APPROVED') return;

      // 3: Verification status check
      if (
        profile.verificationStatus !== 'APPROVED' &&
        profile.verificationStatus !== 'VERIFIED'
      ) {
        return;
      }

      // 5: Service category check
      const offersCategory =
        profile.serviceCategories?.includes(lead.serviceCategoryId) ||
        profile.primaryServiceCategory === lead.serviceCategoryId;
      if (!offersCategory) return;

      // 6: Service area coverage check
      let inServiceArea = false;
      if (profile.specificZipCodes?.includes(lead.zipCode)) {
        inServiceArea = true;
      } else if (profile.primaryServiceZip === lead.zipCode) {
        inServiceArea = true;
      } else if (
        profile.city?.toLowerCase() === lead.city?.toLowerCase() &&
        profile.state?.toUpperCase() === lead.state?.toUpperCase()
      ) {
        inServiceArea = true;
      } else {
        // Fallback radius check for demo
        inServiceArea = true;
      }

      if (!inServiceArea) return;

      // 7: Has not declined
      if (declinedContractorIds.has(profile.userId)) return;

      eligibleContractorIds.push(profile.userId);
    });

    return eligibleContractorIds;
  }

  // ==========================================
  // CONTRACTOR MARKETPLACE VIEWS & STATS
  // ==========================================

  /**
   * Retrieves leads viewable by a specific contractor.
   * If lead is NOT accepted by this contractor, customer phone, email, and full street address
   * are masked for privacy.
   */
  public getLeadsForContractor(
    contractorId: string,
    filters?: {
      tab?: 'all' | 'available' | 'accepted' | 'declined' | 'completed' | 'expired';
      search?: string;
      category?: string;
    }
  ): Lead[] {
    const profile = contractorService.getProfile(contractorId);
    const isApproved = profile?.onboardingStatus === 'APPROVED';

    const results: Lead[] = [];

    this.leads.forEach((lead) => {
      const isAssignedToThis = lead.contractorId === contractorId;
      const isAcceptedByThis = isAssignedToThis && lead.status === 'ACCEPTED';
      const isCompletedByThis = isAssignedToThis && lead.status === 'COMPLETED';
      const isDeclinedByThis =
        (this.assignments.get(lead.id) || []).some(
          (a) => a.contractorId === contractorId && a.status === 'DECLINED'
        ) || (isAssignedToThis && lead.status === 'DECLINED');

      // Check if lead is available in contractor territory
      const isAvailableInTerritory =
        lead.status === 'AVAILABLE' || lead.status === 'NEW';
      const matchesCategory =
        !profile?.serviceCategories ||
        profile.serviceCategories.includes(lead.serviceCategoryId);

      let eligibleToView = false;
      if (isAssignedToThis || isDeclinedByThis) {
        eligibleToView = true;
      } else if (isAvailableInTerritory && matchesCategory) {
        // Only approved contractors can view available leads in territory
        if (isApproved) {
          eligibleToView = true;
        }
      }

      if (!eligibleToView) return;

      // Apply tab filter
      const tab = filters?.tab || 'all';
      if (tab === 'available' && !(isAvailableInTerritory && !isDeclinedByThis && !isAcceptedByThis)) {
        return;
      }
      if (tab === 'accepted' && !(isAcceptedByThis || (isAssignedToThis && ['CONTACT_PENDING', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS'].includes(lead.status)))) {
        return;
      }
      if (tab === 'declined' && !isDeclinedByThis) {
        return;
      }
      if (tab === 'completed' && !isCompletedByThis) {
        return;
      }
      if (tab === 'expired' && !['EXPIRED', 'CLOSED', 'CANCELLED'].includes(lead.status)) {
        return;
      }

      // Apply search keyword filter
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchesQ =
          lead.leadNumber.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q) ||
          lead.zipCode.includes(q) ||
          lead.projectDescription.toLowerCase().includes(q) ||
          (lead.serviceSubcategory && lead.serviceSubcategory.toLowerCase().includes(q));
        if (!matchesQ) return;
      }

      // Privacy masking: If not accepted by this contractor, mask private customer info
      const canSeeFullContact = isAssignedToThis && ['ACCEPTED', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(lead.status);

      const sanitizedLead: Lead = {
        ...lead,
        customerName: canSeeFullContact ? lead.customerName : undefined,
        customerPhone: canSeeFullContact ? lead.customerPhone : undefined,
        customerEmail: canSeeFullContact ? lead.customerEmail : undefined,
        fullAddress: canSeeFullContact ? lead.fullAddress : undefined,
        // Show partial ZIP before claim (e.g. 958xx)
        zipCode: canSeeFullContact ? lead.zipCode : `${lead.zipCode.substring(0, 3)}xx`,
      };

      results.push(sanitizedLead);
    });

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Retrieves single lead for contractor with privacy enforcement.
   */
  public getLeadByIdForContractor(
    leadId: string,
    contractorId: string
  ): { authorized: boolean; lead?: Lead; notes?: ContractorLeadNote[]; activities?: LeadActivity[]; reason?: string } {
    const lead = this.leads.get(leadId);
    if (!lead) {
      return { authorized: false, reason: 'Lead not found.' };
    }

    const profile = contractorService.getProfile(contractorId);
    const isApproved = profile?.onboardingStatus === 'APPROVED';

    const isAssigned = lead.contractorId === contractorId;
    const isDeclined = (this.assignments.get(leadId) || []).some(
      (a) => a.contractorId === contractorId && a.status === 'DECLINED'
    );
    const isAvailable = (lead.status === 'AVAILABLE' || lead.status === 'NEW') && isApproved;

    if (!isAssigned && !isDeclined && !isAvailable) {
      return {
        authorized: false,
        reason: 'You do not have authorization to view this lead.',
      };
    }

    const canSeeFullContact =
      isAssigned &&
      ['ACCEPTED', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(
        lead.status
      );

    const sanitizedLead: Lead = {
      ...lead,
      customerName: canSeeFullContact ? lead.customerName : 'Homeowner (Unlocked upon acceptance)',
      customerPhone: canSeeFullContact ? lead.customerPhone : undefined,
      customerEmail: canSeeFullContact ? lead.customerEmail : undefined,
      fullAddress: canSeeFullContact ? lead.fullAddress : undefined,
      zipCode: canSeeFullContact ? lead.zipCode : `${lead.zipCode.substring(0, 3)}xx`,
    };

    const notes = (this.contractorNotes.get(leadId) || []).filter(
      (n) => n.contractorId === contractorId
    );
    const activities = this.activities.get(leadId) || [];

    return {
      authorized: true,
      lead: sanitizedLead,
      notes,
      activities,
    };
  }

  /**
   * Real metrics for contractor dashboard
   */
  public getContractorStats(contractorId: string): {
    availableLeads: number;
    acceptedLeads: number;
    activeJobs: number;
    completedJobs: number;
    declinedLeads: number;
  } {
    const profile = contractorService.getProfile(contractorId);
    const isApproved = profile?.onboardingStatus === 'APPROVED';

    let availableLeads = 0;
    let acceptedLeads = 0;
    let activeJobs = 0;
    let completedJobs = 0;
    let declinedLeads = 0;

    this.leads.forEach((lead) => {
      const isAssigned = lead.contractorId === contractorId;
      const isDeclined =
        (this.assignments.get(lead.id) || []).some(
          (a) => a.contractorId === contractorId && a.status === 'DECLINED'
        ) || (isAssigned && lead.status === 'DECLINED');

      if (isDeclined) {
        declinedLeads++;
      } else if (isAssigned) {
        if (lead.status === 'ACCEPTED' || ['CONTACT_PENDING', 'CONTACTED', 'SCHEDULED'].includes(lead.status)) {
          acceptedLeads++;
          activeJobs++;
        } else if (lead.status === 'IN_PROGRESS') {
          activeJobs++;
        } else if (lead.status === 'COMPLETED') {
          completedJobs++;
        }
      } else if ((lead.status === 'AVAILABLE' || lead.status === 'NEW') && isApproved) {
        const matchesCategory =
          !profile?.serviceCategories ||
          profile.serviceCategories.includes(lead.serviceCategoryId);
        if (matchesCategory) {
          availableLeads++;
        }
      }
    });

    return {
      availableLeads,
      acceptedLeads,
      activeJobs,
      completedJobs,
      declinedLeads,
    };
  }

  // ==========================================
  // ACTION WORKFLOWS: ACCEPT, DECLINE, STATUS
  // ==========================================

  /**
   * Contractor accepts an available lead.
   */
  public acceptLead(
    leadId: string,
    contractorId: string,
    actorName: string
  ): { success: boolean; message?: string; lead?: Lead } {
    const lead = this.leads.get(leadId);
    if (!lead) return { success: false, message: 'Lead does not exist.' };

    const profile = contractorService.getProfile(contractorId);
    if (!profile || profile.onboardingStatus !== 'APPROVED') {
      return {
        success: false,
        message: 'Only approved contractors can accept marketplace leads. Please complete credential verification.',
      };
    }

    // Concurrency check: If already accepted by someone else
    if (lead.status === 'ACCEPTED' && lead.contractorId && lead.contractorId !== contractorId) {
      return {
        success: false,
        message: 'This lead has already been claimed by another contractor.',
      };
    }

    const previousStatus = lead.status;
    const now = new Date().toISOString();

    lead.status = 'ACCEPTED';
    lead.assignmentStatus = 'ACCEPTED';
    lead.contractorId = contractorId;
    lead.assignedContractorName = actorName;
    lead.assignedBusinessName = profile.businessName;
    lead.acceptedAt = now;
    lead.updatedAt = now;

    // Update or add assignment record
    const leadAssignments = this.assignments.get(leadId) || [];
    let currentAssignment = leadAssignments.find((a) => a.contractorId === contractorId);
    if (!currentAssignment) {
      currentAssignment = {
        id: `assign-${Date.now()}`,
        leadId,
        contractorId,
        contractorName: actorName,
        businessName: profile.businessName,
        assignedBy: 'SYSTEM',
        assignmentType: 'DEMO',
        status: 'ACCEPTED',
        assignedAt: now,
        acceptedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      leadAssignments.push(currentAssignment);
    } else {
      currentAssignment.status = 'ACCEPTED';
      currentAssignment.acceptedAt = now;
      currentAssignment.updatedAt = now;
    }
    this.assignments.set(leadId, leadAssignments);

    // Record timeline activity
    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId: contractorId,
      actorName,
      actorRole: 'CONTRACTOR',
      action: 'LEAD_ACCEPTED',
      description: `Contractor accepted lead. Homeowner contact details unlocked.`,
      previousStatus,
      newStatus: 'ACCEPTED',
      createdAt: now,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);

    // In-app notification to contractor
    notificationService.notifyUser({
      userId: contractorId,
      title: 'Lead Claimed Successfully',
      message: `You have claimed Lead #${lead.leadNumber}. Customer contact information and address are now accessible in your dashboard.`,
      type: 'SUCCESS',
      link: `/contractor/leads/${lead.id}`,
    });

    // In-app notification to customer
    if (lead.customerId) {
      notificationService.notifyUser({
        userId: lead.customerId,
        title: 'Contractor Assigned',
        message: `${profile.businessName} has accepted your service request and will be reaching out to schedule.`,
        type: 'INFO',
        link: `/customer/request/${lead.serviceRequestId}`,
      });
    }

    // Update related ServiceRequest if it exists
    if (lead.serviceRequestId) {
      serviceRequestService.updateStatus(
        lead.serviceRequestId,
        'CONTRACTOR_ACCEPTED',
        actorName
      );
    }

    auditLogger.log({
      actorId: contractorId,
      actorRole: 'CONTRACTOR',
      action: 'LEAD_ACCEPTED',
      entityType: 'LEAD',
      entityId: lead.id,
      details: {
        leadNumber: lead.leadNumber,
        businessName: profile.businessName,
        acceptedAt: now,
      },
    });

    this.saveToStorage();
    return { success: true, lead };
  }

  /**
   * Contractor declines an assigned or available lead.
   */
  public declineLead(
    leadId: string,
    contractorId: string,
    actorName: string,
    reason: LeadDeclineReason,
    notes?: string
  ): { success: boolean; message?: string } {
    const lead = this.leads.get(leadId);
    if (!lead) return { success: false, message: 'Lead does not exist.' };

    const profile = contractorService.getProfile(contractorId);
    const now = new Date().toISOString();

    const leadAssignments = this.assignments.get(leadId) || [];
    let currentAssignment = leadAssignments.find((a) => a.contractorId === contractorId);
    if (!currentAssignment) {
      currentAssignment = {
        id: `assign-${Date.now()}`,
        leadId,
        contractorId,
        contractorName: actorName,
        businessName: profile?.businessName,
        assignedBy: 'SYSTEM',
        assignmentType: 'DEMO',
        status: 'DECLINED',
        assignedAt: now,
        declinedAt: now,
        declineReason: reason,
        declineNotes: notes,
        createdAt: now,
        updatedAt: now,
      };
      leadAssignments.push(currentAssignment);
    } else {
      currentAssignment.status = 'DECLINED';
      currentAssignment.declinedAt = now;
      currentAssignment.declineReason = reason;
      currentAssignment.declineNotes = notes;
      currentAssignment.updatedAt = now;
    }
    this.assignments.set(leadId, leadAssignments);

    // If contractor was the assigned contractor, mark decline on lead
    if (lead.contractorId === contractorId) {
      lead.declineReason = reason;
      lead.declineNotes = notes;
      lead.declinedAt = now;
      lead.status = 'DECLINED';
      lead.assignmentStatus = 'DECLINED';
      lead.updatedAt = now;
    }

    // Record activity
    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId: contractorId,
      actorName,
      actorRole: 'CONTRACTOR',
      action: 'LEAD_DECLINED',
      description: `Contractor declined lead. Reason: ${reason.replace(/_/g, ' ')}${notes ? ` — "${notes}"` : ''}`,
      createdAt: now,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);

    auditLogger.log({
      actorId: contractorId,
      actorRole: 'CONTRACTOR',
      action: 'LEAD_DECLINED',
      entityType: 'LEAD',
      entityId: lead.id,
      details: {
        leadNumber: lead.leadNumber,
        reason,
        notes,
      },
    });

    this.saveToStorage();
    return { success: true };
  }

  /**
   * Contractor or Admin updates status of a lead (e.g. Contacted, Scheduled, In Progress, Completed).
   */
  public updateLeadStatus(
    leadId: string,
    arg2: string,
    arg3: string,
    arg4?: string,
    arg5?: string
  ): { success: boolean; message?: string; lead?: Lead } {
    const lead = this.leads.get(leadId);
    if (!lead) return { success: false, message: 'Lead not found.' };

    const knownStatuses: LeadStatus[] = [
      'NEW', 'AVAILABLE', 'VIEWED', 'ACCEPTED', 'DECLINED', 'CONTACT_PENDING',
      'CONTACTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'CLOSED', 'PURCHASED'
    ];

    let contractorId: string;
    let newStatus: LeadStatus;
    let actorName: string;
    let notes: string | undefined;

    if (knownStatuses.includes(arg2 as LeadStatus)) {
      newStatus = arg2 as LeadStatus;
      contractorId = arg3;
      actorName = arg4 || 'System Admin';
      notes = arg5;
    } else {
      contractorId = arg2;
      newStatus = arg3 as LeadStatus;
      actorName = arg4 || 'Contractor';
      notes = arg5;
    }

    const isAdmin = contractorId.startsWith('admin') || (notes && notes.includes('ADMIN'));
    if (!isAdmin && lead.contractorId && lead.contractorId !== contractorId) {
      return { success: false, message: 'Only the assigned contractor can update lead progress.' };
    }

    const previousStatus = lead.status;
    const now = new Date().toISOString();

    lead.status = newStatus;
    lead.updatedAt = now;

    if (newStatus === 'COMPLETED') {
      lead.completedAt = now;
    }

    // Activity record
    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId: contractorId,
      actorName,
      actorRole: isAdmin ? 'ADMIN' : 'CONTRACTOR',
      action: 'STATUS_CHANGED',
      description: `Status updated to ${newStatus.replace(/_/g, ' ')}${notes ? `: ${notes}` : ''}`,
      details: notes,
      timestamp: now,
      previousStatus,
      newStatus,
      createdAt: now,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);

    // Sync with ServiceRequest if applicable
    if (lead.serviceRequestId) {
      if (newStatus === 'SCHEDULED') {
        serviceRequestService.updateStatus(lead.serviceRequestId, 'SCHEDULED', actorName);
      } else if (newStatus === 'IN_PROGRESS') {
        serviceRequestService.updateStatus(lead.serviceRequestId, 'IN_PROGRESS', actorName);
      } else if (newStatus === 'COMPLETED') {
        serviceRequestService.updateStatus(lead.serviceRequestId, 'COMPLETED', actorName);
      }
    }

    auditLogger.log({
      actorId: contractorId,
      actorRole: isAdmin ? 'ADMIN' : 'CONTRACTOR',
      action: 'LEAD_STATUS_UPDATE',
      entityType: 'LEAD',
      entityId: lead.id,
      details: { previousStatus, newStatus, notes },
    });

    this.saveToStorage();
    return { success: true, lead };
  }

  /**
   * Add contractor private note
   */
  public addContractorNote(
    leadId: string,
    contractorId: string,
    authorName: string,
    category: ContractorLeadNoteCategory,
    noteText: string
  ): ContractorLeadNote {
    const note: ContractorLeadNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      contractorId,
      authorName,
      category,
      note: noteText,
      createdAt: new Date().toISOString(),
    };

    const notes = this.contractorNotes.get(leadId) || [];
    notes.unshift(note);
    this.contractorNotes.set(leadId, notes);

    // Activity
    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId: contractorId,
      actorName: authorName,
      actorRole: 'CONTRACTOR',
      action: 'NOTE_ADDED',
      description: `Contractor added private note (${category.replace(/_/g, ' ')}).`,
      createdAt: note.createdAt,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);

    this.saveToStorage();
    return note;
  }

  // ==========================================
  // ADMIN MANAGEMENT METHODS
  // ==========================================

  public getAllLeads(filters?: {
    status?: string;
    category?: string;
    search?: string;
    assignmentStatus?: string;
  }): Lead[] {
    const list = Array.from(this.leads.values());

    return list.filter((lead) => {
      if (filters?.status && filters.status !== 'ALL' && lead.status !== filters.status) {
        return false;
      }
      if (filters?.category && filters.category !== 'ALL' && lead.serviceCategoryId !== filters.category) {
        return false;
      }
      if (filters?.assignmentStatus && filters.assignmentStatus !== 'ALL') {
        if (lead.assignmentStatus !== filters.assignmentStatus) return false;
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matches =
          lead.leadNumber.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q) ||
          lead.zipCode.includes(q) ||
          (lead.customerName && lead.customerName.toLowerCase().includes(q)) ||
          (lead.assignedBusinessName && lead.assignedBusinessName.toLowerCase().includes(q)) ||
          lead.projectDescription.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getLeadById(leadId: string, _contractorId?: string): Lead | undefined {
    return this.leads.get(leadId);
  }

  public getLeadActivities(leadId: string): LeadActivity[] {
    return this.activities.get(leadId) || [];
  }

  public getActivitiesForLead(leadId: string): LeadActivity[] {
    return this.getLeadActivities(leadId);
  }

  public assignLeadToContractor(
    leadId: string,
    contractorId: string,
    adminName: string,
    _notes?: string
  ): { success: boolean; message?: string } {
    return this.adminAssignContractor(leadId, contractorId, 'admin-1', adminName, 'MANUAL');
  }

  public addLeadActivity(
    leadId: string,
    action: LeadActivityAction | string,
    actorId: string,
    actorName: string,
    details?: string
  ): LeadActivity {
    const now = new Date().toISOString();
    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId,
      actorName,
      actorRole: 'CONTRACTOR',
      action: action as LeadActivityAction,
      description: details || `Activity recorded by ${actorName}`,
      details,
      timestamp: now,
      createdAt: now,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);
    this.saveToStorage();
    return activity;
  }

  public getLeadAssignments(leadId: string): LeadAssignment[] {
    return this.assignments.get(leadId) || [];
  }

  public getAdminNotes(leadId: string): AdminLeadNote[] {
    return this.adminNotes.get(leadId) || [];
  }

  /**
   * Admin assigns a contractor to a lead
   */
  public adminAssignContractor(
    leadId: string,
    contractorId: string,
    adminId: string,
    adminName: string,
    assignmentType: LeadAssignmentType = 'MANUAL'
  ): { success: boolean; message?: string } {
    const lead = this.leads.get(leadId);
    if (!lead) return { success: false, message: 'Lead not found.' };

    const profile = contractorService.getProfile(contractorId);
    if (!profile) return { success: false, message: 'Contractor profile not found.' };

    if (profile.onboardingStatus !== 'APPROVED') {
      return { success: false, message: 'Cannot assign unapproved contractor.' };
    }

    const now = new Date().toISOString();
    lead.contractorId = contractorId;
    lead.assignedContractorName = `${profile.primaryContact?.firstName || 'Contractor'} ${profile.primaryContact?.lastName || ''}`.trim();
    lead.assignedBusinessName = profile.businessName;
    lead.assignmentStatus = 'ASSIGNED';
    lead.status = 'AVAILABLE';
    lead.updatedAt = now;

    const leadAssignments = this.assignments.get(leadId) || [];
    leadAssignments.push({
      id: `assign-${Date.now()}`,
      leadId,
      contractorId,
      contractorName: lead.assignedContractorName,
      businessName: profile.businessName,
      assignedBy: adminId,
      assignmentType,
      status: 'ASSIGNED',
      assignedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    this.assignments.set(leadId, leadAssignments);

    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId: adminId,
      actorName: adminName,
      actorRole: 'ADMIN',
      action: 'LEAD_ASSIGNED',
      description: `Admin ${adminName} assigned lead to ${profile.businessName}.`,
      createdAt: now,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);

    notificationService.notifyUser({
      userId: contractorId,
      title: 'New Lead Dispatched to You',
      message: `Lead #${lead.leadNumber} has been dispatched to your territory. Review and accept in your leads portal.`,
      type: 'INFO',
      link: `/contractor/leads/${lead.id}`,
    });

    auditLogger.log({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'LEAD_MANUAL_ASSIGNMENT',
      entityType: 'LEAD',
      entityId: lead.id,
      details: { contractorId, businessName: profile.businessName },
    });

    this.saveToStorage();
    return { success: true };
  }

  /**
   * Admin unassigns contractor
   */
  public adminRemoveAssignment(
    leadId: string,
    adminId: string,
    adminName: string
  ): { success: boolean; message?: string } {
    const lead = this.leads.get(leadId);
    if (!lead) return { success: false, message: 'Lead not found.' };

    const oldContractor = lead.assignedBusinessName || lead.contractorId;
    const now = new Date().toISOString();

    lead.contractorId = undefined;
    lead.assignedContractorName = undefined;
    lead.assignedBusinessName = undefined;
    lead.assignmentStatus = 'UNASSIGNED';
    lead.status = 'NEW';
    lead.updatedAt = now;

    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId: adminId,
      actorName: adminName,
      actorRole: 'ADMIN',
      action: 'LEAD_REASSIGNED',
      description: `Admin ${adminName} unassigned contractor ${oldContractor}. Lead returned to open queue.`,
      createdAt: now,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);

    this.saveToStorage();
    return { success: true };
  }

  /**
   * Admin updates status directly
   */
  public adminUpdateStatus(
    leadId: string,
    newStatus: LeadStatus,
    adminId: string,
    adminName: string,
    note?: string
  ): { success: boolean; message?: string } {
    const lead = this.leads.get(leadId);
    if (!lead) return { success: false, message: 'Lead not found.' };

    const previousStatus = lead.status;
    const now = new Date().toISOString();

    lead.status = newStatus;
    lead.updatedAt = now;

    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId: adminId,
      actorName: adminName,
      actorRole: 'ADMIN',
      action: 'STATUS_CHANGED',
      description: `Admin changed status from ${previousStatus} to ${newStatus}${note ? ` (${note})` : ''}.`,
      previousStatus,
      newStatus,
      createdAt: now,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);

    this.saveToStorage();
    return { success: true };
  }

  /**
   * Admin adds internal note
   */
  public addAdminNote(
    leadId: string,
    adminId: string,
    adminName: string,
    noteText: string
  ): AdminLeadNote {
    const note: AdminLeadNote = {
      id: `anote-${Date.now()}`,
      leadId,
      adminId,
      adminName,
      note: noteText,
      createdAt: new Date().toISOString(),
    };

    const notes = this.adminNotes.get(leadId) || [];
    notes.unshift(note);
    this.adminNotes.set(leadId, notes);

    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      leadId,
      actorId: adminId,
      actorName: adminName,
      actorRole: 'ADMIN',
      action: 'NOTE_ADDED',
      description: `Internal admin note added by ${adminName}.`,
      createdAt: note.createdAt,
    };
    const leadActs = this.activities.get(leadId) || [];
    leadActs.unshift(activity);
    this.activities.set(leadId, leadActs);

    this.saveToStorage();
    return note;
  }

  public getAdminStats(): {
    totalLeads: number;
    availableLeads: number;
    assignedLeads: number;
    acceptedLeads: number;
    completedLeads: number;
    declinedLeads: number;
  } {
    let total = 0;
    let available = 0;
    let assigned = 0;
    let accepted = 0;
    let completed = 0;
    let declined = 0;

    this.leads.forEach((l) => {
      total++;
      if (l.status === 'AVAILABLE' || l.status === 'NEW') available++;
      if (l.status === 'ACCEPTED' || ['CONTACT_PENDING', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS'].includes(l.status)) accepted++;
      if (l.status === 'COMPLETED') completed++;
      if (l.status === 'DECLINED') declined++;
      if (l.assignmentStatus === 'ASSIGNED') assigned++;
    });

    return {
      totalLeads: total,
      availableLeads: available,
      assignedLeads: assigned,
      acceptedLeads: accepted,
      completedLeads: completed,
      declinedLeads: declined,
    };
  }
}

export const leadService = new LeadService();
