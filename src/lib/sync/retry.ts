/**
 * Retry Logic - Story 3.9
 * Exponential backoff utilities for sync queue
 *
 * Implements exponential backoff: 1s→2s→4s→8s→16s (max 5 retries)
 */

/**
 * Maximum number of retry attempts before marking as failed
 */
export const MAX_RETRIES = 5;

/**
 * Base delay in milliseconds (1 second)
 */
export const BASE_DELAY = 1000;

/**
 * Calculate the backoff delay for a given retry count
 * Uses exponential backoff: delay = BASE_DELAY * 2^retries
 *
 * @param retries - Current retry count (0-indexed)
 * @returns Delay in milliseconds
 *
 * @example
 * calculateBackoff(0) // 1000ms (1s)
 * calculateBackoff(1) // 2000ms (2s)
 * calculateBackoff(2) // 4000ms (4s)
 * calculateBackoff(3) // 8000ms (8s)
 * calculateBackoff(4) // 16000ms (16s)
 */
export function calculateBackoff(retries: number): number {
  return BASE_DELAY * Math.pow(2, retries);
}

/**
 * Check if more retry attempts should be made
 *
 * @param retries - Current retry count (after increment)
 * @returns true if more retries are allowed
 */
export function shouldRetry(retries: number): boolean {
  return retries < MAX_RETRIES;
}

/**
 * Get all backoff delays as an array
 * Useful for testing and documentation
 *
 * @returns Array of delays in milliseconds [1000, 2000, 4000, 8000, 16000]
 */
export function getBackoffDelays(): number[] {
  return Array.from({ length: MAX_RETRIES }, (_, i) => calculateBackoff(i));
}

/**
 * Timer cleanup registry
 * Stores timeout IDs for cleanup on component unmount
 */
const retryTimers = new Map<number, ReturnType<typeof setTimeout>>();

/**
 * Schedule a retry with the appropriate backoff delay
 * The callback will be called after the delay
 *
 * @param id - Sync queue item ID
 * @param retries - Current retry count
 * @param callback - Function to call after delay
 * @returns Function to cancel the scheduled retry
 */
export function scheduleRetry(
  id: number,
  retries: number,
  callback: () => void
): () => void {
  // Cancel any existing timer for this ID
  cancelRetry(id);

  const delay = calculateBackoff(retries);

  const timerId = setTimeout(() => {
    retryTimers.delete(id);
    callback();
  }, delay);

  retryTimers.set(id, timerId);

  // Return cleanup function
  return () => cancelRetry(id);
}

/**
 * Cancel a scheduled retry
 *
 * @param id - Sync queue item ID
 */
export function cancelRetry(id: number): void {
  const timerId = retryTimers.get(id);
  if (timerId) {
    clearTimeout(timerId);
    retryTimers.delete(id);
  }
}

/**
 * Cancel all scheduled retries
 * Call this on component unmount or app shutdown
 */
export function cancelAllRetries(): void {
  for (const timerId of retryTimers.values()) {
    clearTimeout(timerId);
  }
  retryTimers.clear();
}
