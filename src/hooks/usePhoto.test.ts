/**
 * Unit tests for usePhoto hook
 * Story 3.7: Photo Archival
 *
 * Tests for:
 * - Fetching photo by ticketId
 * - Reactive updates with useLiveQuery
 * - Handling missing photo gracefully
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePhoto } from './usePhoto';
import { db } from '@/lib/db';

// fake-indexeddb is loaded in test/setup.ts

describe('usePhoto', () => {
  const mockTicketId = 42;
  let testPhotoId: number;

  beforeEach(async () => {
    await db.photos.clear();

    // Create a test photo
    const photoData = {
      ticketId: mockTicketId,
      blob: new Blob(['fake-image-data'], { type: 'image/webp' }),
      thumbnail: new Blob(['fake-thumbnail-data'], { type: 'image/webp' }),
      createdAt: new Date().toISOString(),
    };
    testPhotoId = (await db.photos.add(photoData)) as number;
  });

  afterEach(async () => {
    await db.photos.clear();
  });

  it('should return photo for given ticketId', async () => {
    const { result } = renderHook(() => usePhoto(mockTicketId));

    await waitFor(() => {
      expect(result.current.photo).toBeDefined();
    });

    expect(result.current.photo?.id).toBe(testPhotoId);
    expect(result.current.photo?.ticketId).toBe(mockTicketId);
  });

  it('should return isLoading as false after photo loads', async () => {
    const { result } = renderHook(() => usePhoto(mockTicketId));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.photo).toBeDefined();
  });

  it('should return undefined photo for non-existent ticketId', async () => {
    const { result } = renderHook(() => usePhoto(999999));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.photo).toBeUndefined();
  });

  it('should handle undefined ticketId gracefully', async () => {
    const { result } = renderHook(() => usePhoto(undefined));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.photo).toBeUndefined();
  });

  it('should handle zero ticketId gracefully', async () => {
    const { result } = renderHook(() => usePhoto(0));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.photo).toBeUndefined();
  });

  it('should handle negative ticketId gracefully', async () => {
    const { result } = renderHook(() => usePhoto(-1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.photo).toBeUndefined();
  });

  it('should return photo blob data', async () => {
    const { result } = renderHook(() => usePhoto(mockTicketId));

    await waitFor(() => {
      expect(result.current.photo).toBeDefined();
    });

    // Note: Blob may serialize differently in fake-indexeddb
    expect(result.current.photo?.blob).toBeDefined();
    expect(result.current.photo?.thumbnail).toBeDefined();
  });

  it('should return createdAt timestamp', async () => {
    const { result } = renderHook(() => usePhoto(mockTicketId));

    await waitFor(() => {
      expect(result.current.photo).toBeDefined();
    });

    expect(result.current.photo?.createdAt).toBeDefined();
    // Should be a valid ISO date
    expect(new Date(result.current.photo!.createdAt).toISOString()).toBe(
      result.current.photo!.createdAt
    );
  });
});
