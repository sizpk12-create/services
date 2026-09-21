/**
 * You Want Services - Professional Demo Mode Indicator & Role Switcher
 * Phase 1 Architecture
 */

import React, { useState } from 'react';
import { useDemoMode } from '../../context/DemoContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { ShieldCheck, Users, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { currentUser, switchDemoRole } = useAuth();
  const { navigate, currentRoute } = useNavigation();
  const [expanded, setExpanded] = useState(false);

  if (!isDemoMode) {
    return (
      <div id="demo-mode-disabled-bar" className="bg-emerald-900 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">LIVE SYSTEM MODE ACTIVE</span>
          <span className="text-emerald-200 hidden sm:inline">(Live payments & dispatch safeguards enabled)</span>
        </div>
        <button
          id="btn-enable-demo-mode"
          onClick={toggleDemoMode}
          className="text-[11px] bg-emerald-800 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded transition cursor-pointer"
        >
          Enable Demo Mode
        </button>
      </div>
    );
  }

  return (
    <div id="demo-mode-indicator-bar" className="bg-slate-900 border-b border-slate-800 text-white text-xs z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DEMO MODE</span>
          </div>
          <span className="text-slate-300 hidden md:inline">
            Phase 1 Foundation • Safe Simulated Sandbox • No real payments or emails
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Active User Role Tag */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded text-slate-200 border border-slate-700">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Viewing as:</span>
            <span className="font-semibold text-white">{currentUser?.role || 'Guest'}</span>
          </div>

          {/* Expand Switcher */}
          <button
            id="btn-toggle-demo-roles"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition cursor-pointer"
          >
            <span className="font-medium">Switch Role</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Toggle Demo Mode Button */}
          <button
            id="btn-toggle-demo-mode"
            onClick={toggleDemoMode}
            title="Toggle Demo Mode Simulation"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            {isDemoMode ? (
              <ToggleRight className="w-5 h-5 text-amber-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-500" />
            )}
            <span className="hidden sm:inline">Demo Active</span>
          </button>
        </div>
      </div>

      {/* Expanded Quick Role Switcher Drawer */}
      {expanded && (
        <div className="bg-slate-950 border-t border-slate-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-400">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Test different role views and permissions instantly in Phase 1:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-role-customer"
                onClick={() => {
                  switchDemoRole('customer');
                  if (currentRoute.startsWith('contractor-') || currentRoute.startsWith('admin-')) {
                    navigate('customer-dashboard');
                  }
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                  currentUser?.role === 'CUSTOMER'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Customer (David M.)
              </button>

              <button
                id="btn-role-contractor"
                onClick={() => {
                  switchDemoRole('contractor');
                  if (currentRoute.startsWith('customer-') || currentRoute.startsWith('admin-')) {
                    navigate('contractor-dashboard');
                  }
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                  currentUser?.role === 'CONTRACTOR'
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Contractor (Marcus - Apex HVAC)
              </button>

              <button
                id="btn-role-admin"
                onClick={() => {
                  switchDemoRole('admin');
                  if (currentRoute.startsWith('customer-') || currentRoute.startsWith('contractor-')) {
                    navigate('admin-dashboard');
                  }
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Admin (Elena R.)
              </button>

              <button
                id="btn-role-superadmin"
                onClick={() => {
                  switchDemoRole('superAdmin');
                  if (currentRoute.startsWith('customer-') || currentRoute.startsWith('contractor-')) {
                    navigate('admin-dashboard');
                  }
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                  currentUser?.role === 'SUPER_ADMIN'
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Super Admin (Alexander S.)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
