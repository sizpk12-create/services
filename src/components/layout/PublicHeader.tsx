/**
 * You Want Services - Public Header Component
 * Phase 1 Architecture
 */

import React from 'react';
import { Logo } from '../common/Logo';
import { Button } from '../common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const { currentRoute, navigate, mobileMenuOpen, setMobileMenuOpen } = useNavigation();
  const { isAuthenticated, currentUser, role } = useAuth();

  const navLinks: { label: string; route: 'home' | 'services' | 'how-it-works' | 'about' | 'contact' }[] = [
    { label: 'Home', route: 'home' },
    { label: 'Services', route: 'services' },
    { label: 'How It Works', route: 'how-it-works' },
    { label: 'About', route: 'about' },
    { label: 'Contact', route: 'contact' },
  ];

  const getDashboardRoute = () => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return 'admin-dashboard';
    if (role === 'CONTRACTOR') return 'contractor-dashboard';
    return 'customer-dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo
          size="md"
          showTagline
          onClick={() => navigate('home')}
          className="cursor-pointer"
        />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                id={`nav-link-${link.route}`}
                onClick={() => navigate(link.route)}
                className={`text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {/* Become a Contractor CTA */}
          <button
            id="header-contractor-link"
            onClick={() => navigate('become-a-contractor')}
            className="text-xs font-bold text-slate-700 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            Become a Contractor
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {isAuthenticated ? (
            <Button
              id="header-dashboard-btn"
              variant="primary"
              size="sm"
              onClick={() => navigate(getDashboardRoute())}
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              {currentUser?.firstName}&apos;s Dashboard
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                id="header-signin-btn"
                variant="ghost"
                size="sm"
                onClick={() => navigate('login')}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Sign In
              </Button>
              <Button
                id="header-register-btn"
                variant="primary"
                size="sm"
                onClick={() => navigate('register')}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => navigate(link.route)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
                  currentRoute === link.route
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => navigate('become-a-contractor')}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Become a Contractor
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => navigate(getDashboardRoute())}
                className="w-full justify-center"
              >
                Open {role} Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('login')}
                  className="w-full justify-center"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('register')}
                  className="w-full justify-center"
                >
                  Register Account
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
