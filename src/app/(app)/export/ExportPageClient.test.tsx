/**
 * Tests for ExportPageClient component
 * Story 5.1: Export Page & Period Selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ExportPageClient } from './ExportPageClient';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      }),
    },
  })),
}));

// Mock useExportPreview hook
vi.mock('@/hooks/useExportPreview', () => ({
  useExportPreview: vi.fn(),
}));

// Mock date-ranges to get consistent values
vi.mock('@/lib/utils/date-ranges', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/utils/date-ranges')>();
  return {
    ...original,
    getThisMonth: vi.fn(() => ({
      start: '2026-01-01',
      end: '2026-01-31',
    })),
    getLastMonth: vi.fn(() => ({
      start: '2025-12-01',
      end: '2025-12-31',
    })),
  };
});

import { useExportPreview } from '@/hooks/useExportPreview';
import { createClient } from '@/lib/supabase/client';

const mockUseExportPreview = useExportPreview as unknown as ReturnType<typeof vi.fn>;
const mockCreateClient = createClient as unknown as ReturnType<typeof vi.fn>;

// Helper to flush async effects
async function flushPromises() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('ExportPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: user authenticated, 15 tickets
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
    });
    mockUseExportPreview.mockReturnValue({
      ticketCount: 15,
      totalAmount: 123450,
      isLoading: false,
    });
  });

  describe('loading state', () => {
    it('shows loading skeleton initially', () => {
      // Simulate pending auth - never resolves
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: vi.fn(() => new Promise(() => {})),
        },
      });

      render(<ExportPageClient />);

      expect(screen.getByTestId('export-page-loading')).toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    it('renders period selector after auth', async () => {
      render(<ExportPageClient />);

      await flushPromises();

      expect(screen.getByTestId('export-page-content')).toBeInTheDocument();
      expect(screen.getByTestId('preset-this-month')).toBeInTheDocument();
    });

    it('defaults to "Ce mois" preset', async () => {
      render(<ExportPageClient />);

      await flushPromises();

      const thisMonthButton = screen.getByTestId('preset-this-month');
      expect(thisMonthButton).toHaveClass('bg-primary');
    });

    it('renders export preview card', async () => {
      render(<ExportPageClient />);

      await flushPromises();

      expect(screen.getByTestId('export-preview-card')).toBeInTheDocument();
      expect(screen.getByText('15 tickets')).toBeInTheDocument();
    });

    it('renders export button', async () => {
      render(<ExportPageClient />);

      await flushPromises();

      expect(screen.getByTestId('export-button')).toBeInTheDocument();
      expect(screen.getByText('Exporter en CSV')).toBeInTheDocument();
    });
  });

  describe('preset selection', () => {
    it('updates date range when preset is selected', async () => {
      render(<ExportPageClient />);

      await flushPromises();

      // Click "Mois dernier" preset
      fireEvent.click(screen.getByTestId('preset-last-month'));

      // The preset button should now be highlighted
      const lastMonthButton = screen.getByTestId('preset-last-month');
      expect(lastMonthButton).toHaveClass('bg-primary');

      // "Ce mois" should no longer be highlighted
      const thisMonthButton = screen.getByTestId('preset-this-month');
      expect(thisMonthButton).not.toHaveClass('bg-primary');
    });
  });

  describe('custom date range', () => {
    it('clears preset when custom date is entered', async () => {
      render(<ExportPageClient />);

      await flushPromises();

      // Change start date
      fireEvent.change(screen.getByTestId('custom-start-date'), {
        target: { value: '2026-01-15' },
      });

      // No preset should be highlighted (all should lose bg-primary)
      const thisMonthButton = screen.getByTestId('preset-this-month');
      expect(thisMonthButton).not.toHaveClass('bg-primary');
    });
  });

  describe('export button state', () => {
    it('enables export button when tickets exist', async () => {
      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).not.toBeDisabled();
    });

    it('disables export button when no tickets', async () => {
      mockUseExportPreview.mockReturnValue({
        ticketCount: 0,
        totalAmount: 0,
        isLoading: false,
      });

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).toBeDisabled();
    });

    it('shows helper text when no tickets', async () => {
      mockUseExportPreview.mockReturnValue({
        ticketCount: 0,
        totalAmount: 0,
        isLoading: false,
      });

      render(<ExportPageClient />);

      await flushPromises();

      expect(
        screen.getByText('Sélectionnez une période avec des tickets pour exporter')
      ).toBeInTheDocument();
    });

    it('disables export button while loading', async () => {
      mockUseExportPreview.mockReturnValue({
        ticketCount: 15,
        totalAmount: 123450,
        isLoading: true,
      });

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).toBeDisabled();
    });
  });
});
