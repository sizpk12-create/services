/**
 * You Want Services - Privacy Policy
 * Phase 3 Architecture
 */

import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Button } from '../../components/common/UIComponents';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs text-slate-500 font-mono">Version 1.0-2026</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Customer Privacy Safeguards</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">Effective Date: January 1, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We collect personal contact information (first name, last name, email address, phone number) and service property address details (street address, city, state, zip code) solely to facilitate contractor matching and service dispatch.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">2. How Customer Information Is Shared</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your contact details are only shared with licensed, verified contractors who have accepted or purchased the lead for your specific service request. We never sell your personal information to third-party telemarketers or advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">3. Data Security & Encryption</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            All user credentials, authentication tokens, and sensitive account data are encrypted in transit and protected using modern cryptographic standards. Password information is never stored in cleartext.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">4. Customer Rights & Account Deactivation</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Customers have the right to inspect, update, or deactivate their account at any time through Account Settings. Account deactivation halts notifications and disables active marketplace interactions safely.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero-spam policy strictly enforced</span>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('register')}>
            Return to Registration
          </Button>
        </div>
      </div>
    </div>
  );
};
