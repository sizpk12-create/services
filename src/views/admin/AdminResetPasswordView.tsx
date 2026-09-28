/**
 * You Want Services - Dedicated Administrator Password Reset View
 * Prompt #10 Architecture
 *
 * Implements:
 * - Dedicated Admin Password Reset at /admin/reset-password
 * - Token verification & 15-minute expiration check
 * - Strong password complexity validation
 * - Single-use token invalidation
 * - Active session revocation on password reset
 * - Return to Admin Login
 */

import React, { useState, useEffect } from 'react';
import { Button, Alert } from '../../components/common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import { adminAuthService } from '../../services/adminAuthService';
import { validateAdminPassword } from '../../services/cryptoUtils';
import {
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const AdminResetPasswordView: React.FC = () => {
  const { navigate, routeParams } = useNavigation();

  // Extract token from routeParams or URL
  const getInitialToken = () => {
    if (routeParams?.token) return routeParams.token;
    // Check hash query string (e.g. #/admin-reset-password?token=XYZ)
    const hash = window.location.hash;
    const tokenMatch = hash.match(/token=([^&]+)/);
    if (tokenMatch) return decodeURIComponent(tokenMatch[1]);
    // Check search params
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token') || '';
  };

  const [token, setToken] = useState<string>(getInitialToken);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token whenever token changes
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError('Password reset token is missing. Please use the link provided in your email.');
      return;
    }

    const validation = adminAuthService.validateResetToken(token);
    if (validation.valid) {
      setTokenValid(true);
      setTokenError(null);
    } else {
      setTokenValid(false);
      setTokenError(validation.error || 'Password reset token is invalid or has expired.');
    }
  }, [token]);

  const passwordValidation = validateAdminPassword(newPassword);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0] || 'Password does not meet administrative security requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminAuthService.resetPasswordWithToken(token, newPassword, confirmPassword);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.message || 'Failed to reset administrator password.');
      }
    } catch {
      setError('A secure terminal error occurred while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-2xl shadow-inner mb-2">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-xl font-black text-white tracking-wide uppercase">
            YOU WANT SERVICES
          </h1>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            SET NEW ADMIN PASSWORD
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create a high-strength password for authorized administrative access.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Success State */}
          {isSuccess ? (
            <div className="space-y-5 text-center">
              <div className="inline-flex p-3 bg-emerald-950/80 border border-emerald-800 rounded-full text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Password Reset Successful</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your administrator password has been updated and all prior active sessions have been securely invalidated.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => navigate('admin-login')}
                className="w-full !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Administrator Login
              </Button>
            </div>
          ) : tokenValid === false ? (
            /* Token Invalid or Expired State */
            <div className="space-y-4">
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Invalid or Expired Token</span>
                </div>
                <p className="text-xs text-rose-200/80 leading-relaxed">
                  {tokenError || 'This reset token is invalid, has expired, or has already been used.'}
                </p>
              </div>

              {/* Optional Manual Token Input in case of truncation */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Have a reset token? Enter or paste it here:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value.trim())}
                    placeholder="adm_rst_..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const v = adminAuthService.validateResetToken(token);
                      setTokenValid(v.valid);
                      setTokenError(v.error || null);
                    }}
                  >
                    Verify
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => navigate('admin-forgot-password')}
                  className="w-full !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                >
                  Request a New Password Reset Link
                </Button>
              </div>
            </div>
          ) : (
            /* Valid Token - Password Reset Form */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2 text-xs text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Authorized token verified. Set your new master password.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
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

                {/* Password Strength Checklist */}
                <div className="mt-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-[11px]">
                  <div className="font-semibold text-slate-400 mb-1">Administrative Requirements:</div>
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
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Reset Password & Invalidate Token
              </Button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => navigate('admin-login')}
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Return to Administrator Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
