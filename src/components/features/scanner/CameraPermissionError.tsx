/**
 * CameraPermissionError Component
 * Story 3.2: Camera Capture UI - Task 6
 *
 * Displays error messages when camera access fails.
 * Shows different messages based on error type.
 */

'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Camera, CameraOff, RefreshCw, Lock } from 'lucide-react';
import type { CameraError, CameraErrorType } from '@/hooks/useCamera';

export interface CameraPermissionErrorProps {
  /** The camera error object */
  error: CameraError;
  /** Callback to retry permission request */
  onRetry: () => void | Promise<void>;
  /** Whether retry is in progress */
  isRetrying?: boolean;
}

/**
 * Get icon component for error type
 */
function getErrorIcon(type: CameraErrorType) {
  switch (type) {
    case 'not-allowed':
      return <Lock className="w-12 h-12 text-red-500" />;
    case 'not-found':
      return <CameraOff className="w-12 h-12 text-amber-500" />;
    case 'not-readable':
      return <Camera className="w-12 h-12 text-amber-500" />;
    case 'security':
      return <Lock className="w-12 h-12 text-red-500" />;
    default:
      return <AlertCircle className="w-12 h-12 text-red-500" />;
  }
}

/**
 * Get title for error type
 */
function getErrorTitle(type: CameraErrorType): string {
  switch (type) {
    case 'not-allowed':
      return 'Accès à la caméra refusé';
    case 'not-found':
      return 'Aucune caméra détectée';
    case 'not-readable':
      return 'Caméra indisponible';
    case 'security':
      return 'Connexion non sécurisée';
    case 'overconstrained':
      return 'Caméra non compatible';
    default:
      return 'Erreur de caméra';
  }
}

/**
 * Get help text for error type
 */
function getHelpText(type: CameraErrorType): string | null {
  switch (type) {
    case 'not-allowed':
      return 'Pour autoriser l\'accès, allez dans les paramètres de votre navigateur et activez la permission caméra pour ce site.';
    case 'not-found':
      return 'Vérifiez que votre appareil dispose d\'une caméra fonctionnelle.';
    case 'not-readable':
      return 'Fermez les autres applications utilisant la caméra et réessayez.';
    case 'security':
      return 'Cette fonctionnalité nécessite une connexion HTTPS sécurisée.';
    default:
      return null;
  }
}

/**
 * Camera permission error display
 *
 * Shows user-friendly error messages with retry option.
 * Messages are in French per UX requirements.
 *
 * @example
 * ```tsx
 * if (error) {
 *   return <CameraPermissionError error={error} onRetry={requestPermission} />;
 * }
 * ```
 */
export function CameraPermissionError({
  error,
  onRetry,
  isRetrying = false,
}: CameraPermissionErrorProps) {
  const title = getErrorTitle(error.type);
  const helpText = getHelpText(error.type);
  const icon = getErrorIcon(error.type);
  // Ref-based guard to prevent double-tap on mobile (state update is async)
  const isRetryingRef = useRef(false);

  const handleRetry = async () => {
    // Use both state and ref check for double-tap protection
    if (isRetrying || isRetryingRef.current) return;
    isRetryingRef.current = true;
    try {
      await onRetry();
    } finally {
      isRetryingRef.current = false;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4 bg-gray-50">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4" aria-hidden="true">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {helpText && (
            <p className="text-sm text-gray-600">{helpText}</p>
          )}

          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
            size="lg"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Tentative en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </>
            )}
          </Button>

          {error.type === 'not-allowed' && (
            <p className="text-xs text-gray-500 mt-4">
              Conseil : Sur Safari iOS, allez dans Réglages &gt; Safari &gt; Caméra
              et autorisez l'accès.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
