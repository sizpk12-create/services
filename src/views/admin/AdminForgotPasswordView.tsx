/**
 * You Want Services - Admin Password Recovery Request View
 * Prompt #10 Architecture
 *
 * Implements:
 * - Dedicated Admin Password Recovery at /admin/forgot-password
 * - Account enumeration prevention (generic response)
 * - Single-use expiring token generation (15 min validity)
 * - Development/testing preview simulator for offline sandbox
 * - Direct routing to /admin/reset-password
 */

import React, { useState } from 'react';
import { Button, Alert } from '../../components/common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import { adminAuthService } from '../../services/adminAuthService';
import { Shield, Mail, ArrowLeft, Send, CheckCircle2, Copy, ExternalLink } from 'lucide-react';

export const AdminForgotPasswordView: React.FC = () => {
  const { navigate } = useNavigation();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [demoResetToken, setDemoResetToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await adminAuthService.requestPasswordReset(email.trim());
      setSubmitted(true);
      setStatusMessage(res.message);
      if (res.resetToken) {
        setDemoResetToken(res.resetToken);
      }
    } catch {
      setSubmitted(true);
      setStatusMessage(
        'If an administrator account exists for this email address, password-reset instructions will be sent.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (demoResetToken) {
      const url = `${window.location.origin}${window.location.pathname}#/admin-reset-password?token=${demoResetToken}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            ADMIN PASSWORD RECOVERY
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Authorized administrative account password reset dispatch.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered administrator email address. If authorized, a cryptographically signed, single-use password reset link expiring in 15 minutes will be issued.
              </p>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@youwantservices.com"
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
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Password Reset Instructions
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Request Processed</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {statusMessage}
                </p>
                <p className="text-[11px] text-slate-500">
                  For security, the reset token is single-use and invalidates automatically after 15 minutes.
                </p>
              </div>

              {/* Sandbox / Testing Dispatch Simulation Helper */}
              {demoResetToken && (
                <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                    <span>Developer / Testing Dispatch</span>
                    <span className="text-[10px] text-indigo-400">15-min Token</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    In this sandbox environment, you can test the password reset immediately using the generated token:
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('admin-reset-password', { token: demoResetToken })}
                      className="!bg-indigo-600 hover:!bg-indigo-700 text-xs py-1.5 flex-1"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Proceed to Reset Form
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="text-xs py-1.5 border-slate-700 text-slate-300 hover:text-white"
                      leftIcon={<Copy className="w-3.5 h-3.5" />}
                    >
                      {copied ? 'Copied!' : 'Copy Token'}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('admin-login')}
                className="w-full border-slate-700 text-slate-300 hover:text-white"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Return to Administrator Login
              </Button>
            </div>
          )}

          {/* Footer Back Link */}
          {!submitted && (
            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => navigate('admin-login')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Administrator Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
