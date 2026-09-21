/**
 * You Want Services - Customer & User Account Service
 * Phase 3 Architecture
 *
 * Implements:
 * - Duplicate email prevention
 * - Registration with Terms of Service & Privacy Policy consent recording
 * - Authentication & role enforcement
 * - Password reset tokens with expiration and one-time use
 * - Customer profile & settings management
 * - Safe account deactivation workflow
 */

import { User, CustomerProfile, UserRole, UserStatus } from '../types/database';
import { DEMO_USERS } from '../config/demo';
import { auditLogger } from './auditLogger';

export interface RegisterCustomerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  preferredContactMethod?: 'PHONE' | 'EMAIL' | 'SMS';
  termsAccepted: boolean;
  termsVersion?: string;
  privacyVersion?: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  duplicate?: boolean;
  user?: User;
  profile?: CustomerProfile;
}

const STORAGE_USERS_KEY = 'yws_user_registry_v3';
const STORAGE_PROFILES_KEY = 'yws_customer_profiles_v3';
const STORAGE_PASSWORDS_KEY = 'yws_user_credentials_v3'; // In sandbox, store simulated hashes

class AccountService {
  private users: Map<string, User> = new Map();
  private profiles: Map<string, CustomerProfile> = new Map();
  private credentials: Map<string, string> = new Map(); // email -> simulated password hash

  constructor() {
    this.initStore();
  }

  private initStore() {
    // 1. Seed demo accounts
    Object.values(DEMO_USERS).forEach((entry) => {
      this.users.set(entry.user.id, { ...entry.user });
      this.credentials.set(entry.user.email.toLowerCase(), 'DemoPass123!');
      if (entry.profile && entry.user.role === 'CUSTOMER') {
        this.profiles.set(entry.user.id, { ...(entry.profile as CustomerProfile) });
      }
    });

    // 2. Load persistent registered accounts from localStorage
    try {
      const savedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      if (savedUsers) {
        const parsed: User[] = JSON.parse(savedUsers);
        parsed.forEach((u) => this.users.set(u.id, u));
      }

      const savedProfiles = localStorage.getItem(STORAGE_PROFILES_KEY);
      if (savedProfiles) {
        const parsed: CustomerProfile[] = JSON.parse(savedProfiles);
        parsed.forEach((p) => this.profiles.set(p.userId, p));
      }

      const savedCreds = localStorage.getItem(STORAGE_PASSWORDS_KEY);
      if (savedCreds) {
        const parsed: Record<string, string> = JSON.parse(savedCreds);
        Object.entries(parsed).forEach(([k, v]) => this.credentials.set(k.toLowerCase(), v));
      }
    } catch (err) {
      console.warn('Failed to load user accounts from localStorage', err);
    }
  }

  private saveToStorage() {
    try {
      const usersArray = Array.from(this.users.values());
      const profilesArray = Array.from(this.profiles.values());
      const credsObj: Record<string, string> = {};
      this.credentials.forEach((v, k) => {
        credsObj[k] = v;
      });

      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(usersArray));
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profilesArray));
      localStorage.setItem(STORAGE_PASSWORDS_KEY, JSON.stringify(credsObj));
    } catch (err) {
      console.warn('Failed to persist user accounts to localStorage', err);
    }
  }

  /**
   * Check if an email address is already registered
   */
  public isEmailRegistered(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email.trim().toLowerCase() === normalized) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find a user by email
   */
  public findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email.trim().toLowerCase() === normalized) {
        return u;
      }
    }
    return undefined;
  }

  /**
   * Register a new Customer Account with duplicate detection & consent recording
   */
  public registerCustomer(payload: RegisterCustomerPayload): AuthResult {
    const normalizedEmail = payload.email.trim().toLowerCase();

    // 1. Duplicate Account check
    if (this.isEmailRegistered(normalizedEmail)) {
      return {
        success: false,
        duplicate: true,
        message: 'An account with this email already exists. Please log in or reset your password.',
      };
    }

    // 2. Validate Terms Consent
    if (!payload.termsAccepted) {
      return {
        success: false,
        message: 'You must agree to the Terms of Service and Privacy Policy to create an account.',
      };
    }

    const userId = `usr-cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: normalizedEmail,
      phone: payload.phone.trim(),
      role: 'CUSTOMER',
      status: 'ACTIVE',
      termsAccepted: true,
      termsAcceptedAt: now,
      termsVersion: payload.termsVersion || 'v1.0-2026',
      privacyVersion: payload.privacyVersion || 'v1.0-2026',
      createdAt: now,
      updatedAt: now,
    };

    const newProfile: CustomerProfile = {
      id: `prof-cust-${Date.now()}`,
      userId: userId,
      address: payload.address.trim(),
      city: payload.city.trim(),
      state: payload.state.trim().toUpperCase(),
      zipCode: payload.zipCode.trim(),
      preferredContactMethod: payload.preferredContactMethod || 'EMAIL',
      emailNotifications: true,
      smsNotifications: true,
      serviceRequestNotifications: true,
      marketingCommunications: false,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    // Store records
    this.users.set(userId, newUser);
    this.profiles.set(userId, newProfile);
    this.credentials.set(normalizedEmail, payload.password);
    this.saveToStorage();

    // Audit log
    auditLogger.log({
      actorId: userId,
      actorRole: 'CUSTOMER',
      action: 'CUSTOMER_REGISTRATION',
      entityType: 'USER',
      entityId: userId,
      details: {
        email: normalizedEmail,
        city: newProfile.city,
        state: newProfile.state,
        zipCode: newProfile.zipCode,
        termsVersion: newUser.termsVersion,
        privacyVersion: newUser.privacyVersion,
        consentTimestamp: now,
      },
      isDemo: true,
    });

    return {
      success: true,
      user: newUser,
      profile: newProfile,
      message: 'Account created successfully.',
    };
  }

  /**
   * Authenticate user credentials
   */
  public authenticate(email: string, password?: string): AuthResult {
    const normalized = email.trim().toLowerCase();
    const user = this.findUserByEmail(normalized);

    if (!user) {
      return {
        success: false,
        message: 'Invalid email address or password.',
      };
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return {
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      };
    }

    // In demo sandbox: verify password if configured, or allow demo passwords
    const storedPass = this.credentials.get(normalized);
    if (storedPass && password && storedPass !== password && password !== 'DemoPass123!') {
      return {
        success: false,
        message: 'Invalid email address or password.',
      };
    }

    let profile: any = this.profiles.get(user.id);
    if (!profile && user.role === 'CONTRACTOR') {
      try {
        const savedProfiles = localStorage.getItem('yws_contractor_profiles_v5');
        if (savedProfiles) {
          const parsed: any[] = JSON.parse(savedProfiles);
          profile = parsed.find((p) => p.userId === user.id);
        }
        if (!profile && (user.id === 'demo-usr-contractor-1' || user.email === 'marcus@apexheatingcooling.demo')) {
          profile = DEMO_USERS.contractor.profile;
        }
      } catch {
        // fallback
      }
    }

    auditLogger.log({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      isDemo: true,
    });

    return {
      success: true,
      user,
      profile,
    };
  }

  /**
   * Request password reset token
   * Protects against account enumeration while providing demo simulation link
   */
  public requestPasswordReset(email: string): {
    success: boolean;
    token?: string;
    message: string;
    simulatedUser?: boolean;
  } {
    const normalized = email.trim().toLowerCase();
    const user = this.findUserByEmail(normalized);

    const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

    if (user) {
      user.resetPasswordToken = token;
      user.resetPasswordExpiresAt = expiresAt;
      this.users.set(user.id, user);
      this.saveToStorage();

      auditLogger.log({
        actorId: user.id,
        actorRole: user.role,
        action: 'PASSWORD_RESET_TOKEN_GENERATED',
        entityType: 'AUTH',
        entityId: user.id,
        details: { tokenPrefix: token.substring(0, 10), expiresAt },
        isDemo: true,
      });

      return {
        success: true,
        token,
        simulatedUser: true,
        message:
          'If an account with this email exists, password reset instructions have been generated.',
      };
    }

    // Account enumeration protection: return generic message even if user not found
    return {
      success: true,
      token,
      simulatedUser: false,
      message:
        'If an account with this email exists, password reset instructions have been generated.',
    };
  }

  /**
   * Validate a reset token
   */
  public validateResetToken(token: string): { valid: boolean; user?: User; error?: string } {
    if (!token) {
      return { valid: false, error: 'Password reset token is missing.' };
    }

    for (const u of this.users.values()) {
      if (u.resetPasswordToken === token) {
        if (!u.resetPasswordExpiresAt || new Date(u.resetPasswordExpiresAt).getTime() < Date.now()) {
          return { valid: false, error: 'Password reset token has expired. Please request a new one.' };
        }
        return { valid: true, user: u };
      }
    }

    return { valid: false, error: 'Password reset token is invalid or has already been used.' };
  }

  /**
   * Reset password using one-time token
   */
  public resetPasswordWithToken(
    token: string,
    newPassword: string
  ): { success: boolean; message: string } {
    const validation = this.validateResetToken(token);
    if (!validation.valid || !validation.user) {
      return {
        success: false,
        message: validation.error || 'Password reset token is invalid or expired.',
      };
    }

    const user = validation.user;
    this.credentials.set(user.email.toLowerCase(), newPassword);

    // One-time use: clear the reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
    this.saveToStorage();

    auditLogger.log({
      actorId: user.id,
      actorRole: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'AUTH',
      entityId: user.id,
      isDemo: true,
    });

    return {
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new password.',
    };
  }

  /**
   * Update customer profile & address
   */
  public updateCustomerProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      preferredContactMethod?: 'PHONE' | 'EMAIL' | 'SMS';
      serviceInterests?: string[];
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      serviceRequestNotifications?: boolean;
      marketingCommunications?: boolean;
      onboardingCompleted?: boolean;
    }
  ): { success: boolean; user?: User; profile?: CustomerProfile; message?: string } {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Role cannot be changed by customer
    if (data.firstName) user.firstName = data.firstName.trim();
    if (data.lastName) user.lastName = data.lastName.trim();
    if (data.phone) user.phone = data.phone.trim();
    user.updatedAt = new Date().toISOString();
    this.users.set(userId, user);

    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = {
        id: `prof-cust-${Date.now()}`,
        userId,
        address: data.address || '',
        city: data.city || '',
        state: data.state || 'IL',
        zipCode: data.zipCode || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (data.address !== undefined) profile.address = data.address.trim();
    if (data.city !== undefined) profile.city = data.city.trim();
    if (data.state !== undefined) profile.state = data.state.trim().toUpperCase();
    if (data.zipCode !== undefined) profile.zipCode = data.zipCode.trim();
    if (data.preferredContactMethod !== undefined)
      profile.preferredContactMethod = data.preferredContactMethod;
    if (data.serviceInterests !== undefined) profile.serviceInterests = data.serviceInterests;
    if (data.emailNotifications !== undefined) profile.emailNotifications = data.emailNotifications;
    if (data.smsNotifications !== undefined) profile.smsNotifications = data.smsNotifications;
    if (data.serviceRequestNotifications !== undefined)
      profile.serviceRequestNotifications = data.serviceRequestNotifications;
    if (data.marketingCommunications !== undefined)
      profile.marketingCommunications = data.marketingCommunications;
    if (data.onboardingCompleted !== undefined)
      profile.onboardingCompleted = data.onboardingCompleted;

    profile.updatedAt = new Date().toISOString();
    this.profiles.set(userId, profile);
    this.saveToStorage();

    auditLogger.log({
      actorId: userId,
      actorRole: user.role,
      action: 'CUSTOMER_PROFILE_UPDATED',
      entityType: 'USER_PROFILE',
      entityId: profile.id,
      isDemo: true,
    });

    return { success: true, user, profile, message: 'Profile updated successfully.' };
  }

  /**
   * Change user password with current password verification
   */
  public changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): { success: boolean; message: string } {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const storedPass = this.credentials.get(user.email.toLowerCase());
    if (storedPass && storedPass !== currentPass && currentPass !== 'DemoPass123!') {
      return { success: false, message: 'Current password does not match.' };
    }

    this.credentials.set(user.email.toLowerCase(), newPass);
    this.saveToStorage();

    auditLogger.log({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_PASSWORD_CHANGED',
      entityType: 'AUTH',
      entityId: user.id,
      isDemo: true,
    });

    return { success: true, message: 'Password updated successfully.' };
  }

  /**
   * Deactivate account safely (marks status as INACTIVE rather than destructive delete)
   */
  public deactivateAccount(userId: string): { success: boolean; message: string } {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    user.status = 'INACTIVE';
    user.updatedAt = new Date().toISOString();
    this.users.set(userId, user);
    this.saveToStorage();

    auditLogger.log({
      actorId: userId,
      actorRole: user.role,
      action: 'USER_ACCOUNT_DEACTIVATED',
      entityType: 'USER',
      entityId: userId,
      details: { reason: 'User requested deactivation' },
      isDemo: true,
    });

    return { success: true, message: 'Your account has been deactivated.' };
  }

  /**
   * Register a custom pre-created User (e.g. Contractor) into identity map
   */
  public registerCustomUser(user: User, password?: string) {
    this.users.set(user.id, user);
    if (password) {
      this.credentials.set(user.email.toLowerCase(), password);
    }
    this.saveToStorage();
  }

  /**
   * Get user by ID
   */
  public getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get all registered users
   */
  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Admin update user status (e.g. SUSPENDED, ACTIVE, INACTIVE)
   */
  public updateUserStatus(
    userId: string,
    status: UserStatus,
    adminId?: string,
    reason?: string
  ): { success: boolean; user?: User; message?: string } {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const previousStatus = user.status;
    user.status = status;
    user.updatedAt = new Date().toISOString();
    this.users.set(userId, user);
    this.saveToStorage();

    auditLogger.log({
      actorId: adminId || 'SYSTEM_ADMIN',
      actorRole: 'ADMIN',
      action: 'ADMIN_UPDATED_USER_STATUS',
      entityType: 'USER',
      entityId: userId,
      details: { previousStatus, newStatus: status, reason },
      isDemo: true,
    });

    return { success: true, user, message: `Account status updated to ${status}.` };
  }

  /**
   * Get user profile
   */
  public getProfile(userId: string): CustomerProfile | undefined {
    return this.profiles.get(userId);
  }
}

export const accountService = new AccountService();
