/**
 * You Want Services - Contractor Landing Page ("Become a Contractor")
 * Phase 5 Architecture
 *
 * Implements:
 * - Headline: "Grow Your Home-Service Business With You Want Services"
 * - Supporting text: "Create your business profile and prepare to connect with customers looking for home-service professionals."
 * - Primary CTA: "Get Started" -> opens Contractor Registration wizard
 * - Secondary CTA: "Learn How It Works" -> scrolls to platform explanation
 * - Core benefits: Build Your Business Profile, Reach New Opportunities, Manage Your Business
 * - Realistic expectations (no false claims of guaranteed leads, jobs, or revenue)
 * - Supported trades & categories overview
 * - FAQ section
 */

import React, { useRef } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Button, Card, Badge } from '../../components/common/UIComponents';
import { INITIAL_SERVICE_CATEGORIES } from '../../config/categories';
import {
  Briefcase,
  TrendingUp,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Building2,
  FileCheck2,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ContractorLandingView: React.FC = () => {
  const { navigate } = useNavigation();
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollToHowItWorks = () => {
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Service Professional Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Grow Your Home-Service Business With You Want Services
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Create your business profile and prepare to connect with customers looking for home-service professionals.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              id="contractor-landing-get-started-btn"
              variant="primary"
              size="lg"
              onClick={() => navigate('contractor-registration')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-lg shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 text-base"
            >
              Get Started
            </Button>
            <Button
              id="contractor-landing-learn-btn"
              variant="outline"
              size="lg"
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto text-slate-200 border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:text-white text-base"
            >
              Learn How It Works
            </Button>
          </div>

          {/* Platform Standards / No-Guarantees Disclaimer */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Independent Business Profiles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Standard Licensing & Insurance Requirements</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Free Onboarding Registration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Why Partner With Us
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built Specifically For Trade Professionals
          </h2>
          <p className="text-sm text-slate-600">
            A transparent platform engineered to showcase your craftsmanship and prepare your business for high-intent local homeowners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <Card className="p-6 sm:p-8 space-y-4 hover:shadow-md transition border-slate-200 bg-white">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Build Your Business Profile
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Present your services and business information professionally. Showcase your trade categories, certifications, dispatch radius, operating hours, and contact channels.
            </p>
          </Card>

          {/* Benefit 2 */}
          <Card className="p-6 sm:p-8 space-y-4 hover:shadow-md transition border-slate-200 bg-white">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Reach New Opportunities
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Prepare your business for future marketplace opportunities. Position your team to receive verified customer service requests directly matched to your specific zip codes.
            </p>
          </Card>

          {/* Benefit 3 */}
          <Card className="p-6 sm:p-8 space-y-4 hover:shadow-md transition border-slate-200 bg-white">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Manage Your Business
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Use one platform for future leads, jobs, communications and account management. Keep all project history, customer messages, and dispatch credentials organized.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Onboarding Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How Contractor Onboarding Works
            </h2>
            <p className="text-sm text-slate-600">
              Our structured 4-step onboarding pipeline protects marketplace quality and sets expectations clearly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base">Account & Business</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide your core business entity details, legal registration type, contact principals, and company background.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base">Trades & Coverage</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your primary trade categories, specific service subcategories, and geographic dispatch radius.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base">Credentials & Docs</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your state license number, general liability insurance policy, and optionally upload supporting documents.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-base">Review & Dashboard</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit for onboarding review. Access your Contractor Dashboard to track profile completion and configure dispatch settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Categories Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Supported Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Trades Represented In The Network
          </h2>
          <p className="text-sm text-slate-600">
            We onboard licensed and experienced professionals across essential residential home service trades.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {INITIAL_SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-1 hover:border-blue-300 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Briefcase className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{cat.name}</h5>
              <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Contractor Onboarding FAQ
            </h2>
          </div>

          <div className="space-y-4">
            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                Is there an upfront fee to create my contractor profile?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                No. Registering your business profile and establishing your service area is free. You will not be asked for credit card details during registration.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                Does registering guarantee immediate jobs or leads?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                No. Registration creates your business profile and enters your credentials into onboarding review. Marketplace job matching and lead notifications depend on active homeowner demand in your specific service zip codes.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                How are licenses and insurance verified?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                During this phase, credentials you submit are initially marked as &ldquo;NOT VERIFIED&rdquo; and recorded safely. Full administrative verification and background check workflows will be executed in Phase 6.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                Can I update my service radius and categories later?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                Yes. You have full control inside your Contractor Business Profile to modify trade specialties, adjust radius mileage, add or remove zip codes, and configure business hours at any time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-700 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Build Your Contractor Profile?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Join professional trades in your region. Complete the multi-step onboarding wizard in about 5 minutes.
          </p>
          <div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('contractor-registration')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 shadow-md"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
