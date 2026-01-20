/**
 * Unit tests for PhotoThumbnail component
 * Story 3.4: Verification Screen - Task 3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PhotoThumbnail } from './PhotoThumbnail';

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  mockCreateObjectURL.mockReturnValue('blob:mock-url');
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('PhotoThumbnail', () => {
  describe('Rendering', () => {
    it('should render empty state when no blob is provided', () => {
      render(<PhotoThumbnail blob={null} />);

      expect(screen.getByLabelText('Aucune photo disponible')).toBeInTheDocument();
    });

    it('should render image when blob is provided', () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      render(<PhotoThumbnail blob={blob} alt="Test photo" />);

      const img = screen.getByAltText('Test photo');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'blob:mock-url');
    });

    it('should use default alt text', () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      render(<PhotoThumbnail blob={blob} />);

      expect(screen.getByAltText('Photo du ticket')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      const { container } = render(
        <PhotoThumbnail blob={blob} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Blob URL Management', () => {
    it('should create object URL when blob is provided', () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      render(<PhotoThumbnail blob={blob} />);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
    });

    it('should revoke object URL on unmount', () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      const { unmount } = render(<PhotoThumbnail blob={blob} />);

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should not create object URL when blob is null', () => {
      render(<PhotoThumbnail blob={null} />);

      expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      const { container } = render(<PhotoThumbnail blob={blob} />);

      // Check for spinner (animate-spin class)
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should hide loading spinner after image loads', async () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      const { container } = render(<PhotoThumbnail blob={blob} />);

      const img = screen.getByAltText('Photo du ticket');
      fireEvent.load(img);

      await waitFor(() => {
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).not.toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should show error state when image fails to load', async () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      render(<PhotoThumbnail blob={blob} />);

      const img = screen.getByAltText('Photo du ticket');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      });
    });

    it('should have alert role on error state', async () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      render(<PhotoThumbnail blob={blob} />);

      const img = screen.getByAltText('Photo du ticket');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for empty state', () => {
      render(<PhotoThumbnail blob={null} />);

      const emptyState = screen.getByRole('img');
      expect(emptyState).toHaveAttribute('aria-label', 'Aucune photo disponible');
    });

    it('should hide decorative SVGs from screen readers', () => {
      render(<PhotoThumbnail blob={null} />);

      const svg = document.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });
  });
});
