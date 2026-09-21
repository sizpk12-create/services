/**
 * You Want Services - Forgot Password View
 * Phase 3 Architecture
 *
 * Implements:
 * - Email address input
 * - Account enumeration mitigation (generic confirmation message)
 * - Transparent Demo Mode simulation (avoids pretending live email was sent)
 * - Direct transition to reset password workflow with generated token
 */

import React, { useState } from 'react';
import { Logo } from '../../components/common/Logo';
import { Input, Button, Alert } from '../../components/common/UIComponents';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { ArrowLeft, Mail, KeyRound, ArrowRight, Info, ShieldCheck } from 'lucide-react';

export const ForgotPasswordView: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const { navigate } = useNavigation();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(normalized);
      setSubmitted(true);
      if (res.token) {
        setDemoToken(res.token);
      }
    } catch {
      setError('Unable to process password reset request. Please try again.');
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
            Reset your password
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            Enter your account email to receive a secure password reset link.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && <Alert variant="danger">{error}</Alert>}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                helperText="We will check our system and generate a secure reset link."
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full"
                leftIcon={<Mail className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Request Processed</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  If an account matching <strong>{email}</strong> exists, password reset instructions have been created.
                </p>
              </div>

              {/* Demo Mode Notice & Simulation Link */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Demo Mode Email Simulation</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  A live email server (SMTP/SES) is not connected in this preview container. In a production environment, an email with a secure, one-time link would be dispatched.
                </p>
                {demoToken && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold"
                    onClick={() => navigate('reset-password', { token: demoToken })}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Simulate Email Click: Reset Password Now
                  </Button>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setDemoToken(null);
                  }}
                  className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  Try another email
                </button>
                <button
                  onClick={() => navigate('login')}
                  className="font-bold text-blue-700 hover:text-blue-800 cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
