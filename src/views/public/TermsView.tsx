/**
 * You Want Services - Terms of Service
 * Phase 3 Architecture
 */

import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Button } from '../../components/common/UIComponents';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const TermsView: React.FC = () => {
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
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Marketplace Platform Agreement</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-500 mt-1">Effective Date: January 1, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            By creating an account, accessing, or utilizing the You Want Services platform (&ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the Platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">2. Platform Role & Marketplace Nature</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            You Want Services operates a technology marketplace connecting residential property owners and tenants (&ldquo;Customers&rdquo;) with independent licensed, registered trade professionals (&ldquo;Contractors&rdquo;). You Want Services is not a general contractor, employer of trade specialists, or direct provider of construction or repair services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">3. Customer Accounts & Security</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Customers must provide accurate, current, and complete registration information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">4. Contractor Engagement & Job Quotes</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Any contractual agreement for repair, maintenance, or installation services is formed directly between Customer and Contractor. Customers are responsible for reviewing quotes, verifying contractor credentials, and agreeing upon scopes of work and payment terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">5. Limitation of Liability</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To the maximum extent permitted by applicable law, You Want Services shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the marketplace or contractor service outcomes.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Document audited for consumer transparency</span>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('register')}>
            Return to Registration
          </Button>
        </div>
      </div>
    </div>
  );
};
