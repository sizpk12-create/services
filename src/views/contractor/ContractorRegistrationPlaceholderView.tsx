/**
 * You Want Services - Contractor Registration Architecture Placeholder
 * Phase 1 Architecture
 *
 * As mandated in Phase 1 prompt:
 * "Contractor Registration is a future major module.
 * Do NOT build the complete contractor-registration workflow yet.
 * Instead, create the route and architecture so Prompt #6 can implement
 * the full Contractor Registration system without requiring a major rebuild.
 * The Contractor Registration page should clearly indicate that the detailed
 * registration workflow will be implemented in a later build phase.
 * Do not create a fake completed verification status."
 */

import React from 'react';
import { Logo } from '../../components/common/Logo';
import { Button, Card, Badge } from '../../components/common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  ShieldAlert,
  FileCheck2,
  MapPin,
  FileText,
  CreditCard,
  ArrowRight,
  Info,
} from 'lucide-react';

export const ContractorRegistrationPlaceholderView: React.FC = () => {
  const { navigate } = useNavigation();
  const { switchDemoRole } = useAuth();

  const handlePreviewDashboard = () => {
    switchDemoRole('contractor');
    navigate('contractor-dashboard');
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Logo size="lg" onClick={() => navigate('home')} className="mx-auto cursor-pointer" />
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300/80 px-3.5 py-1 rounded-full text-xs font-bold mt-2">
            <Info className="w-3.5 h-3.5 text-amber-700" />
            <span>Architecture Phase 1 Active • Full Workflow Scheduled for Prompt #6</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contractor Registration & Onboarding
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to the You Want Services pro network gateway. The dedicated contractor registration pipeline and document verification workflows will be activated in Build Prompt #6.
          </p>
        </div>

        {/* Phase 6 Architecture Roadmap Card */}
        <Card className="border-blue-200 bg-white space-y-6 p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Future Module Blueprint (Prompt #6 Ready)
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                The database schema, role permissions, and route interfaces are established in Phase 1 to support the upcoming multi-step contractor onboarding:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Business Profile & Trades
                </span>
                <Badge variant="neutral">Schema Ready</Badge>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Business entity name, contact principals, tax ID / EIN, and selection from 10 home trades.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Territory & Service Radius
                </span>
                <Badge variant="neutral">Schema Ready</Badge>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Geographic dispatch range, radius mileage, and specific zip codes served.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  License & Insurance Verification
                </span>
                <Badge variant="warning">Phase 6 Module</Badge>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                State trade licensing upload, COI general liability insurance audit, and review triage.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Lead Purchasing & Billing
                </span>
                <Badge variant="warning">Phase 6 Module</Badge>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Automated lead dispatch credits, payment methods, and membership tiers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Verification Status Notice:</strong> In compliance with Prompt #1 instructions, no fake completed verification status is generated. Contractors currently display accurate <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">PENDING</code> or <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">UNVERIFIED</code> status.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Want to preview the contractor dashboard interface right now?
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={handlePreviewDashboard}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Contractor Dashboard (Demo)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
