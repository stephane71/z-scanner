/**
 * useOnline hook - Network connectivity detection
 * Story 3.9: Background Sync Engine
 *
 * Detects online/offline state using navigator.onLine and window events.
 * Handles SSR by defaulting to true when navigator is not available.
 *
 * @returns boolean - true if online, false if offline
 *
 * @example
 * const isOnline = useOnline();
 * if (isOnline) {
 *   // Sync data
 * }
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect network connectivity status
 *
 * Uses navigator.onLine for initial state and listens to
 * 'online' and 'offline' window events for reactive updates.
 *
 * @returns boolean indicating if the browser is online
 */
export function useOnline(): boolean {
  // SSR-safe: default to true when navigator is not available
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Assume online during SSR
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
