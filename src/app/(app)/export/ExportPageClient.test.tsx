/**
 * Tests for ExportPageClient component
 * Story 5.1: Export Page & Period Selection
 * Story 5.2: CSV Export Generation
 * Story 5.3: File Download
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// Mock hooks barrel export
vi.mock('@/hooks', () => ({
  useExportPreview: vi.fn(),
  useGenerateExport: vi.fn(),
  useDownloadCsv: vi.fn(),
  useToast: vi.fn(),
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

import { useExportPreview, useGenerateExport, useDownloadCsv, useToast } from '@/hooks';
import { createClient } from '@/lib/supabase/client';

const mockUseExportPreview = useExportPreview as unknown as ReturnType<typeof vi.fn>;
const mockUseGenerateExport = useGenerateExport as unknown as ReturnType<typeof vi.fn>;
const mockUseDownloadCsv = useDownloadCsv as unknown as ReturnType<typeof vi.fn>;
const mockUseToast = useToast as unknown as ReturnType<typeof vi.fn>;
const mockCreateClient = createClient as unknown as ReturnType<typeof vi.fn>;

// Helper to flush async effects
async function flushPromises() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('ExportPageClient', () => {
  const mockGenerateCsv = vi.fn();
  const mockDownloadCsv = vi.fn();
  const mockToastSuccess = vi.fn();
  const mockToastError = vi.fn();

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
    mockUseGenerateExport.mockReturnValue({
      generateCsv: mockGenerateCsv,
      isGenerating: false,
      error: null,
    });
    mockUseDownloadCsv.mockReturnValue({
      downloadCsv: mockDownloadCsv,
      isDownloading: false,
      error: null,
    });
    mockUseToast.mockReturnValue({
      toastSuccess: mockToastSuccess,
      toastError: mockToastError,
      success: mockToastSuccess,
      error: mockToastError,
      info: vi.fn(),
      warning: vi.fn(),
    });
    mockGenerateCsv.mockReturnValue('mock-csv-content');
    mockDownloadCsv.mockResolvedValue(true);
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

    it('disables export button while generating CSV', async () => {
      mockUseGenerateExport.mockReturnValue({
        generateCsv: mockGenerateCsv,
        isGenerating: true,
        error: null,
      });

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).toBeDisabled();
      expect(screen.getByText('Génération en cours...')).toBeInTheDocument();
    });
  });

  describe('CSV generation', () => {
    it('calls generateCsv when export button is clicked', async () => {
      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(mockGenerateCsv).toHaveBeenCalled();
    });

    it('shows error message when CSV generation fails', async () => {
      mockUseGenerateExport.mockReturnValue({
        generateCsv: mockGenerateCsv,
        isGenerating: false,
        error: 'Failed to generate CSV',
      });

      render(<ExportPageClient />);

      await flushPromises();

      expect(screen.getByTestId('export-error')).toBeInTheDocument();
      expect(screen.getByText('Erreur: Failed to generate CSV')).toBeInTheDocument();
    });
  });

  describe('file download (Story 5.3)', () => {
    it('calls downloadCsv when export button is clicked and CSV is generated', async () => {
      mockGenerateCsv.mockReturnValue('csv-download-content');

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(mockDownloadCsv).toHaveBeenCalledWith(
        'csv-download-content',
        '2026-01-01',
        '2026-01-31'
      );
    });

    it('shows success toast after successful download', async () => {
      mockGenerateCsv.mockReturnValue('csv-success-content');
      mockDownloadCsv.mockResolvedValue(true);

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Export téléchargé avec succès');
    });

    it('shows error toast on download failure', async () => {
      mockGenerateCsv.mockReturnValue('csv-error-content');
      mockDownloadCsv.mockResolvedValue(false); // Download returns false on failure

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(mockToastError).toHaveBeenCalledWith('Erreur lors du téléchargement');
    });

    it('does not call downloadCsv when generateCsv returns null', async () => {
      mockGenerateCsv.mockReturnValue(null);

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(mockDownloadCsv).not.toHaveBeenCalled();
    });

    it('disables export button while downloading', async () => {
      mockUseDownloadCsv.mockReturnValue({
        downloadCsv: mockDownloadCsv,
        isDownloading: true,
        error: null,
      });

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).toBeDisabled();
    });

    it('allows repeated exports after completion', async () => {
      mockGenerateCsv.mockReturnValue('csv-repeat-content');

      render(<ExportPageClient />);

      await flushPromises();

      const exportButton = screen.getByTestId('export-button');

      // First export
      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(mockDownloadCsv).toHaveBeenCalledTimes(1);

      // Second export
      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(mockDownloadCsv).toHaveBeenCalledTimes(2);
    });
  });
});
