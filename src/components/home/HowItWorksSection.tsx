/**
 * You Want Services - How It Works Section
 * Phase 1 Architecture
 *
 * Three steps:
 * 1. Tell us what you need
 * 2. Get connected with a service professional
 * 3. Get the job completed
 */

import React from 'react';
import { ClipboardCheck, UserCheck, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Tell us what you need',
      description:
        'Describe your project, choose your trade category, urgency, and location. It takes less than two minutes.',
      icon: ClipboardCheck,
    },
    {
      number: '2',
      title: 'Get connected with a service professional',
      description:
        'We match your request with qualified, licensed, and insured local contractors who review your scope and provide quotes.',
      icon: UserCheck,
    },
    {
      number: '3',
      title: 'Get the job completed',
      description:
        'Schedule a convenient time, confirm the project details, and get your home service completed with confidence.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
            Simple Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            Finding reliable home contractors should be stress-free. Here is how You Want Services makes it seamless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow relative flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-blue-700/80">
                    0{step.number}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-550 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
