/**
 * You Want Services - Customer Registration View
 * Phase 3 Architecture
 *
 * Implements:
 * - Comprehensive customer account creation fields
 * - Field-level validations with clear error messages
 * - Duplicate email detection with direct Login & Forgot Password CTAs
 * - Required, un-prechecked Terms of Service and Privacy Policy consent checkbox
 * - Version & timestamp audit tracking
 * - Smooth transition into the Customer Onboarding wizard
 */

import React, { useState } from 'react';
import { Logo } from '../../components/common/Logo';
import { Input, Select, Button, Alert } from '../../components/common/UIComponents';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Lock,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  termsConsent?: string;
}

export const RegisterView: React.FC = () => {
  const { registerCustomer } = useAuth();
  const { navigate } = useNavigation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: 'IL',
    zipCode: '',
    preferredContactMethod: 'EMAIL' as 'PHONE' | 'EMAIL' | 'SMS',
    termsConsent: false, // Must not be pre-checked
  });

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // First Name
    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
      isValid = false;
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters.';
      isValid = false;
    } else if (form.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be under 50 characters.';
      isValid = false;
    }

    // Last Name
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
      isValid = false;
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters.';
      isValid = false;
    } else if (form.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be under 50 characters.';
      isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = form.email.trim().toLowerCase();
    if (!normalizedEmail) {
      newErrors.email = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(normalizedEmail)) {
      newErrors.email = 'Please provide a valid email format (e.g. name@example.com).';
      isValid = false;
    }

    // Phone
    const digitsOnly = form.phone.replace(/\D/g, '');
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
      isValid = false;
    } else if (digitsOnly.length < 10) {
      newErrors.phone = 'Please provide a valid 10-digit phone number.';
      isValid = false;
    }

    // Password
    if (!form.password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
      isValid = false;
    } else if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one letter and one number.';
      isValid = false;
    }

    // Confirm Password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    // Address
    if (!form.address.trim()) {
      newErrors.address = 'Street address is required.';
      isValid = false;
    }

    // City
    if (!form.city.trim()) {
      newErrors.city = 'City is required.';
      isValid = false;
    }

    // State
    if (!form.state.trim()) {
      newErrors.state = 'State is required.';
      isValid = false;
    } else if (form.state.trim().length !== 2) {
      newErrors.state = '2-letter state code required.';
      isValid = false;
    }

    // ZIP Code
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!form.zipCode.trim()) {
      newErrors.zipCode = 'ZIP Code is required.';
      isValid = false;
    } else if (!zipRegex.test(form.zipCode.trim())) {
      newErrors.zipCode = 'Please enter a valid 5-digit US ZIP code.';
      isValid = false;
    }

    // Terms Consent
    if (!form.termsConsent) {
      newErrors.termsConsent = 'You must agree to the Terms of Service and Privacy Policy.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePhoneChange = (val: string) => {
    // Format US phone number cleanly
    const digits = val.replace(/\D/g, '').substring(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setForm({ ...form, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setDuplicateError(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await registerCustomer({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        preferredContactMethod: form.preferredContactMethod,
        termsAccepted: form.termsConsent,
        termsVersion: 'v1.0-2026',
        privacyVersion: 'v1.0-2026',
      });

      if (res.success) {
        // Direct new customer to the friendly onboarding flow
        navigate('customer-onboarding');
      } else if (res.duplicate) {
        setDuplicateError(true);
      } else {
        setGeneralError(res.message || 'Registration failed. Please check your information.');
      }
    } catch {
      setGeneralError('An unexpected error occurred during account creation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Top Header */}
        <div className="text-center">
          <Logo size="lg" onClick={() => navigate('home')} className="mx-auto cursor-pointer" />
          <h1 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="mt-2 text-xs text-slate-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="font-bold text-blue-700 hover:text-blue-600 cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Contractor Switch Callout */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-700 shrink-0" />
            <span>Are you a service professional or contractor?</span>
          </div>
          <button
            onClick={() => navigate('contractor-registration')}
            className="font-bold text-blue-700 hover:text-blue-900 underline shrink-0 cursor-pointer"
          >
            Go to Contractor Registration
          </button>
        </div>

        {/* Registration Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {generalError && <Alert variant="danger">{generalError}</Alert>}

          {/* Duplicate Account Callout */}
          {duplicateError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-amber-900">Account Already Exists</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    An account with this email already exists. Please log in or reset your password.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200/80 flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('login')}
                  className="bg-amber-800 hover:bg-amber-900 text-white"
                >
                  Log In
                </Button>
                <button
                  type="button"
                  onClick={() => navigate('forgot-password')}
                  className="text-xs font-bold text-amber-900 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Personal Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <span>Personal Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="e.g. Sarah"
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="e.g. Jenkins"
                  error={errors.lastName}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sarah.jenkins@example.com"
                  error={errors.email}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 000-0000"
                  error={errors.phone}
                />
              </div>

              {/* Optional Preferred Contact Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Contact Method <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['EMAIL', 'PHONE', 'SMS'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setForm({ ...form, preferredContactMethod: method })}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        form.preferredContactMethod === method
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                      {method === 'PHONE' && <Phone className="w-3.5 h-3.5" />}
                      {method === 'SMS' && <Phone className="w-3.5 h-3.5" />}
                      <span>{method === 'SMS' ? 'Text / SMS' : method === 'PHONE' ? 'Phone Call' : 'Email'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Address & Service Location */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>Primary Home Address</span>
              </div>

              <Input
                label="Street Address"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 742 Evergreen Terrace"
                error={errors.address}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <Input
                    label="City"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Springfield"
                    error={errors.city}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Input
                    label="State"
                    required
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                    placeholder="IL"
                    error={errors.state}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Input
                    label="ZIP Code"
                    required
                    maxLength={5}
                    value={form.zipCode}
                    onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                    placeholder="62704"
                    error={errors.zipCode}
                  />
                </div>
              </div>
            </div>

            {/* Password & Security */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                <Lock className="w-4 h-4 text-blue-700" />
                <span>Security & Password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create password"
                  error={errors.password}
                  helperText="Minimum 8 characters with letters & numbers"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword}
                />
              </div>

              {/* Password Requirements Guide */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-1">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <span className={form.password.length >= 8 ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-500'}>
                    ✓ 8+ Characters
                  </span>
                  <span className={/[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-500'}>
                    ✓ Letters & numbers
                  </span>
                  <span className={form.password && form.confirmPassword && form.password === form.confirmPassword ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-500'}>
                    ✓ Passwords match
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Privacy Consent Checkbox (REQUIRED, UNCHECKED) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.termsConsent}
                  onChange={(e) => setForm({ ...form, termsConsent: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-medium">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('terms');
                      }}
                      className="font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('privacy');
                      }}
                      className="font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your acceptance will be recorded with timestamp and version reference (v1.0-2026).
                  </p>
                </div>
              </label>
              {errors.termsConsent && (
                <p className="text-xs font-semibold text-rose-600 pl-1">{errors.termsConsent}</p>
              )}
            </div>

            {/* Submission CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full shadow-md"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Create Account & Continue
              </Button>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-spam guarantee. Your information is shared only with matched pros.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
