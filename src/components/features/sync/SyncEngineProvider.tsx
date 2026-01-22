/**
 * SyncEngineProvider - Story 3.9
 * Provides sync engine context for the app
 *
 * Responsibilities:
 * - Starts sync engine on mount (when authenticated)
 * - Shows toast notifications on sync failures
 * - Exposes manual sync trigger for settings page
 */

'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useSyncEngine, useToast, type UseSyncEngineResult } from '@/hooks';
import { Toaster } from '@/components/ui/sonner';

/**
 * Sync engine context type
 */
interface SyncEngineContextValue extends UseSyncEngineResult {
  /** Manually trigger sync (for settings page) */
  retryFailed: () => void;
}

const SyncEngineContext = createContext<SyncEngineContextValue | null>(null);

/**
 * Provider props
 */
interface SyncEngineProviderProps {
  children: ReactNode;
}

/**
 * SyncEngineProvider component
 * Wraps app to provide sync engine functionality
 */
export function SyncEngineProvider({ children }: SyncEngineProviderProps) {
  const syncEngine = useSyncEngine();
  const { toastWarning } = useToast();

  const {
    isSyncing,
    syncError,
    lastSyncResult,
    failedCount,
    pendingCount,
    manualSync,
  } = syncEngine;

  // Show toast on sync failures (after all retries exhausted)
  useEffect(() => {
    if (lastSyncResult && lastSyncResult.failed > 0) {
      // Only show toast if there are newly failed items
      toastWarning(
        'Synchronisation échouée',
        'Réessayer dans Paramètres'
      );
    }
  }, [lastSyncResult, toastWarning]);

  // Context value with all sync engine capabilities
  const contextValue: SyncEngineContextValue = {
    isSyncing,
    syncError,
    lastSyncResult,
    failedCount,
    pendingCount,
    manualSync,
    retryFailed: manualSync, // Alias for settings page
  };

  return (
    <SyncEngineContext.Provider value={contextValue}>
      {children}
      {/* Toast container - renders toasts at bottom */}
      <Toaster position="bottom-center" />
    </SyncEngineContext.Provider>
  );
}

/**
 * Hook to access sync engine context
 * @throws Error if used outside SyncEngineProvider
 */
export function useSyncEngineContext(): SyncEngineContextValue {
  const context = useContext(SyncEngineContext);
  if (!context) {
    throw new Error('useSyncEngineContext must be used within SyncEngineProvider');
  }
  return context;
}
