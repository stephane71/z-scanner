/**
 * Tests for useGenerateExport hook
 * Story 5.2: CSV Export Generation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGenerateExport } from "./useGenerateExport";

// Mock useExportTickets hook
vi.mock("./useExportTickets", () => ({
  useExportTickets: vi.fn(),
}));

// Mock CSV generation utility
vi.mock("@/lib/utils/csv", () => ({
  generateCsv: vi.fn(),
}));

import { useExportTickets } from "./useExportTickets";
import { generateCsv } from "@/lib/utils/csv";
import type { ExportTicket } from "@/types";

const mockUseExportTickets = useExportTickets as ReturnType<typeof vi.fn>;
const mockGenerateCsv = generateCsv as ReturnType<typeof vi.fn>;

describe("useGenerateExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when no tickets", () => {
    mockUseExportTickets.mockReturnValue({
      tickets: [],
      isLoading: false,
    });

    const { result } = renderHook(() =>
      useGenerateExport("user-123", "2026-01-01", "2026-01-31")
    );

    const csvResult = result.current.generateCsv();
    expect(csvResult).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should return CSV string when tickets exist", () => {
    const mockTickets: ExportTicket[] = [
      {
        date: "2026-01-15",
        montantTtc: 1250,
        modeReglement: "CB",
        numeroTicket: 1234,
        marche: "Marché",
        statut: "Validé",
        hash: "abc123",
        validatedAt: "2026-01-15T14:30:00.000Z",
      },
    ];

    mockUseExportTickets.mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
    });

    const expectedCsv = "mock-csv-content";
    mockGenerateCsv.mockReturnValue(expectedCsv);

    const { result } = renderHook(() =>
      useGenerateExport("user-123", "2026-01-01", "2026-01-31")
    );

    const csvResult = result.current.generateCsv();
    expect(csvResult).toBe(expectedCsv);
    expect(mockGenerateCsv).toHaveBeenCalledWith(mockTickets);
  });

  it("should show loading state while tickets are loading", () => {
    mockUseExportTickets.mockReturnValue({
      tickets: [],
      isLoading: true,
    });

    const { result } = renderHook(() =>
      useGenerateExport("user-123", "2026-01-01", "2026-01-31")
    );

    expect(result.current.isGenerating).toBe(true);
  });

  it("should not show loading state when tickets are loaded", () => {
    mockUseExportTickets.mockReturnValue({
      tickets: [],
      isLoading: false,
    });

    const { result } = renderHook(() =>
      useGenerateExport("user-123", "2026-01-01", "2026-01-31")
    );

    expect(result.current.isGenerating).toBe(false);
  });

  it("should handle errors gracefully", () => {
    mockUseExportTickets.mockReturnValue({
      tickets: [
        {
          date: "2026-01-15",
          montantTtc: 1250,
          modeReglement: "CB",
          numeroTicket: 1234,
          marche: "Marché",
          statut: "Validé",
          hash: "abc123",
          validatedAt: "2026-01-15T14:30:00.000Z",
        },
      ],
      isLoading: false,
    });

    mockGenerateCsv.mockImplementation(() => {
      throw new Error("CSV generation failed");
    });

    const { result } = renderHook(() =>
      useGenerateExport("user-123", "2026-01-01", "2026-01-31")
    );

    let csvResult: string | null = null;
    act(() => {
      csvResult = result.current.generateCsv();
    });
    expect(csvResult).toBeNull();
    expect(result.current.error).toBe("CSV generation failed");
  });

  it("should pass correct parameters to useExportTickets", () => {
    mockUseExportTickets.mockReturnValue({
      tickets: [],
      isLoading: false,
    });

    renderHook(() =>
      useGenerateExport("user-123", "2026-01-01", "2026-01-31")
    );

    expect(mockUseExportTickets).toHaveBeenCalledWith(
      "user-123",
      "2026-01-01",
      "2026-01-31"
    );
  });

  it("should reset error on subsequent successful generation", () => {
    const mockTickets: ExportTicket[] = [
      {
        date: "2026-01-15",
        montantTtc: 1250,
        modeReglement: "CB",
        numeroTicket: 1234,
        marche: "Marché",
        statut: "Validé",
        hash: "abc123",
        validatedAt: "2026-01-15T14:30:00.000Z",
      },
    ];

    mockUseExportTickets.mockReturnValue({
      tickets: mockTickets,
      isLoading: false,
    });

    // First call throws
    mockGenerateCsv.mockImplementationOnce(() => {
      throw new Error("First error");
    });

    const { result, rerender } = renderHook(() =>
      useGenerateExport("user-123", "2026-01-01", "2026-01-31")
    );

    // First call - error
    act(() => {
      result.current.generateCsv();
    });
    expect(result.current.error).toBe("First error");

    // Second call - success
    mockGenerateCsv.mockReturnValue("csv-content");
    rerender();

    let csvResult: string | null = null;
    act(() => {
      csvResult = result.current.generateCsv();
    });

    expect(csvResult).toBe("csv-content");
    expect(result.current.error).toBeNull();
  });
});
