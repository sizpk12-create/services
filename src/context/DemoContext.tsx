/**
 * You Want Services - Demo Mode Context & Global Guard
 * Phase 1 Architecture
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_CONFIG } from '../config/demo';
import { auditLogger } from '../services/auditLogger';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  assertNotProduction: (actionName: string) => boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('yws_demo_mode');
    return saved !== null ? saved === 'true' : DEMO_CONFIG.DEFAULT_ENABLED;
  });

  useEffect(() => {
    localStorage.setItem('yws_demo_mode', String(isDemoMode));
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      auditLogger.log({
        actorId: 'system-toggle',
        actorRole: 'ADMIN',
        action: 'TOGGLE_DEMO_MODE',
        entityType: 'PLATFORM',
        entityId: 'config',
        details: { enabled: next },
        isDemo: true,
      });
      return next;
    });
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    auditLogger.log({
      actorId: 'system-toggle',
      actorRole: 'ADMIN',
      action: 'SET_DEMO_MODE',
      entityType: 'PLATFORM',
      entityId: 'config',
      details: { enabled },
      isDemo: true,
    });
  };

  const assertNotProduction = (actionName: string): boolean => {
    if (isDemoMode) {
      console.info(`[Demo Mode Guard] Suppressed live action: "${actionName}". Operating safely in sandbox.`);
      return true;
    }
    return false;
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode, toggleDemoMode, assertNotProduction }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoMode = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
};
