/**
 * CaptureButton Component
 * Story 3.2: Camera Capture UI - Task 3
 *
 * 64px circular green button for capturing ticket photos.
 * Positioned in thumb zone for one-handed use.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

export interface CaptureButtonProps {
  /** Callback when capture button is pressed */
  onCapture: () => void | Promise<void>;
  /** Whether the button is disabled (during capture/processing) */
  disabled?: boolean;
  /** Whether capture is in progress */
  isCapturing?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Capture button for camera viewfinder
 *
 * Design specs (from UX):
 * - 64px circular button
 * - Green color (#16A34A / green-600)
 * - Touch target minimum 48px (met by 64px)
 * - Position in thumb zone (handled by parent)
 *
 * @example
 * ```tsx
 * <CaptureButton
 *   onCapture={handleCapture}
 *   disabled={isProcessing}
 *   isCapturing={isCapturing}
 * />
 * ```
 */
export function CaptureButton({
  onCapture,
  disabled = false,
  isCapturing = false,
  className = '',
}: CaptureButtonProps) {
  const handleClick = async () => {
    if (disabled || isCapturing) return;
    await onCapture();
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isCapturing}
      className={`
        w-16 h-16 rounded-full
        bg-green-600 hover:bg-green-700 active:bg-green-800
        disabled:bg-gray-400 disabled:cursor-not-allowed
        flex items-center justify-center
        shadow-lg active:shadow-md
        transition-all duration-150
        touch-manipulation
        ${className}
      `}
      aria-label={isCapturing ? 'Capture en cours...' : 'Capturer le ticket'}
    >
      {isCapturing ? (
        <div
          className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Camera className="w-7 h-7 text-white" aria-hidden="true" />
      )}
    </Button>
  );
}
