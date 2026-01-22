/**
 * TicketPhoto component tests
 * Story 4.2: Ticket Detail View
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketPhoto, TicketPhotoSkeleton } from './TicketPhoto';

// Mock usePhoto
const mockUsePhoto = vi.fn();
vi.mock('@/hooks/usePhoto', () => ({
  usePhoto: (ticketId: number) => mockUsePhoto(ticketId),
}));

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

describe('TicketPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows skeleton while loading', () => {
    mockUsePhoto.mockReturnValue({ photo: undefined, isLoading: true });

    render(<TicketPhoto ticketId={1} />);

    expect(screen.getByTestId('photo-skeleton')).toBeInTheDocument();
  });

  it('shows placeholder when no photo available', () => {
    mockUsePhoto.mockReturnValue({ photo: undefined, isLoading: false });

    render(<TicketPhoto ticketId={1} />);

    expect(screen.getByTestId('photo-placeholder')).toBeInTheDocument();
    expect(screen.getByText('Photo non disponible')).toBeInTheDocument();
  });

  it('displays photo when available', () => {
    const mockBlob = new Blob(['test'], { type: 'image/webp' });
    mockUsePhoto.mockReturnValue({
      photo: { id: 1, ticketId: 1, blob: mockBlob, thumbnail: mockBlob, createdAt: '' },
      isLoading: false,
    });

    render(<TicketPhoto ticketId={1} />);

    expect(screen.getByTestId('ticket-photo')).toBeInTheDocument();
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('opens modal when photo is clicked', () => {
    const mockBlob = new Blob(['test'], { type: 'image/webp' });
    mockUsePhoto.mockReturnValue({
      photo: { id: 1, ticketId: 1, blob: mockBlob, thumbnail: mockBlob, createdAt: '' },
      isLoading: false,
    });

    render(<TicketPhoto ticketId={1} />);

    fireEvent.click(screen.getByTestId('photo-button'));

    expect(screen.getByTestId('photo-modal')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    const mockBlob = new Blob(['test'], { type: 'image/webp' });
    mockUsePhoto.mockReturnValue({
      photo: { id: 1, ticketId: 1, blob: mockBlob, thumbnail: mockBlob, createdAt: '' },
      isLoading: false,
    });

    render(<TicketPhoto ticketId={1} />);

    // Open modal
    fireEvent.click(screen.getByTestId('photo-button'));
    expect(screen.getByTestId('photo-modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('photo-modal')).not.toBeInTheDocument();
  });

  it('closes modal when Escape key is pressed', () => {
    const mockBlob = new Blob(['test'], { type: 'image/webp' });
    mockUsePhoto.mockReturnValue({
      photo: { id: 1, ticketId: 1, blob: mockBlob, thumbnail: mockBlob, createdAt: '' },
      isLoading: false,
    });

    render(<TicketPhoto ticketId={1} />);

    // Open modal
    fireEvent.click(screen.getByTestId('photo-button'));
    expect(screen.getByTestId('photo-modal')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('photo-modal')).not.toBeInTheDocument();
  });
});

describe('TicketPhotoSkeleton', () => {
  it('renders skeleton with correct aspect ratio', () => {
    render(<TicketPhotoSkeleton />);

    const skeleton = screen.getByTestId('photo-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('aspect-[4/3]');
  });
});
