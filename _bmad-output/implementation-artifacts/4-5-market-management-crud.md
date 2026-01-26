# Story 4.5: Market Management (CRUD)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to create and manage my markets/points de vente**,
So that **I can organize my tickets by location** (FR22).

## Acceptance Criteria

1. **Given** I navigate to /settings → "Mes marchés"
   **When** the page loads
   **Then** a list of my existing markets is displayed
   **And** each market shows its name
   **And** a count of tickets associated is shown (nice-to-have)

2. **Given** I tap "Ajouter un marché"
   **When** the form opens
   **Then** I can enter a market name
   **And** on save, the market is created in Dexie via `addMarket()`
   **And** it is queued for sync to Supabase via `queueCreate('market', ...)`

3. **Given** I want to edit a market
   **When** I tap on a market name
   **Then** I can rename it inline or in a dialog
   **And** changes are saved to Dexie via `updateMarketName()`
   **And** empty names are rejected with validation error

4. **Given** I want to delete a market
   **When** I tap delete
   **Then** a confirmation dialog appears (AlertDialog)
   **And** on confirm, the market is soft-deleted via `deleteMarket()` (NF525 compliance)
   **And** the market disappears from the list

5. **Given** I have no markets
   **When** the page loads
   **Then** an empty state is shown encouraging creation
   **And** the "Ajouter" button is prominently visible

6. **Given** I create or delete a market
   **When** the action completes
   **Then** the list updates reactively via useLiveQuery (no manual refresh)

## Tasks / Subtasks

- [x] **Task 1: Create MarketListClient Component** (AC: #1, #5, #6)
  - [x] Create `src/components/features/settings/MarketListClient.tsx`
  - [x] Fetch authenticated user from Supabase
  - [x] Use `useMarkets(userId)` for reactive market list
  - [x] Display markets as a list of items with name
  - [x] Show empty state when no markets
  - [x] Write unit tests (4 tests: loading, empty state, list display, reactive update)

- [x] **Task 2: Create AddMarketForm Component** (AC: #2)
  - [x] Create `src/components/features/settings/AddMarketForm.tsx`
  - [x] Text input for market name with validation (non-empty, trimmed)
  - [x] Submit button that calls `addMarket()` + `queueCreate('market', ...)`
  - [x] Clear form after successful creation
  - [x] Show loading state during save
  - [x] Write unit tests (4 tests: render, validation, submit, clear after success)

- [x] **Task 3: Create EditMarketDialog Component** (AC: #3)
  - [x] Create `src/components/features/settings/EditMarketDialog.tsx`
  - [x] Sheet or Dialog with current name pre-filled
  - [x] Validate non-empty name
  - [x] Call `updateMarketName(id, name)` on save
  - [x] Close dialog on success
  - [x] Write unit tests (3 tests: pre-fill, validation, save)

- [x] **Task 4: Create DeleteMarketDialog Component** (AC: #4)
  - [x] Create `src/components/features/settings/DeleteMarketDialog.tsx`
  - [x] AlertDialog confirmation with market name
  - [x] Call `deleteMarket(id)` on confirm
  - [x] Informative text about soft-delete (data preserved)
  - [x] Write unit tests (3 tests: confirmation, delete, cancel)

- [x] **Task 5: Update Settings Page** (AC: #1)
  - [x] Convert `/settings/page.tsx` to use client component for markets section
  - [x] Add "Mes marchés" section with MarketListClient
  - [x] Keep existing "Mon compte" section with LogoutButton
  - [x] Write/update unit tests (2 tests: section renders, market list visible)

- [x] **Task 6: Update Barrel Exports** (AC: all)
  - [x] Create `src/components/features/settings/index.ts` barrel export
  - [x] Export: MarketListClient, AddMarketForm, EditMarketDialog, DeleteMarketDialog

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 4.5 OF EPIC 4:** Market management CRUD enables users to organize tickets by location.

**Epic 4 Overview:** Gestion des Tickets & Marchés - Views, filters, and management of tickets and markets.

**Dependencies:**
- Story 3.1 (Dexie Schema - DONE): Markets table already defined
- Story 4.4 (Filter by Market - DONE): MarketFilter already uses `useMarkets()` hook
- Story 4.6 (Assign Ticket to Market - BACKLOG): Will use markets created here

**CRITICAL REUSE:** The ENTIRE data layer already exists! All hooks and CRUD operations are built:
- `useMarkets(userId)` - reactive list query (filters out soft-deleted)
- `useMarketById(id)` - single market query
- `addMarket(market)` - create new market
- `updateMarketName(id, name)` - rename market with validation
- `deleteMarket(id)` - soft-delete (NF525 compliant)
- `restoreMarket(id)` - undo soft-delete
- `queueCreate('market', id, payload)` - queue for sync

**This story is PURELY UI/UX work - the data layer is complete!**

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |
| dexie-react-hooks | 1.x | useLiveQuery for reactive data |
| lucide-react | latest | Icons (MapPin, Plus, Pencil, Trash2) |
| tailwindcss | 4.x | Styling with @theme tokens |
| shadcn/ui | latest | Button, Input, AlertDialog, Sheet |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **Data Source:** useLiveQuery is THE SINGLE SOURCE OF TRUTH for IndexedDB data
- **NF525 Compliance:** Markets are NEVER truly deleted - only soft-deleted (deletedAt field)
- **Offline-First:** All CRUD operations write to Dexie first, queue sync for later
- **Error Handling:** Hooks return `{ data, error, isLoading }` pattern
- **Loading States:** Skeleton for lists, Spinner for actions

**From architecture.md:**

- **State Management:** useLiveQuery for reactive data
- **Naming:** Components PascalCase, hooks camelCase with `use` prefix
- **Feature Components:** Place in `src/components/features/settings/`
- **Settings Page:** Server Component shell with Client Component for interactive sections

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

- **Anti-Pattern:** "Settings complexes → Defaults intelligents"
- **Touch Target:** 48px minimum for all interactive elements
- **One-Hand Use:** Design for mobile one-handed operation
- **Simple Language:** "Ajouter un marché", "Supprimer", no jargon
- **Immediate Feedback:** Confirmation dialogs for destructive actions

**Market List UI Pattern:**
```
┌─────────────────────────────────────┐
│ Mes marchés                    [+ ] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Marché Bastille         [✏️][🗑]│ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Marché Aligre           [✏️][🗑]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Nom du marché         [Ajouter] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**EXISTING HOOKS (src/hooks/useMarkets.ts) - ALL CRUD IS DONE:**

```typescript
// REACTIVE QUERIES
export function useMarkets(userId: string) { ... }      // Get active markets list
export function useMarketById(id: number) { ... }       // Get single market
export function useMarketsCount(userId: string) { ... } // Get count

// CRUD OPERATIONS
export async function addMarket(market: Omit<Market, 'id'>): Promise<number> { ... }
export async function updateMarketName(id: number, name: string): Promise<void> { ... }
export async function deleteMarket(id: number): Promise<void> { ... }
export async function restoreMarket(id: number): Promise<void> { ... }
```

**SYNC QUEUE (src/hooks/useSyncQueue.ts):**

```typescript
// Queue market creation for sync
import { queueCreate } from '@/hooks';
const marketId = await addMarket({ name, userId, createdAt: new Date().toISOString() });
await queueCreate('market', marketId, { name, userId, createdAt });
```

**EXISTING UI COMPONENTS (shadcn/ui):**

```typescript
// Already available in src/components/ui/
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet';
```

**SETTINGS PAGE (src/app/(app)/settings/page.tsx) - MODIFY THIS:**

```typescript
// Currently a Server Component with placeholder
// Add "Mes marchés" section with client component
export default function SettingsPage() {
  return (
    <div>
      {/* Mon compte section - keep as-is */}
      <section>
        <LogoutButton />
      </section>

      {/* NEW: Mes marchés section */}
      <Suspense fallback={<MarketListSkeleton />}>
        <MarketListClient />
      </Suspense>
    </div>
  );
}
```

### Database Schema Reference

```typescript
// src/types/market.ts
interface Market {
  id?: number;           // Auto-increment PK
  name: string;          // Market name
  userId: string;        // Owner's Supabase UID
  createdAt: string;     // ISO 8601 timestamp
  deletedAt?: string;    // Soft-delete timestamp (NF525)
}

// Dexie indexes: ++id, userId, name, createdAt
```

### Sync Pattern for Market Creation

```typescript
// When user creates a market:
async function handleCreateMarket(name: string, userId: string) {
  const createdAt = new Date().toISOString();
  const marketId = await addMarket({ name: name.trim(), userId, createdAt });
  await queueCreate('market', marketId, { name: name.trim(), userId, createdAt });
  // useLiveQuery automatically updates the list - no manual refresh needed
}
```

### Component Structure

```
src/components/features/settings/
├── MarketListClient.tsx      # Main client component (auth + list)
├── MarketListClient.test.tsx
├── AddMarketForm.tsx         # Inline form for adding markets
├── AddMarketForm.test.tsx
├── EditMarketDialog.tsx      # Rename dialog/sheet
├── EditMarketDialog.test.tsx
├── DeleteMarketDialog.tsx    # AlertDialog confirmation
├── DeleteMarketDialog.test.tsx
└── index.ts                  # Barrel exports

src/app/(app)/settings/
├── page.tsx                  # MODIFIED - Add markets section
└── page.test.tsx             # Optional - test page sections render
```

### Testing Strategy

**Unit Tests (co-located):**
- MarketListClient: auth, loading, empty state, list rendering, reactive updates
- AddMarketForm: validation, submit, queue sync, clear form
- EditMarketDialog: pre-fill name, validate, save
- DeleteMarketDialog: confirm dialog, soft-delete call, cancel

**Test Mocks:**
```typescript
// Mock all hooks from barrel
vi.mock('@/hooks', () => ({
  useMarkets: vi.fn(() => ({ markets: [], isLoading: false })),
  addMarket: vi.fn(() => Promise.resolve(1)),
  updateMarketName: vi.fn(() => Promise.resolve()),
  deleteMarket: vi.fn(() => Promise.resolve()),
  queueCreate: vi.fn(() => Promise.resolve(1)),
}));

// Mock Supabase for auth
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: vi.fn() },
  }),
}));
```

### Previous Story Intelligence (Story 4.4)

**Learnings to apply:**
1. `useMarkets` hook works correctly - confirmed in MarketFilter usage
2. Sheet pattern for bottom-sheet UIs on mobile
3. 48px touch targets for buttons (min 32px for secondary actions)
4. `[&>button:last-child]:hidden` trick for Sheet custom header
5. Form validation: trim inputs, reject empty strings

**Established patterns:**
- `'use client'` directive for interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Sheet with custom header layout (title + close on same row)
- AlertDialog for destructive actions (from shadcn/ui)

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - use Dexie hooks
- useEffect for data fetching - use useLiveQuery via hooks
- Hardcoded colors - use Tailwind theme tokens
- Skip loading states - maintain existing skeleton pattern
- TRUE DELETE markets - ALWAYS soft-delete (NF525!)
- Create new CRUD hooks - ALL ALREADY EXIST in useMarkets.ts!
- Forget sync queue - every create must call queueCreate()
- Skip confirmation for delete - ALWAYS use AlertDialog
- Mix server/client - Settings page is server, market section is client

### References

- [Source: epics.md#Story-4.5] - Acceptance criteria and user story
- [Source: project-context.md#Critical-Rules] - NF525, offline-first rules
- [Source: ux-design-specification.md#Anti-Patterns] - Simple settings
- [Source: architecture.md#Frontend] - State management, component structure
- [Source: src/hooks/useMarkets.ts] - Complete CRUD operations
- [Source: src/hooks/useSyncQueue.ts#queueCreate] - Sync queue pattern
- [Source: src/app/(app)/settings/page.tsx] - Current settings page to modify
- [Source: src/types/market.ts] - Market type definition

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 16 tests pass (5 test files): MarketListClient (4), AddMarketForm (4), EditMarketDialog (3), DeleteMarketDialog (3), SettingsPage (2)

### Completion Notes List

- Purely UI story - all CRUD hooks already existed in useMarkets.ts
- Used Sheet (bottom side) for EditMarketDialog for mobile UX
- Used AlertDialog for DeleteMarketDialog with confirmation
- AddMarketForm calls addMarket() + queueCreate() for offline-first sync
- MarketListClient gets userId from Supabase auth, passes to useMarkets() hook
- NF525 compliance: DeleteMarketDialog uses soft-delete (deleteMarket sets deletedAt)
- Settings page remains a Server Component, MarketListClient wrapped in Suspense

### File List

**New files:**
- `src/components/features/settings/MarketListClient.tsx` - Main client component (auth + market list + edit/delete state)
- `src/components/features/settings/MarketListClient.test.tsx` - 4 tests
- `src/components/features/settings/AddMarketForm.tsx` - Inline form for adding markets
- `src/components/features/settings/AddMarketForm.test.tsx` - 4 tests
- `src/components/features/settings/EditMarketDialog.tsx` - Sheet dialog for renaming
- `src/components/features/settings/EditMarketDialog.test.tsx` - 3 tests
- `src/components/features/settings/DeleteMarketDialog.tsx` - AlertDialog for soft-delete
- `src/components/features/settings/DeleteMarketDialog.test.tsx` - 3 tests
- `src/components/features/settings/index.ts` - Barrel exports
- `src/app/(app)/settings/page.test.tsx` - 2 tests for settings page

**Modified files:**
- `src/app/(app)/settings/page.tsx` - Added MarketListClient in Suspense, removed placeholder

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-24 | Story created - UI-only story, all data layer already exists from earlier stories | Claude Opus 4.5 |
| 2026-01-24 | Implementation complete - 4 components, 5 test files, 16 tests passing | Claude Opus 4.5 |
| 2026-01-24 | Code review fixes: removed non-null assertions (MarketWithId type), added error handling to AddMarketForm and DeleteMarketDialog, removed unused Plus import | Claude Opus 4.5 |
