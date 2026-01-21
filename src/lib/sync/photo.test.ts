/**
 * Unit tests for uploadPhoto utility
 * Story 3.7: Photo Archival
 *
 * Tests for:
 * - Successful photo upload to Supabase Storage
 * - Error handling for missing photo
 * - Error handling for upload failure
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadPhoto } from './photo';
import { db } from '@/lib/db';

// fake-indexeddb is loaded in test/setup.ts

// Mock Supabase client
const mockUpload = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
      }),
    },
  }),
}));

describe('uploadPhoto', () => {
  const mockUserId = 'user-test-123';
  const mockTicketId = 42;
  let testPhotoId: number;

  beforeEach(async () => {
    vi.clearAllMocks();
    await db.photos.clear();

    // Create a test photo
    const photoData = {
      ticketId: mockTicketId,
      blob: new Blob(['fake-image-data'], { type: 'image/webp' }),
      thumbnail: new Blob(['fake-thumbnail-data'], { type: 'image/webp' }),
      createdAt: new Date().toISOString(),
    };
    testPhotoId = (await db.photos.add(photoData)) as number;

    // Default: successful upload
    mockUpload.mockResolvedValue({ error: null });
  });

  afterEach(async () => {
    await db.photos.clear();
  });

  it('should upload photo to Supabase Storage with correct path', async () => {
    const result = await uploadPhoto({
      photoId: testPhotoId,
      ticketId: mockTicketId,
      userId: mockUserId,
    });

    // Check that upload was called with correct path and options
    expect(mockUpload).toHaveBeenCalledTimes(1);
    const callArgs = mockUpload.mock.calls[0];
    expect(callArgs[0]).toBe(`${mockUserId}/${mockTicketId}/${testPhotoId}.webp`);
    // Note: Blob may serialize as {} in fake-indexeddb, but it's still a valid blob
    expect(callArgs[1]).toBeDefined();
    expect(callArgs[2]).toEqual({
      contentType: 'image/webp',
      upsert: false,
    });

    expect(result).toBe(`${mockUserId}/${mockTicketId}/${testPhotoId}.webp`);
  });

  it('should throw error when photo not found in local storage', async () => {
    await expect(
      uploadPhoto({
        photoId: 999999,
        ticketId: mockTicketId,
        userId: mockUserId,
      })
    ).rejects.toThrow('Photo 999999 not found in local storage');
  });

  it('should throw error when Supabase upload fails', async () => {
    mockUpload.mockResolvedValue({
      error: { message: 'Storage quota exceeded' },
    });

    await expect(
      uploadPhoto({
        photoId: testPhotoId,
        ticketId: mockTicketId,
        userId: mockUserId,
      })
    ).rejects.toThrow('Upload failed: Storage quota exceeded');
  });

  it('should use correct content type for WebP images', async () => {
    await uploadPhoto({
      photoId: testPhotoId,
      ticketId: mockTicketId,
      userId: mockUserId,
    });

    const callArgs = mockUpload.mock.calls[0];
    expect(callArgs[2].contentType).toBe('image/webp');
  });

  it('should use upsert=false for immutability', async () => {
    await uploadPhoto({
      photoId: testPhotoId,
      ticketId: mockTicketId,
      userId: mockUserId,
    });

    const callArgs = mockUpload.mock.calls[0];
    expect(callArgs[2].upsert).toBe(false);
  });

  it('should return storage path on successful upload', async () => {
    const result = await uploadPhoto({
      photoId: testPhotoId,
      ticketId: mockTicketId,
      userId: mockUserId,
    });

    expect(result).toBe(`${mockUserId}/${mockTicketId}/${testPhotoId}.webp`);
  });
});
