/**
 * Unit tests for CameraView component
 * Story 3.2: Camera Capture UI - Task 8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CameraView } from './CameraView';

// Mock useCamera hook
const mockRequestPermission = vi.fn();
const mockCaptureFrame = vi.fn();
const mockStopStream = vi.fn();

vi.mock('@/hooks/useCamera', () => ({
  useCamera: vi.fn(() => ({
    videoRef: { current: null },
    stream: null,
    error: null,
    isLoading: false,
    isReady: true,
    requestPermission: mockRequestPermission,
    captureFrame: mockCaptureFrame,
    stopStream: mockStopStream,
  })),
}));

// Get the mocked module
const { useCamera } = await vi.importMock<typeof import('@/hooks/useCamera')>('@/hooks/useCamera');

describe('CameraView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock to default state
    vi.mocked(useCamera).mockReturnValue({
      videoRef: { current: null },
      stream: null,
      error: null,
      isLoading: false,
      isReady: true,
      requestPermission: mockRequestPermission,
      captureFrame: mockCaptureFrame,
      stopStream: mockStopStream,
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when camera is initializing', () => {
      vi.mocked(useCamera).mockReturnValue({
        videoRef: { current: null },
        stream: null,
        error: null,
        isLoading: true,
        isReady: false,
        requestPermission: mockRequestPermission,
        captureFrame: mockCaptureFrame,
        stopStream: mockStopStream,
      });

      render(<CameraView onCapture={vi.fn()} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/initialisation/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when camera permission is denied', () => {
      vi.mocked(useCamera).mockReturnValue({
        videoRef: { current: null },
        stream: null,
        error: {
          type: 'not-allowed',
          message: "L'accès à la caméra a été refusé",
        },
        isLoading: false,
        isReady: false,
        requestPermission: mockRequestPermission,
        captureFrame: mockCaptureFrame,
        stopStream: mockStopStream,
      });

      render(<CameraView onCapture={vi.fn()} />);

      // Check for the error title (more specific to avoid multiple matches)
      expect(screen.getByText(/Accès à la caméra refusé/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument();
    });

    it('should show error message when no camera is found', () => {
      vi.mocked(useCamera).mockReturnValue({
        videoRef: { current: null },
        stream: null,
        error: {
          type: 'not-found',
          message: "Aucune caméra n'a été détectée",
        },
        isLoading: false,
        isReady: false,
        requestPermission: mockRequestPermission,
        captureFrame: mockCaptureFrame,
        stopStream: mockStopStream,
      });

      render(<CameraView onCapture={vi.fn()} />);

      // Check for the error title (more specific than just "détectée")
      expect(screen.getByText(/Aucune caméra détectée/)).toBeInTheDocument();
    });

    it('should call requestPermission when retry button is clicked', async () => {
      mockRequestPermission.mockResolvedValue(undefined);

      vi.mocked(useCamera).mockReturnValue({
        videoRef: { current: null },
        stream: null,
        error: {
          type: 'not-allowed',
          message: "L'accès à la caméra a été refusé",
        },
        isLoading: false,
        isReady: false,
        requestPermission: mockRequestPermission,
        captureFrame: mockCaptureFrame,
        stopStream: mockStopStream,
      });

      render(<CameraView onCapture={vi.fn()} />);

      const retryButton = screen.getByRole('button', { name: /réessayer/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });
    });
  });

  describe('Ready State', () => {
    it('should render video element when camera is ready', () => {
      render(<CameraView onCapture={vi.fn()} />);

      const video = screen.getByLabelText(/aperçu/i);
      expect(video).toBeInTheDocument();
      expect(video.tagName.toLowerCase()).toBe('video');
    });

    it('should render guide frame', () => {
      render(<CameraView onCapture={vi.fn()} />);

      expect(screen.getByText(/placez le ticket/i)).toBeInTheDocument();
    });

    it('should render capture button', () => {
      render(<CameraView onCapture={vi.fn()} />);

      expect(screen.getByRole('button', { name: /capturer/i })).toBeInTheDocument();
    });
  });

  describe('Capture Flow', () => {
    it('should call onCapture with blob when capture button is clicked', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/webp' });
      mockCaptureFrame.mockResolvedValue(mockBlob);
      const onCapture = vi.fn();

      render(<CameraView onCapture={onCapture} />);

      const captureButton = screen.getByRole('button', { name: /capturer/i });
      fireEvent.click(captureButton);

      await waitFor(() => {
        expect(mockCaptureFrame).toHaveBeenCalled();
        expect(onCapture).toHaveBeenCalledWith(mockBlob);
      });
    });

    it('should not call onCapture when captureFrame returns null', async () => {
      mockCaptureFrame.mockResolvedValue(null);
      const onCapture = vi.fn();

      render(<CameraView onCapture={onCapture} />);

      const captureButton = screen.getByRole('button', { name: /capturer/i });
      fireEvent.click(captureButton);

      await waitFor(() => {
        expect(mockCaptureFrame).toHaveBeenCalled();
      });

      expect(onCapture).not.toHaveBeenCalled();
    });

    it('should disable capture button while processing', async () => {
      const onCapture = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      mockCaptureFrame.mockResolvedValue(new Blob(['test']));

      render(<CameraView onCapture={onCapture} />);

      const captureButton = screen.getByRole('button', { name: /capturer/i });
      fireEvent.click(captureButton);

      // Button should show capturing state
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /capture en cours/i })
        ).toBeDisabled();
      });
    });

    it('should disable capture button when isProcessing is true', () => {
      render(<CameraView onCapture={vi.fn()} isProcessing={true} />);

      const captureButton = screen.getByRole('button', { name: /capturer/i });
      expect(captureButton).toBeDisabled();
    });
  });

  describe('Processing State', () => {
    it('should show processing overlay when isProcessing is true', () => {
      render(<CameraView onCapture={vi.fn()} isProcessing={true} />);

      expect(screen.getByText(/traitement en cours/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible video element', () => {
      render(<CameraView onCapture={vi.fn()} />);

      const video = screen.getByLabelText(/aperçu/i);
      expect(video).toHaveAttribute('aria-label');
    });

    it('should have accessible capture button', () => {
      render(<CameraView onCapture={vi.fn()} />);

      const button = screen.getByRole('button', { name: /capturer/i });
      expect(button).toBeInTheDocument();
    });
  });
});
