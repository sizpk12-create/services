/**
 * You Want Services - About Us View
 * Phase 1 Architecture
 */

import React from 'react';
import { Shield, Users, Award, Home } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            About The Marketplace
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            Rebuilding Trust in Home Services
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            You Want Services was founded with a singular conviction: Homeowners deserve verified, trustworthy contractors, and skilled trades professionals deserve straightforward, fair local connections.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Uncompromising Verification</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We check trade licenses, liability insurance certificates, and background credentials before contractors are promoted to active matching tiers.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Local Community First</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We focus on community-level matches so contractors have realistic service territories and homeowners receive responsive dispatch times.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Transparent Pricing & Scope</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No hidden broker fees or inflated lead auctions. Homeowners get direct estimates from the technicians doing the work.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Home className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Full Lifecycle Support</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              From the initial request through direct messaging, scheduled appointments, and job completion tracking, everything stays organized in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
