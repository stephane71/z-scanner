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
