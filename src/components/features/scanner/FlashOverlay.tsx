/**
 * FlashOverlay Component
 * Story 3.2: Camera Capture UI - Task 5
 *
 * White flash overlay that fades out to confirm photo capture.
 * Includes haptic feedback via Navigator.vibrate().
 */

'use client';

import { useEffect, useRef } from 'react';

export interface FlashOverlayProps {
  /** Whether the flash is visible */
  isVisible: boolean;
  /** Duration of flash animation in ms (default: 200) */
  duration?: number;
  /** Callback when flash animation completes */
  onComplete?: () => void;
}

/**
 * Flash overlay for capture confirmation
 *
 * Design specs (from UX):
 * - White overlay
 * - 200ms fade out animation
 * - Haptic feedback (50ms vibration)
 *
 * @example
 * ```tsx
 * const [showFlash, setShowFlash] = useState(false);
 *
 * const handleCapture = async () => {
 *   setShowFlash(true);
 *   // ... capture logic
 * };
 *
 * <FlashOverlay
 *   isVisible={showFlash}
 *   onComplete={() => setShowFlash(false)}
 * />
 * ```
 */
export function FlashOverlay({
  isVisible,
  duration = 200,
  onComplete,
}: FlashOverlayProps) {
  const hasTriggeredHaptic = useRef(false);
  const isMounted = useRef(true);

  // Track mounted state for safe callback invocation
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isVisible && !hasTriggeredHaptic.current) {
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      hasTriggeredHaptic.current = true;

      // Schedule completion callback (only if still mounted)
      const timer = setTimeout(() => {
        if (isMounted.current) {
          onComplete?.();
        }
      }, duration);

      return () => clearTimeout(timer);
    }

    // Reset haptic trigger when flash is hidden
    if (!isVisible) {
      hasTriggeredHaptic.current = false;
    }
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        backgroundColor: 'white',
        animation: `flash-fade ${duration}ms ease-out forwards`,
      }}
      aria-hidden="true"
      role="presentation"
    >
      <style>
        {`
          @keyframes flash-fade {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
