/**
 * useCancelTicket hook tests
 * Story 4.7: Ticket Cancellation (NF525 Compliant)
 *
 * Tests for the hook that handles NF525-compliant ticket cancellation
 * including local Dexie update and sync queue entry.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCancelTicket } from "./useCancelTicket";

// Mock the ticket and sync queue operations
const mockCancelTicket = vi.fn();
const mockQueueCancel = vi.fn();

vi.mock("@/hooks/useTickets", () => ({
  cancelTicket: (...args: unknown[]) => mockCancelTicket(...args),
}));

vi.mock("@/hooks/useSyncQueue", () => ({
  queueCancel: (...args: unknown[]) => mockQueueCancel(...args),
}));

describe("useCancelTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCancelTicket.mockResolvedValue(undefined);
    mockQueueCancel.mockResolvedValue(1);
  });

  describe("Initial State", () => {
    it("returns cancelTicket function, isLoading false, and error null", () => {
      const { result } = renderHook(() => useCancelTicket());

      expect(result.current.cancelTicket).toBeInstanceOf(Function);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Successful Cancellation (AC #3, #6)", () => {
    it("calls cancelTicket to update Dexie and queueCancel for sync", async () => {
      const { result } = renderHook(() => useCancelTicket());

      await act(async () => {
        await result.current.cancelTicket(123, "Erreur de saisie");
      });

      // Should call cancelTicket with id, reason, and timestamp
      expect(mockCancelTicket).toHaveBeenCalledWith(
        123,
        "Erreur de saisie",
        expect.any(String), // ISO 8601 timestamp
      );
      expect(mockQueueCancel).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          action: "cancel",
          cancellationReason: "Erreur de saisie",
        }),
      );
    });

    it("includes cancelledAt timestamp in sync queue payload", async () => {
      const { result } = renderHook(() => useCancelTicket());

      await act(async () => {
        await result.current.cancelTicket(123, "Erreur");
      });

      expect(mockQueueCancel).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          cancelledAt: expect.any(String),
        }),
      );

      // Verify it's a valid ISO 8601 timestamp
      const payload = mockQueueCancel.mock.calls[0][1];
      expect(new Date(payload.cancelledAt).toISOString()).toBe(
        payload.cancelledAt,
      );
    });

    it("sets isLoading to true during cancellation", async () => {
      const { result } = renderHook(() => useCancelTicket());

      // Start cancellation without awaiting
      let resolvePromise: () => void;
      mockCancelTicket.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolvePromise = resolve;
          }),
      );

      act(() => {
        result.current.cancelTicket(123, "Erreur");
      });

      // Check loading state
      expect(result.current.isLoading).toBe(true);

      // Complete the operation
      await act(async () => {
        resolvePromise!();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Validation", () => {
    it("throws error when reason is empty", async () => {
      const { result } = renderHook(() => useCancelTicket());

      await act(async () => {
        await result.current.cancelTicket(123, "");
      });

      expect(result.current.error).toBe("Cancellation reason is required");
      expect(mockCancelTicket).not.toHaveBeenCalled();
      expect(mockQueueCancel).not.toHaveBeenCalled();
    });

    it("throws error when reason is only whitespace", async () => {
      const { result } = renderHook(() => useCancelTicket());

      await act(async () => {
        await result.current.cancelTicket(123, "   ");
      });

      expect(result.current.error).toBe("Cancellation reason is required");
      expect(mockCancelTicket).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("sets error state when cancelTicket fails", async () => {
      mockCancelTicket.mockRejectedValue(new Error("Ticket not found"));
      const { result } = renderHook(() => useCancelTicket());

      await act(async () => {
        await result.current.cancelTicket(123, "Erreur");
      });

      expect(result.current.error).toBe("Ticket not found");
      expect(result.current.isLoading).toBe(false);
    });

    it("sets error state when queueCancel fails but keeps local cancellation", async () => {
      mockQueueCancel.mockRejectedValue(new Error("Queue error"));
      const { result } = renderHook(() => useCancelTicket());

      await act(async () => {
        await result.current.cancelTicket(123, "Erreur");
      });

      // Local cancellation should have been called
      expect(mockCancelTicket).toHaveBeenCalled();
      // But error should be set for sync failure
      expect(result.current.error).toBe("Queue error");
    });

    it("clears error on next successful cancellation", async () => {
      mockCancelTicket.mockRejectedValueOnce(new Error("First error"));
      const { result } = renderHook(() => useCancelTicket());

      // First call fails
      await act(async () => {
        await result.current.cancelTicket(123, "Erreur");
      });
      expect(result.current.error).toBe("First error");

      // Reset mock for success
      mockCancelTicket.mockResolvedValue(undefined);

      // Second call succeeds
      await act(async () => {
        await result.current.cancelTicket(456, "Autre raison");
      });
      expect(result.current.error).toBeNull();
    });
  });
});
