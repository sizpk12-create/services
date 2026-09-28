/**
 * You Want Services - Dedicated Administrator Login & First-Time Setup View
 * Prompt #10 Architecture
 *
 * Implements:
 * - Dedicated Admin Login at /admin/login
 * - First-Time Administrator Setup when no admin account exists
 * - Cryptographic salted hash authentication
 * - Two-Factor Authentication (2FA) verification step
 * - Rate limiting & brute force lockout defense
 * - Account enumeration defense
 * - Complete isolation from Customer and Contractor accounts
 */

import React, { useState, useEffect } from 'react';
import { Logo } from '../../components/common/Logo';
import { Input, Button, Alert } from '../../components/common/UIComponents';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { adminAuthService } from '../../services/adminAuthService';
import { validateAdminPassword } from '../../services/cryptoUtils';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useNavigation();

  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 2FA States
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [temp2FAToken, setTemp2FAToken] = useState('');

  // First-Time Setup States
  const [setupFirstName, setSetupFirstName] = useState('');
  const [setupLastName, setSetupLastName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  // Check setup status on mount
  useEffect(() => {
    const status = adminAuthService.getSetupStatus();
    setIsInitialized(status.initialized);
    setCheckingStatus(false);
  }, []);

  // Real-time password validation for setup
  const passwordValidation = validateAdminPassword(setupPassword);

  // Handle standard Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminAuthService.login(email.trim(), password);

      if (!res.success) {
        setError(res.message || 'Invalid administrator credentials.');
        return;
      }

      if (res.requires2FA && res.temp2FAToken) {
        setTemp2FAToken(res.temp2FAToken);
        setIs2FAStep(true);
        setSuccessMsg('Primary credentials verified. Enter your 6-digit verification code.');
        return;
      }

      if (res.user) {
        // Synchronize with global AuthContext
        await login(res.user.email, password, 'ADMIN');
        navigate('admin-dashboard');
      }
    } catch {
      setError('A secure terminal error occurred. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!twoFACode || twoFACode.length < 6) {
      setError('Please enter a valid 6-digit security verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = adminAuthService.verify2FA(twoFACode, temp2FAToken);
      if (res.success && res.user) {
        await login(res.user.email, undefined, 'ADMIN');
        navigate('admin-dashboard');
      } else {
        setError(res.message || 'Invalid 2FA code. Please try again.');
      }
    } catch {
      setError('Failed to verify two-factor authentication code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle First-Time Setup
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!setupEmail.trim()) {
      setError('Please enter a valid administrator email address.');
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0] || 'Password does not satisfy complexity requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminAuthService.setupFirstAdmin({
        firstName: setupFirstName,
        lastName: setupLastName,
        email: setupEmail,
        password: setupPassword,
        confirmPassword: setupConfirmPassword,
      });

      if (res.success && res.user) {
        setIsInitialized(true);
        setSuccessMsg('Administrator account provisioned successfully. Routing to control center...');
        await login(res.user.email, setupPassword, 'SUPER_ADMIN');
        setTimeout(() => {
          navigate('admin-dashboard');
        }, 1200);
      } else {
        setError(res.message || 'Failed to initialize administrator account.');
      }
    } catch {
      setError('An error occurred during account initialization.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand & Security Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-2xl shadow-inner mb-2">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-xl font-black text-white tracking-wide uppercase">
            YOU WANT SERVICES
          </h1>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            {isInitialized ? 'ADMINISTRATOR LOGIN' : 'FIRST-TIME ADMIN SETUP'}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isInitialized
              ? 'Restricted Access • Authorized Operations Staff & Platform Administrators Only'
              : 'Initial Platform Provisioning • Create the primary master administrator account'}
          </p>
        </div>

        {/* Security Notification Banner */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5 text-xs text-slate-400 shadow-sm">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Encrypted cryptographic session with strict role separation.</span>
        </div>

        {/* Dynamic Card: Setup vs Standard Login vs 2FA */}
        <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          {error && <Alert variant="danger">{error}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          {/* MODE 1: First-Time Setup */}
          {!isInitialized ? (
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Setup Master Administrator</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Choose your administrative email address and set your own secure master password. This account will have full platform authority.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={setupFirstName}
                    onChange={(e) => setSetupFirstName(e.target.value)}
                    placeholder="e.g. Master"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={setupLastName}
                    onChange={(e) => setSetupLastName(e.target.value)}
                    placeholder="e.g. Admin"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrator Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder="e.g. owner@youwantservices.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type={showSetupPassword ? 'text' : 'password'}
                    required
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupPassword(!showSetupPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                <div className="mt-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-[11px]">
                  <div className="font-semibold text-slate-400 mb-1">Security Requirements:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.minLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordValidation.requirements.minLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>10+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordValidation.requirements.hasUppercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>1 uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordValidation.requirements.hasLowercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>1 lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordValidation.requirements.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>1 number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.requirements.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordValidation.requirements.hasSpecialChar ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>1 special character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={setupConfirmPassword}
                    onChange={(e) => setSetupConfirmPassword(e.target.value)}
                    placeholder="Repeat master password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-950"
                rightIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Initialize Master Administrator
              </Button>
            </form>
          ) : is2FAStep ? (
            /* MODE 2: 2FA Verification */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 bg-indigo-950 border border-indigo-800 rounded-full text-indigo-400 mb-1">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Two-Factor Verification</h3>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit security code generated by your authenticator app.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
              >
                Verify Code & Authorize
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIs2FAStep(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ← Back to standard login
                </button>
              </div>
            </form>
          ) : (
            /* MODE 3: Standard Admin Login */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@youwantservices.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('admin-forgot-password')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold shadow-md shadow-indigo-950"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Admin Terminal
              </Button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="hover:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Return to Public Marketplace</span>
            </button>
            <span className="text-[10px] text-slate-600">Prompt #10 Security Architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
};
