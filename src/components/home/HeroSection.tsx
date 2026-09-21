/**
 * You Want Services - Homepage Hero Section
 * Phase 1 Architecture
 *
 * Headline: Home Services Made Simple
 * Supporting message: Find trusted professionals for the services your home needs.
 * Primary CTA: Request a Service
 * Secondary CTA: Join as a Contractor
 */

import React from 'react';
import { Button } from '../common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import { ShieldCheck, CheckCircle, ArrowRight, Star, Clock } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 bg-blue-100/70 border border-blue-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-900 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Verified Home Services & Local Contractors</span>
            </div>

            {/* Main Headline & Supporting Message */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Home Services <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900">
                Made Simple
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Find trusted professionals for the services your home needs. Connect with verified, licensed, and insured contractors ready to get the job done right.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                id="hero-primary-cta"
                variant="primary"
                size="lg"
                onClick={() => navigate('customer-request-service')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto shadow-md"
              >
                Request a Service
              </Button>

              <Button
                id="hero-secondary-cta"
                variant="outline"
                size="lg"
                onClick={() => navigate('contractor-registration')}
                className="w-full sm:w-auto"
              >
                Join as a Contractor
              </Button>
            </div>

            {/* Core Trust Pillars */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Licensed & Insured Pros</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Fast Direct Quotes</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
                <span>Verified Local Reviews</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Quick Match Showcase */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-7 relative">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Quick Match Guarantee
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    What project do you need help with?
                  </h3>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => navigate('customer-request-service')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      01
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                        Heating & AC Repair
                      </p>
                      <p className="text-xs text-slate-500">Fast dispatch available</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition" />
                </div>

                <div
                  onClick={() => navigate('customer-request-service')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      02
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                        Plumbing & Water Heaters
                      </p>
                      <p className="text-xs text-slate-500">Emergency & routine repairs</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition" />
                </div>

                <div
                  onClick={() => navigate('customer-request-service')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      03
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                        Electrical, Roofing & More
                      </p>
                      <p className="text-xs text-slate-500">10+ specialized home trades</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Free to post a request</span>
                <span className="font-semibold text-slate-800">No obligation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
