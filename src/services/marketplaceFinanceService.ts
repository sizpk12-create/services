/**
 * You Want Services - Marketplace Finance, Monetization & Subscriptions Service
 * Prompt #10 Architecture
 *
 * Implements:
 * - Central Payment & Transaction Ledger
 * - Contractor Subscriptions & MRR Analytics (Starter, Pro, Elite)
 * - Dispute & Refund Request Resolution Engine
 * - Dynamic Category & Urgency Pricing Rules
 * - High-Precision Marketplace KPIs derived from real database records
 * - Production-ready CSV Data Exporters
 */

import {
  Payment,
  PaymentType,
  PaymentStatus,
  ContractorSubscription,
  MembershipTier,
  MembershipStatus,
  RefundRequest,
  RefundReason,
  RefundStatus,
  CategoryPricingRule,
} from '../types/database';
import { contractorService } from './contractorService';
import { accountService } from './accountService';
import { leadService } from './leadService';
import { serviceRequestService } from './serviceRequestService';
import { auditLogger } from './auditLogger';
import { notificationService } from './notificationService';

const STORAGE_PAYMENTS_KEY = 'yws_payments_ledger_v10';
const STORAGE_SUBSCRIPTIONS_KEY = 'yws_contractor_subs_v10';
const STORAGE_REFUNDS_KEY = 'yws_refund_requests_v10';
const STORAGE_PRICING_RULES_KEY = 'yws_category_pricing_rules_v10';

export interface MembershipTierDetail {
  name: string;
  monthlyPrice: number;
  leadDiscountPercent: number;
  freeLeadsPerMonth: number;
  description: string;
}

export const MEMBERSHIP_TIER_CONFIG: Record<MembershipTier, MembershipTierDetail> = {
  STARTER: {
    name: 'Starter Tier',
    monthlyPrice: 0,
    leadDiscountPercent: 0,
    freeLeadsPerMonth: 0,
    description: 'Pay-per-lead standard pricing with zero monthly commitment.',
  },
  PRO: {
    name: 'Professional Tier',
    monthlyPrice: 49.0,
    leadDiscountPercent: 15,
    freeLeadsPerMonth: 2,
    description: 'Includes 2 free leads/month and 15% discount on all claims.',
  },
  ELITE: {
    name: 'Elite Premier Tier',
    monthlyPrice: 99.0,
    leadDiscountPercent: 30,
    freeLeadsPerMonth: 5,
    description: 'Priority matching, 5 free leads/month, and 30% discount.',
  },
};

export interface SubscriptionMetrics {
  activeSubscribers: number;
  monthlyRecurringRevenue: number;
  starterCount: number;
  proCount: number;
  eliteCount: number;
}

export interface MarketplaceKPIs {
  totalCustomers: number;
  totalContractors: number;
  verifiedContractors: number;
  pendingContractors: number;
  totalServiceRequests: number;
  totalLeads: number;
  availableLeads: number;
  claimedLeads: number;
  completedLeads: number;
  leadConversionRate: number; // percentage (0-100)
  totalLeadSalesRevenue: number;
  monthlyRecurringRevenue: number;
  totalMarketplaceRevenue: number;
  pendingRefundsCount: number;
  pendingRefundsAmount: number;
  activeSubscribersCount: number;
}

class MarketplaceFinanceManager {
  private payments: Map<string, Payment> = new Map();
  private subscriptions: Map<string, ContractorSubscription> = new Map();
  private refunds: Map<string, RefundRequest> = new Map();
  private pricingRules: Map<string, CategoryPricingRule> = new Map();

  constructor() {
    this.initStore();
  }

  private initStore() {
    // 1. Initial Default Category Pricing Rules
    const defaultRules: CategoryPricingRule[] = [
      {
        categoryId: 'cat-hvac',
        categoryName: 'Heating, Ventilation & AC (HVAC)',
        basePrice: 35.0,
        rushMultiplier: 1.25,
        emergencyMultiplier: 1.5,
        isActive: true,
        updatedAt: '2026-09-15T00:00:00Z',
      },
      {
        categoryId: 'cat-plumbing',
        categoryName: 'Plumbing & Pipe Services',
        basePrice: 30.0,
        rushMultiplier: 1.25,
        emergencyMultiplier: 1.5,
        isActive: true,
        updatedAt: '2026-09-15T00:00:00Z',
      },
      {
        categoryId: 'cat-electrical',
        categoryName: 'Electrical & Wiring',
        basePrice: 32.0,
        rushMultiplier: 1.25,
        emergencyMultiplier: 1.5,
        isActive: true,
        updatedAt: '2026-09-15T00:00:00Z',
      },
      {
        categoryId: 'cat-roofing',
        categoryName: 'Roofing & Gutters',
        basePrice: 45.0,
        rushMultiplier: 1.2,
        emergencyMultiplier: 1.4,
        isActive: true,
        updatedAt: '2026-09-15T00:00:00Z',
      },
      {
        categoryId: 'cat-painting',
        categoryName: 'Interior & Exterior Painting',
        basePrice: 25.0,
        rushMultiplier: 1.15,
        emergencyMultiplier: 1.3,
        isActive: true,
        updatedAt: '2026-09-15T00:00:00Z',
      },
      {
        categoryId: 'cat-handyman',
        categoryName: 'General Handyman & Repairs',
        basePrice: 20.0,
        rushMultiplier: 1.2,
        emergencyMultiplier: 1.35,
        isActive: true,
        updatedAt: '2026-09-15T00:00:00Z',
      },
      {
        categoryId: 'cat-landscaping',
        categoryName: 'Lawn & Landscape Care',
        basePrice: 22.0,
        rushMultiplier: 1.15,
        emergencyMultiplier: 1.3,
        isActive: true,
        updatedAt: '2026-09-15T00:00:00Z',
      },
      {
        categoryId: 'cat-remodeling',
        categoryName: 'Kitchen & Bath Remodeling',
        basePrice: 50.0,
        rushMultiplier: 1.2,
        emergencyMultiplier: 1.4,
        isActive: true,
        updatedAt: '2026-09-15T00:00:00Z',
      },
    ];

    defaultRules.forEach((r) => this.pricingRules.set(r.categoryId, r));

    // 2. Initial Seed Payments (representing real lead purchases and subscriptions)
    const initialPayments: Payment[] = [
      {
        id: 'pay-tx-1001',
        leadId: 'lead-802',
        payerId: 'demo-usr-contractor-1',
        payerName: 'Apex HVAC & Mechanical Services',
        amount: 35.0,
        type: 'LEAD_FEE',
        status: 'COMPLETED',
        description: 'Lead Purchase fee for HVAC Replacement (YL-2026-000802)',
        paymentMethod: 'Visa •••• 4242',
        receiptNumber: 'REC-2026-08912',
        isDemo: true,
        createdAt: '2026-09-17T09:15:00Z',
      },
      {
        id: 'pay-tx-1002',
        payerId: 'demo-usr-contractor-1',
        payerName: 'Apex HVAC & Mechanical Services',
        amount: 49.0,
        type: 'MEMBERSHIP',
        status: 'COMPLETED',
        description: 'Pro Contractor Membership (Monthly Renewal)',
        paymentMethod: 'Visa •••• 4242',
        receiptNumber: 'REC-2026-08850',
        isDemo: true,
        createdAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'pay-tx-1003',
        leadId: 'lead-801',
        payerId: 'demo-usr-contractor-1',
        payerName: 'Apex HVAC & Mechanical Services',
        amount: 28.0,
        type: 'LEAD_FEE',
        status: 'COMPLETED',
        description: 'Lead Purchase fee for Emergency AC Diagnostics (YL-2026-000801)',
        paymentMethod: 'Visa •••• 4242',
        receiptNumber: 'REC-2026-08970',
        isDemo: true,
        createdAt: '2026-09-18T14:35:00Z',
      },
    ];

    initialPayments.forEach((p) => this.payments.set(p.id, p));

    // 3. Initial Seed Subscriptions
    const initialSubs: ContractorSubscription[] = [
      {
        id: 'sub-con-apex',
        contractorId: 'demo-usr-contractor-1',
        contractorName: 'Marcus Vance',
        businessName: 'Apex HVAC & Mechanical Services',
        tier: 'PRO',
        monthlyFee: 49.0,
        leadDiscountPercent: 15,
        monthlyFreeLeads: 2,
        remainingFreeLeads: 1,
        status: 'ACTIVE',
        startedAt: '2026-08-01T00:00:00Z',
        currentPeriodEnd: '2026-10-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        paymentMethodMasked: 'Visa •••• 4242',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ];

    initialSubs.forEach((s) => this.subscriptions.set(s.contractorId, s));

    // 4. Initial Seed Refund Requests
    const initialRefunds: RefundRequest[] = [
      {
        id: 'ref-req-501',
        paymentId: 'pay-tx-1003',
        contractorId: 'demo-usr-contractor-1',
        contractorName: 'Marcus Vance',
        businessName: 'Apex HVAC & Mechanical Services',
        leadId: 'lead-801',
        leadNumber: 'YL-2026-000801',
        amount: 28.0,
        reason: 'INVALID_CONTACT_INFO',
        reasonDetails: 'Phone number provided in lead connected to disconnected voicemail upon multiple attempts.',
        status: 'PENDING',
        requestedAt: '2026-09-19T11:20:00Z',
      },
    ];

    initialRefunds.forEach((r) => this.refunds.set(r.id, r));

    // 5. Restore from localStorage if present
    try {
      const savedPayments = localStorage.getItem(STORAGE_PAYMENTS_KEY);
      if (savedPayments) {
        const parsed: Payment[] = JSON.parse(savedPayments);
        parsed.forEach((p) => this.payments.set(p.id, p));
      }

      const savedSubs = localStorage.getItem(STORAGE_SUBSCRIPTIONS_KEY);
      if (savedSubs) {
        const parsed: ContractorSubscription[] = JSON.parse(savedSubs);
        parsed.forEach((s) => this.subscriptions.set(s.contractorId, s));
      }

      const savedRefunds = localStorage.getItem(STORAGE_REFUNDS_KEY);
      if (savedRefunds) {
        const parsed: RefundRequest[] = JSON.parse(savedRefunds);
        parsed.forEach((r) => this.refunds.set(r.id, r));
      }

      const savedRules = localStorage.getItem(STORAGE_PRICING_RULES_KEY);
      if (savedRules) {
        const parsed: CategoryPricingRule[] = JSON.parse(savedRules);
        parsed.forEach((r) => this.pricingRules.set(r.categoryId, r));
      }
    } catch (err) {
      console.warn('Failed to parse financial data from localStorage', err);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_PAYMENTS_KEY,
        JSON.stringify(Array.from(this.payments.values()))
      );
      localStorage.setItem(
        STORAGE_SUBSCRIPTIONS_KEY,
        JSON.stringify(Array.from(this.subscriptions.values()))
      );
      localStorage.setItem(
        STORAGE_REFUNDS_KEY,
        JSON.stringify(Array.from(this.refunds.values()))
      );
      localStorage.setItem(
        STORAGE_PRICING_RULES_KEY,
        JSON.stringify(Array.from(this.pricingRules.values()))
      );
    } catch (err) {
      console.warn('Failed to persist financial data to localStorage', err);
    }
  }

  // ==========================================
  // PAYMENTS & TRANSACTIONS
  // ==========================================

  public getAllPayments(filters?: {
    type?: string;
    status?: string;
    payerId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Payment[] {
    const list = Array.from(this.payments.values());

    return list.filter((p) => {
      if (filters?.type && filters.type !== 'ALL' && p.type !== filters.type) return false;
      if (filters?.status && filters.status !== 'ALL' && p.status !== filters.status) return false;
      if (filters?.payerId && p.payerId !== filters.payerId) return false;

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matches =
          p.id.toLowerCase().includes(q) ||
          (p.payerName && p.payerName.toLowerCase().includes(q)) ||
          (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (filters?.startDate && new Date(p.createdAt) < new Date(filters.startDate)) return false;
      if (filters?.endDate && new Date(p.createdAt) > new Date(filters.endDate)) return false;

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPaymentById(id: string): Payment | undefined {
    return this.payments.get(id);
  }

  public recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
    const id = `pay-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: now,
      receiptNumber: payment.receiptNumber || `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    this.payments.set(id, newPayment);
    this.saveToStorage();

    auditLogger.log({
      actorId: payment.payerId,
      actorRole: 'CONTRACTOR',
      action: 'PAYMENT_RECORDED',
      entityType: 'PAYMENT',
      entityId: id,
      details: {
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
      },
    });

    return newPayment;
  }

  // ==========================================
  // CONTRACTOR MEMBERSHIPS & SUBSCRIPTIONS
  // ==========================================

  public getAllSubscriptions(): ContractorSubscription[] {
    // Ensure all registered contractors have at least a baseline entry
    const contractors = contractorService.getAllProfiles();
    contractors.forEach((c) => {
      if (!this.subscriptions.has(c.userId)) {
        const user = accountService.getUserById(c.userId);
        const name = user ? `${user.firstName} ${user.lastName}` : c.businessName;
        this.subscriptions.set(c.userId, {
          id: `sub-${c.userId}`,
          contractorId: c.userId,
          contractorName: name,
          businessName: c.businessName || name,
          tier: 'STARTER',
          monthlyFee: 0,
          leadDiscountPercent: 0,
          monthlyFreeLeads: 0,
          remainingFreeLeads: 0,
          status: 'ACTIVE',
          startedAt: c.createdAt || new Date().toISOString(),
          currentPeriodEnd: '2026-12-31T23:59:59Z',
          cancelAtPeriodEnd: false,
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    return Array.from(this.subscriptions.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public getSubscription(contractorId: string): ContractorSubscription | undefined {
    this.getAllSubscriptions(); // ensure hydrated
    return this.subscriptions.get(contractorId);
  }

  public updateSubscription(
    contractorId: string,
    tier: MembershipTier,
    status: MembershipStatus,
    adminId: string,
    adminName: string,
    notes?: string
  ): ContractorSubscription {
    let sub = this.subscriptions.get(contractorId);
    const now = new Date().toISOString();

    const tierPricing: Record<MembershipTier, { fee: number; discount: number; freeLeads: number }> = {
      STARTER: { fee: 0, discount: 0, freeLeads: 0 },
      PRO: { fee: 49.0, discount: 15, freeLeads: 2 },
      ELITE: { fee: 99.0, discount: 30, freeLeads: 5 },
    };

    const config = tierPricing[tier];

    if (!sub) {
      const profile = contractorService.getProfile(contractorId);
      const user = accountService.getUserById(contractorId);
      sub = {
        id: `sub-${contractorId}`,
        contractorId,
        contractorName: user ? `${user.firstName} ${user.lastName}` : (profile?.businessName || 'Contractor'),
        businessName: profile?.businessName || 'Contractor Business',
        tier,
        monthlyFee: config.fee,
        leadDiscountPercent: config.discount,
        monthlyFreeLeads: config.freeLeads,
        remainingFreeLeads: config.freeLeads,
        status,
        startedAt: now,
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      };
    } else {
      sub.tier = tier;
      sub.status = status;
      sub.monthlyFee = config.fee;
      sub.leadDiscountPercent = config.discount;
      sub.monthlyFreeLeads = config.freeLeads;
      sub.remainingFreeLeads = Math.max(sub.remainingFreeLeads, config.freeLeads);
      sub.updatedAt = now;
    }

    this.subscriptions.set(contractorId, sub);

    // If upgrading to paid tier, record a simulated renewal charge
    if (config.fee > 0 && status === 'ACTIVE') {
      this.recordPayment({
        payerId: contractorId,
        payerName: sub.businessName,
        amount: config.fee,
        type: 'MEMBERSHIP',
        status: 'COMPLETED',
        description: `${tier} Membership Activated (${notes || 'Admin updated'})`,
        paymentMethod: 'Credit Card (System Admin Override)',
        isDemo: true,
      });
    }

    auditLogger.log({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'MEMBERSHIP_TIER_CHANGED',
      entityType: 'SUBSCRIPTION',
      entityId: sub.id,
      details: { contractorId, tier, status, adminName, notes },
    });

    notificationService.notifyUser({
      userId: contractorId,
      title: 'Membership Tier Updated',
      message: `Your You Want Services membership has been updated to ${tier} by administration. Enjoy your updated benefits!`,
      type: 'SUCCESS',
    });

    this.saveToStorage();
    return sub;
  }

  public updateSubscriptionAllowance(
    contractorId: string,
    newFreeLeads: number,
    adminId?: string
  ): ContractorSubscription | undefined {
    const sub = this.subscriptions.get(contractorId);
    if (!sub) return undefined;

    sub.monthlyFreeLeads = newFreeLeads;
    sub.remainingFreeLeads = Math.max(sub.remainingFreeLeads, newFreeLeads);
    sub.updatedAt = new Date().toISOString();
    this.subscriptions.set(contractorId, sub);
    this.saveToStorage();

    auditLogger.log({
      actorId: adminId || 'admin-usr-1',
      actorRole: 'ADMIN',
      action: 'MEMBERSHIP_ALLOWANCE_MODIFIED',
      entityType: 'SUBSCRIPTION',
      entityId: sub.id,
      details: { contractorId, newFreeLeads },
    });

    return sub;
  }

  public getSubscriptionMetrics(): SubscriptionMetrics {
    const subs = this.getAllSubscriptions();
    const active = subs.filter((s) => s.status === 'ACTIVE');
    const mrr = active.reduce((sum, s) => sum + (s.monthlyFee || 0), 0);
    const starter = subs.filter((s) => s.tier === 'STARTER').length;
    const pro = subs.filter((s) => s.tier === 'PRO').length;
    const elite = subs.filter((s) => s.tier === 'ELITE').length;

    return {
      activeSubscribers: active.length,
      monthlyRecurringRevenue: mrr,
      starterCount: starter,
      proCount: pro,
      eliteCount: elite,
    };
  }

  // ==========================================
  // REFUNDS & DISPUTES
  // ==========================================

  public getAllRefunds(status?: string): RefundRequest[] {
    const list = Array.from(this.refunds.values());
    if (status && status !== 'ALL') {
      return list.filter((r) => r.status === status);
    }
    return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  public requestRefund(payload: {
    paymentId: string;
    contractorId: string;
    leadId?: string;
    reason: RefundReason;
    reasonDetails: string;
  }): RefundRequest {
    const payment = this.payments.get(payload.paymentId);
    const contractor = contractorService.getProfile(payload.contractorId);
    const user = accountService.getUserById(payload.contractorId);
    const lead = payload.leadId ? leadService.getLeadById(payload.leadId) : undefined;

    const id = `ref-req-${Date.now()}`;
    const now = new Date().toISOString();

    const refund: RefundRequest = {
      id,
      paymentId: payload.paymentId,
      contractorId: payload.contractorId,
      contractorName: user ? `${user.firstName} ${user.lastName}` : (contractor?.businessName || 'Contractor'),
      businessName: contractor?.businessName,
      leadId: payload.leadId,
      leadNumber: lead?.leadNumber,
      amount: payment ? payment.amount : 20.0,
      reason: payload.reason,
      reasonDetails: payload.reasonDetails,
      status: 'PENDING',
      requestedAt: now,
    };

    this.refunds.set(id, refund);
    this.saveToStorage();

    auditLogger.log({
      actorId: payload.contractorId,
      actorRole: 'CONTRACTOR',
      action: 'REFUND_REQUESTED',
      entityType: 'REFUND',
      entityId: id,
      details: { amount: refund.amount, reason: payload.reason },
    });

    return refund;
  }

  public approveRefund(
    refundId: string,
    adminId: string,
    adminName: string,
    notes?: string
  ): { success: boolean; message?: string } {
    const refund = this.refunds.get(refundId);
    if (!refund) return { success: false, message: 'Refund request not found.' };

    const now = new Date().toISOString();
    refund.status = 'APPROVED';
    refund.resolvedAt = now;
    refund.resolvedBy = adminId;
    refund.resolvedByName = adminName;
    refund.resolutionNotes = notes || 'Refund approved. Amount credited back to contractor account balance.';

    // Update original payment status to REFUNDED
    const payment = this.payments.get(refund.paymentId);
    if (payment) {
      payment.status = 'REFUNDED';
    }

    // Record adjustment payment log (negative fee)
    this.recordPayment({
      jobId: payment?.jobId,
      leadId: refund.leadId,
      payerId: refund.contractorId,
      payerName: refund.businessName || refund.contractorName,
      amount: -refund.amount,
      type: 'LEAD_FEE',
      status: 'REFUNDED',
      description: `Refund Approved: #${refund.leadNumber || refund.paymentId} - ${refund.reason.replace(/_/g, ' ')}`,
      paymentMethod: 'Account Credit',
      isDemo: true,
    });

    auditLogger.log({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'REFUND_APPROVED',
      entityType: 'REFUND',
      entityId: refund.id,
      details: { amount: refund.amount, contractorId: refund.contractorId, notes },
    });

    notificationService.notifyUser({
      userId: refund.contractorId,
      title: 'Refund Approved',
      message: `Your refund request for $${refund.amount.toFixed(2)} (${refund.leadNumber || 'Lead Fee'}) was approved by administration.`,
      type: 'SUCCESS',
    });

    this.saveToStorage();
    return { success: true };
  }

  public rejectRefund(
    refundId: string,
    adminId: string,
    adminName: string,
    notes?: string
  ): { success: boolean; message?: string } {
    const refund = this.refunds.get(refundId);
    if (!refund) return { success: false, message: 'Refund request not found.' };

    const now = new Date().toISOString();
    refund.status = 'REJECTED';
    refund.resolvedAt = now;
    refund.resolvedBy = adminId;
    refund.resolvedByName = adminName;
    refund.resolutionNotes = notes || 'Refund denied upon compliance verification.';

    auditLogger.log({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'REFUND_REJECTED',
      entityType: 'REFUND',
      entityId: refund.id,
      details: { contractorId: refund.contractorId, notes },
    });

    notificationService.notifyUser({
      userId: refund.contractorId,
      title: 'Refund Request Declined',
      message: `Your refund request for Lead #${refund.leadNumber || ''} was reviewed and declined. Reason: ${notes || 'Terms compliance'}`,
      type: 'WARNING',
    });

    this.saveToStorage();
    return { success: true };
  }

  // ==========================================
  // DYNAMIC PRICING ENGINE
  // ==========================================

  public getAllPricingRules(): CategoryPricingRule[] {
    return Array.from(this.pricingRules.values());
  }

  public updatePricingRule(
    categoryId: string,
    updates: Partial<CategoryPricingRule>,
    adminId: string,
    adminName: string
  ): CategoryPricingRule {
    const rule = this.pricingRules.get(categoryId);
    const now = new Date().toISOString();

    if (!rule) {
      const newRule: CategoryPricingRule = {
        categoryId,
        categoryName: updates.categoryName || categoryId,
        basePrice: updates.basePrice || 25.0,
        rushMultiplier: updates.rushMultiplier || 1.25,
        emergencyMultiplier: updates.emergencyMultiplier || 1.5,
        isActive: updates.isActive !== undefined ? updates.isActive : true,
        updatedAt: now,
      };
      this.pricingRules.set(categoryId, newRule);
      this.saveToStorage();
      return newRule;
    }

    const updated: CategoryPricingRule = {
      ...rule,
      ...updates,
      updatedAt: now,
    };

    this.pricingRules.set(categoryId, updated);
    this.saveToStorage();

    auditLogger.log({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'PRICING_RULE_UPDATED',
      entityType: 'PRICING_RULE',
      entityId: categoryId,
      details: { updates, adminName },
    });

    return updated;
  }

  public calculateLeadPrice(
    categoryId: string,
    urgency: string,
    contractorId?: string
  ): { price: number; basePrice: number; multiplier: number; discountPercent: number } {
    const rule = this.pricingRules.get(categoryId);
    const base = rule ? rule.basePrice : 25.0;

    let multiplier = 1.0;
    if (urgency === 'EMERGENCY') {
      multiplier = rule ? rule.emergencyMultiplier : 1.5;
    } else if (urgency === 'WITHIN_24_HOURS' || urgency === 'RUSH') {
      multiplier = rule ? rule.rushMultiplier : 1.25;
    }

    let discountPercent = 0;
    if (contractorId) {
      const sub = this.getSubscription(contractorId);
      if (sub && sub.status === 'ACTIVE') {
        discountPercent = sub.leadDiscountPercent;
      }
    }

    const unroundedPrice = base * multiplier * (1 - discountPercent / 100);
    const price = Math.round(unroundedPrice * 100) / 100;

    return { price, basePrice: base, multiplier, discountPercent };
  }

  // ==========================================
  // MARKETPLACE KPIS & AGGREGATIONS
  // ==========================================

  public getMarketplaceKPIs(): MarketplaceKPIs {
    const allUsers = accountService.getAllUsers();
    const customers = allUsers.filter((u) => u.role === 'CUSTOMER');
    const profiles = contractorService.getAllProfiles();

    const verified = profiles.filter(
      (p) => p.onboardingStatus === 'APPROVED' || p.verificationStatus === 'VERIFIED'
    ).length;

    const pending = profiles.filter(
      (p) => p.onboardingStatus === 'PENDING_REVIEW' || p.onboardingStatus === 'SUBMITTED'
    ).length;

    const requests = serviceRequestService.getAllRequests();
    const allLeads = leadService.getAllLeads();

    const availableLeads = allLeads.filter(
      (l) => l.status === 'AVAILABLE' || l.status === 'NEW'
    ).length;

    const claimedLeads = allLeads.filter(
      (l) =>
        l.status === 'ACCEPTED' ||
        l.status === 'PURCHASED' ||
        l.status === 'SCHEDULED' ||
        l.status === 'IN_PROGRESS' ||
        l.status === 'COMPLETED'
    ).length;

    const completedLeads = allLeads.filter((l) => l.status === 'COMPLETED').length;

    const conversionRate =
      allLeads.length > 0 ? Math.round((claimedLeads / allLeads.length) * 100) : 0;

    // Subscriptions MRR
    const allSubs = this.getAllSubscriptions();
    const activeSubs = allSubs.filter((s) => s.status === 'ACTIVE');
    const mrr = activeSubs.reduce((sum, s) => sum + s.monthlyFee, 0);

    // Payments revenue
    const allPayments = Array.from(this.payments.values());
    const leadFeesTotal = allPayments
      .filter((p) => p.type === 'LEAD_FEE' && p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = allPayments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    // Pending refunds
    const pendingRefunds = Array.from(this.refunds.values()).filter(
      (r) => r.status === 'PENDING'
    );
    const pendingRefundsAmount = pendingRefunds.reduce((sum, r) => sum + r.amount, 0);

    return {
      totalCustomers: customers.length,
      totalContractors: profiles.length,
      verifiedContractors: verified,
      pendingContractors: pending,
      totalServiceRequests: requests.length,
      totalLeads: allLeads.length,
      availableLeads,
      claimedLeads,
      completedLeads,
      leadConversionRate: conversionRate,
      totalLeadSalesRevenue: Math.max(0, leadFeesTotal),
      monthlyRecurringRevenue: mrr,
      totalMarketplaceRevenue: Math.max(0, totalRevenue),
      pendingRefundsCount: pendingRefunds.length,
      pendingRefundsAmount,
      activeSubscribersCount: activeSubs.length,
    };
  }

  // ==========================================
  // REAL CSV EXPORT GENERATORS
  // ==========================================

  public exportRevenueCSV(): string {
    const payments = this.getAllPayments();
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Status',
      'Payer Name',
      'Payer ID',
      'Amount ($)',
      'Receipt #',
      'Description',
    ];

    const rows = payments.map((p) => [
      p.id,
      new Date(p.createdAt).toISOString(),
      p.type,
      p.status,
      `"${(p.payerName || '').replace(/"/g, '""')}"`,
      p.payerId,
      p.amount.toFixed(2),
      p.receiptNumber || '',
      `"${(p.description || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportLeadsCSV(): string {
    const leads = leadService.getAllLeads();
    const headers = [
      'Lead Number',
      'Created Date',
      'Category ID',
      'City',
      'State',
      'ZIP',
      'Status',
      'Lead Price ($)',
      'Assigned Business',
      'Contractor ID',
      'Customer ID',
      'Urgency',
    ];

    const rows = leads.map((l) => [
      l.leadNumber,
      new Date(l.createdAt).toISOString(),
      l.serviceCategoryId || l.categoryId,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      l.state,
      l.zipCode,
      l.status,
      l.leadPrice ? l.leadPrice.toFixed(2) : '20.00',
      `"${(l.assignedBusinessName || '').replace(/"/g, '""')}"`,
      l.contractorId || '',
      l.customerId || '',
      l.urgency,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportContractorsCSV(): string {
    const profiles = contractorService.getAllProfiles();
    const headers = [
      'Contractor ID',
      'Business Name',
      'Onboarding Status',
      'Verification Status',
      'City',
      'State',
      'ZIP',
      'Phone',
      'Email',
      'License #',
      'License State',
      'Insurance Provider',
      'Registered Date',
    ];

    const rows = profiles.map((p) => [
      p.userId || p.id,
      `"${(p.businessName || '').replace(/"/g, '""')}"`,
      p.onboardingStatus,
      p.verificationStatus,
      `"${(p.city || '').replace(/"/g, '""')}"`,
      p.state,
      p.primaryServiceZip || '',
      p.contactPhone,
      p.contactEmail,
      p.licenseNumber || '',
      p.licenseState || '',
      `"${(p.insuranceProvider || '').replace(/"/g, '""')}"`,
      p.createdAt ? new Date(p.createdAt).toISOString() : '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportCustomersCSV(): string {
    const customers = accountService.getAllUsers().filter((u) => u.role === 'CUSTOMER');
    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Status',
      'Registered Date',
      'Last Login',
    ];

    const rows = customers.map((c) => [
      c.id,
      `"${(`${c.firstName} ${c.lastName}`).replace(/"/g, '""')}"`,
      c.email,
      c.phone || '',
      c.status,
      new Date(c.createdAt).toISOString(),
      c.updatedAt ? new Date(c.updatedAt).toISOString() : '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportServiceRequestsCSV(): string {
    const requests = serviceRequestService.getAllRequests();
    const headers = [
      'Request ID',
      'Customer ID',
      'Category ID',
      'Title',
      'City',
      'State',
      'ZIP',
      'Urgency',
      'Status',
      'Created Date',
    ];

    const rows = requests.map((r) => [
      r.id,
      r.customerId,
      r.categoryId,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.city || '').replace(/"/g, '""')}"`,
      r.state,
      r.zipCode,
      r.urgency,
      r.status,
      new Date(r.createdAt).toISOString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const marketplaceFinanceService = new MarketplaceFinanceManager();
