/**
 * Unit tests for OcrError component
 * Story 3.3: OCR Processing (Claude Haiku 4.5 API)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OcrError } from './OcrError';
import type { OcrError as OcrErrorType } from '@/lib/ocr/types';

describe('OcrError', () => {
  const baseError: OcrErrorType = {
    type: 'api_error',
    message: 'Test error message',
  };

  it('should render error message', () => {
    render(<OcrError error={baseError} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should have alert role', () => {
    render(<OcrError error={baseError} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  describe('error types', () => {
    it('should show "Erreur d\'analyse" for api_error', () => {
      render(<OcrError error={baseError} />);
      expect(screen.getByText(/Erreur d'analyse/i)).toBeInTheDocument();
    });

    it('should show "Hors ligne" for network_error', () => {
      const error: OcrErrorType = {
        type: 'network_error',
        message: 'No network',
      };
      render(<OcrError error={error} />);
      expect(screen.getByText('Hors ligne')).toBeInTheDocument();
    });

    it('should show "Analyse trop longue" for timeout', () => {
      const error: OcrErrorType = {
        type: 'timeout',
        message: 'Timeout',
      };
      render(<OcrError error={error} />);
      expect(screen.getByText('Analyse trop longue')).toBeInTheDocument();
    });

    it('should show "Lecture difficile" for low_confidence', () => {
      const error: OcrErrorType = {
        type: 'low_confidence',
        message: 'Low confidence',
      };
      render(<OcrError error={error} />);
      expect(screen.getByText('Lecture difficile')).toBeInTheDocument();
    });

    it('should show "Image invalide" for invalid_image', () => {
      const error: OcrErrorType = {
        type: 'invalid_image',
        message: 'Invalid image',
      };
      render(<OcrError error={error} />);
      expect(screen.getByText('Image invalide')).toBeInTheDocument();
    });
  });

  describe('retry button', () => {
    it('should show retry button when onRetry provided', () => {
      const onRetry = vi.fn();
      render(<OcrError error={baseError} onRetry={onRetry} />);

      expect(
        screen.getByRole('button', { name: /réessayer/i })
      ).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(<OcrError error={baseError} onRetry={onRetry} />);

      fireEvent.click(screen.getByRole('button', { name: /réessayer/i }));

      expect(onRetry).toHaveBeenCalled();
    });

    it('should show loading state when retrying', () => {
      const onRetry = vi.fn();
      render(<OcrError error={baseError} onRetry={onRetry} isRetrying />);

      expect(screen.getByText(/Réessai en cours/i)).toBeInTheDocument();
    });

    it('should disable retry button when retrying', () => {
      const onRetry = vi.fn();
      render(<OcrError error={baseError} onRetry={onRetry} isRetrying />);

      const button = screen.getByRole('button', { name: /réessai en cours/i });
      expect(button).toBeDisabled();
    });

    it('should not show retry button for low_confidence', () => {
      const error: OcrErrorType = {
        type: 'low_confidence',
        message: 'Low confidence',
      };
      const onRetry = vi.fn();
      render(<OcrError error={error} onRetry={onRetry} />);

      expect(
        screen.queryByRole('button', { name: /réessayer/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('manual entry button', () => {
    it('should show manual entry button when onManualEntry provided', () => {
      const onManualEntry = vi.fn();
      render(<OcrError error={baseError} onManualEntry={onManualEntry} />);

      expect(
        screen.getByRole('button', { name: /saisie manuelle/i })
      ).toBeInTheDocument();
    });

    it('should call onManualEntry when button clicked', () => {
      const onManualEntry = vi.fn();
      render(<OcrError error={baseError} onManualEntry={onManualEntry} />);

      fireEvent.click(screen.getByRole('button', { name: /saisie manuelle/i }));

      expect(onManualEntry).toHaveBeenCalled();
    });
  });

  describe('network error info', () => {
    it('should show sync info for network_error', () => {
      const error: OcrErrorType = {
        type: 'network_error',
        message: 'No network',
      };
      render(<OcrError error={error} />);

      expect(
        screen.getByText(/sera analysé automatiquement/i)
      ).toBeInTheDocument();
    });

    it('should show sync info for timeout', () => {
      const error: OcrErrorType = {
        type: 'timeout',
        message: 'Timeout',
      };
      render(<OcrError error={error} />);

      expect(
        screen.getByText(/sera analysé automatiquement/i)
      ).toBeInTheDocument();
    });
  });

  describe('low confidence help text', () => {
    it('should show help text for low_confidence', () => {
      const error: OcrErrorType = {
        type: 'low_confidence',
        message: 'Low confidence',
      };
      render(<OcrError error={error} />);

      expect(
        screen.getByText(/qualité de l'image/i)
      ).toBeInTheDocument();
    });
  });
});
