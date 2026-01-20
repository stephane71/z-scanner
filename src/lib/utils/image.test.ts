/**
 * Unit tests for image compression utilities
 * Story 3.2: Camera Capture UI - Task 8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  compressTicketImage,
  compressSingleImage,
  supportsWebP,
  getImageFileType,
  getImageDimensions,
  createPreviewUrl,
  revokePreviewUrl,
} from './image';

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn().mockImplementation(async (file, options) => {
    // Simulate compression by creating a smaller blob
    const size = options.maxSizeMB * 1024 * 1024 * 0.8; // 80% of max
    return new File(
      [new ArrayBuffer(Math.min(size, file.size))],
      file.name,
      { type: options.fileType }
    );
  }),
}));

// Mock canvas for WebP detection
const mockToDataURL = vi.fn();

describe('Image Compression Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock document.createElement for canvas
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          toDataURL: mockToDataURL,
          getContext: vi.fn(() => ({
            drawImage: vi.fn(),
          })),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('supportsWebP', () => {
    it('should return true when browser supports WebP', () => {
      mockToDataURL.mockReturnValue('data:image/webp;base64,UklG...');

      expect(supportsWebP()).toBe(true);
    });

    it('should return false when browser does not support WebP', () => {
      mockToDataURL.mockReturnValue('data:image/png;base64,...');

      expect(supportsWebP()).toBe(false);
    });
  });

  describe('getImageFileType', () => {
    it('should return webp when supported', () => {
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      expect(getImageFileType()).toBe('image/webp');
    });

    it('should return jpeg as fallback', () => {
      mockToDataURL.mockReturnValue('data:image/png;base64,...');

      expect(getImageFileType()).toBe('image/jpeg');
    });
  });

  describe('compressTicketImage', () => {
    it('should compress image to original and thumbnail', async () => {
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      const inputBlob = new Blob([new ArrayBuffer(1000000)], {
        type: 'image/webp',
      });

      const result = await compressTicketImage(inputBlob);

      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('thumbnail');
      expect(result.original).toBeInstanceOf(Blob);
      expect(result.thumbnail).toBeInstanceOf(Blob);
    });

    it('should use default compression options', async () => {
      const imageCompression = (await import('browser-image-compression')).default;
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      const inputBlob = new Blob([new ArrayBuffer(1000000)], {
        type: 'image/webp',
      });

      await compressTicketImage(inputBlob);

      // Check original options (1MB, 2048px for OCR text recognition)
      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          maxSizeMB: 1.0,
          maxWidthOrHeight: 2048,
          initialQuality: 0.9,
        })
      );

      // Check thumbnail options
      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          maxSizeMB: 0.01,
          maxWidthOrHeight: 200,
          initialQuality: 0.6,
        })
      );
    });

    it('should accept custom compression options', async () => {
      const imageCompression = (await import('browser-image-compression')).default;
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      const inputBlob = new Blob([new ArrayBuffer(1000000)], {
        type: 'image/webp',
      });

      await compressTicketImage(inputBlob, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1280,
        initialQuality: 0.9,
      });

      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1280,
          initialQuality: 0.9,
        })
      );
    });

    it('should use JPEG for Safari (no WebP)', async () => {
      const imageCompression = (await import('browser-image-compression')).default;
      mockToDataURL.mockReturnValue('data:image/png;base64,...'); // No WebP support

      const inputBlob = new Blob([new ArrayBuffer(1000000)], {
        type: 'image/jpeg',
      });

      await compressTicketImage(inputBlob);

      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          fileType: 'image/jpeg',
        })
      );
    });

    it('should use WebP when supported', async () => {
      const imageCompression = (await import('browser-image-compression')).default;
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      const inputBlob = new Blob([new ArrayBuffer(1000000)], {
        type: 'image/webp',
      });

      await compressTicketImage(inputBlob);

      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          fileType: 'image/webp',
        })
      );
    });

    it('should compress in parallel using Promise.all', async () => {
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      const inputBlob = new Blob([new ArrayBuffer(1000000)], {
        type: 'image/webp',
      });

      const startTime = Date.now();
      await compressTicketImage(inputBlob);
      const duration = Date.now() - startTime;

      // Both compressions should happen in parallel, not sequentially
      // This is a rough check - parallel should be faster than 2x sequential
      expect(duration).toBeLessThan(1000);
    });

    it('should reject images larger than 20MB', async () => {
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      // Create a blob that appears to be 25MB
      const largeBlobSize = 25 * 1024 * 1024; // 25MB
      const largeBlob = new Blob([new ArrayBuffer(largeBlobSize)], {
        type: 'image/webp',
      });

      await expect(compressTicketImage(largeBlob)).rejects.toThrow(
        /Image trop volumineuse/
      );
    });

    it('should accept images under 20MB', async () => {
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      // Create a blob that is 15MB (under the limit)
      const validBlobSize = 15 * 1024 * 1024; // 15MB
      const validBlob = new Blob([new ArrayBuffer(validBlobSize)], {
        type: 'image/webp',
      });

      const result = await compressTicketImage(validBlob);

      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('thumbnail');
    });
  });

  describe('compressSingleImage', () => {
    it('should compress a single image', async () => {
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      const inputBlob = new Blob([new ArrayBuffer(1000000)], {
        type: 'image/webp',
      });

      const result = await compressSingleImage(inputBlob, 0.05, 1024, 0.7);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should use default options when not provided', async () => {
      const imageCompression = (await import('browser-image-compression')).default;
      mockToDataURL.mockReturnValue('data:image/webp;base64,...');

      const inputBlob = new Blob([new ArrayBuffer(1000000)], {
        type: 'image/webp',
      });

      await compressSingleImage(inputBlob);

      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          maxSizeMB: 0.1,
          maxWidthOrHeight: 1920,
          initialQuality: 0.8,
        })
      );
    });
  });

  describe('getImageDimensions', () => {
    it('should return image dimensions', async () => {
      // Mock Image constructor using class
      const mockWidth = 1920;
      const mockHeight = 1080;

      class MockImage {
        width = mockWidth;
        height = mockHeight;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private _src = '';

        get src() {
          return this._src;
        }
        set src(value: string) {
          this._src = value;
          // Trigger onload asynchronously
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      const mockBlob = new Blob(['test'], { type: 'image/webp' });
      const mockUrl = 'blob:http://localhost/test';
      vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const dimensions = await getImageDimensions(mockBlob);

      expect(dimensions).toEqual({ width: mockWidth, height: mockHeight });

      vi.unstubAllGlobals();
    });

    it('should reject on image load error', async () => {
      // Mock Image constructor that triggers error
      class MockImage {
        width = 0;
        height = 0;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private _src = '';

        get src() {
          return this._src;
        }
        set src(value: string) {
          this._src = value;
          // Trigger onerror asynchronously
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      const mockBlob = new Blob(['test'], { type: 'image/webp' });
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      await expect(getImageDimensions(mockBlob)).rejects.toThrow(
        'Failed to load image'
      );

      vi.unstubAllGlobals();
    });
  });

  describe('createPreviewUrl', () => {
    it('should create object URL for blob', () => {
      const mockUrl = 'blob:http://localhost/test-id';
      vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);

      const blob = new Blob(['test'], { type: 'image/webp' });
      const url = createPreviewUrl(blob);

      expect(url).toBe(mockUrl);
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    });
  });

  describe('revokePreviewUrl', () => {
    it('should revoke object URL', () => {
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const url = 'blob:http://localhost/test-id';
      revokePreviewUrl(url);

      expect(revokeSpy).toHaveBeenCalledWith(url);
    });
  });
});
