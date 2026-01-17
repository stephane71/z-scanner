/**
 * Unit tests for ScanPageClient component
 * Story 3.2: Camera Capture UI - Task 8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Mock modules before importing the component
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockGetUser = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

const mockCompressTicketImage = vi.fn();
vi.mock('@/lib/utils/image', () => ({
  compressTicketImage: (blob: Blob) => mockCompressTicketImage(blob),
}));

const mockDbTicketsAdd = vi.fn();
const mockDbPhotosAdd = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      add: (data: unknown) => mockDbTicketsAdd(data),
    },
    photos: {
      add: (data: unknown) => mockDbPhotosAdd(data),
    },
  },
}));

// Mock CameraView to capture onCapture callback
const mockOnCapture = vi.fn();
vi.mock('@/components/features/scanner', () => ({
  CameraView: ({ onCapture, isProcessing }: { onCapture: (blob: Blob) => void; isProcessing?: boolean }) => {
    // Store the onCapture callback so tests can trigger it
    mockOnCapture.mockImplementation(onCapture);
    return (
      <div data-testid="camera-view" data-processing={isProcessing}>
        <button
          onClick={() => onCapture(new Blob(['test'], { type: 'image/webp' }))}
          data-testid="capture-button"
        >
          Capture
        </button>
      </div>
    );
  },
}));

import { ScanPageClient } from './ScanPageClient';

describe('ScanPageClient', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Default mock implementations
    mockGetUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
    });

    mockCompressTicketImage.mockResolvedValue({
      original: new Blob(['original'], { type: 'image/webp' }),
      thumbnail: new Blob(['thumbnail'], { type: 'image/webp' }),
    });

    mockDbTicketsAdd.mockResolvedValue(42); // ticket ID
    mockDbPhotosAdd.mockResolvedValue(1); // photo ID
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('Initialization', () => {
    it('should render CameraView component', async () => {
      render(<ScanPageClient />);

      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });

    it('should fetch current user on mount', async () => {
      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });
    });
  });

  describe('Capture Flow', () => {
    it('should compress image after capture', async () => {
      render(<ScanPageClient />);

      // Wait for user to be fetched
      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      // Trigger capture
      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(mockCompressTicketImage).toHaveBeenCalled();
      });
    });

    it('should create draft ticket after compression', async () => {
      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(mockDbTicketsAdd).toHaveBeenCalled();
        const ticketData = mockDbTicketsAdd.mock.calls[0][0];
        expect(ticketData.status).toBe('draft');
        expect(ticketData.userId).toBe(mockUserId);
        expect(ticketData.montantTTC).toBe(0); // placeholder
      });
    });

    it('should save photo with ticket reference', async () => {
      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(mockDbPhotosAdd).toHaveBeenCalled();
        const photoData = mockDbPhotosAdd.mock.calls[0][0];
        expect(photoData.ticketId).toBe(42); // the mocked ticket ID
        expect(photoData.blob).toBeInstanceOf(Blob);
        expect(photoData.thumbnail).toBeInstanceOf(Blob);
      });
    });

    it('should navigate to verification screen after save', async () => {
      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/scan/verify/42');
      });
    });

    it('should set isProcessing to true during capture', async () => {
      // Make compression slow to observe processing state
      mockCompressTicketImage.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('capture-button'));

      // Check processing state is passed to CameraView
      await waitFor(() => {
        const cameraView = screen.getByTestId('camera-view');
        expect(cameraView).toHaveAttribute('data-processing', 'true');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      // Trigger capture without authenticated user
      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/non authentifié/i)).toBeInTheDocument();
      });
    });

    it('should show error when compression fails', async () => {
      mockCompressTicketImage.mockRejectedValue(new Error('Compression failed'));

      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Compression failed/)).toBeInTheDocument();
      });
    });

    it('should show error when database save fails', async () => {
      mockDbTicketsAdd.mockRejectedValue(new Error('Database error'));

      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Database error/)).toBeInTheDocument();
      });
    });

    it('should allow dismissing error', async () => {
      mockCompressTicketImage.mockRejectedValue(new Error('Test error'));

      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Click the close button
      const closeButton = screen.getByLabelText(/fermer/i);
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Hash Generation', () => {
    it('should include dataHash in ticket data', async () => {
      render(<ScanPageClient />);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('capture-button'));

      await waitFor(() => {
        expect(mockDbTicketsAdd).toHaveBeenCalled();
        const ticketData = mockDbTicketsAdd.mock.calls[0][0];
        expect(ticketData.dataHash).toBeDefined();
        expect(typeof ticketData.dataHash).toBe('string');
        // Hash should be a 64-character hex string (SHA-256)
        expect(ticketData.dataHash).toMatch(/^[0-9a-f]{64}$/);
      });
    });
  });
});
