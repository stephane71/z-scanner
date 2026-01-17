/**
 * Unit tests for useCamera hook
 * Story 3.2: Camera Capture UI
 *
 * Tests cover:
 * - Permission request on mount
 * - Error handling for all camera error types
 * - Stream cleanup on unmount
 * - Device change handling
 * - Frame capture functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCamera } from './useCamera';

// Mock MediaStream and tracks
const createMockTrack = (state: MediaStreamTrackState = 'live') => ({
  stop: vi.fn(),
  readyState: state,
  kind: 'video' as const,
  enabled: true,
  id: 'mock-track-id',
  label: 'Mock Camera',
  muted: false,
});

const createMockStream = (trackState: MediaStreamTrackState = 'live') => {
  const mockTrack = createMockTrack(trackState);
  return {
    getTracks: vi.fn(() => [mockTrack]),
    getVideoTracks: vi.fn(() => [mockTrack]),
    getAudioTracks: vi.fn(() => []),
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
    active: true,
    id: 'mock-stream-id',
  } as unknown as MediaStream;
};

// Mock MediaDevices
const mockGetUserMedia = vi.fn();
const mockEnumerateDevices = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Store event handlers for testing
let deviceChangeHandler: (() => void) | null = null;

describe('useCamera', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    deviceChangeHandler = null;

    // Setup event listener capture
    mockAddEventListener.mockImplementation((event: string, handler: () => void) => {
      if (event === 'devicechange') {
        deviceChangeHandler = handler;
      }
    });

    // Mock navigator.mediaDevices
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: mockGetUserMedia,
        enumerateDevices: mockEnumerateDevices,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      },
      vibrate: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Permission Request', () => {
    it('should request camera permission on mount', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useCamera());

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have called getUserMedia with correct constraints
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            facingMode: { ideal: 'environment' },
          }),
          audio: false,
        })
      );
    });

    it('should set stream when permission is granted', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stream).toBe(mockStream);
      expect(result.current.error).toBeNull();
    });

    it('should allow retry via requestPermission', async () => {
      // First call fails
      const error = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.error?.type).toBe('not-allowed');
      });

      // Now mock success for retry
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.stream).toBe(mockStream);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle NotAllowedError', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.error?.type).toBe('not-allowed');
      });

      expect(result.current.error?.message).toContain('refusé');
      expect(result.current.stream).toBeNull();
    });

    it('should handle NotFoundError', async () => {
      const error = new DOMException('No camera found', 'NotFoundError');
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.error?.type).toBe('not-found');
      });

      expect(result.current.error?.message).toContain('détectée');
    });

    it('should handle NotReadableError', async () => {
      const error = new DOMException('Camera in use', 'NotReadableError');
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.error?.type).toBe('not-readable');
      });

      expect(result.current.error?.message).toContain('utilisée');
    });

    it('should handle OverconstrainedError', async () => {
      const error = new DOMException('Constraints not satisfied', 'OverconstrainedError');
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.error?.type).toBe('overconstrained');
      });
    });

    it('should handle SecurityError', async () => {
      const error = new DOMException('Security error', 'SecurityError');
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.error?.type).toBe('security');
      });

      expect(result.current.error?.message).toContain('HTTPS');
    });

    it('should handle unknown errors', async () => {
      const error = new DOMException('Unknown error', 'UnknownError');
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.error?.type).toBe('unknown');
      });
    });

    it('should handle missing MediaDevices API', async () => {
      // Remove mediaDevices
      vi.stubGlobal('navigator', {});

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.error?.type).toBe('security');
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Stream Cleanup', () => {
    it('should stop all tracks on unmount', async () => {
      const mockTrack = createMockTrack();
      const mockStream = {
        getTracks: vi.fn(() => [mockTrack]),
        getVideoTracks: vi.fn(() => [mockTrack]),
        getAudioTracks: vi.fn(() => []),
        active: true,
        id: 'mock-stream-id',
      } as unknown as MediaStream;
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { result, unmount } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
      });

      unmount();

      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('should stop stream when stopStream is called', async () => {
      const mockTrack = createMockTrack();
      const mockStream = {
        getTracks: vi.fn(() => [mockTrack]),
        getVideoTracks: vi.fn(() => [mockTrack]),
        getAudioTracks: vi.fn(() => []),
        active: true,
        id: 'mock-stream-id',
      } as unknown as MediaStream;
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
      });

      act(() => {
        result.current.stopStream();
      });

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(result.current.stream).toBeNull();
      expect(result.current.isReady).toBe(false);
    });
  });

  describe('Device Change Handling', () => {
    it('should add devicechange event listener', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      renderHook(() => useCamera());

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalledWith(
          'devicechange',
          expect.any(Function)
        );
      });
    });

    it('should remove devicechange event listener on unmount', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { unmount } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'devicechange',
        expect.any(Function)
      );
    });

    it('should request permission again when device is disconnected', async () => {
      // First stream with ended track
      const mockStreamEnded = createMockStream('ended');
      mockGetUserMedia.mockResolvedValueOnce(mockStreamEnded);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      // Prepare for reconnection
      const mockStreamNew = createMockStream('live');
      mockGetUserMedia.mockResolvedValueOnce(mockStreamNew);

      // Trigger device change
      await act(async () => {
        if (deviceChangeHandler) {
          deviceChangeHandler();
        }
      });

      // Should have called getUserMedia again
      expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
    });
  });

  describe('Frame Capture', () => {
    it('should return null when video is not ready', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // isReady will be false without actual video element
      const blob = await act(async () => {
        return result.current.captureFrame();
      });

      expect(blob).toBeNull();
    });

    it('should return null when videoRef is null', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // videoRef.current is null by default
      const blob = await result.current.captureFrame();
      expect(blob).toBeNull();
    });
  });

  describe('Loading States', () => {
    it('should start with loading state true', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useCamera());

      // Initially loading is true
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set loading to false after permission resolved', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.stream).not.toBeNull();
      });
    });

    it('should set loading to false after permission rejected', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCamera());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).not.toBeNull();
      });
    });
  });

  describe('Rear Camera Selection', () => {
    it('should prefer environment facing mode for rear camera', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      renderHook(() => useCamera());

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            video: expect.objectContaining({
              facingMode: { ideal: 'environment' },
            }),
          })
        );
      });
    });

    it('should request video with ideal dimensions', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValueOnce(mockStream);

      renderHook(() => useCamera());

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            video: expect.objectContaining({
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 },
            }),
          })
        );
      });
    });
  });
});
