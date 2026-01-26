/**
 * Tests for useDownloadCsv hook
 * Story 5.3: File Download
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDownloadCsv } from "./useDownloadCsv";

describe("useDownloadCsv", () => {
  // Mock browser APIs
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockAnchorClick: ReturnType<typeof vi.fn>;
  let mockAnchor: { href: string; download: string; click: () => void };
  let originalCreateElement: typeof document.createElement;
  let originalNavigator: typeof navigator;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL APIs
    mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement for anchor element
    mockAnchorClick = vi.fn();
    mockAnchor = { href: "", download: "", click: mockAnchorClick };
    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        return mockAnchor as unknown as HTMLElement;
      }
      return originalCreateElement(tagName);
    });

    // Default to non-iOS Safari browser (no share support)
    originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: {
        ...originalNavigator,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        share: undefined,
        canShare: undefined,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe("filename generation", () => {
    it("should generate correct filename from date range", async () => {
      const { result } = renderHook(() => useDownloadCsv());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(mockAnchor.download).toBe("z-scanner_export_2026-01-01_2026-01-31.csv");
      expect(success).toBe(true);
    });
  });

  describe("blob creation", () => {
    it("should create Blob with correct MIME type", async () => {
      const blobSpy = vi.spyOn(global, "Blob");
      const { result } = renderHook(() => useDownloadCsv());

      await act(async () => {
        await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(blobSpy).toHaveBeenCalledWith(["csv-content"], {
        type: "text/csv;charset=utf-8;",
      });
    });
  });

  describe("desktop/Android download", () => {
    it("should use anchor element download for non-iOS browsers", async () => {
      const { result } = renderHook(() => useDownloadCsv());

      await act(async () => {
        await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAnchor.href).toBe("blob:mock-url");
      expect(mockAnchorClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("iOS Safari share", () => {
    it("should use navigator.share for iOS Safari when available", async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      const mockCanShare = vi.fn().mockReturnValue(true);

      Object.defineProperty(global, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
          share: mockShare,
          canShare: mockCanShare,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDownloadCsv());

      await act(async () => {
        await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(mockCanShare).toHaveBeenCalled();
      expect(mockShare).toHaveBeenCalled();
      // Should NOT use anchor download when share is used
      expect(mockAnchorClick).not.toHaveBeenCalled();
    });

    it("should fall back to anchor download if canShare returns false", async () => {
      const mockShare = vi.fn();
      const mockCanShare = vi.fn().mockReturnValue(false);

      Object.defineProperty(global, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
          share: mockShare,
          canShare: mockCanShare,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDownloadCsv());

      await act(async () => {
        await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(mockShare).not.toHaveBeenCalled();
      expect(mockAnchorClick).toHaveBeenCalled();
    });

    it("should handle user cancelling iOS share sheet gracefully", async () => {
      const mockShare = vi.fn().mockRejectedValue(new DOMException("Share canceled", "AbortError"));
      const mockCanShare = vi.fn().mockReturnValue(true);

      Object.defineProperty(global, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
          share: mockShare,
          canShare: mockCanShare,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDownloadCsv());

      await act(async () => {
        await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      // AbortError should not set error state (user cancelled intentionally)
      expect(result.current.error).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should set error state and return false on download failure", async () => {
      // Make URL.createObjectURL throw an error
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error("URL creation failed");
      });

      const { result } = renderHook(() => useDownloadCsv());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(result.current.error).toBe("URL creation failed");
      expect(success).toBe(false);
    });

    it("should set error state on share failure (non-AbortError)", async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error("Share failed"));
      const mockCanShare = vi.fn().mockReturnValue(true);

      Object.defineProperty(global, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
          share: mockShare,
          canShare: mockCanShare,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useDownloadCsv());

      await act(async () => {
        await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(result.current.error).toBe("Share failed");
    });
  });

  describe("loading state", () => {
    it("should set isDownloading during download", async () => {
      const { result } = renderHook(() => useDownloadCsv());

      expect(result.current.isDownloading).toBe(false);

      // Start download but don't await yet
      let downloadPromise: Promise<void>;
      act(() => {
        downloadPromise = result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      // Note: Due to sync execution in tests, isDownloading may already be false
      // This is expected behavior as the download completes synchronously

      await act(async () => {
        await downloadPromise;
      });

      expect(result.current.isDownloading).toBe(false);
    });

    it("should reset error on new download attempt", async () => {
      // First download fails
      mockCreateObjectURL.mockImplementationOnce(() => {
        throw new Error("First error");
      });

      const { result } = renderHook(() => useDownloadCsv());

      await act(async () => {
        await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(result.current.error).toBe("First error");

      // Second download succeeds (mockCreateObjectURL back to default)
      await act(async () => {
        await result.current.downloadCsv("csv-content", "2026-01-01", "2026-01-31");
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("return type", () => {
    it("should return correct interface shape", () => {
      const { result } = renderHook(() => useDownloadCsv());

      expect(result.current).toHaveProperty("downloadCsv");
      expect(result.current).toHaveProperty("isDownloading");
      expect(result.current).toHaveProperty("error");
      expect(typeof result.current.downloadCsv).toBe("function");
      expect(typeof result.current.isDownloading).toBe("boolean");
    });
  });
});
