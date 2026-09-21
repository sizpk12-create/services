/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * YOU WANT SERVICES
 * Phase 1 Architecture: Root Application Component
 */

import React from 'react';
import { DemoProvider } from './context/DemoContext';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { DemoBanner } from './components/common/DemoBanner';
import { AppRouter } from './components/routing/AppRouter';

export default function App() {
  return (
    <DemoProvider>
      <AuthProvider>
        <NavigationProvider>
          <div className="min-h-screen flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
            {/* Global Demo Sandbox Banner & Fast Role Switcher */}
            <DemoBanner />
            {/* Main Application Router */}
            <AppRouter />
          </div>
        </NavigationProvider>
      </AuthProvider>
    </DemoProvider>
  );
}

