# Story 3.9: Background Sync Engine

Status: complete

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **my data to sync automatically when I'm back online**,
So that **I don't have to think about backups** (FR33).

## Acceptance Criteria

1. **Given** there are items in the syncQueue
   **When** network connectivity is restored
   **Then** the sync engine processes the queue automatically
   **And** OCR queue items sync first (to unblock validation), then tickets metadata, then photos

2. **Given** a sync item is being processed
   **When** the operation fails
   **Then** each item retries up to 5 times with exponential backoff (1s→2s→4s→8s→16s)

3. **Given** a sync item succeeds
   **When** the server confirms receipt
   **Then** the syncQueue item status is updated to "completed"
   **And** the ticket's sync indicator is removed (Story 3.8 components update reactively)

4. **Given** a sync item fails after 5 retries
   **When** all retries are exhausted
   **Then** the status is set to "failed"
   **And** a toast notification informs the user
   **And** manual retry is available in settings

## Tasks / Subtasks

- [x] **Task 1: Create useOnline Hook for Network Status** (AC: #1)
  - [x] Create `src/hooks/useOnline.ts` with navigator.onLine + event listeners
  - [x] Expose `isOnline` reactive state
  - [x] Handle SSR (default to true)
  - [x] Write unit tests (5 tests)
  - [x] Export from hooks index

- [x] **Task 2: Create Sync API Routes** (AC: #1, #3)
  - [x] Create `src/app/api/sync/route.ts` for batch sync endpoint
  - [x] Create `src/app/api/sync/tickets/route.ts` for ticket sync
  - [x] Create `src/app/api/sync/photos/route.ts` for photo upload to Supabase Storage
  - [x] Implement RLS-aware Supabase operations
  - [x] Return success responses with confirmed IDs
  - [ ] Write integration tests (deferred - requires Supabase test env)

- [x] **Task 3: Implement Sync Engine Core** (AC: #1, #2, #3)
  - [x] Implement `src/lib/sync/engine.ts` with main sync loop
  - [x] Process items in priority order: ocr > tickets > photos
  - [x] Use Dexie transaction for atomic status updates
  - [x] Implement exponential backoff: delays = [1000, 2000, 4000, 8000, 16000]
  - [x] Mark items as "in-progress" during sync, "completed" or "failed" after
  - [x] Write unit tests (15 tests)

- [x] **Task 4: Implement Retry Logic** (AC: #2, #4)
  - [x] Create `src/lib/sync/retry.ts` with backoff utilities
  - [x] `calculateBackoff(retries: number): number` - returns delay in ms
  - [x] `shouldRetry(retries: number): boolean` - max 5 retries
  - [x] `scheduleRetry(id: number, delay: number)` - setTimeout wrapper
  - [x] Write unit tests (17 tests)

- [x] **Task 5: Create useSyncEngine Hook** (AC: #1, #3, #4)
  - [x] Create `src/hooks/useSyncEngine.ts` orchestrating sync lifecycle
  - [x] Start sync automatically when online and pending items exist
  - [x] Stop sync when offline
  - [x] Expose `isSyncing`, `syncError`, `manualSync()` for UI
  - [x] Write unit tests (8 tests)
  - [x] Export from hooks index

- [x] **Task 6: Implement Toast Notifications for Failures** (AC: #4)
  - [x] Create `src/components/ui/sonner.tsx` via shadcn/ui (sonner library)
  - [x] Create `src/hooks/useToast.ts` for toast context
  - [x] Show toast on sync failure: "Synchronisation échouée - Réessayer dans Paramètres"
  - [x] Toast appears after all retries exhausted (via SyncEngineProvider)
  - [x] Write unit tests (7 tests)

- [x] **Task 7: Integrate Sync Engine into App** (AC: #1, #3, #4)
  - [x] Add SyncEngineProvider to `src/app/(app)/layout.tsx`
  - [x] Ensure engine starts on app mount when authenticated
  - [x] Connect to SyncIndicator (Story 3.8) for reactive updates
  - [ ] Add manual sync button to settings page placeholder (deferred to Story 6.4)

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE BACKGROUND SYNC ENGINE FOR EPIC 3:** This story implements the core synchronization functionality that makes Z-Scanner's offline-first architecture complete. It processes the syncQueue populated by Stories 3.6 (validation) and 3.7 (photo archival), syncing data to Supabase when connectivity is available.

**Epic 3 Overview:** Scan & Validation (Core Flow + Offline) - The core product value.

**Dependencies:**
- Story 3.1 (Local Database Schema) - DONE: syncQueue table with status, retries, errorMessage fields
- Story 3.6 (Ticket Validation) - DONE: Creates syncQueue entries for validated tickets
- Story 3.7 (Photo Archival) - DONE: Creates syncQueue entries for photos
- Story 3.8 (Sync Queue Indicator) - DONE: UI components react to syncQueue changes
- Story 3.10 (App Layout) - FUTURE: Bottom navigation integration

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| dexie | ^4.x | IndexedDB transactions for status updates |
| dexie-react-hooks | ^4.x | useLiveQuery for reactive sync status |
| @supabase/supabase-js | ^2.x | Cloud sync to PostgreSQL + Storage |
| @supabase/ssr | ^0.x | Server-side Supabase client |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **Sync Queue Pattern:**
  1. User action → Write to Dexie (immediate)
  2. Add to syncQueue with status "pending"
  3. Background sync processes queue when online
  4. Retry 5 times with exponential backoff (1s→16s)
  5. Mark "completed" or "failed" after all retries
  6. Never delete queue items (audit trail - NF525)

- **Priority Order:**
  - OCR Queue items first (to unblock validation)
  - Tickets metadata second
  - Photos (binary data) last

- **API Routes handle all business logic** - never call Supabase directly from client

### Sync Engine Design

**Main Loop Flow:**
```typescript
// src/lib/sync/engine.ts
export async function processSyncQueue(): Promise<SyncResult> {
  // 1. Get pending items sorted by priority
  const items = await getPendingItemsByPriority();

  for (const item of items) {
    // 2. Mark as in-progress
    await markInProgress(item.id);

    try {
      // 3. Sync based on entity type
      await syncItem(item);

      // 4. Mark as completed
      await markCompleted(item.id);
    } catch (error) {
      // 5. Handle retry or failure
      const newRetries = await incrementRetry(item.id);

      if (shouldRetry(newRetries)) {
        // Schedule retry with backoff
        await scheduleRetry(item.id, calculateBackoff(newRetries));
      } else {
        // Mark as permanently failed
        await markFailed(item.id, error.message);
      }
    }
  }
}
```

**Priority Sorting:**
```typescript
// Priority: ocr(1) > ticket(2) > photo(3)
const PRIORITY: Record<SyncEntityType, number> = {
  ticket: 2, // 'ocr' action has priority 1
  photo: 3,
  market: 2,
};

function getItemPriority(item: SyncQueueItem): number {
  if (item.action === 'ocr') return 1;
  return PRIORITY[item.entityType] || 99;
}
```

### Exponential Backoff Implementation

```typescript
// src/lib/sync/retry.ts
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second

export function calculateBackoff(retries: number): number {
  // 1s, 2s, 4s, 8s, 16s
  return BASE_DELAY * Math.pow(2, retries);
}

export function shouldRetry(retries: number): boolean {
  return retries < MAX_RETRIES;
}

// Delays: [1000, 2000, 4000, 8000, 16000]
```

### API Route Design

**Batch Sync Endpoint:**
```typescript
// POST /api/sync
// Body: { items: SyncQueueItem[] }
// Response: { success: true, results: { id: number, status: 'completed' | 'failed' }[] }

// Uses Supabase server client with RLS
import { createClient } from '@/lib/supabase/server';
```

**Photo Upload:**
```typescript
// POST /api/sync/photos
// Body: FormData with ticketId, image blob
// Uploads to: ticket-photos/{userId}/{ticketId}.webp
```

### Existing Code to Use

**From src/hooks/useSyncQueue.ts:**
```typescript
// Already implemented and tested
export function usePendingSyncItems()
export function useSyncQueueStats()
export function useHasPendingSync()
export async function addToSyncQueue(item)
export async function updateSyncStatus(id, status, errorMessage?)
export async function incrementRetry(id): Promise<number>
export async function getNextPendingItem()
export async function markInProgress(id)
export async function markCompleted(id)
export async function markFailed(id, errorMessage)
```

**From src/types/sync.ts:**
```typescript
export type SyncStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
export type SyncAction = 'create' | 'update' | 'validate' | 'cancel' | 'ocr';
export type SyncEntityType = 'ticket' | 'photo' | 'market';
export interface SyncQueueItem { ... }
```

### Network Detection

```typescript
// src/hooks/useOnline.ts
export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Toast Notification Design

**From UX Design Specification:**
- Toast appears bottom center, above bottom nav
- Duration: 4 seconds for warnings
- Style: Amber/warning for sync failures (not alarming red)
- Text: "Échec synchronisation - réessayer dans Paramètres"

```tsx
// Toast usage
import { useToast } from '@/hooks/useToast';

const { toast } = useToast();
toast({
  title: "Synchronisation échouée",
  description: "Réessayer dans Paramètres",
  variant: "warning",
});
```

### Testing Strategy

**Unit Tests:**
- useOnline detects online/offline events
- calculateBackoff returns correct delays
- shouldRetry returns false after 5 attempts
- processSyncQueue processes items in priority order
- markCompleted updates syncQueue status
- markFailed records error message

**Integration Tests:**
- Full sync cycle: pending → in-progress → completed
- Retry cycle: pending → in-progress → pending (retry) → failed
- Priority ordering: OCR items sync before tickets before photos

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**Sync is AUTOMATIC and TRANSPARENT:**
- User should never have to think about sync
- Sync starts automatically when online
- No manual "sync now" button in main UI (only in Settings)
- Offline is NORMAL, not an error state

**Toast on Failure (After All Retries):**
- Style: Warning (amber), not error (red)
- Position: Bottom, above nav
- Duration: 4 seconds
- Action: Tap to go to Settings

**Settings Manual Retry:**
- Located in Settings page
- Shows failed items count
- "Réessayer synchronisation" button
- Progress indicator during retry

### Forbidden Patterns (NEVER DO)

- Sync in Service Worker directly (use API routes)
- Poll for online status (use event listeners)
- Block UI during sync (background processing)
- Show error states for offline mode
- Delete syncQueue items (NF525 audit trail)
- Call Supabase directly from client (use API routes)
- Use setTimeout without cleanup

### Integration with Other Stories

| Story | Integration Point |
|-------|------------------|
| 3.6 Ticket Validation | syncQueue entries for validated tickets |
| 3.7 Photo Archival | syncQueue entries for photos |
| 3.8 Sync Indicator | UI updates reactively via useLiveQuery |
| 3.10 App Layout | SyncEngineProvider in (app)/layout.tsx |
| 6.4 Settings Page | Manual retry functionality |

### Previous Story Intelligence (Story 3-8)

**Learnings to apply:**
1. useLiveQuery pattern works well for reactive IndexedDB queries
2. Components in `src/components/features/sync/` - add engine-related files to `src/lib/sync/`
3. Tests with fake-indexeddb work reliably
4. SyncIndicator already updates reactively when syncQueue changes

**Code patterns established:**
- Hook structure with isLoading state
- Export types alongside functions
- Test file co-location

### Git Context (Recent Commits)

Recent implementation patterns from Story 3.7 and 3.8:
- Photo sync queue integration: `queueCreate('photo', photoId, payload)`
- SyncIndicator uses `usePendingSyncCount()` hook
- AppHeader includes SyncIndicator
- Layout in `src/app/(app)/layout.tsx` wraps authenticated routes

### References

- [Source: epics.md#Story-3.9] - Acceptance criteria
- [Source: project-context.md#Sync-Queue-Pattern] - Queue architecture with retry
- [Source: architecture.md#Sync-Retry] - Exponential backoff specification
- [Source: ux-design-specification.md] - Toast and failure handling UX
- [Source: src/hooks/useSyncQueue.ts] - Existing sync queue hooks
- [Source: src/types/sync.ts] - Sync types and interfaces
- [Source: src/lib/sync/] - Sync module (engine.ts placeholder exists)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

| File | Status | Description |
|------|--------|-------------|
| `src/hooks/useOnline.ts` | Created | Network connectivity detection hook |
| `src/hooks/useOnline.test.ts` | Created | Unit tests for useOnline (5 tests) |
| `src/hooks/useSyncEngine.ts` | Created | Sync engine orchestration hook |
| `src/hooks/useSyncEngine.test.ts` | Created | Unit tests for useSyncEngine (8 tests) |
| `src/hooks/useToast.ts` | Created | Toast notification wrapper hook |
| `src/hooks/useToast.test.ts` | Created | Unit tests for useToast (7 tests) |
| `src/lib/sync/engine.ts` | Modified | Full sync engine implementation |
| `src/lib/sync/engine.test.ts` | Created | Unit tests for sync engine (15 tests) |
| `src/lib/sync/retry.ts` | Created | Exponential backoff utilities |
| `src/lib/sync/retry.test.ts` | Created | Unit tests for retry logic (17 tests) |
| `src/lib/sync/index.ts` | Modified | Export engine and retry modules |
| `src/app/api/sync/route.ts` | Created | Batch sync API endpoint |
| `src/app/api/sync/tickets/route.ts` | Created | Ticket sync API endpoint |
| `src/app/api/sync/photos/route.ts` | Created | Photo upload API endpoint |
| `src/components/ui/sonner.tsx` | Created | Sonner toast component via shadcn/ui |
| `src/components/features/sync/SyncEngineProvider.tsx` | Created | Provider with sync engine + toast |
| `src/components/features/sync/index.ts` | Modified | Export SyncEngineProvider |
| `src/app/(app)/layout.tsx` | Modified | Integrated SyncEngineProvider |
| `src/hooks/index.ts` | Modified | Export useOnline, useSyncEngine, useToast |
| `package.json` | Modified | Added sonner dependency |
| `package-lock.json` | Modified | Lock file updated for sonner |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-22 | Story created with comprehensive background sync engine implementation guide | Claude Opus 4.5 |
| 2026-01-22 | Tasks 1-7 implemented: sync engine, retry logic, toast notifications, app integration | Claude Opus 4.5 |
| 2026-01-22 | Code review fix: Implemented actual exponential backoff via isReadyForRetry() that filters pending items by elapsed time since lastAttemptAt. Added 6 new tests (23 total engine tests). | Claude Opus 4.5 |
