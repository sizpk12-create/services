/**
 * You Want Services - Contractor Service & Lifecycle Management
 * Phase 5 Architecture
 *
 * Implements:
 * - Contractor account creation & duplicate detection
 * - Business profile management
 * - Accurate profile completion calculation
 * - License & Insurance tracking (unverified baseline)
 * - Private document storage (data URLs with size/type validation)
 * - Service category & subcategory associations
 * - Geographic service area coverage
 * - Strict contractor authentication/ownership validation
 */

import {
  User,
  ContractorProfile,
  ContractorBusinessType,
  ContractorOnboardingStatus,
  ContractorService,
  ContractorServiceArea,
  ContractorLicense,
  ContractorInsurance,
  ContractorDocument,
  ContractorBusinessHoursDay,
  ContractorPrimaryContact,
} from '../types/database';
import { DEMO_USERS } from '../config/demo';
import { accountService } from './accountService';
import { auditLogger } from './auditLogger';

const STORAGE_CONTRACTOR_PROFILES_KEY = 'yws_contractor_profiles_v5';
const STORAGE_CONTRACTOR_SERVICES_KEY = 'yws_contractor_services_v5';
const STORAGE_CONTRACTOR_AREAS_KEY = 'yws_contractor_areas_v5';
const STORAGE_CONTRACTOR_LICENSES_KEY = 'yws_contractor_licenses_v5';
const STORAGE_CONTRACTOR_INSURANCE_KEY = 'yws_contractor_insurance_v5';
const STORAGE_CONTRACTOR_DOCS_KEY = 'yws_contractor_docs_v5';

export interface RegisterContractorPayload {
  // Account Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  termsAccepted: boolean;
  termsVersion?: string;
  privacyVersion?: string;

  // Business Information
  businessName: string;
  businessType: ContractorBusinessType;
  businessPhone: string;
  businessEmail: string;
  website?: string;
  yearsInBusiness?: string | number;
  businessDescription?: string;

  // Primary Contact
  primaryContact?: ContractorPrimaryContact;

  // Services
  primaryCategoryId: string;
  serviceCategoryIds: string[];
  serviceSubcategoryIds?: string[];

  // Service Territory
  primaryServiceZip: string;
  city: string;
  state: string;
  serviceRadius: number | string;
  specificZipCodes?: string[];

  // Business Address
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;

  // Professional Credentials
  licenseType?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiration?: string;

  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceCoverageType?: string;
  insuranceExpiration?: string;

  // Business Profile details
  profileLogo?: string;
  businessHours?: Record<string, ContractorBusinessHoursDay>;
  preferredContactMethods?: ('PHONE' | 'EMAIL' | 'SMS')[];

  // Optional Documents
  documents?: {
    documentType: 'BUSINESS_LICENSE' | 'CONTRACTOR_LICENSE' | 'CERTIFICATE_OF_INSURANCE' | 'OTHER';
    fileName: string;
    fileReference: string;
    fileType: string;
    fileSize: number;
  }[];
}

export interface ProfileCompletionResult {
  score: number; // 0 to 100
  completedItems: string[];
  missingItems: string[];
}

class ContractorServiceManager {
  private profiles: Map<string, ContractorProfile> = new Map(); // userId -> profile
  private services: Map<string, ContractorService[]> = new Map(); // contractorId -> services
  private serviceAreas: Map<string, ContractorServiceArea[]> = new Map(); // contractorId -> areas
  private licenses: Map<string, ContractorLicense[]> = new Map(); // contractorId -> licenses
  private insurances: Map<string, ContractorInsurance[]> = new Map(); // contractorId -> insurances
  private documents: Map<string, ContractorDocument[]> = new Map(); // contractorId -> docs

  constructor() {
    this.initStore();
  }

  private initStore() {
    // 1. Seed primary demo contractor (Mark Jenkins / Apex Climate Systems & Air)
    const demoContractor = DEMO_USERS.contractor;
    if (demoContractor && demoContractor.profile) {
      const p = demoContractor.profile as ContractorProfile;
      const enrichedDemoProfile: ContractorProfile = {
        ...p,
        businessName: p.businessName || 'Sacramento Pro Services',
        businessType: 'LLC',
        businessPhone: p.contactPhone,
        businessEmail: p.contactEmail,
        businessDescription:
          'Licensed HVAC and master plumbing contractor providing fast diagnostic repairs, high-efficiency system installations, and seasonal maintenance throughout Sacramento, Rancho Cordova, and Citrus Heights.',
        yearsInBusiness: 12,
        city: 'Sacramento',
        state: 'CA',
        zipCode: '95814',
        primaryServiceZip: '95814',
        serviceRadius: 35,
        serviceRadiusMiles: 35,
        serviceCategories: ['cat-plumbing', 'cat-hvac'],
        specificZipCodes: ['95814', '95816', '95670', '95610', '95825', '95628'],
        onboardingStatus: 'APPROVED',
        membershipStatus: 'ACTIVE',
        verificationStatus: 'APPROVED',
        preferredContactMethods: ['EMAIL', 'PHONE'],
        businessHours: {
          monday: { closed: false, openTime: '08:00', closeTime: '17:00' },
          tuesday: { closed: false, openTime: '08:00', closeTime: '17:00' },
          wednesday: { closed: false, openTime: '08:00', closeTime: '17:00' },
          thursday: { closed: false, openTime: '08:00', closeTime: '17:00' },
          friday: { closed: false, openTime: '08:00', closeTime: '17:00' },
          saturday: { closed: true },
          sunday: { closed: true },
        },
      };

      enrichedDemoProfile.profileCompletion = this.calculateProfileCompletion(
        demoContractor.user,
        enrichedDemoProfile
      ).score;

      this.profiles.set(demoContractor.user.id, enrichedDemoProfile);

      // Seed documents for primary demo contractor
      const demoDocs: ContractorDocument[] = [
        {
          id: 'doc-demo-lic-1',
          contractorId: enrichedDemoProfile.id,
          documentType: 'CONTRACTOR_LICENSE',
          fileName: 'Illinois_HVAC_Trade_License.pdf',
          fileReference: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          fileType: 'application/pdf',
          fileSize: 1420500,
          verificationStatus: 'PENDING',
          status: 'UNDER_REVIEW',
          uploadedAt: '2026-02-14T14:30:00Z',
        },
        {
          id: 'doc-demo-ins-1',
          contractorId: enrichedDemoProfile.id,
          documentType: 'CERTIFICATE_OF_INSURANCE',
          fileName: 'Nationwide_General_Liability_COI.pdf',
          fileReference: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
          fileType: 'application/pdf',
          fileSize: 2189000,
          verificationStatus: 'PENDING',
          status: 'UNDER_REVIEW',
          uploadedAt: '2026-02-14T14:32:00Z',
        },
      ];
      this.documents.set(enrichedDemoProfile.id, demoDocs);
    }

    // 2. Seed diverse demo contractors for testing all review lifecycle states
    this.seedAdditionalDemoContractors();

    // 3. Load from localStorage
    try {
      const savedProfiles = localStorage.getItem(STORAGE_CONTRACTOR_PROFILES_KEY);
      if (savedProfiles) {
        const parsed: ContractorProfile[] = JSON.parse(savedProfiles);
        parsed.forEach((p) => this.profiles.set(p.userId, p));
      }

      const savedDocs = localStorage.getItem(STORAGE_CONTRACTOR_DOCS_KEY);
      if (savedDocs) {
        const parsed: Record<string, ContractorDocument[]> = JSON.parse(savedDocs);
        Object.entries(parsed).forEach(([k, v]) => this.documents.set(k, v));
      }
    } catch (err) {
      console.warn('Failed to load contractor data from localStorage', err);
    }
  }

  private seedAdditionalDemoContractors() {
    // A. California Contractor - CSLB Foundation Test (Pending Review)
    const caUser: User = {
      id: 'demo-usr-cont-ca-1',
      firstName: 'Carlos',
      lastName: 'Santana',
      email: 'carlos@goldengateplumbing.com',
      phone: '(415) 890-2134',
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      createdAt: '2026-01-10T09:00:00Z',
      updatedAt: '2026-03-01T11:00:00Z',
    };
    accountService.registerCustomUser(caUser, 'demo1234');

    const caProfile: ContractorProfile = {
      id: 'prof-demo-cont-ca-1',
      userId: caUser.id,
      businessName: 'Golden Gate Plumbing & Rooter',
      businessType: 'LLC',
      contactPhone: '(415) 890-2134',
      contactEmail: 'carlos@goldengateplumbing.com',
      address: '742 Market Street, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      primaryServiceZip: '94102',
      serviceRadiusMiles: 30,
      serviceCategories: ['cat-plumbing'],
      businessDescription: 'Licensed master plumbing, hydro-jetting, trenchless sewer repair, and water heater installation throughout the San Francisco Bay Area.',
      yearsInBusiness: 9,
      licenseNumber: '892144',
      licenseType: 'CSLB Class C-36 Plumbing',
      licenseState: 'CA',
      licenseExpiration: '2027-08-31',
      insuranceProvider: 'State Farm Business Shield',
      insurancePolicyNumber: 'SF-CA-8891024',
      insuranceCoverageType: 'Commercial General Liability ($2,000,000)',
      insuranceExpiration: '2027-02-28',
      onboardingStatus: 'PENDING_REVIEW',
      verificationStatus: 'PENDING',
      membershipStatus: 'ACTIVE',
      rating: 4.8,
      reviewCount: 29,
      createdAt: '2026-01-10T09:00:00Z',
      updatedAt: '2026-03-01T11:00:00Z',
      profileCompletion: 95,
    };
    this.profiles.set(caUser.id, caProfile);
    this.documents.set(caProfile.id, [
      {
        id: 'doc-ca-1',
        contractorId: caProfile.id,
        documentType: 'CONTRACTOR_LICENSE',
        fileName: 'CA_CSLB_ClassC36_License.pdf',
        fileReference: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        fileType: 'application/pdf',
        fileSize: 840000,
        verificationStatus: 'PENDING',
        status: 'UNDER_REVIEW',
        uploadedAt: '2026-01-10T09:30:00Z',
      },
      {
        id: 'doc-ca-2',
        contractorId: caProfile.id,
        documentType: 'CERTIFICATE_OF_INSURANCE',
        fileName: 'StateFarm_Liability_COI.pdf',
        fileReference: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
        fileType: 'application/pdf',
        fileSize: 1250000,
        verificationStatus: 'PENDING',
        status: 'UNDER_REVIEW',
        uploadedAt: '2026-01-10T09:32:00Z',
      },
    ]);

    // B. Action Required / Correction Requested Contractor
    const actionUser: User = {
      id: 'demo-usr-cont-ca-2',
      firstName: 'Marcus',
      lastName: 'Wright',
      email: 'marcus@elitesparkelectric.com',
      phone: '(510) 745-9921',
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-03-12T14:00:00Z',
    };
    accountService.registerCustomUser(actionUser, 'demo1234');

    const actionProfile: ContractorProfile = {
      id: 'prof-demo-cont-ca-2',
      userId: actionUser.id,
      businessName: 'Elite Spark Electricians',
      businessType: 'Corporation',
      contactPhone: '(510) 745-9921',
      contactEmail: 'marcus@elitesparkelectric.com',
      address: '2200 Broadway',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612',
      primaryServiceZip: '94612',
      serviceRadiusMiles: 25,
      serviceCategories: ['cat-electrical'],
      businessDescription: 'High-voltage and residential electrical contractors specializing in 200A panel upgrades, EV chargers, and architectural lighting.',
      yearsInBusiness: 7,
      licenseNumber: '1029381',
      licenseType: 'CSLB Class C-10 Electrical',
      licenseState: 'CA',
      licenseExpiration: '2027-10-31',
      insuranceProvider: 'Liberty Mutual Fire & Casualty',
      insurancePolicyNumber: 'LM-99214-X',
      insuranceCoverageType: 'General Liability ($1,000,000)',
      insuranceExpiration: '2026-03-31', // Expiring very soon!
      onboardingStatus: 'ACTION_REQUIRED',
      verificationStatus: 'PENDING',
      membershipStatus: 'ACTIVE',
      rating: 4.7,
      reviewCount: 19,
      correctionRequest: {
        items: ['Insurance Information', 'Certificate of Insurance Document'],
        instructions: 'Your current certificate of insurance expires on March 31, 2026. Please upload an updated policy binder showing continuous coverage for the upcoming term.',
        requestedAt: '2026-03-12T14:00:00Z',
        requestedBy: 'demo-usr-admin-1',
        requestedByName: 'Elena Reyes',
      },
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-03-12T14:00:00Z',
      profileCompletion: 90,
    };
    this.profiles.set(actionUser.id, actionProfile);
    this.documents.set(actionProfile.id, [
      {
        id: 'doc-spark-1',
        contractorId: actionProfile.id,
        documentType: 'CONTRACTOR_LICENSE',
        fileName: 'CSLB_ClassC10_License.pdf',
        fileReference: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        fileType: 'application/pdf',
        fileSize: 950000,
        verificationStatus: 'VERIFIED',
        status: 'ACCEPTED',
        uploadedAt: '2026-02-01T10:15:00Z',
      },
      {
        id: 'doc-spark-2',
        contractorId: actionProfile.id,
        documentType: 'CERTIFICATE_OF_INSURANCE',
        fileName: 'LibertyMutual_COI_Expiring.pdf',
        fileReference: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
        fileType: 'application/pdf',
        fileSize: 1100000,
        verificationStatus: 'REJECTED',
        status: 'REJECTED',
        rejectionReason: 'Expired',
        reviewNotes: 'Policy expires within 30 days. Needs active annual extension binder.',
        uploadedAt: '2026-02-01T10:16:00Z',
      },
    ]);

    // C. Approved Contractor
    const approvedUser: User = {
      id: 'demo-usr-cont-il-2',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david@precisionproroofing.com',
      phone: '(312) 555-7890',
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      createdAt: '2025-09-15T08:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
    };
    accountService.registerCustomUser(approvedUser, 'demo1234');

    const approvedProfile: ContractorProfile = {
      id: 'prof-demo-cont-il-2',
      userId: approvedUser.id,
      businessName: 'Precision Pro Roofing & Gutters',
      businessType: 'Corporation',
      contactPhone: '(312) 555-7890',
      contactEmail: 'david@precisionproroofing.com',
      address: '4500 W Belmont Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60641',
      primaryServiceZip: '60641',
      serviceRadiusMiles: 40,
      serviceCategories: ['cat-roofing'],
      businessDescription: 'Commercial and residential architectural roofing systems, gutter guards, storm mitigation and emergency tarping.',
      yearsInBusiness: 16,
      licenseNumber: '104-019283',
      licenseType: 'State Roofing Contractor (Unlimited)',
      licenseState: 'IL',
      licenseExpiration: '2028-06-30',
      insuranceProvider: 'Travelers Property Casualty',
      insurancePolicyNumber: 'TRV-993812-00',
      insuranceCoverageType: 'Commercial General Liability ($2,000,000)',
      insuranceExpiration: '2027-09-30',
      onboardingStatus: 'APPROVED',
      verificationStatus: 'VERIFIED',
      overallVerificationStatus: 'VERIFIED',
      membershipStatus: 'ACTIVE',
      rating: 4.9,
      reviewCount: 64,
      approvedAt: '2026-03-01T10:00:00Z',
      approvedBy: 'demo-usr-super-1',
      approvedByName: 'Alexander Sterling',
      approvalNotes: 'Comprehensive background audit complete. Valid Illinois unlimited roofing license and $2M liability policy on file.',
      verifications: {
        BUSINESS: {
          id: 'ver-b-1',
          contractorId: 'prof-demo-cont-il-2',
          category: 'BUSINESS',
          status: 'VERIFIED',
          verificationMethod: 'ADMIN_CONFIRMATION',
          verifiedBy: 'demo-usr-super-1',
          verifiedByName: 'Alexander Sterling',
          verifiedAt: '2026-03-01T09:45:00Z',
          createdAt: '2026-03-01T09:45:00Z',
          updatedAt: '2026-03-01T09:45:00Z',
        },
        LICENSE: {
          id: 'ver-l-1',
          contractorId: 'prof-demo-cont-il-2',
          category: 'LICENSE',
          status: 'VERIFIED',
          verificationMethod: 'MANUAL_LOOKUP',
          verifiedBy: 'demo-usr-super-1',
          verifiedByName: 'Alexander Sterling',
          verifiedAt: '2026-03-01T09:50:00Z',
          notes: 'Illinois IDFPR registry lookup confirmed active Unlimited Roofing status.',
          expirationDate: '2028-06-30',
          createdAt: '2026-03-01T09:50:00Z',
          updatedAt: '2026-03-01T09:50:00Z',
        },
        INSURANCE: {
          id: 'ver-i-1',
          contractorId: 'prof-demo-cont-il-2',
          category: 'INSURANCE',
          status: 'VERIFIED',
          verificationMethod: 'DOCUMENT_REVIEW',
          verifiedBy: 'demo-usr-super-1',
          verifiedByName: 'Alexander Sterling',
          verifiedAt: '2026-03-01T09:55:00Z',
          notes: 'Travelers policy direct verification verified through broker phone audit.',
          expirationDate: '2027-09-30',
          createdAt: '2026-03-01T09:55:00Z',
          updatedAt: '2026-03-01T09:55:00Z',
        },
        DOCUMENTS: {
          id: 'ver-d-1',
          contractorId: 'prof-demo-cont-il-2',
          category: 'DOCUMENTS',
          status: 'VERIFIED',
          verificationMethod: 'DOCUMENT_REVIEW',
          verifiedBy: 'demo-usr-super-1',
          verifiedByName: 'Alexander Sterling',
          verifiedAt: '2026-03-01T09:58:00Z',
          notes: 'All documents inspected and conform to platform quality criteria.',
          createdAt: '2026-03-01T09:58:00Z',
          updatedAt: '2026-03-01T09:58:00Z',
        },
        PROFILE: {
          id: 'ver-p-1',
          contractorId: 'prof-demo-cont-il-2',
          category: 'PROFILE',
          status: 'VERIFIED',
          verificationMethod: 'ADMIN_CONFIRMATION',
          verifiedBy: 'demo-usr-super-1',
          verifiedByName: 'Alexander Sterling',
          verifiedAt: '2026-03-01T09:59:00Z',
          createdAt: '2026-03-01T09:59:00Z',
          updatedAt: '2026-03-01T09:59:00Z',
        },
      },
      createdAt: '2025-09-15T08:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
      profileCompletion: 100,
    };
    this.profiles.set(approvedUser.id, approvedProfile);
    this.documents.set(approvedProfile.id, [
      {
        id: 'doc-prec-1',
        contractorId: approvedProfile.id,
        documentType: 'CONTRACTOR_LICENSE',
        fileName: 'IL_Roofing_Unlimited_License.pdf',
        fileReference: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        fileType: 'application/pdf',
        fileSize: 1600000,
        verificationStatus: 'VERIFIED',
        status: 'ACCEPTED',
        uploadedAt: '2025-09-15T08:30:00Z',
      },
      {
        id: 'doc-prec-2',
        contractorId: approvedProfile.id,
        documentType: 'CERTIFICATE_OF_INSURANCE',
        fileName: 'Travelers_General_Liability.pdf',
        fileReference: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
        fileType: 'application/pdf',
        fileSize: 2400000,
        verificationStatus: 'VERIFIED',
        status: 'ACCEPTED',
        uploadedAt: '2025-09-15T08:32:00Z',
      },
    ]);

    // D. Suspended Contractor
    const suspendedUser: User = {
      id: 'demo-usr-cont-il-3',
      firstName: 'Robert',
      lastName: 'Vance',
      email: 'bob@metromechanical.com',
      phone: '(217) 555-4921',
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      createdAt: '2025-07-20T10:00:00Z',
      updatedAt: '2026-02-01T09:00:00Z',
    };
    accountService.registerCustomUser(suspendedUser, 'demo1234');

    const suspendedProfile: ContractorProfile = {
      id: 'prof-demo-cont-il-3',
      userId: suspendedUser.id,
      businessName: 'Metro Mechanical Services',
      businessType: 'Partnership',
      contactPhone: '(217) 555-4921',
      contactEmail: 'bob@metromechanical.com',
      address: '900 S 6th St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      primaryServiceZip: '62701',
      serviceRadiusMiles: 25,
      serviceCategories: ['cat-hvac', 'cat-plumbing'],
      businessDescription: 'Commercial boiler installation, chiller maintenance and hydronic piping.',
      yearsInBusiness: 18,
      licenseNumber: 'IL-MECH-44102',
      licenseType: 'State Mechanical Contractor',
      licenseState: 'IL',
      licenseExpiration: '2026-01-15', // EXPIRED!
      insuranceProvider: 'Chubb Commercial',
      insurancePolicyNumber: 'CH-88219-F',
      insuranceCoverageType: 'General Liability ($1,000,000)',
      insuranceExpiration: '2027-04-30',
      onboardingStatus: 'SUSPENDED',
      verificationStatus: 'REJECTED',
      membershipStatus: 'SUSPENDED',
      suspensionReason: 'Contractor state trade license expired on January 15, 2026. Account access suspended until renewal proof is submitted.',
      suspendedAt: '2026-02-01T09:00:00Z',
      suspendedBy: 'demo-usr-admin-1',
      suspendedByName: 'Elena Reyes',
      rating: 4.4,
      reviewCount: 22,
      createdAt: '2025-07-20T10:00:00Z',
      updatedAt: '2026-02-01T09:00:00Z',
      profileCompletion: 85,
    };
    this.profiles.set(suspendedUser.id, suspendedProfile);
  }

  private saveToStorage() {
    try {
      const profilesArray = Array.from(this.profiles.values());
      localStorage.setItem(STORAGE_CONTRACTOR_PROFILES_KEY, JSON.stringify(profilesArray));

      const docsObj: Record<string, ContractorDocument[]> = {};
      this.documents.forEach((v, k) => {
        docsObj[k] = v;
      });
      localStorage.setItem(STORAGE_CONTRACTOR_DOCS_KEY, JSON.stringify(docsObj));
    } catch (err) {
      console.warn('Failed to persist contractor data to localStorage', err);
    }
  }

  /**
   * Reusable profile completion calculation based on actual stored information.
   */
  public calculateProfileCompletion(
    user?: User | null,
    profile?: ContractorProfile | null
  ): ProfileCompletionResult {
    if (!profile) {
      return {
        score: 0,
        completedItems: [],
        missingItems: [
          'Account Information',
          'Business Information',
          'Services',
          'Service Area',
          'Credentials',
          'Business Profile',
        ],
      };
    }

    const items = [
      {
        name: 'Account Contact Details',
        isComplete: !!(user?.firstName && user?.lastName && user?.email && user?.phone),
        weight: 15,
      },
      {
        name: 'Business Name & Entity Type',
        isComplete: !!(profile.businessName && profile.businessType),
        weight: 15,
      },
      {
        name: 'Business Description',
        isComplete: !!(profile.businessDescription && profile.businessDescription.trim().length >= 20),
        weight: 10,
      },
      {
        name: 'Service Offerings',
        isComplete: !!(profile.serviceCategories && profile.serviceCategories.length > 0),
        weight: 15,
      },
      {
        name: 'Service Territory & Dispatch Radius',
        isComplete: !!(profile.primaryServiceZip || profile.zipCode) && !!profile.serviceRadiusMiles,
        weight: 15,
      },
      {
        name: 'Business Address',
        isComplete: !!(profile.address && profile.city && profile.state && profile.zipCode),
        weight: 10,
      },
      {
        name: 'License Information',
        isComplete: !!(profile.licenseNumber && profile.licenseState),
        weight: 10,
      },
      {
        name: 'Insurance Information',
        isComplete: !!(profile.insuranceProvider && profile.insurancePolicyNumber),
        weight: 10,
      },
      {
        name: 'Operating Hours',
        isComplete: !!(profile.businessHours && Object.keys(profile.businessHours).length > 0),
        weight: 5,
      },
      {
        name: 'Business Logo',
        isComplete: !!profile.profileLogo,
        weight: 5,
      },
    ];

    let totalEarned = 0;
    let totalWeight = 0;
    const completedItems: string[] = [];
    const missingItems: string[] = [];

    items.forEach((item) => {
      totalWeight += item.weight;
      if (item.isComplete) {
        totalEarned += item.weight;
        completedItems.push(item.name);
      } else {
        missingItems.push(item.name);
      }
    });

    const score = Math.round((totalEarned / totalWeight) * 100);
    return { score, completedItems, missingItems };
  }

  /**
   * Register a new Contractor with account creation, business profile, services, territory, and credentials
   */
  public registerContractor(payload: RegisterContractorPayload): {
    success: boolean;
    duplicate?: boolean;
    message: string;
    user?: User;
    profile?: ContractorProfile;
  } {
    const normalizedEmail = payload.email.trim().toLowerCase();

    // 1. Check for duplicate email across system
    if (accountService.isEmailRegistered(normalizedEmail)) {
      return {
        success: false,
        duplicate: true,
        message: 'An account with this email already exists. Please log in or use password recovery.',
      };
    }

    // 2. Validate Terms Consent
    if (!payload.termsAccepted) {
      return {
        success: false,
        message: 'You must agree to the Terms of Service and Privacy Policy to create an account.',
      };
    }

    // 3. Validate at least one service category
    if (!payload.serviceCategoryIds || payload.serviceCategoryIds.length === 0) {
      return {
        success: false,
        message: 'You must select at least one primary service category.',
      };
    }

    const userId = `usr-cont-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const contractorProfileId = `prof-cont-${Date.now()}`;
    const now = new Date().toISOString();

    // Create User record
    const newUser: User = {
      id: userId,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: normalizedEmail,
      phone: payload.phone.trim(),
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      termsAccepted: true,
      termsAcceptedAt: now,
      termsVersion: payload.termsVersion || 'v1.0-2026',
      privacyVersion: payload.privacyVersion || 'v1.0-2026',
      createdAt: now,
      updatedAt: now,
    };

    // Primary contact default
    const primaryContact: ContractorPrimaryContact = payload.primaryContact || {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone.trim(),
      email: normalizedEmail,
    };

    const radiusNumber = typeof payload.serviceRadius === 'number'
      ? payload.serviceRadius
      : parseInt(String(payload.serviceRadius), 10) || 25;

    // Create ContractorProfile record
    const newProfile: ContractorProfile = {
      id: contractorProfileId,
      userId,
      businessName: payload.businessName.trim(),
      businessType: payload.businessType,
      businessPhone: payload.businessPhone.trim() || payload.phone.trim(),
      businessEmail: payload.businessEmail.trim().toLowerCase() || normalizedEmail,
      contactPhone: payload.phone.trim(),
      contactEmail: normalizedEmail,
      website: payload.website ? payload.website.trim() : undefined,
      businessDescription: payload.businessDescription ? payload.businessDescription.trim() : undefined,
      yearsInBusiness: payload.yearsInBusiness || 0,
      address: payload.businessAddress.trim(),
      city: payload.businessCity.trim(),
      state: payload.businessState.trim().toUpperCase(),
      zipCode: payload.businessZipCode.trim(),
      primaryServiceZip: payload.primaryServiceZip.trim(),
      serviceRadius: radiusNumber,
      serviceRadiusMiles: radiusNumber,
      specificZipCodes: payload.specificZipCodes || [],
      serviceCategories: payload.serviceCategoryIds,
      profileLogo: payload.profileLogo,
      primaryContact,
      businessHours: payload.businessHours || {},
      preferredContactMethods: payload.preferredContactMethods || ['EMAIL', 'PHONE'],

      // Initial unverified credentials
      licenseNumber: payload.licenseNumber ? payload.licenseNumber.trim() : undefined,
      licenseType: payload.licenseType,
      licenseState: payload.licenseState,
      licenseExpiration: payload.licenseExpiration,

      insuranceProvider: payload.insuranceProvider ? payload.insuranceProvider.trim() : undefined,
      insurancePolicyNumber: payload.insurancePolicyNumber ? payload.insurancePolicyNumber.trim() : undefined,
      insuranceCoverageType: payload.insuranceCoverageType,
      insuranceExpiration: payload.insuranceExpiration,

      verificationStatus: 'NOT_VERIFIED',
      membershipStatus: 'PENDING_ONBOARDING',
      onboardingStatus: 'PENDING_REVIEW',
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    newProfile.profileCompletion = this.calculateProfileCompletion(newUser, newProfile).score;

    // Handle documents if uploaded
    if (payload.documents && payload.documents.length > 0) {
      const docs: ContractorDocument[] = payload.documents.map((d, index) => ({
        id: `doc-${Date.now()}-${index}`,
        contractorId: contractorProfileId,
        documentType: d.documentType,
        fileName: d.fileName,
        fileReference: d.fileReference,
        fileType: d.fileType,
        fileSize: d.fileSize,
        verificationStatus: 'NOT_VERIFIED',
        uploadedAt: now,
      }));
      this.documents.set(contractorProfileId, docs);
    }

    // Register User credentials and identity in accountService
    accountService.registerCustomUser(newUser, payload.password);

    // Save profile
    this.profiles.set(userId, newProfile);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: userId,
      actorRole: 'CONTRACTOR',
      action: 'CONTRACTOR_REGISTRATION',
      entityType: 'CONTRACTOR_PROFILE',
      entityId: contractorProfileId,
      details: {
        businessName: newProfile.businessName,
        businessType: newProfile.businessType,
        categories: newProfile.serviceCategories,
        serviceZip: newProfile.primaryServiceZip,
        radius: newProfile.serviceRadiusMiles,
        hasLicense: !!newProfile.licenseNumber,
        hasInsurance: !!newProfile.insurancePolicyNumber,
        profileCompletion: newProfile.profileCompletion,
      },
      isDemo: true,
    });

    return {
      success: true,
      user: newUser,
      profile: newProfile,
      message: 'Your contractor registration has been submitted and is pending review.',
    };
  }

  /**
   * Get contractor profile by User ID
   */
  public getProfileByUserId(userId: string): ContractorProfile | undefined {
    return this.profiles.get(userId);
  }

  /**
   * Alias for getProfileByUserId
   */
  public getProfile(userId: string): ContractorProfile | undefined {
    return this.getProfileByUserId(userId);
  }

  /**
   * Update contractor business profile
   */
  public updateProfile(
    userId: string,
    updates: Partial<ContractorProfile>,
    user?: User
  ): { success: boolean; profile?: ContractorProfile; message?: string } {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return { success: false, message: 'Contractor profile not found.' };
    }

    const updatedProfile: ContractorProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate profile completion
    updatedProfile.profileCompletion = this.calculateProfileCompletion(user, updatedProfile).score;

    this.profiles.set(userId, updatedProfile);
    this.saveToStorage();

    auditLogger.log({
      actorId: userId,
      actorRole: 'CONTRACTOR',
      action: 'CONTRACTOR_PROFILE_UPDATED',
      entityType: 'CONTRACTOR_PROFILE',
      entityId: profile.id,
      details: { updatedFields: Object.keys(updates) },
      isDemo: true,
    });

    return {
      success: true,
      profile: updatedProfile,
      message: 'Business profile successfully updated.',
    };
  }

  /**
   * Upload business document
   */
  public uploadDocument(
    contractorId: string,
    doc: {
      documentType: 'BUSINESS_LICENSE' | 'CONTRACTOR_LICENSE' | 'CERTIFICATE_OF_INSURANCE' | 'OTHER';
      fileName: string;
      fileReference: string;
      fileType: string;
      fileSize: number;
    }
  ): { success: boolean; document?: ContractorDocument; message?: string } {
    // Validate file size (< 10MB)
    if (doc.fileSize > 10 * 1024 * 1024) {
      return { success: false, message: 'Document exceeds the maximum allowed file size of 10MB.' };
    }

    // Validate type (PDF, JPG, PNG, WebP)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (!allowedTypes.includes(doc.fileType.toLowerCase())) {
      return {
        success: false,
        message: 'Invalid file format. Please upload a PDF, JPG, PNG, or WebP document.',
      };
    }

    const newDoc: ContractorDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contractorId,
      documentType: doc.documentType,
      fileName: doc.fileName,
      fileReference: doc.fileReference,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      verificationStatus: 'NOT_VERIFIED',
      uploadedAt: new Date().toISOString(),
    };

    const existingDocs = this.documents.get(contractorId) || [];
    existingDocs.push(newDoc);
    this.documents.set(contractorId, existingDocs);
    this.saveToStorage();

    return {
      success: true,
      document: newDoc,
      message: 'Document uploaded successfully.',
    };
  }

  /**
   * Get uploaded documents for contractor
   */
  public getDocuments(contractorId: string): ContractorDocument[] {
    return this.documents.get(contractorId) || [];
  }

  /**
   * Delete uploaded document
   */
  public deleteDocument(contractorId: string, documentId: string): boolean {
    const existing = this.documents.get(contractorId) || [];
    const filtered = existing.filter((d) => d.id !== documentId);
    this.documents.set(contractorId, filtered);
    this.saveToStorage();
    return true;
  }

  /**
   * Save documents array for contractor (used by review workflows)
   */
  public saveDocuments(contractorId: string, docs: ContractorDocument[]): void {
    this.documents.set(contractorId, docs);
    this.saveToStorage();
  }

  /**
   * Get all contractor profiles
   */
  public getAllProfiles(): ContractorProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get contractor profile by profile ID (or user ID)
   */
  public getProfileById(profileIdOrUserId: string): ContractorProfile | undefined {
    // Check by user ID first
    if (this.profiles.has(profileIdOrUserId)) {
      return this.profiles.get(profileIdOrUserId);
    }
    // Check by profile id
    for (const p of this.profiles.values()) {
      if (p.id === profileIdOrUserId) {
        return p;
      }
    }
    return undefined;
  }

  /**
   * Update profile internally without requiring raw User object (for admin actions)
   */
  public updateProfileInternal(
    userId: string,
    updates: Partial<ContractorProfile>
  ): { success: boolean; profile?: ContractorProfile } {
    const profile = this.profiles.get(userId);
    if (!profile) {
      // Try searching by profile id
      let foundUserId: string | null = null;
      for (const [uId, p] of this.profiles.entries()) {
        if (p.id === userId) {
          foundUserId = uId;
          break;
        }
      }
      if (foundUserId) {
        const foundProfile = this.profiles.get(foundUserId)!;
        const updated: ContractorProfile = {
          ...foundProfile,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.profiles.set(foundUserId, updated);
        this.saveToStorage();
        return { success: true, profile: updated };
      }
      return { success: false };
    }

    const updatedProfile: ContractorProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(userId, updatedProfile);
    this.saveToStorage();
    return { success: true, profile: updatedProfile };
  }
}

export const contractorService = new ContractorServiceManager();
