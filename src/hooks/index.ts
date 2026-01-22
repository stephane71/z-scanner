/**
 * Custom React hooks for Z-Scanner
 * Re-exports all hooks for convenient imports
 */

// Ticket hooks
export {
  useTickets,
  useTicketById,
  useTicketsByStatus,
  useTicketsByMarket,
  useTicketsCount,
  addTicket,
  getTicket,
  validateTicket,
  cancelTicket,
} from './useTickets';

// Market hooks
export {
  useMarkets,
  useMarketById,
  useMarketsCount,
  addMarket,
  getMarket,
  updateMarketName,
  deleteMarket,
  restoreMarket,
} from './useMarkets';

// Sync queue hooks
export {
  usePendingSyncItems,
  useSyncQueueStats,
  useFailedSyncItems,
  useHasPendingSync,
  addToSyncQueue,
  queueCreate,
  queueCancel,
  updateSyncStatus,
  incrementRetry,
  getNextPendingItem,
  markInProgress,
  markCompleted,
  markFailed,
} from './useSyncQueue';

// Camera hooks
export {
  useCamera,
  type CameraError,
  type CameraErrorType,
  type UseCameraResult,
} from './useCamera';

// OCR hooks
export { useOCR, type UseOcrResult } from './useOCR';

// Verification hooks
export {
  useVerification,
  type UseVerificationOptions,
  type UseVerificationResult,
} from './useVerification';

// Manual entry hooks
export {
  useManualEntry,
  type UseManualEntryOptions,
  type UseManualEntryResult,
} from './useManualEntry';

// Validation hooks (Story 3.6)
export {
  useTicketValidation,
  type UseTicketValidationResult,
} from './useTicketValidation';

// Photo hooks (Story 3.7)
export { usePhoto, type UsePhotoResult } from './usePhoto';

// Network connectivity hooks (Story 3.9)
export { useOnline } from './useOnline';

// Sync engine hooks (Story 3.9)
export { useSyncEngine, type UseSyncEngineResult } from './useSyncEngine';

// Toast hooks (Story 3.9)
export { useToast, type ToastOptions, type ToastType, type UseToastResult } from './useToast';

// Sync count hook (Story 3.8)
export { usePendingSyncCount } from './usePendingSyncCount';

// Date filter hooks (Story 4.3)
export { useTicketsByDateRange } from './useTicketsByDateRange';
