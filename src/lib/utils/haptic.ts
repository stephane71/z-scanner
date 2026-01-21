/**
 * Haptic feedback utility using Vibration API
 * Story 3.6: Ticket Validation with NF525 Compliance
 *
 * Provides haptic feedback for validation success, warnings, and errors.
 * Falls back gracefully when Vibration API is not supported.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */

/**
 * Haptic feedback pattern types
 */
export type HapticPattern = 'success' | 'warning' | 'error';

/**
 * Vibration patterns for different feedback types
 * Values represent vibration/pause durations in milliseconds
 *
 * - success: Single short vibration (100ms)
 * - warning: Two short pulses (50ms vibrate, 50ms pause, 50ms vibrate)
 * - error: Long-short-long pattern (200ms, 100ms pause, 200ms)
 */
export const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  success: [100],
  warning: [50, 50, 50],
  error: [200, 100, 200],
};

/**
 * Trigger haptic feedback using Vibration API
 *
 * @param pattern - Type of haptic feedback (default: 'success')
 *
 * @example
 * ```typescript
 * // On validation success
 * triggerHaptic('success');
 *
 * // On validation warning
 * triggerHaptic('warning');
 *
 * // On validation error
 * triggerHaptic('error');
 * ```
 */
export function triggerHaptic(pattern: HapticPattern = 'success'): void {
  // Check if Vibration API is supported
  if (typeof navigator === 'undefined' || !navigator) {
    return;
  }

  if (!('vibrate' in navigator)) {
    return;
  }

  // Trigger vibration with specified pattern
  try {
    navigator.vibrate(HAPTIC_PATTERNS[pattern]);
  } catch {
    // Silently ignore errors (e.g., permission denied)
  }
}
