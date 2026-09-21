/**
 * You Want Services - Contractor CTA Section
 * Phase 1 Architecture
 *
 * Section encouraging contractors to join the marketplace.
 * CTA: Become a Service Provider
 */

import React from 'react';
import { Button } from '../common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import { Briefcase, CheckCircle, TrendingUp, Users, ArrowRight } from 'lucide-react';

export const ContractorCtaSection: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-300">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>For Home Service Professionals</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Grow Your Contracting Business With High-Intent Local Leads
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Connect directly with homeowners actively seeking HVAC, plumbing, electrical, roofing, and specialty home services in your verified service territory.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Verified Homeowners</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-200">
                <TrendingUp className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Direct Territory Control</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-200">
                <Users className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Fair Pricing Structure</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                id="cta-become-provider"
                variant="primary"
                size="lg"
                onClick={() => navigate('contractor-registration')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
              >
                Become a Service Provider
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Contractor Network Architecture
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prompt #1 establishes the foundational contractor schema, territory radius logic, and registration routes. Full onboarding, license submission, and insurance verification workflows will be activated in Phase 6.
              </p>
              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700 text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Supported Trades:</span>
                  <span className="font-semibold text-white">10 Core Home Trades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lead Model:</span>
                  <span className="font-semibold text-white">Direct Customer Matching</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registration Status:</span>
                  <span className="font-semibold text-amber-400">Phase 1 Route Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
