/**
 * You Want Services - Global Demo Mode Architecture
 * Phase 1 Architecture
 *
 * When DEMO_MODE is true:
 * - Uses clearly labeled demo data
 * - Prevents real emails, real payments, real contractor contacts
 * - Exposes safe mock profiles for role evaluations
 * - Clearly displays a professional DEMO MODE indicator
 */

import { User, ContractorProfile, CustomerProfile } from '../types/database';

export const DEMO_CONFIG = {
  // Global flag to toggle demo mode
  DEFAULT_ENABLED: true,
  VERSION: 'Phase 1.0.0-foundation',
  APP_NAME: 'You Want Services',
  TAGLINE: 'One place to find trusted home-service professionals.',
  HERO_HEADLINE: 'Home Services Made Simple',
  HERO_SUPPORTING: 'Find trusted professionals for the services your home needs.',
};

export const DEMO_USERS: Record<string, { user: User; profile?: CustomerProfile | ContractorProfile }> = {
  customer: {
    user: {
      id: 'demo-usr-customer-1',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.homeowner@demo.youwantservices.com',
      phone: '(555) 234-5678',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-03-01T12:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    profile: {
      id: 'demo-prof-cust-1',
      userId: 'demo-usr-customer-1',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      preferredContactMethod: 'SMS',
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-03-01T12:00:00Z',
    },
  },
  contractor: {
    user: {
      id: 'demo-usr-contractor-1',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus@sacramentoproservices.demo',
      phone: '(916) 555-0192',
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      createdAt: '2025-11-20T10:00:00Z',
      updatedAt: '2026-02-14T14:30:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    profile: {
      id: 'demo-prof-cont-1',
      userId: 'demo-usr-contractor-1',
      businessName: 'Sacramento Pro Services',
      contactPhone: '(916) 555-0192',
      contactEmail: 'contact@sacramentoproservices.demo',
      website: 'https://sacramentoproservices.example.com',
      address: '1850 J Street, Suite 200',
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95814',
      primaryServiceZip: '95814',
      serviceCategories: ['cat-plumbing', 'cat-hvac'],
      serviceRadiusMiles: 35,
      specificZipCodes: ['95814', '95816', '95670', '95610', '95825', '95628'],
      licenseNumber: 'CA-CSLB-994821',
      licenseType: 'CSLB Class C-20 HVAC & C-36 Plumbing',
      licenseState: 'CA',
      licenseExpiration: '2027-12-31',
      insuranceProvider: 'State Compensation & Casualty',
      insurancePolicyNumber: 'POL-COMM-449102',
      insuranceExpiration: '2027-06-30',
      verificationStatus: 'APPROVED',
      onboardingStatus: 'APPROVED',
      membershipStatus: 'ACTIVE',
      rating: 4.9,
      reviewCount: 42,
      createdAt: '2025-11-20T10:00:00Z',
      updatedAt: '2026-02-14T14:30:00Z',
    },
  },
  admin: {
    user: {
      id: 'demo-usr-admin-1',
      firstName: 'Elena',
      lastName: 'Reyes',
      email: 'elena.admin@youwantservices.com',
      phone: '(555) 432-1098',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: '2025-08-01T08:00:00Z',
      updatedAt: '2026-03-10T16:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  },
  superAdmin: {
    user: {
      id: 'demo-usr-super-1',
      firstName: 'Alexander',
      lastName: 'Sterling',
      email: 'alex.superadmin@youwantservices.com',
      phone: '(555) 999-0001',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      createdAt: '2025-06-01T08:00:00Z',
      updatedAt: '2026-03-15T11:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  },
};
