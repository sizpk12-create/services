/**
 * You Want Services - Customer Service Request View
 * Phase 3 Architecture
 *
 * Implements:
 * - Professional prompt when user is not logged in:
 *   "Create an account or log in to request a service." with Log In and Create Account CTAs
 * - Pre-filled customer profile address & details when logged in
 * - Category routing integration
 */

import React, { useState } from 'react';
import { INITIAL_SERVICE_CATEGORIES } from '../../config/categories';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useDemoMode } from '../../context/DemoContext';
import { Input, Select, Button, Alert } from '../../components/common/UIComponents';
import { auditLogger } from '../../services/auditLogger';
import { CustomerProfile } from '../../types/database';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Lock,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

export const RequestServiceView: React.FC = () => {
  const { navigate, routeParams } = useNavigation();
  const { currentUser, currentProfile } = useAuth();
  const { assertNotProduction } = useDemoMode();

  const profile = currentProfile as CustomerProfile | null;

  const [selectedCategory, setSelectedCategory] = useState<string>(
    routeParams.categoryId || INITIAL_SERVICE_CATEGORIES[0].id
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('WITHIN_24_HOURS');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || 'Springfield');
  const [state, setState] = useState(profile?.state || 'IL');
  const [zipCode, setZipCode] = useState(profile?.zipCode || '62704');
  const [estimatedBudget, setEstimatedBudget] = useState('$200 - $500');
  const [submitted, setSubmitted] = useState(false);

  // If user is not logged in: show the required prompt
  if (!currentUser) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
            <Wrench className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <span>Homeowner Account Required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create an account or log in to request a service.
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Connect with verified, licensed, and insured trade contractors in your neighborhood. Fast direct quotes and transparent pricing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              id="unauth-login-btn"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-md"
              onClick={() => navigate('login')}
            >
              Log In
            </Button>
            <Button
              id="unauth-register-btn"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('register')}
            >
              Create Account
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Always 100% free for homeowners. No hidden service charges.</span>
          </div>
        </div>
      </div>
    );
  }

  // If logged in as contractor or admin: offer role explanation
  if (currentUser.role !== 'CUSTOMER') {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Customer Account Needed
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              You are currently logged in with a <strong>{currentUser.role}</strong> account. Service requests are created from customer/homeowner accounts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('login')}
            >
              Switch to Customer Account
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('home')}
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assertNotProduction('Create Service Request');

    auditLogger.log({
      actorId: currentUser.id,
      actorRole: currentUser.role,
      action: 'SERVICE_REQUEST_CREATED',
      entityType: 'SERVICE_REQUEST',
      entityId: `req-${Date.now()}`,
      details: {
        category: selectedCategory,
        title,
        urgency,
        city,
        state,
        zipCode,
      },
      isDemo: true,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Request Submitted!</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Your project has been recorded in the platform. In Demo Mode, simulated local contractors matching &ldquo;{title}&rdquo; will be notified in your area.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('customer-my-requests')}
            >
              View My Requests
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('customer-dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('customer-dashboard')}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Request a Service</h1>
          <p className="text-xs text-slate-500">
            Tell us about your home project to get matched with verified trade professionals.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Select
              label="Service Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={INITIAL_SERVICE_CATEGORIES.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />

            <Input
              label="Project Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Central Air AC Diagnostic & Coolant Check"
              helperText="Brief summary of what you need serviced or inspected."
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Scope & Details
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe symptoms, age of equipment, or specific repairs needed..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Timeline / Urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                options={[
                  { value: 'EMERGENCY', label: 'Emergency (Immediate Dispatch)' },
                  { value: 'WITHIN_24_HOURS', label: 'Within 24 Hours' },
                  { value: 'WITHIN_WEEK', label: 'This Week' },
                  { value: 'FLEXIBLE', label: 'Flexible / Next Month' },
                ]}
              />

              <Input
                label="Estimated Budget"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                placeholder="$200 - $500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Service Address
            </h4>
            <Input
              label="Street Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="742 Evergreen Terrace"
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="State"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <Input
                label="ZIP Code"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('customer-dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Submit Service Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
