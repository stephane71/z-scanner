/**
 * CameraView Component
 * Story 3.2: Camera Capture UI - Task 2
 *
 * Main camera viewfinder component with video stream,
 * guide frame overlay, and capture button.
 */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useCamera } from '@/hooks/useCamera';
import { CaptureButton } from './CaptureButton';
import { CameraPermissionError } from './CameraPermissionError';
import { FlashOverlay } from './FlashOverlay';

export interface CameraViewProps {
  /** Callback when photo is captured (receives raw blob) */
  onCapture: (blob: Blob) => void | Promise<void>;
  /** Optional loading state from parent */
  isProcessing?: boolean;
}

/**
 * Camera viewfinder with guide frame and capture button
 *
 * Design specs (from UX):
 * - Direct to scanner (immediate camera on page load)
 * - Dotted guide frame (80% viewport width, 3:4 aspect)
 * - Capture button (64px green) in thumb zone
 * - Flash animation + haptic on capture
 *
 * @example
 * ```tsx
 * <CameraView
 *   onCapture={async (blob) => {
 *     const compressed = await compressTicketImage(blob);
 *     // Save and navigate...
 *   }}
 * />
 * ```
 */
export function CameraView({ onCapture, isProcessing = false }: CameraViewProps) {
  const {
    videoRef,
    error,
    isLoading,
    isReady,
    requestPermission,
    captureFrame,
  } = useCamera();

  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  /**
   * Handle photo capture
   */
  const handleCapture = useCallback(async () => {
    if (isCapturing || isProcessing || !isReady) return;

    setIsCapturing(true);
    setShowFlash(true);

    try {
      const blob = await captureFrame();

      if (blob) {
        await onCapture(blob);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isProcessing, isReady, captureFrame, onCapture]);

  /**
   * Handle retry permission request
   */
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await requestPermission();
    } finally {
      setIsRetrying(false);
    }
  }, [requestPermission]);

  /**
   * Handle flash animation complete
   */
  const handleFlashComplete = useCallback(() => {
    setShowFlash(false);
  }, []);

  // Show error state
  if (error) {
    return (
      <CameraPermissionError
        error={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full bg-black"
        role="status"
        aria-label="Initialisation de la caméra"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <p className="text-white text-sm">Initialisation de la caméra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black overflow-hidden">
      {/* Flash overlay */}
      <FlashOverlay isVisible={showFlash} onComplete={handleFlashComplete} />

      {/* Video viewfinder */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        aria-label="Aperçu de la caméra"
      />

      {/* Dotted guide frame */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="relative w-[80%] aspect-[3/4] max-w-[360px]">
          {/* Guide frame */}
          <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg" />

          {/* Corner indicators */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg" />
        </div>
      </div>

      {/* Instruction text */}
      <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
        <p className="px-4 py-2 bg-black/50 text-white text-sm rounded-full">
          Placez le ticket dans le cadre
        </p>
      </div>

      {/* Capture button and manual entry link in thumb zone */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3 pb-safe">
        <CaptureButton
          onCapture={handleCapture}
          disabled={!isReady || isProcessing}
          isCapturing={isCapturing}
        />
        <Link
          href="/scan/manual"
          className="text-xs text-white/70 underline hover:text-white transition-colors"
        >
          Saisie manuelle
        </Link>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
            <div
              className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <p className="text-gray-700 font-medium">Traitement en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
}
