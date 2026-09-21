/**
 * You Want Services - Authentication Architecture
 * Phase 3 Architecture
 *
 * Provides:
 * - Customer registration with duplicate detection & legal consent
 * - Customer authentication & role segregation
 * - Password reset lifecycle with secure tokens and expiration
 * - Profile updates and password changes
 * - Safe account deactivation
 * - Demo mode role switching
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CustomerProfile, ContractorProfile } from '../types/database';
import { DEMO_USERS } from '../config/demo';
import { auditLogger } from '../services/auditLogger';
import { accountService, RegisterCustomerPayload, AuthResult } from '../services/accountService';
import { contractorService, RegisterContractorPayload } from '../services/contractorService';

interface UpdateProfilePayload {
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

interface AuthContextType {
  currentUser: User | null;
  currentProfile: CustomerProfile | ContractorProfile | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password?: string, defaultRole?: UserRole) => Promise<AuthResult>;
  registerCustomer: (data: RegisterCustomerPayload) => Promise<AuthResult>;
  registerContractor: (data: RegisterContractorPayload) => Promise<{ success: boolean; duplicate?: boolean; message: string; user?: User; profile?: ContractorProfile }>;
  updateContractorProfile: (updates: Partial<ContractorProfile>) => Promise<{ success: boolean; profile?: ContractorProfile; message?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; token?: string; simulatedUser?: boolean }>;
  validateResetToken: (token: string) => { valid: boolean; user?: User; error?: string };
  resetPasswordWithToken: (token: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateCustomerProfile: (data: UpdateProfilePayload) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  deactivateAccount: () => Promise<{ success: boolean; message: string }>;
  switchDemoRole: (roleKey: 'customer' | 'contractor' | 'admin' | 'superAdmin') => void;
  updateUserStatus: (status: User['status']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('yws_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved auth user', e);
      }
    }
    // Default to Customer for seamless exploration in sandbox
    return DEMO_USERS.customer.user;
  });

  const [currentProfile, setCurrentProfile] = useState<CustomerProfile | ContractorProfile | null>(() => {
    const saved = localStorage.getItem('yws_auth_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved auth profile', e);
      }
    }
    return (DEMO_USERS.customer.profile as CustomerProfile) || null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('yws_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('yws_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem('yws_auth_profile', JSON.stringify(currentProfile));
    } else {
      localStorage.removeItem('yws_auth_profile');
    }
  }, [currentProfile]);

  const login = async (
    email: string,
    password?: string,
    roleOverride?: UserRole
  ): Promise<AuthResult> => {
    // 1. Attempt authentication with accountService
    const result = accountService.authenticate(email, password);

    if (result.success && result.user) {
      // Role override check for demo switching
      if (roleOverride && result.user.role !== roleOverride) {
        result.user.role = roleOverride;
      }

      setCurrentUser(result.user);
      setCurrentProfile(result.profile || null);
      return result;
    }

    // 2. Demo fallback if user entered standard demo credentials or quick login
    const matchedKey = Object.keys(DEMO_USERS).find(
      (k) => DEMO_USERS[k].user.email.toLowerCase() === email.toLowerCase()
    );

    if (matchedKey) {
      const demoAccount = DEMO_USERS[matchedKey];
      setCurrentUser(demoAccount.user);
      setCurrentProfile(demoAccount.profile || null);
      auditLogger.log({
        actorId: demoAccount.user.id,
        actorRole: demoAccount.user.role,
        action: 'USER_LOGIN',
        entityType: 'AUTH',
        entityId: demoAccount.user.id,
        isDemo: true,
      });
      return { success: true, user: demoAccount.user, profile: demoAccount.profile as CustomerProfile };
    }

    // Return the error message from accountService
    return result;
  };

  const registerCustomer = async (data: RegisterCustomerPayload): Promise<AuthResult> => {
    const result = accountService.registerCustomer(data);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setCurrentProfile(result.profile || null);
    }

    return result;
  };

  const registerContractor = async (
    data: RegisterContractorPayload
  ): Promise<{ success: boolean; duplicate?: boolean; message: string; user?: User; profile?: ContractorProfile }> => {
    const result = contractorService.registerContractor(data);

    if (result.success && result.user && result.profile) {
      setCurrentUser(result.user);
      setCurrentProfile(result.profile);
    }

    return result;
  };

  const updateContractorProfile = async (
    updates: Partial<ContractorProfile>
  ): Promise<{ success: boolean; profile?: ContractorProfile; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Not authenticated.' };
    }

    const res = contractorService.updateProfile(currentUser.id, updates, currentUser);
    if (res.success && res.profile) {
      setCurrentProfile({ ...res.profile });
    }
    return res;
  };

  const logout = () => {
    if (currentUser) {
      auditLogger.log({
        actorId: currentUser.id,
        actorRole: currentUser.role,
        action: 'USER_LOGOUT',
        entityType: 'AUTH',
        entityId: currentUser.id,
        isDemo: true,
      });
    }
    setCurrentUser(null);
    setCurrentProfile(null);
    localStorage.removeItem('yws_auth_user');
    localStorage.removeItem('yws_auth_profile');
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message: string; token?: string; simulatedUser?: boolean }> => {
    return accountService.requestPasswordReset(email);
  };

  const validateResetToken = (token: string) => {
    return accountService.validateResetToken(token);
  };

  const resetPasswordWithToken = async (
    token: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    return accountService.resetPasswordWithToken(token, newPass);
  };

  const updateCustomerProfile = async (
    data: UpdateProfilePayload
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Not authenticated.' };
    }

    const res = accountService.updateCustomerProfile(currentUser.id, data);
    if (res.success && res.user) {
      setCurrentUser({ ...res.user });
      if (res.profile) {
        setCurrentProfile({ ...res.profile });
      }
    }
    return res;
  };

  const changePassword = async (
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Not authenticated.' };
    }
    return accountService.changePassword(currentUser.id, currentPass, newPass);
  };

  const deactivateAccount = async (): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Not authenticated.' };
    }
    const res = accountService.deactivateAccount(currentUser.id);
    if (res.success) {
      logout();
    }
    return res;
  };

  const switchDemoRole = (roleKey: 'customer' | 'contractor' | 'admin' | 'superAdmin') => {
    const selected = DEMO_USERS[roleKey];
    if (selected) {
      setCurrentUser(selected.user);
      if (selected.user.role === 'CONTRACTOR') {
        const enrichedProfile = contractorService.getProfileByUserId(selected.user.id);
        setCurrentProfile(enrichedProfile || (selected.profile as ContractorProfile) || null);
      } else {
        setCurrentProfile(selected.profile || null);
      }
      auditLogger.log({
        actorId: selected.user.id,
        actorRole: selected.user.role,
        action: 'DEMO_ROLE_SWITCH',
        entityType: 'AUTH',
        entityId: selected.user.id,
        details: { targetRole: selected.user.role },
        isDemo: true,
      });
    }
  };

  const updateUserStatus = (status: User['status']) => {
    if (currentUser) {
      const updated = { ...currentUser, status };
      setCurrentUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProfile,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || null,
        login,
        registerCustomer,
        registerContractor,
        updateContractorProfile,
        logout,
        requestPasswordReset,
        validateResetToken,
        resetPasswordWithToken,
        updateCustomerProfile,
        changePassword,
        deactivateAccount,
        switchDemoRole,
        updateUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
