/**
 * You Want Services - How It Works Detail View
 * Phase 1 Architecture
 */

import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Button } from '../../components/common/UIComponents';
import { ClipboardList, Users, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const HowItWorksView: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Transparent Workflow
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            How You Want Services Works
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            We bridge the gap between quality-conscious homeowners and proven, verified home-service professionals.
          </p>
        </div>

        {/* 3 Step Deep Dive */}
        <div className="space-y-12 mb-16">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              01
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-700" />
                <h3 className="text-xl font-bold text-slate-900">Tell us what your home needs</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit details about your repair, maintenance, or renovation task. Choose your trade category (e.g., HVAC, plumbing, electrical), tell us how urgent the request is, and specify your location.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              02
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" />
                <h3 className="text-xl font-bold text-slate-900">Get connected with a qualified pro</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your request is intelligently matched with licensed, insured contractors serving your immediate geographic zone. Contractors review the scope, verify availability, and respond directly.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              03
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-700" />
                <h3 className="text-xl font-bold text-slate-900">Get the job completed with peace of mind</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Schedule service on your terms, review clear work estimates, and inspect completed work. Track communication directly inside your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 sm:p-12 text-white text-center shadow-lg">
          <ShieldCheck className="w-12 h-12 text-blue-200 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to get your project started?</h2>
          <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-xl mx-auto mb-6">
            Post a service request in under 2 minutes. Free and with no obligation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('customer-request-service')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Request a Service
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('contractor-registration')}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              Join as a Contractor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
