# Story 3.7: Photo Archival

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **my ticket photos to be archived with the data**,
So that **I have visual proof for tax audits** (FR13).

## Acceptance Criteria

1. **Given** a ticket is validated
   **When** the photo is archived
   **Then** the original WebP image is stored in Dexie `photos` table
   **And** the thumbnail is stored for list display
   **And** the photo is linked to the ticket via ticketId

2. **Given** a photo is archived locally
   **When** the user is online
   **Then** the photo is included in the sync queue for cloud backup
   **And** the sync queue entry has entityType="photo" and action="create"

3. **Given** photos exist in the sync queue
   **When** background sync runs (Story 3.9)
   **Then** photos are uploaded to Supabase Storage with correct path
   **And** the sync queue entry is marked "completed"

4. **Given** a photo upload fails
   **When** retries are exhausted (5 attempts)
   **Then** the sync queue entry is marked "failed"
   **And** the photo remains in local IndexedDB for manual retry

## Tasks / Subtasks

- [x] **Task 1: Add Photo to Sync Queue on Validation** (AC: #1, #2)
  - [x] Modify `useTicketValidation.ts` to add photo to syncQueue after ticket validation
  - [x] Create syncQueue entry with entityType="photo", action="create"
  - [x] Include photoId in payload for server reference
  - [x] Ensure atomicity with existing Dexie transaction

- [x] **Task 2: Create Photo Sync Utility** (AC: #2, #3)
  - [x] Create `src/lib/sync/photo.ts` with `uploadPhoto` function
  - [x] Define Supabase Storage path: `{userId}/{ticketId}/{photoId}.webp` (in `ticket-photos` bucket)
  - [x] Handle blob-to-upload conversion
  - [x] Return storage URL on success

- [x] **Task 3: Create Photo Retrieval Hook** (AC: #1)
  - [x] Create `src/hooks/usePhoto.ts` for fetching photo by ticketId
  - [x] Use useLiveQuery for reactive updates
  - [x] Handle missing photo gracefully (photo may be uploading)
  - [x] Export from `src/hooks/index.ts`

- [x] **Task 4: Update VerifyPageClient Photo Display** (AC: #1)
  - [x] Ensure photo thumbnail loads from Dexie (already implemented, verify)
  - [x] Add fullscreen photo viewer functionality (already implemented, verify)
  - [x] Handle case where photo is still compressing/pending

- [x] **Task 5: Create Unit Tests** (AC: #1, #2, #3, #4)
  - [x] Test photo sync queue entry creation in useTicketValidation (4 tests)
  - [x] Test uploadPhoto utility with mocked Supabase Storage (6 tests)
  - [x] Test usePhoto hook with fake-indexeddb (8 tests)
  - [x] Test error handling for failed uploads (2 tests)

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE PHOTO ARCHIVAL STORY FOR EPIC 3:** This story ensures that ticket photos are properly archived both locally (IndexedDB) and remotely (Supabase Storage) for NF525 compliance. Photos serve as visual proof for tax audits and must be retained for 6 years.

**Epic 3 Overview:** Scan & Validation (Core Flow + Offline) - The core product value.

**NF525 Compliance Requirements for Photos:**
| Requirement | Implementation |
|-------------|----------------|
| **Conservation** | 6-year retention, photos stored in Supabase Storage |
| **Archivage** | Original quality preserved, linked to ticket via foreign key |
| **Intégrité** | Photos are immutable after validation, no modification allowed |

**Dependencies:**
- Story 3.1 (Local Database Schema) - DONE: photos table exists with ticketId FK
- Story 3.2 (Camera Capture UI) - DONE: Photos captured and compressed
- Story 3.6 (Ticket Validation) - DONE: Validation flow with syncQueue

### What's Already Implemented (from Story 3.2 and 3.6)

**Photo Storage (ScanPageClient.tsx:134-141):**
```typescript
// Photos are already saved to Dexie on capture
const photoData: Omit<Photo, 'id'> = {
  ticketId,
  blob: original,      // ~1MB WebP for OCR quality
  thumbnail,           // ~10KB thumbnail
  createdAt: now.toISOString(),
};
await db.photos.add(photoData as Photo);
```

**Photo Retrieval (useVerification.ts:66):**
```typescript
// Photos are already retrieved in verification hook
return db.photos.where("ticketId").equals(ticketId).first();
```

**What's MISSING (This Story Implements):**
1. ❌ Photos are NOT added to syncQueue for cloud backup
2. ❌ No upload utility for Supabase Storage
3. ❌ No dedicated usePhoto hook (embedded in useVerification)

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| dexie | ^4.2.1 | IndexedDB storage (INSTALLED) |
| @supabase/supabase-js | ^2.x | Storage upload (INSTALLED) |

### Architecture Compliance (CRITICAL)

**From architecture.md - Photo Storage:**
```
| Requirement | Implementation |
|-------------|----------------|
| Local Storage | Dexie photos table with blob + thumbnail |
| Cloud Storage | Supabase Storage bucket "ticket-photos" |
| Format | WebP 80% (~1MB for OCR) + thumbnail 60% (~10KB) |
| Sync Priority | Photos sync AFTER ticket metadata (lower priority) |
```

**From project-context.md - Sync Queue Pattern:**
```
1. User action → Write to Dexie (immediate)
2. Add to syncQueue with status "pending"
3. Background sync processes queue when online
4. Retry 5 times with exponential backoff (1s→16s)
5. Mark "completed" or "failed" after all retries
6. Never delete queue items (audit trail)

Priority: Tickets metadata > Photos (binary data)
```

### Supabase Storage Structure

**Bucket:** `ticket-photos` (already configured in Story 1.2)

**Path Pattern:** `{userId}/{ticketId}/{photoId}.webp` (inside `ticket-photos` bucket)

**Example:** `user-abc123/42/1.webp`

**RLS Policy (already configured):**
- Users can only access their own photos
- Upload requires authenticated user with matching userId
- No public access

### Sync Queue Entry Format for Photos

```typescript
interface SyncQueueItem {
  id?: number;
  entityType: 'photo';
  entityId: number;          // photoId from photos table
  action: 'create';          // Only create, never update/delete
  payload: string;           // JSON.stringify({ ticketId, userId, storagePath })
  status: 'pending';
  retries: 0;
  createdAt: string;         // ISO 8601
}

// Example payload:
{
  ticketId: 42,
  userId: 'user-abc123',
  storagePath: 'user-abc123/42/1.webp'
}
```

### uploadPhoto Utility Implementation Pattern

```typescript
// src/lib/sync/photo.ts
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';

interface UploadPhotoParams {
  photoId: number;
  ticketId: number;
  userId: string;
}

export async function uploadPhoto({
  photoId,
  ticketId,
  userId,
}: UploadPhotoParams): Promise<string> {
  // 1. Get photo blob from Dexie
  const photo = await db.photos.get(photoId);
  if (!photo) {
    throw new Error(`Photo ${photoId} not found in local storage`);
  }

  // 2. Construct storage path
  const storagePath = `${userId}/${ticketId}/${photoId}.webp`;

  // 3. Upload to Supabase Storage
  const supabase = createClient();
  const { error } = await supabase.storage
    .from('ticket-photos')
    .upload(storagePath, photo.blob, {
      contentType: 'image/webp',
      upsert: false, // Don't overwrite - photos are immutable
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 4. Return public URL (or storage path for later retrieval)
  return storagePath;
}
```

### usePhoto Hook Implementation Pattern

```typescript
// src/hooks/usePhoto.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Photo } from '@/types';

export function usePhoto(ticketId: number | undefined) {
  const photo = useLiveQuery(
    async () => {
      if (!ticketId || ticketId <= 0) return undefined;
      return db.photos.where('ticketId').equals(ticketId).first();
    },
    [ticketId],
    undefined
  );

  return {
    photo,
    isLoading: photo === undefined,
  };
}
```

### Modify useTicketValidation for Photo Sync

**Current flow (Story 3.6):**
1. Compute hash
2. Update ticket status
3. Add ticket to syncQueue
4. Trigger haptic

**New flow (Story 3.7):**
1. Compute hash
2. Update ticket status
3. Add ticket to syncQueue (existing)
4. **Add photo to syncQueue (NEW)**
5. Trigger haptic

```typescript
// In useTicketValidation.ts, after ticket syncQueue entry:

// 5.5 Add photo to sync queue for cloud backup
const photo = await db.photos.where('ticketId').equals(ticketId).first();
if (photo && photo.id) {
  const storagePath = `${userId}/${ticketId}/${photo.id}.webp`;
  await db.syncQueue.add({
    entityType: 'photo',
    entityId: photo.id,
    action: 'create',
    payload: JSON.stringify({
      ticketId,
      userId,
      storagePath,
    }),
    status: 'pending',
    retries: 0,
    createdAt: clientTimestamp,
  });
}
```

### Previous Story Intelligence (Story 3-6)

**Learnings to apply:**
1. **Transaction pattern** - Use Dexie transaction for atomic operations
2. **Test patterns** - Mock Dexie with fake-indexeddb
3. **Sync queue format** - payload is JSON stringified, action is verb
4. **Error handling** - Set error state in hook, display in component

**Code Review Issues from Story 3-6 to avoid:**
- Document all files in File List
- Add VerifyPageClient integration tests
- Handle auth errors gracefully

### Testing Strategy

**Unit Tests:**
- useTicketValidation: photo syncQueue entry created after validation
- uploadPhoto: successful upload returns storage path
- uploadPhoto: handles missing photo error
- uploadPhoto: handles upload failure
- usePhoto: returns photo by ticketId
- usePhoto: handles missing photo gracefully

**Integration Tests (if time permits):**
- Full flow: capture → validate → photo queued for sync

**Test Mocking:**
```typescript
// Mock Supabase Storage
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  }),
}));

// Mock Dexie with fake-indexeddb
import 'fake-indexeddb/auto';
```

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**Photo Display:**
- Thumbnail in verification screen header (32px height, rounded)
- Click to view fullscreen (already implemented)
- Loading skeleton while photo loads

**Sync Indicator:**
- No visual indicator on individual photos (Story 3.8 handles global sync status)
- Photos sync silently in background

### Forbidden Patterns (NEVER DO)

- Modify or delete photos after validation (IMMUTABLE - NF525 requirement)
- Store photos in localStorage (use IndexedDB via Dexie only)
- Upload photos before ticket validation (sync after validation only)
- Skip thumbnail generation (required for list performance)
- Use floating point for file sizes (use integer bytes)

### Integration with Other Stories

| Story | Integration Point |
|-------|------------------|
| 3.2 Camera Capture | Photos stored in Dexie (already implemented) |
| 3.6 Ticket Validation | Add photo to syncQueue during validation |
| 3.8 Sync Queue Indicator | Shows pending photo uploads in count |
| 3.9 Background Sync | Processes photo upload queue |
| 4.2 Ticket Detail View | Displays archived photo |

### References

- [Source: epics.md#Story-3.7] - Acceptance criteria
- [Source: architecture.md#Photo-Storage] - WebP format, storage bucket
- [Source: project-context.md#Sync-Queue-Pattern] - Retry logic, priority
- [Source: Story 3.2] - compressTicketImage utility
- [Source: Story 3.6] - useTicketValidation transaction pattern

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Fixed usePhoto isLoading sentinel pattern to distinguish "loading" from "not found"
- Blob serialization issue in fake-indexeddb required test assertion adjustments

### Completion Notes List

- Photo sync queue entry added within Dexie transaction for atomicity
- uploadPhoto utility uses upsert=false for NF525 immutability compliance
- usePhoto hook provides standalone photo retrieval (useVerification also has embedded photo loading)

### File List

| File | Status | Description | Tests |
|------|--------|-------------|-------|
| `src/hooks/useTicketValidation.ts` | Modified | Add photo to syncQueue after ticket validation | 15 |
| `src/hooks/useTicketValidation.test.ts` | Modified | Add 4 tests for photo syncQueue entry | - |
| `src/lib/sync/photo.ts` | Created | Photo upload utility for Supabase Storage (73 lines) | 6 |
| `src/lib/sync/photo.test.ts` | Created | Unit tests for uploadPhoto utility | - |
| `src/lib/sync/index.ts` | Created | Exports for sync module | - |
| `src/hooks/usePhoto.ts` | Created | Hook for fetching photo by ticketId (70 lines) | 8 |
| `src/hooks/usePhoto.test.ts` | Created | Unit tests for usePhoto hook | - |
| `src/hooks/index.ts` | Modified | Export usePhoto hook | - |
| `sprint-status.yaml` | Modified | Update story status to done | - |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-21 | Story created with comprehensive task breakdown for photo archival | Claude Opus 4.5 |
| 2026-01-21 | Implementation complete: all 5 tasks done, 29 tests passing | Claude Opus 4.5 |
| 2026-01-21 | Code review: Fixed storage path documentation, completed Dev Agent Record | Claude Opus 4.5 |
