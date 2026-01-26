/**
 * Tests for useExportTickets hook
 * Story 5.2: CSV Export Generation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useExportTickets } from "./useExportTickets";

// Mock dexie-react-hooks
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    tickets: {
      where: vi.fn(),
    },
    markets: {
      get: vi.fn(),
    },
  },
}));

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

const mockUseLiveQuery = useLiveQuery as ReturnType<typeof vi.fn>;
const mockDb = db as {
  tickets: { where: ReturnType<typeof vi.fn> };
  markets: { get: ReturnType<typeof vi.fn> };
};

describe("useExportTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return loading state initially", () => {
    mockUseLiveQuery.mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useExportTickets("user-123", "2026-01-01", "2026-01-31")
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.tickets).toEqual([]);
  });

  it("should return empty array when no tickets in date range", async () => {
    mockUseLiveQuery.mockReturnValue([]);

    const { result } = renderHook(() =>
      useExportTickets("user-123", "2026-01-01", "2026-01-31")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tickets).toEqual([]);
  });

  it("should return tickets with market names resolved", async () => {
    const mockTickets = [
      {
        date: "2026-01-15",
        montantTtc: 1250,
        modeReglement: "CB",
        numeroTicket: 1234,
        marche: "Marché de Rungis",
        statut: "Validé" as const,
        hash: "abc123",
        validatedAt: "2026-01-15T14:30:00.000Z",
      },
    ];

    mockUseLiveQuery.mockReturnValue(mockTickets);

    const { result } = renderHook(() =>
      useExportTickets("user-123", "2026-01-01", "2026-01-31")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tickets).toEqual(mockTickets);
    expect(result.current.tickets[0].marche).toBe("Marché de Rungis");
  });

  it("should return empty string for tickets without market", async () => {
    const mockTickets = [
      {
        date: "2026-01-15",
        montantTtc: 1250,
        modeReglement: "CB",
        numeroTicket: 1234,
        marche: "",
        statut: "Validé" as const,
        hash: "abc123",
        validatedAt: "2026-01-15T14:30:00.000Z",
      },
    ];

    mockUseLiveQuery.mockReturnValue(mockTickets);

    const { result } = renderHook(() =>
      useExportTickets("user-123", "2026-01-01", "2026-01-31")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tickets[0].marche).toBe("");
  });

  it("should include both validated and cancelled tickets", async () => {
    const mockTickets = [
      {
        date: "2026-01-15",
        montantTtc: 1250,
        modeReglement: "CB",
        numeroTicket: 1234,
        marche: "",
        statut: "Validé" as const,
        hash: "abc123",
        validatedAt: "2026-01-15T14:30:00.000Z",
      },
      {
        date: "2026-01-16",
        montantTtc: 2500,
        modeReglement: "Espèces",
        numeroTicket: 1235,
        marche: "Marché du Dimanche",
        statut: "Annulé" as const,
        hash: "def456",
        validatedAt: "2026-01-16T09:00:00.000Z",
      },
    ];

    mockUseLiveQuery.mockReturnValue(mockTickets);

    const { result } = renderHook(() =>
      useExportTickets("user-123", "2026-01-01", "2026-01-31")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tickets).toHaveLength(2);
    expect(result.current.tickets[0].statut).toBe("Validé");
    expect(result.current.tickets[1].statut).toBe("Annulé");
  });

  it("should return empty tickets when userId is empty", async () => {
    mockUseLiveQuery.mockReturnValue([]);

    const { result } = renderHook(() =>
      useExportTickets("", "2026-01-01", "2026-01-31")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tickets).toEqual([]);
  });

  it("should call useLiveQuery with correct dependencies", () => {
    mockUseLiveQuery.mockReturnValue([]);

    renderHook(() => useExportTickets("user-123", "2026-01-01", "2026-01-31"));

    expect(mockUseLiveQuery).toHaveBeenCalledWith(
      expect.any(Function),
      ["user-123", "2026-01-01", "2026-01-31"]
    );
  });

  it("should create one line per payment mode (multiple payments)", async () => {
    // A ticket with 2 payment modes should generate 2 export lines
    const mockExportLines = [
      {
        date: "2026-01-15",
        montantTtc: 5000, // 50€ CB
        modeReglement: "CB",
        numeroTicket: 1234,
        marche: "Marché de Rungis",
        statut: "Validé" as const,
        hash: "abc123",
        validatedAt: "2026-01-15T14:30:00.000Z",
      },
      {
        date: "2026-01-15",
        montantTtc: 3000, // 30€ ESPECES (same ticket)
        modeReglement: "ESPECES",
        numeroTicket: 1234,
        marche: "Marché de Rungis",
        statut: "Validé" as const,
        hash: "abc123",
        validatedAt: "2026-01-15T14:30:00.000Z",
      },
    ];

    mockUseLiveQuery.mockReturnValue(mockExportLines);

    const { result } = renderHook(() =>
      useExportTickets("user-123", "2026-01-01", "2026-01-31")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have 2 lines for the same ticket (one per payment)
    expect(result.current.tickets).toHaveLength(2);
    expect(result.current.tickets[0].modeReglement).toBe("CB");
    expect(result.current.tickets[0].montantTtc).toBe(5000);
    expect(result.current.tickets[1].modeReglement).toBe("ESPECES");
    expect(result.current.tickets[1].montantTtc).toBe(3000);
    // Same ticket number for both lines
    expect(result.current.tickets[0].numeroTicket).toBe(1234);
    expect(result.current.tickets[1].numeroTicket).toBe(1234);
  });
});
