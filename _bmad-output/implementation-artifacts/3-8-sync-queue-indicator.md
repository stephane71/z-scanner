# Story 3.8: Sync Queue & Indicator

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see which tickets are synced and which are pending**,
So that **I know my data is safely backed up** (FR32).

## Acceptance Criteria

1. **Given** a ticket is validated offline
   **When** the ticket is saved
   **Then** it is added to the syncQueue with status "pending"
   **And** a sync indicator shows "Non synchronisé" on the ticket

2. **Given** I am viewing the app
   **When** there are pending sync items
   **Then** a subtle indicator in the header shows the count (e.g., "2 en attente")
   **And** the indicator is not alarming (per UX: offline is normal)

3. **Given** network connectivity is restored
   **When** sync completes for an item
   **Then** the indicator count decreases
   **And** individual ticket sync badges update

4. **Given** there are no pending sync items
   **When** I view the app
   **Then** no sync indicator is shown (clean state)

## Tasks / Subtasks

- [x] **Task 1: Update usePendingSyncCount Hook** (AC: #2, #4)
  - [x] Replace placeholder implementation in `src/hooks/usePendingSyncCount.ts`
  - [x] Use useLiveQuery to count pending items from syncQueue
  - [x] Export from hooks index (if not already)
  - [x] Write unit tests (5 tests passing)

- [x] **Task 2: Create SyncIndicator Component** (AC: #2, #4)
  - [x] Create `src/components/features/sync/SyncIndicator.tsx`
  - [x] Display subtle badge with pending count (e.g., "2 en attente")
  - [x] Use UX-approved styling (not alarming, muted colors)
  - [x] Hide when count is 0
  - [x] Include cloud icon with sync animation when syncing
  - [x] Write unit tests (9 tests passing)

- [x] **Task 3: Create TicketSyncBadge Component** (AC: #1, #3)
  - [x] Create `src/components/features/sync/TicketSyncBadge.tsx`
  - [x] Display "Non synchronisé" badge on individual tickets
  - [x] Accept ticketId prop to check sync status
  - [x] Use useLiveQuery for reactive updates
  - [x] Disappear when ticket is synced
  - [x] Write unit tests (9 tests passing)

- [x] **Task 4: Integrate SyncIndicator into App Header** (AC: #2)
  - [x] Add SyncIndicator to app layout or header component
  - [x] Position in header area (top right per UX patterns)
  - [x] Ensure visibility on all authenticated pages
  - [x] Created AppHeader component with 5 tests
  - [x] Created (app)/layout.tsx to include AppHeader

- [x] **Task 5: Integrate TicketSyncBadge into Ticket List** (AC: #1, #3)
  - [x] Add TicketSyncBadge to ticket list item display
  - [x] Show badge only for unsynced tickets
  - [x] Ensure proper spacing and visual hierarchy
  - [x] Created TicketListItem component with 9 tests
  - [x] Ready for Story 4.1 integration

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE SYNC INDICATOR STORY FOR EPIC 3:** This story provides visual feedback for the offline-first sync system. Users need to know when their data is safely backed up to the cloud vs. only stored locally.

**Epic 3 Overview:** Scan & Validation (Core Flow + Offline) - The core product value.

**UX Principle:** Offline is NORMAL, not an error. The indicator should be subtle and informative, not alarming. Users should feel confident using the app offline.

**Dependencies:**
- Story 3.1 (Local Database Schema) - DONE: syncQueue table exists
- Story 3.6 (Ticket Validation) - DONE: Tickets added to syncQueue
- Story 3.7 (Photo Archival) - DONE: Photos added to syncQueue
- Story 3.9 (Background Sync Engine) - FUTURE: Will process the queue

### What's Already Implemented

**Sync Queue Hooks (src/hooks/useSyncQueue.ts):**
```typescript
// Already exists with full functionality
export function useHasPendingSync() {
  const count = useLiveQuery(async () => {
    return db.syncQueue.where('status').equals('pending').count();
  }, []);

  return {
    hasPending: count !== undefined && count > 0,
    pendingCount: count ?? 0,
    isLoading: count === undefined,
  };
}
```

**Placeholder Hook (src/hooks/usePendingSyncCount.ts):**
```typescript
// Returns 0 - needs to be replaced with real implementation
export function usePendingSyncCount(): number {
  return 0; // Placeholder
}
```

**Sync Queue Stats (src/hooks/useSyncQueue.ts):**
```typescript
export function useSyncQueueStats() {
  const stats = useLiveQuery(async () => {
    const all = await db.syncQueue.toArray();
    return {
      pending: all.filter((i) => i.status === 'pending').length,
      inProgress: all.filter((i) => i.status === 'in-progress').length,
      completed: all.filter((i) => i.status === 'completed').length,
      failed: all.filter((i) => i.status === 'failed').length,
      total: all.length,
    };
  }, []);
  return { stats, isLoading: stats === undefined };
}
```

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| dexie-react-hooks | ^4.x | useLiveQuery for reactive sync status |
| Tailwind CSS | 4.x | Styling for badges and indicators |
| Lucide React | latest | Icons (Cloud, CloudOff, RefreshCw) |

### Architecture Compliance (CRITICAL)

**From project-context.md:**
- **useLiveQuery is the single source of truth** for IndexedDB data
- Components go in `src/components/features/sync/`
- No alarming error states for offline mode

**From UX Design Specification:**
- Touch targets: 48px minimum
- Muted colors for non-alarming states
- Header-positioned indicators
- Subtle animation for sync-in-progress

### Component Design

**SyncIndicator (Header):**
```tsx
// Subtle header indicator
<div className="flex items-center gap-1 text-sm text-gray-500">
  <Cloud className="h-4 w-4" />
  <span>2 en attente</span>
</div>

// When syncing (optional animation)
<div className="flex items-center gap-1 text-sm text-gray-500">
  <RefreshCw className="h-4 w-4 animate-spin" />
  <span>Synchronisation...</span>
</div>

// When all synced (hidden or checkmark)
// Nothing shown - clean state
```

**TicketSyncBadge (Ticket List Item):**
```tsx
// When not synced
<span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
  Non synchronisé
</span>

// When synced - no badge (badge disappears)
```

### Sync Status Flow

```
Ticket Created → syncQueue.status = "pending" → Badge visible
                                              ↓
Network Online → Background Sync (Story 3.9) → status = "completed"
                                              ↓
                                              Badge hidden
```

### Testing Strategy

**Unit Tests:**
- usePendingSyncCount returns correct count from IndexedDB
- SyncIndicator displays count when > 0
- SyncIndicator hidden when count = 0
- TicketSyncBadge displays for pending tickets
- TicketSyncBadge hidden for synced tickets

**Integration Tests:**
- Indicator updates reactively when syncQueue changes

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**Sync Indicator Design:**
- Position: Header area, top right
- Style: Muted, non-alarming (gray or amber tones)
- Animation: Subtle rotation on sync icon when active
- Text: "X en attente" (French)

**Ticket Badge Design:**
- Style: Small pill badge
- Color: Amber (warning but not error)
- Text: "Non synchronisé"
- Position: Below or next to ticket info

**States:**
| State | Display |
|-------|---------|
| All synced | No indicator |
| 1+ pending | "X en attente" |
| Syncing | "Synchronisation..." with spinner |
| Failed | "Échec sync" (red, but rare) |

### Forbidden Patterns (NEVER DO)

- Show alarming red indicators for pending sync (offline is normal)
- Block user actions based on sync status
- Hide important content behind sync state
- Poll for sync status (use useLiveQuery instead)
- Store sync state in useState (use IndexedDB via useLiveQuery)

### Integration with Other Stories

| Story | Integration Point |
|-------|------------------|
| 3.6 Ticket Validation | Tickets appear in syncQueue after validation |
| 3.7 Photo Archival | Photos appear in syncQueue after validation |
| 3.9 Background Sync | Will process queue and update status to completed |
| 4.1 Ticket List | TicketSyncBadge displays on list items |
| 4.2 Ticket Detail | May show sync status on detail view |

### Previous Story Intelligence (Story 3-7)

**Learnings to apply:**
1. useLiveQuery pattern works well for reactive IndexedDB queries
2. Sentinel values (null vs undefined) help distinguish loading from not-found
3. Tests with fake-indexeddb work reliably

**Code patterns established:**
- Hook structure with isLoading state
- Export types alongside hooks
- Test file co-location

### References

- [Source: epics.md#Story-3.8] - Acceptance criteria
- [Source: project-context.md#Sync-Queue-Pattern] - Queue architecture
- [Source: ux-design-specification.md] - Visual design requirements
- [Source: src/hooks/useSyncQueue.ts] - Existing sync hooks

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

No debug issues encountered.

### Completion Notes List

1. Task 1: Updated usePendingSyncCount hook with useLiveQuery - 5 tests
2. Task 2: Created SyncIndicator component with muted styling - 9 tests
3. Task 3: Created TicketSyncBadge component with amber styling - 9 tests
4. Task 4: Created AppHeader and (app)/layout.tsx for header integration - 5 tests
5. Task 5: Created TicketListItem component for Story 4.1 readiness - 9 tests
6. All 37 Story 3.8 tests passing
7. Pre-existing flaky test in ManualEntryClient.test.tsx (unrelated to Story 3.8)

### File List

| File | Status | Description |
|------|--------|-------------|
| `src/hooks/usePendingSyncCount.ts` | Modified | Replace placeholder with real useLiveQuery implementation |
| `src/hooks/usePendingSyncCount.test.ts` | Modified | Unit tests for pending sync count hook (5 tests) |
| `src/components/features/sync/SyncIndicator.tsx` | Created | Header sync status indicator component |
| `src/components/features/sync/SyncIndicator.test.tsx` | Created | Unit tests for SyncIndicator (9 tests) |
| `src/components/features/sync/TicketSyncBadge.tsx` | Created | Individual ticket sync badge component |
| `src/components/features/sync/TicketSyncBadge.test.tsx` | Created | Unit tests for TicketSyncBadge (9 tests) |
| `src/components/features/sync/AppHeader.tsx` | Created | Header with SyncIndicator integration |
| `src/components/features/sync/AppHeader.test.tsx` | Created | Unit tests for AppHeader (5 tests) |
| `src/components/features/sync/TicketListItem.tsx` | Created | Ticket list item with sync badge |
| `src/components/features/sync/TicketListItem.test.tsx` | Created | Unit tests for TicketListItem (9 tests) |
| `src/components/features/sync/index.ts` | Created | Exports for sync components |
| `src/app/(app)/layout.tsx` | Created | App layout with AppHeader |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Modified | Status updated to done |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-21 | Story created with comprehensive sync indicator implementation guide | Claude Opus 4.5 |
| 2026-01-21 | Story implemented with 5 tasks, 37 unit tests | Claude Opus 4.5 |
