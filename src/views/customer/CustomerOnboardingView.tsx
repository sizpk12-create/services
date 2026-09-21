/**
 * You Want Services - Customer Onboarding Wizard
 * Phase 3 Architecture
 *
 * 4-Step Progressive Onboarding Flow:
 * - Step 1: Welcome to You Want Services & Platform Explanation
 * - Step 2: Confirm Your Information (Name, Phone, Address)
 * - Step 3: What Services Are You Looking For? (Optional trade selection)
 * - Step 4: You're Ready (Request a Service or Go to Dashboard)
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Button, Input } from '../../components/common/UIComponents';
import { CustomerProfile } from '../../types/database';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Home,
  Wrench,
  Zap,
  Flame,
  Droplets,
  Paintbrush,
  Scissors,
  Layers,
  Check,
} from 'lucide-react';

const ONBOARDING_SERVICES = [
  { id: 'cat-hvac', name: 'HVAC', description: 'Heating & Air Conditioning', icon: Flame },
  { id: 'cat-plumbing', name: 'Plumbing', description: 'Pipes, Drains & Water Heaters', icon: Droplets },
  { id: 'cat-electrical', name: 'Electrical', description: 'Wiring, Panels & Lighting', icon: Zap },
  { id: 'cat-cleaning', name: 'Cleaning', description: 'Deep Clean, Move-in & Regular', icon: Sparkles },
  { id: 'cat-lawn', name: 'Lawn Care', description: 'Mowing, Landscaping & Cleanups', icon: Scissors },
  { id: 'cat-concrete', name: 'Concrete', description: 'Driveways, Patios & Foundations', icon: Layers },
  { id: 'cat-roofing', name: 'Roofing', description: 'Shingle, Metal & Leak Repairs', icon: Home },
  { id: 'cat-handyman', name: 'Handyman', description: 'General Repairs & Installations', icon: Wrench },
  { id: 'cat-appliances', name: 'Appliance Repair', description: 'Washers, Dryers & Ovens', icon: Wrench },
  { id: 'cat-painting', name: 'Painting', description: 'Interior & Exterior Painting', icon: Paintbrush },
];

export const CustomerOnboardingView: React.FC = () => {
  const { currentUser, currentProfile, updateCustomerProfile } = useAuth();
  const { navigate } = useNavigation();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const profile = currentProfile as CustomerProfile | null;

  // Step 2 editable confirmation form
  const [details, setDetails] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phone: currentUser?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || 'IL',
    zipCode: profile?.zipCode || '',
  });

  // Step 3 service interests
  const [selectedServices, setSelectedServices] = useState<string[]>(
    profile?.serviceInterests || []
  );

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleComplete = async (action: 'service' | 'dashboard') => {
    await updateCustomerProfile({
      ...details,
      serviceInterests: selectedServices,
      onboardingCompleted: true,
    });

    if (action === 'service') {
      const primaryCategory = selectedServices[0] || 'cat-hvac';
      navigate('customer-request-service', { categoryId: primaryCategory });
    } else {
      navigate('customer-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step === s
                      ? 'bg-blue-700 text-white shadow-sm'
                      : step > s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-700">
                  {s === 1 && 'Welcome'}
                  {s === 2 && 'Your Info'}
                  {s === 3 && 'Interests'}
                  {s === 4 && 'Ready'}
                </span>
                {s < 4 && <div className="w-8 sm:w-12 h-0.5 bg-slate-200 mx-1 sm:mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Step Content Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Welcome, {currentUser?.firstName || 'Neighbor'}!</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Home Services Made Simple
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  You Want Services connects you directly with verified, licensed local contractors for all your home projects.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Post a Request</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Describe what needs repair, maintenance, or installation at your home.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Get Matched</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Verified contractors in your neighborhood review your scope and provide quotes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Hire with Trust</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Choose the best pro based on reviews, credentials, and transparent pricing.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Free for homeowners. No hidden booking fees.</span>
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setStep(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIRM INFORMATION */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Confirm Your Contact & Home Details</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Ensure your contact number and service address are accurate for contractor dispatches.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={details.firstName}
                    onChange={(e) => setDetails({ ...details, firstName: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    value={details.lastName}
                    onChange={(e) => setDetails({ ...details, lastName: e.target.value })}
                  />
                </div>

                <Input
                  label="Phone Number"
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                />

                <Input
                  label="Street Address"
                  value={details.address}
                  onChange={(e) => setDetails({ ...details, address: e.target.value })}
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="City"
                    value={details.city}
                    onChange={(e) => setDetails({ ...details, city: e.target.value })}
                  />
                  <Input
                    label="State"
                    maxLength={2}
                    value={details.state}
                    onChange={(e) => setDetails({ ...details, state: e.target.value.toUpperCase() })}
                  />
                  <Input
                    label="ZIP Code"
                    maxLength={5}
                    value={details.zipCode}
                    onChange={(e) => setDetails({ ...details, zipCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setStep(3)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Confirm & Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SERVICE INTERESTS */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">What Services Are You Looking For?</h3>
                  <span className="text-xs font-semibold text-slate-400">Optional</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Select any services you might need in the coming months. This helps us customize your dashboard recommendations.
                </p>
              </div>

              {/* Service Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {ONBOARDING_SERVICES.map((cat) => {
                  const isSelected = selectedServices.includes(cat.id);
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleService(cat.id)}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-slate-900 truncate">{cat.name}</p>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{cat.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span>
                  💡 <strong>No commitment:</strong> This is optional. You do not need to request a service right now, and you can change your preferences anytime.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="md" onClick={() => setStep(4)}>
                    Skip for Now
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setStep(4)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Save & Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: YOU'RE READY */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  You&apos;re All Set, {currentUser?.firstName || 'Neighbor'}!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your customer profile is active. You can now request your first service or explore your account dashboard.
                </p>
              </div>

              {selectedServices.length > 0 && (
                <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 max-w-md mx-auto">
                  <p className="font-semibold mb-1">Saved service categories:</p>
                  <p className="text-blue-700">
                    {selectedServices
                      .map((id) => ONBOARDING_SERVICES.find((s) => s.id === id)?.name)
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-md"
                  onClick={() => handleComplete('service')}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Request a Service
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => handleComplete('dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
