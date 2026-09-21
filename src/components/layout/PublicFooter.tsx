/**
 * You Want Services - Public Footer Component
 * Phase 1 Architecture
 */

import React from 'react';
import { Logo } from '../common/Logo';
import { useNavigation } from '../../context/NavigationContext';
import { Shield, PhoneCall, Mail, MapPin } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="lg" showTagline />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mt-3">
              One place to find trusted home-service professionals. Connecting homeowners with verified, licensed, and insured contractors for all residential repairs and renovations.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified contractor and satisfaction guarantee network.</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('services')}
                  className="hover:text-white transition cursor-pointer"
                >
                  All Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('how-it-works')}
                  className="hover:text-white transition cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('customer-request-service')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Request a Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('become-a-contractor')}
                  className="hover:text-amber-400 transition cursor-pointer text-amber-300 font-medium"
                >
                  Become a Contractor
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('contractor-registration')}
                  className="hover:text-white transition cursor-pointer text-slate-400"
                >
                  Contractor Onboarding
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('about')}
                  className="hover:text-white transition cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('contact')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed text-xs">
                  Careers (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed text-xs">
                  Press & Media (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Support & Legal Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Trust & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-xs">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span>1-800-YOU-WANT (Demo)</span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support@youwantservices.com</span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Nationwide Local Coverage</span>
              </li>
              <li className="pt-2 text-xs border-t border-slate-800 flex flex-col gap-1.5">
                <button
                  onClick={() => navigate('privacy')}
                  className="text-slate-400 hover:text-white cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate('terms')}
                  className="text-slate-400 hover:text-white cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} You Want Services Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Phase 1 Architecture</span>
            <span>•</span>
            <span>Local Community Marketplace</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
