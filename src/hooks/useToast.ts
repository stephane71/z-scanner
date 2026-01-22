/**
 * useToast hook - Story 3.9
 * Wrapper around sonner toast for sync notifications
 *
 * @example
 * const { toastError, toastSuccess } = useToast();
 *
 * // On sync failure
 * toastError("Synchronisation échouée", "Réessayer dans Paramètres");
 *
 * // On sync success
 * toastSuccess("Synchronisation terminée");
 */

'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Toast types for semantic styling
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast options
 */
export interface ToastOptions {
  /** Toast title */
  title: string;
  /** Optional description */
  description?: string;
  /** Toast type for styling */
  type?: ToastType;
  /** Duration in milliseconds (default: 4000) */
  duration?: number;
  /** Click action */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Result type for useToast hook
 */
export interface UseToastResult {
  /** Show a toast notification */
  showToast: (options: ToastOptions) => void;
  /** Show a success toast */
  toastSuccess: (title: string, description?: string) => void;
  /** Show an error toast */
  toastError: (title: string, description?: string) => void;
  /** Show a warning toast */
  toastWarning: (title: string, description?: string) => void;
  /** Show an info toast */
  toastInfo: (title: string, description?: string) => void;
}

/**
 * Default toast duration in milliseconds
 */
const DEFAULT_DURATION = 4000;

/**
 * Hook to show toast notifications
 * Uses sonner under the hood
 *
 * @returns Toast functions
 */
export function useToast(): UseToastResult {
  /**
   * Show a generic toast
   */
  const showToast = useCallback((options: ToastOptions) => {
    const { title, description, type = 'info', duration = DEFAULT_DURATION, action } = options;

    const toastOptions = {
      description,
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    };

    switch (type) {
      case 'success':
        toast.success(title, toastOptions);
        break;
      case 'error':
        toast.error(title, toastOptions);
        break;
      case 'warning':
        toast.warning(title, toastOptions);
        break;
      case 'info':
      default:
        toast.info(title, toastOptions);
        break;
    }
  }, []);

  /**
   * Show a success toast
   */
  const toastSuccess = useCallback(
    (title: string, description?: string) => {
      showToast({ title, description, type: 'success' });
    },
    [showToast]
  );

  /**
   * Show an error toast
   */
  const toastError = useCallback(
    (title: string, description?: string) => {
      showToast({ title, description, type: 'error' });
    },
    [showToast]
  );

  /**
   * Show a warning toast
   */
  const toastWarning = useCallback(
    (title: string, description?: string) => {
      showToast({ title, description, type: 'warning' });
    },
    [showToast]
  );

  /**
   * Show an info toast
   */
  const toastInfo = useCallback(
    (title: string, description?: string) => {
      showToast({ title, description, type: 'info' });
    },
    [showToast]
  );

  return {
    showToast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
  };
}
