/**
 * You Want Services - Customer Profile View
 * Phase 3 Architecture
 *
 * Implements:
 * - Editable personal contact & residential service address
 * - Field-level validation and formatted inputs
 * - Preferred contact method selection (Phone, Email, SMS)
 * - Safe updates via updateCustomerProfile with persistence
 * - Zero exposure of internal IDs or administrative fields
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Card, Alert } from '../../components/common/UIComponents';
import { CustomerProfile } from '../../types/database';
import { User, MapPin, Mail, Phone, CheckCircle2, ShieldCheck, Info } from 'lucide-react';

interface ProfileErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export const CustomerProfileView: React.FC = () => {
  const { currentUser, currentProfile, updateCustomerProfile } = useAuth();
  const profile = currentProfile as CustomerProfile | null;

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    preferredContactMethod: (profile?.preferredContactMethod || 'EMAIL') as 'PHONE' | 'EMAIL' | 'SMS',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || 'IL',
    zipCode: profile?.zipCode || '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const validate = (): boolean => {
    const errs: ProfileErrors = {};
    let ok = true;

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      errs.firstName = 'First name must be at least 2 characters.';
      ok = false;
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      errs.lastName = 'Last name must be at least 2 characters.';
      ok = false;
    }

    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || digitsOnly.length < 10) {
      errs.phone = 'Valid 10-digit phone number is required.';
      ok = false;
    }

    if (!formData.address.trim()) {
      errs.address = 'Street address is required for service matching.';
      ok = false;
    }

    if (!formData.city.trim()) {
      errs.city = 'City is required.';
      ok = false;
    }

    if (!formData.state.trim() || formData.state.trim().length !== 2) {
      errs.state = '2-letter state code required.';
      ok = false;
    }

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!formData.zipCode.trim() || !zipRegex.test(formData.zipCode.trim())) {
      errs.zipCode = 'Valid 5-digit US ZIP code is required.';
      ok = false;
    }

    setErrors(errs);
    return ok;
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setFormData({ ...formData, phone: formatted });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const res = await updateCustomerProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        preferredContactMethod: formData.preferredContactMethod,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      });

      if (res.success) {
        setSuccessMessage('Your profile changes have been saved successfully.');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(res.message || 'Failed to update profile.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while saving your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Keep your contact information and primary home address current for service dispatches.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Card>
        <form onSubmit={handleSave} className="space-y-6" noValidate>
          {/* Contact Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-700" />
              <span>Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={errors.lastName}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  disabled
                  helperText="Contact support if you need to update your verified login email."
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  error={errors.phone}
                  helperText="Used for technician dispatch updates."
                />
              </div>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Contact Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['EMAIL', 'PHONE', 'SMS'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredContactMethod: method })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      formData.preferredContactMethod === method
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

          {/* Service Residence Address */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>Primary Residence Address</span>
            </div>

            <Input
              label="Street Address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              error={errors.address}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                error={errors.city}
              />
              <Input
                label="State"
                required
                maxLength={2}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                error={errors.state}
              />
              <Input
                label="ZIP Code"
                required
                maxLength={5}
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                error={errors.zipCode}
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your full address is only revealed to a contractor once you approve a matching request or accept their direct quotation.
            </span>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="shadow-sm"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
