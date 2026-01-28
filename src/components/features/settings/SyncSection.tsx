/**
 * SyncSection Component
 * Story 6.4: Settings Page - Task 2
 *
 * Displays sync status and manual sync button
 */

'use client';

import { useState, useCallback } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useSyncEngine, useToast } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

/**
 * SyncSection displays synchronization status and manual sync trigger
 *
 * Features:
 * - Shows pending sync count
 * - Shows failed sync count
 * - Manual sync button with loading state
 * - Toast feedback on sync completion/failure
 */
export function SyncSection() {
  const { isSyncing, pendingCount, failedCount, manualSync } = useSyncEngine({ autoSync: false });
  const { toastSuccess, toastError } = useToast();
  const [isTriggering, setIsTriggering] = useState(false);

  // Use pendingCount from useSyncEngine for consistency (single source of truth)
  const hasItemsToSync = pendingCount > 0 || failedCount > 0;
  const isAllSynced = pendingCount === 0 && failedCount === 0;
  const isBusy = isSyncing || isTriggering;

  const handleSync = useCallback(async () => {
    setIsTriggering(true);
    try {
      await manualSync();
      toastSuccess('Synchronisation terminée');
    } catch {
      toastError('Synchronisation échouée', 'Réessayez plus tard');
    } finally {
      setIsTriggering(false);
    }
  }, [manualSync, toastSuccess, toastError]);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Synchronisation</h2>

      <div className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
          {isAllSynced ? (
            <>
              <div
                data-testid="sync-check-icon"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30"
              >
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Tout synchronisé
              </span>
            </>
          ) : (
            <>
              <div
                className={cn(
                  'flex items-center justify-center h-10 w-10 rounded-full',
                  failedCount > 0
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-amber-100 dark:bg-amber-900/30'
                )}
              >
                {isBusy ? (
                  <Spinner data-testid="sync-spinner" size="sm" />
                ) : failedCount > 0 ? (
                  <AlertCircle
                    className="h-5 w-5 text-red-600 dark:text-red-400"
                    aria-hidden="true"
                  />
                ) : (
                  <RefreshCw
                    className="h-5 w-5 text-amber-600 dark:text-amber-400"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="flex flex-col">
                {pendingCount > 0 && (
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {pendingCount} élément(s) en attente
                  </span>
                )}
                {failedCount > 0 && (
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {failedCount} échec(s)
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Manual Sync Button */}
        <Button
          variant="outline"
          className="w-full h-12"
          onClick={handleSync}
          disabled={!hasItemsToSync || isBusy}
        >
          {isBusy ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Synchronisation...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Synchroniser maintenant
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
