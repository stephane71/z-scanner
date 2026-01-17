/**
 * useCamera Hook - MediaDevices getUserMedia wrapper for camera capture
 * Story 3.2: Camera Capture UI
 *
 * Provides camera access with permission handling, rear camera selection,
 * frame capture, and proper cleanup on unmount.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Camera error types matching MediaDevices API error names
 */
export type CameraErrorType =
  | 'not-allowed'
  | 'not-found'
  | 'not-readable'
  | 'overconstrained'
  | 'security'
  | 'unknown';

/**
 * Structured camera error with type and French message
 */
export interface CameraError {
  type: CameraErrorType;
  message: string;
}

/**
 * Return type for useCamera hook
 */
export interface UseCameraResult {
  /** Ref to attach to video element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Active media stream or null */
  stream: MediaStream | null;
  /** Camera error if any */
  error: CameraError | null;
  /** True while requesting camera permission */
  isLoading: boolean;
  /** True when stream is ready and playing */
  isReady: boolean;
  /** Request camera permission (can be called to retry) */
  requestPermission: () => Promise<void>;
  /** Capture current frame as Blob */
  captureFrame: () => Promise<Blob | null>;
  /** Stop camera stream */
  stopStream: () => void;
}

/**
 * Map DOMException names to CameraErrorType
 */
function mapErrorType(errorName: string): CameraErrorType {
  switch (errorName) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'not-allowed';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'not-found';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'not-readable';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'overconstrained';
    case 'SecurityError':
      return 'security';
    default:
      return 'unknown';
  }
}

/**
 * Get French error message for camera error type
 */
function getErrorMessage(type: CameraErrorType): string {
  switch (type) {
    case 'not-allowed':
      return "L'accès à la caméra a été refusé. Autorisez l'accès dans les paramètres de votre navigateur.";
    case 'not-found':
      return "Aucune caméra n'a été détectée sur cet appareil.";
    case 'not-readable':
      return 'La caméra est déjà utilisée par une autre application.';
    case 'overconstrained':
      return 'La caméra ne supporte pas les paramètres demandés.';
    case 'security':
      return "L'accès à la caméra n'est pas autorisé sur cette page (HTTPS requis).";
    case 'unknown':
    default:
      return "Une erreur inattendue s'est produite lors de l'accès à la caméra.";
  }
}

/**
 * Hook for camera access with MediaDevices API
 *
 * Features:
 * - Prefers rear camera (facingMode: environment) for ticket scanning
 * - Proper error handling for all camera permission states
 * - Automatic cleanup of media stream on unmount
 * - Device change detection
 * - Frame capture via canvas
 *
 * @example
 * ```tsx
 * const { videoRef, error, isLoading, captureFrame } = useCamera();
 *
 * if (error) return <CameraPermissionError error={error} />;
 * if (isLoading) return <Spinner />;
 *
 * return <video ref={videoRef} autoPlay playsInline muted />;
 * ```
 */
export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<CameraError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  /**
   * Stop all tracks in the current stream
   */
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
      setIsReady(false);
    }
  }, []);

  /**
   * Request camera permission and start stream
   */
  const requestPermission = useCallback(async () => {
    // Check if MediaDevices API is available
    if (!navigator.mediaDevices?.getUserMedia) {
      // Provide more specific error for secure context issues
      const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

      let message: string;
      if (!isSecureContext && !isLocalhost) {
        message = `L'accès caméra nécessite HTTPS. Accédez via localhost ou configurez HTTPS pour ${hostname}.`;
      } else {
        message = getErrorMessage('security');
      }

      setError({
        type: 'security',
        message,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsReady(false);

    // Stop existing stream if any
    stopStream();

    try {
      // Camera constraints - prefer rear camera for ticket scanning
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);

      // Store in ref for cleanup
      streamRef.current = mediaStream;
      // Setting stream will trigger the useEffect that attaches to video element
      setStream(mediaStream);
    } catch (err) {
      const domError = err as DOMException;
      const errorType = mapErrorType(domError.name);

      setError({
        type: errorType,
        message: getErrorMessage(errorType),
      });
    } finally {
      setIsLoading(false);
    }
  }, [stopStream]);

  /**
   * Capture current video frame as Blob
   * Returns WebP blob at 80% quality (with JPEG fallback for Safari)
   */
  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !isReady) {
      return null;
    }

    const video = videoRef.current;

    // Ensure video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Try WebP first, fallback to JPEG for Safari
    return new Promise<Blob | null>((resolve) => {
      // Check WebP support
      const supportsWebP =
        canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';
      const quality = supportsWebP ? 0.8 : 0.85;

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        mimeType,
        quality
      );
    });
  }, [isReady]);

  // Auto-request permission on mount
  useEffect(() => {
    requestPermission();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, [requestPermission]);

  // Attach stream to video element when both are available
  // This handles the case where the stream is ready before the video element is mounted
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    // Only set srcObject if it's not already set to this stream
    if (video.srcObject !== stream) {
      video.srcObject = stream;

      // On mobile, we need to explicitly play the video
      const playVideo = async () => {
        try {
          await video.play();
        } catch (err) {
          // Autoplay might be blocked, but that's usually fine
          // since user interaction will trigger play
          console.warn('Video autoplay blocked:', err);
        }
      };

      const handleLoadedMetadata = () => {
        setIsReady(true);
        playVideo();
      };

      video.onloadedmetadata = handleLoadedMetadata;

      // If metadata is already loaded (desktop), play immediately
      if (video.readyState >= 1) {
        setIsReady(true);
        playVideo();
      }

      // Cleanup: remove event handler when effect re-runs or on unmount
      return () => {
        video.onloadedmetadata = null;
      };
    }
  }, [stream]);

  // Handle device changes (e.g., camera disconnected/reconnected)
  useEffect(() => {
    const handleDeviceChange = () => {
      // If we have a stream but it's no longer active, request permission again
      if (streamRef.current) {
        const tracks = streamRef.current.getVideoTracks();
        const hasActiveTrack = tracks.some((track) => track.readyState === 'live');

        if (!hasActiveTrack) {
          // Camera was disconnected, try to reconnect
          requestPermission();
        }
      }
    };

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices?.removeEventListener(
        'devicechange',
        handleDeviceChange
      );
    };
  }, [requestPermission]);

  return {
    videoRef,
    stream,
    error,
    isLoading,
    isReady,
    requestPermission,
    captureFrame,
    stopStream,
  };
}
