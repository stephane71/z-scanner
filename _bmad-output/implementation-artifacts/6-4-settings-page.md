# Story 6.4: Settings Page

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to access app settings**,
So that **I can manage my account and preferences**.

## Acceptance Criteria

1. **Given** I navigate to /settings (Paramètres tab)
   **When** the page loads
   **Then** I see sections for:
   - Mon compte (email, logout)
   - Mes marchés (link to market management)
   - Synchronisation (manual retry, sync status)
   - À propos (version, support contact)

2. **Given** I want to force sync
   **When** I tap "Synchroniser maintenant"
   **Then** pending items are synced immediately
   **And** a progress indicator shows sync status

## Tasks / Subtasks

- [x] **Task 1: Display User Email in Mon compte Section** (AC: #1)
  - [x] Create `src/components/features/settings/AccountSection.tsx`
  - [x] Fetch user email from Supabase Auth client
  - [x] Display email in a Card with user icon
  - [x] Keep existing LogoutButton below email
  - [x] Loading skeleton while fetching email
  - [x] Write unit tests for AccountSection (4+ tests) - **6 tests**

- [x] **Task 2: Create Synchronisation Section** (AC: #1, #2)
  - [x] Create `src/components/features/settings/SyncSection.tsx`
  - [x] Display pending sync count from useSyncCount hook
  - [x] Display sync status ("Tout synchronisé" or "X éléments en attente")
  - [x] Show last sync timestamp if available (N/A - showing failed count instead for better UX)
  - [x] Create "Synchroniser maintenant" button (disabled if nothing to sync)
  - [x] Button triggers manual sync via useSyncEngine.manualSync()
  - [x] Loading spinner on button during sync
  - [x] Success/error toast after sync completes
  - [x] Write unit tests for SyncSection (8+ tests) - **10 tests**

- [x] **Task 3: Create À propos Section** (AC: #1)
  - [x] Create `src/components/features/settings/AboutSection.tsx`
  - [x] Display app version from package.json (read at build time)
  - [x] Display "Conforme NF525" badge with check icon
  - [x] Display support email link: support@z-scanner.fr (mailto:)
  - [x] Display "Développé par Z-Scanner SAS" credit
  - [x] Write unit tests for AboutSection (3+ tests) - **5 tests**

- [x] **Task 4: Integrate All Sections into Settings Page** (AC: #1, #2)
  - [x] Update `src/app/(app)/settings/page.tsx`
  - [x] Add AccountSection (replaces old Mon compte content)
  - [x] Keep MarketListClient as "Mes marchés" section
  - [x] Add SyncSection after markets
  - [x] Add AboutSection at bottom
  - [x] Ensure proper section spacing and visual hierarchy
  - [x] Update page.test.tsx with new sections - **6 tests**

- [x] **Task 5: Update Settings Barrel Export** (AC: all)
  - [x] Update `src/components/features/settings/index.ts`
  - [x] Export AccountSection, SyncSection, AboutSection

- [x] **Task 6: Style and Polish** (AC: #1, #2)
  - [x] Ensure 48px touch targets per UX guidelines (h-12 on buttons, p-4 on interactive rows)
  - [x] Verify mobile-first responsive design (container max-w-md)
  - [x] Verify accessibility (aria-hidden="true" on decorative icons)
  - [x] Visual feedback for sync button states (idle, syncing with spinner, disabled)
  - [x] Consistent Card styling across sections (border rounded-lg bg-muted/30)

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 6.4 OF EPIC 6:** The fourth and final story of Epic 6 (Dashboard & Insights), completing the Settings Page.

**Epic 6 Overview:** Dashboard & Insights - Allow users to visualize their business activity and make better decisions.

**Dependencies:**
- Story 2.4 (User Logout - DONE): LogoutButton component exists
- Story 3.9 (Background Sync Engine - DONE): useSyncEngine, useSyncCount, useToast hooks exist
- Story 4.5 (Market Management - DONE): MarketListClient exists in settings
- Story 6.3 (Sales by Market - DONE): FloatingScanButton, navigation restructuring complete

**Related Stories:**
- Epic 6 Retrospective - Next after this story

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |
| @supabase/ssr | 0.x | Server-side Supabase client for auth |
| lucide-react | latest | Icons (User, RefreshCw, Info, Shield, Mail) |
| tailwindcss | 4.x | Styling with @theme tokens |
| shadcn/ui | latest | Card, Button components |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **useLiveQuery is the single source of truth** for IndexedDB data
- **useState only for ephemeral UI state** (sync button loading)
- **API Response Format:** Not applicable - mostly local operations
- Never call Supabase directly from client components - use API Routes or server components

**From architecture.md:**

- **Feature-based organization:** Components go in `src/components/features/settings/`
- Route groups: `(app)/` for authenticated routes

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

- **Touch Targets:** 48px minimum
- **Loading States:** Skeleton components, spinner for actions
- **Typography:** Inter font, 16px base
- **Interactive Elements:** Buttons need visual feedback for all states

**Settings Page Layout (from epics.md):**
```
┌─────────────────────────────────────────┐
│ ⚙️ Paramètres                           │
├─────────────────────────────────────────┤
│                                         │
│ 👤 Mon compte                           │
│    stephane@example.com                 │
│    [Se déconnecter]                     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ 📍 Mes marchés                          │
│    [Existing MarketListClient]          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ 🔄 Synchronisation                      │
│    ✓ Tout synchronisé                   │
│    ou                                   │
│    ⏳ 3 éléments en attente             │
│    [Synchroniser maintenant]            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ ℹ️ À propos                             │
│    Version 1.0.0                        │
│    ✓ Conforme NF525                     │
│    📧 support@z-scanner.fr              │
│                                         │
└─────────────────────────────────────────┘
```

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**REUSE useSyncEngine Hook (src/hooks/useSyncEngine.ts):**

```typescript
// Story 3.9 established this hook:
export function useSyncEngine() {
  // Returns { syncNow, isSyncing }
  // syncNow() triggers manual sync of all pending items
}
```

**REUSE useSyncCount Hook (src/hooks/useSyncCount.ts):**

```typescript
// Story 3.9 established this hook:
export function useSyncCount() {
  // Returns { pendingCount, isLoading } from syncQueue table
}
```

**REUSE useToast Hook (src/hooks/useToast.ts):**

```typescript
// Story 3.9 established this hook:
export function useToast() {
  // Returns { success, error, info } toast functions
}
```

**EXISTING LogoutButton (src/components/features/auth/LogoutButton.tsx):**

```typescript
// Story 2.4 established this component - DO NOT DUPLICATE
import { LogoutButton } from '@/components/features/auth/LogoutButton';
```

**EXISTING MarketListClient (src/components/features/settings/MarketListClient.tsx):**

```typescript
// Story 4.5 established this component - KEEP AS-IS
import { MarketListClient } from '@/components/features/settings';
```

**EXISTING Settings Page (src/app/(app)/settings/page.tsx):**

```typescript
// Current structure to enhance:
// - Has "Mon compte" section with LogoutButton
// - Has "Mes marchés" section with MarketListClient
// - Missing: user email, Synchronisation, À propos
```

**SHADCN/UI COMPONENTS:**

```typescript
// Already available
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
```

**SUPABASE AUTH CLIENT (src/lib/supabase/client.ts):**

```typescript
// Get user email from Supabase Auth
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
const email = user?.email;
```

### Component Structure

```
src/components/features/settings/
├── AccountSection.tsx          # NEW - Email display
├── AccountSection.test.tsx     # NEW - Tests
├── SyncSection.tsx             # NEW - Sync status and manual sync
├── SyncSection.test.tsx        # NEW - Tests
├── AboutSection.tsx            # NEW - App info
├── AboutSection.test.tsx       # NEW - Tests
├── MarketListClient.tsx        # EXISTING - Keep as-is
├── AddMarketForm.tsx           # EXISTING - Keep as-is
├── EditMarketDialog.tsx        # EXISTING - Keep as-is
├── DeleteMarketDialog.tsx      # EXISTING - Keep as-is
├── index.ts                    # MODIFY - Add new exports

src/app/(app)/settings/
├── page.tsx                    # MODIFY - Integrate new sections
├── page.test.tsx               # MODIFY - Update tests
```

### Testing Strategy

**Unit Tests (co-located):**
- AccountSection: email display, loading state, error state
- SyncSection: sync status display, button states, sync action, toast feedback
- AboutSection: version display, NF525 badge, support link

**Test Mocks:**
```typescript
// Mock Supabase client for AccountSection
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { email: 'test@example.com' } },
      }),
    },
  }),
}));

// Mock sync hooks for SyncSection
vi.mock('@/hooks', () => ({
  useSyncCount: vi.fn(() => ({ pendingCount: 0, isLoading: false })),
  useSyncEngine: vi.fn(() => ({ syncNow: vi.fn(), isSyncing: false })),
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}));

// Mock package.json version for AboutSection
vi.mock('@/../package.json', () => ({
  default: { version: '1.0.0' },
}));
```

### Previous Story Intelligence (Story 6.3)

**Learnings to apply:**
1. TDD approach with pure functions for testability
2. 48px minimum touch targets with min-h-[48px] class
3. Accessibility: aria-labels on buttons, sr-only for screen reader text
4. Loading states with skeletons provide good UX
5. vi.mock pattern for Vitest (not jest.mock)

**Established patterns from Story 6.3:**
- `'use client'` directive for interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Card component with CardHeader, CardTitle, CardContent

### Git Intelligence (Recent Commits)

```
7dde801 feat(story-6-3): Implement Sales by Market feature with unassigned ticket support and analytics page integration
661a786 feat(story-6-2): Implement Sales by Period feature with breakdown and trend analysis
791443f feat(story-6-1): Implement Activity Dashboard with summary card and stats hook
```

**Commit message pattern:**
```
feat(story-6-4): Complete Settings Page with sync status and about sections
```

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - always use Dexie.js via hooks
- useEffect for data fetching - use useLiveQuery or async in useEffect with cleanup
- Skip loading states - always show skeleton/spinner
- Store money as floats - use integer centimes
- Mix naming conventions - camelCase in frontend
- Call Supabase directly from client components for data operations
- Duplicate existing components (LogoutButton, MarketListClient)
- jest.mock - use vi.mock for Vitest

### Project Structure Notes

- Settings components go in `src/components/features/settings/`
- Hooks in `src/hooks/` - reuse existing sync hooks
- Page in `src/app/(app)/settings/`
- Test files co-located with components

### References

- [Source: epics.md#Story-6.4] - Acceptance criteria and user story
- [Source: project-context.md#Technology-Stack] - Tech stack versions
- [Source: architecture.md#Frontend-Architecture] - Component organization
- [Source: src/hooks/useSyncEngine.ts] - Manual sync hook
- [Source: src/hooks/useSyncCount.ts] - Pending sync count hook
- [Source: src/hooks/useToast.ts] - Toast notifications
- [Source: src/components/features/auth/LogoutButton.tsx] - Existing logout component
- [Source: src/components/features/settings/MarketListClient.tsx] - Existing market management
- [Source: src/app/(app)/settings/page.tsx] - Current settings page to enhance

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - All tests passed on first implementation

### Completion Notes List

- Implemented TDD approach throughout: RED (write failing tests) -> GREEN (implement) -> REFACTOR
- Created 27 new tests: 6 AccountSection + 10 SyncSection + 5 AboutSection + 6 page tests
- Total tests in settings features: 41 tests (including existing Market Management tests)
- Full test suite: 1254 tests pass (up from 1229 before story)
- Used existing hooks from Story 3.9: useSyncEngine, useToast (single source of truth)
- Used existing LogoutButton from Story 2.4 (not duplicated)
- Used existing MarketListClient from Story 4.5 (not duplicated)
- App version read from package.json at build time
- 48px touch targets on all interactive elements (h-12 on buttons)
- Accessibility: aria-hidden="true" on all decorative icons
- Responsive design with container max-w-md for mobile-first

### File List

| File | Action |
|------|--------|
| src/components/features/settings/AccountSection.tsx | NEW |
| src/components/features/settings/AccountSection.test.tsx | NEW |
| src/components/features/settings/SyncSection.tsx | NEW |
| src/components/features/settings/SyncSection.test.tsx | NEW |
| src/components/features/settings/AboutSection.tsx | NEW |
| src/components/features/settings/AboutSection.test.tsx | NEW |
| src/components/features/settings/index.ts | MODIFIED - Add new exports |
| src/app/(app)/settings/page.tsx | MODIFIED - Integrate all sections |
| src/app/(app)/settings/page.test.tsx | MODIFIED - Update tests |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Story created with comprehensive context from Epic 6 intelligence, existing settings page analysis, and sync infrastructure review | Claude Opus 4.5 |
| 2026-01-27 | Implementation complete: AccountSection (6 tests), SyncSection (10 tests), AboutSection (5 tests), page integration (6 tests), barrel export updated | Claude Opus 4.5 |
| 2026-01-28 | **Code Review Complete** - Fixed 3 HIGH issues: (1) AccountSection memory leak via useEffect cleanup, (2) SyncSection dual source of truth removed (now uses only useSyncEngine.pendingCount), (3) AC #2 timestamp scope documented. Fixed 2 MEDIUM issues: (4) AboutSection support link now has aria-label for accessibility, (5) SyncSection tests cleaned up to match single-source implementation. All 41 tests pass. Status → done | Claude Opus 4.5 |
