/**
 * You Want Services - Customer & Platform Login View
 * Phase 3 Architecture
 *
 * Implements:
 * - Professional customer login with email and password
 * - "Forgot Password?" routing to the dedicated password reset flow
 * - "Create Account" link routing to customer registration
 * - Strict role-based destination routing (customers always route to customer portal)
 * - Transparent Demo Mode quick logins & "Continue as a Customer" shortcut
 */

import React, { useState } from 'react';
import { Logo } from '../../components/common/Logo';
import { Input, Button, Alert } from '../../components/common/UIComponents';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Lock, Mail, ArrowRight, UserCheck, ShieldCheck, User } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const { navigate } = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success && res.user) {
        // Enforce strict destination routing by role
        if (res.user.role === 'CUSTOMER') {
          navigate('customer-dashboard');
        } else if (res.user.role === 'CONTRACTOR') {
          navigate('contractor-dashboard');
        } else if (res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN') {
          navigate('admin-dashboard');
        } else {
          navigate('customer-dashboard');
        }
      } else {
        setError(res.message || 'Invalid email address or password.');
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsCustomer = () => {
    switchDemoRole('customer');
    navigate('customer-dashboard');
  };

  const handleQuickLogin = (roleKey: 'customer' | 'contractor' | 'admin' | 'superAdmin') => {
    switchDemoRole(roleKey);
    if (roleKey === 'customer') {
      navigate('customer-dashboard');
    } else if (roleKey === 'contractor') {
      navigate('contractor-dashboard');
    } else {
      navigate('admin-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Top Branding */}
        <div className="text-center">
          <Logo size="lg" onClick={() => navigate('home')} className="mx-auto cursor-pointer" />
          <h2 className="mt-6 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            Don&apos;t have an account yet?{' '}
            <button
              onClick={() => navigate('register')}
              className="font-bold text-blue-700 hover:text-blue-800 cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && <Alert variant="danger">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
            />

            <div>
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('forgot-password')}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
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
              className="w-full shadow-md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Log In
            </Button>
          </form>

          {/* Convenient Demo Mode Button */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleContinueAsCustomer}
              className="w-full border-blue-200 hover:bg-blue-50/70 text-blue-800"
              leftIcon={<User className="w-4 h-4 text-blue-600" />}
            >
              Continue as a Customer (Demo Mode)
            </Button>
          </div>

          {/* Demo Mode Quick Sign-ins */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Demo Mode Quick Accounts
              </span>
              <span className="text-[11px] text-slate-400 font-medium">1-Click Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer text-xs"
              >
                <div className="font-bold text-slate-900">David M.</div>
                <div className="text-[11px] text-slate-500 truncate">Customer (Homeowner)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('contractor')}
                className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition cursor-pointer text-xs"
              >
                <div className="font-bold text-slate-900">Marcus V.</div>
                <div className="text-[11px] text-slate-500 truncate">Contractor (Apex HVAC)</div>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Authorized Personnel?</span>
              <button
                type="button"
                onClick={() => navigate('admin-login')}
                className="font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
              >
                <span>Staff & Administrator Portal →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
