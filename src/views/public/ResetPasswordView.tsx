/**
 * You Want Services - Reset Password View
 * Phase 3 Architecture
 *
 * Implements:
 * - One-time secure token validation & expiry verification
 * - Strong password requirement checks
 * - Confirmation comparison
 * - Immediate token invalidation upon successful completion
 */

import React, { useState, useEffect } from 'react';
import { Logo } from '../../components/common/Logo';
import { Input, Button, Alert } from '../../components/common/UIComponents';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Lock, CheckCircle2, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export const ResetPasswordView: React.FC = () => {
  const { validateResetToken, resetPasswordWithToken } = useAuth();
  const { navigate, routeParams } = useNavigation();

  const token = routeParams.token || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Password reset token is missing or malformed.');
      return;
    }

    const check = validateResetToken(token);
    setTokenValid(check.valid);
    if (!check.valid) {
      setError(check.error || 'Password reset token is invalid or expired.');
    }
  }, [token, validateResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strong password validation: min 8 characters, letter and number
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithToken(token, password);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message);
      }
    } catch {
      setError('An unexpected error occurred while resetting your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center">
          <Logo size="lg" onClick={() => navigate('home')} className="mx-auto cursor-pointer" />
          <h2 className="mt-6 text-2xl font-black text-slate-900 tracking-tight">
            Create a New Password
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            Set a secure password for your You Want Services account.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && <Alert variant="danger">{error}</Alert>}

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Password Reset Complete!</h3>
              <p className="text-xs text-slate-600">
                Your password has been updated securely. You can now log into your account using your new credentials.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => navigate('login')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          ) : tokenValid === false ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Invalid or Expired Token</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This password reset link is invalid or has already been used. Please submit a new request.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('forgot-password')}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                >
                  Request New Reset Link
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('login')}
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  helperText="Must be 8+ characters and contain letters and numbers"
                />
              </div>

              <div>
                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
                  <li className={password.length >= 8 ? 'text-emerald-700 font-semibold' : ''}>
                    Minimum 8 characters
                  </li>
                  <li className={/[0-9]/.test(password) && /[a-zA-Z]/.test(password) ? 'text-emerald-700 font-semibold' : ''}>
                    Contains both letters and numbers
                  </li>
                  <li className={password && confirmPassword && password === confirmPassword ? 'text-emerald-700 font-semibold' : ''}>
                    Passwords match
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full"
                leftIcon={<Lock className="w-4 h-4" />}
              >
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
