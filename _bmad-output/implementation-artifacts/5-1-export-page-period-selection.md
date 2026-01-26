# Story 5.1: Export Page & Period Selection

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to select a date range for exporting my tickets**,
So that **I can prepare data for my accountant** (FR24).

## Acceptance Criteria

1. **Given** I navigate to /export (Export tab)
   **When** the page loads
   **Then** a date range picker is displayed
   **And** quick presets are available: "Ce mois", "Mois dernier", "Ce trimestre", "Trimestre dernier", "Cette année"
   **And** custom date range selection is available
   **And** the number of tickets in the selected period is shown

2. **Given** no tickets exist in the selected period
   **When** the preview updates
   **Then** a message indicates "Aucun ticket pour cette période"
   **And** the export button is disabled

## Tasks / Subtasks

- [x] **Task 1: Create ExportPageClient Component** (AC: #1)
  - [x] Create `src/app/(app)/export/ExportPageClient.tsx`
  - [x] 'use client' directive for interactivity
  - [x] State for selected date range: `startDate`, `endDate`
  - [x] State for selected preset (for UI highlighting)
  - [x] Default to "Ce mois" preset on load
  - [x] Display ticket count and total amount for selected period
  - [x] Write unit tests (render, preset selection, date display)

- [x] **Task 2: Create PeriodSelector Component** (AC: #1)
  - [x] Create `src/components/features/export/PeriodSelector.tsx`
  - [x] Quick preset buttons: "Ce mois", "Mois dernier", "Ce trimestre", "Trimestre dernier", "Cette année"
  - [x] Custom date range inputs (native date inputs for mobile)
  - [x] Highlight active preset
  - [x] Validation error for invalid date range
  - [x] Write unit tests (render, preset click, custom range, validation)

- [x] **Task 3: Create useExportPreview Hook** (AC: #1, #2)
  - [x] Create `src/hooks/useExportPreview.ts`
  - [x] Uses useLiveQuery to count tickets in date range
  - [x] Returns `{ ticketCount, totalAmount, isLoading }`
  - [x] Filters by date range using Dexie where clause
  - [x] Excludes cancelled tickets from total (counts all tickets)
  - [x] Write unit tests

- [x] **Task 4: Create ExportPreviewCard Component** (AC: #1, #2)
  - [x] Create `src/components/features/export/ExportPreviewCard.tsx`
  - [x] Shows: "X tickets", "Total: XX,XX €", period summary
  - [x] Loading skeleton while computing
  - [x] Empty state: "Aucun ticket pour cette période"
  - [x] Write unit tests

- [x] **Task 5: Update Export Page Server Component** (AC: #1)
  - [x] Modify `src/app/(app)/export/page.tsx`
  - [x] Replace placeholder with ExportPageClient
  - [x] Keep metadata and SEO

- [x] **Task 6: Export Components and Hooks** (AC: all)
  - [x] Create `src/components/features/export/index.ts` barrel export
  - [x] Export useExportPreview from `src/hooks/index.ts`

- [x] **Task 7: Create date-ranges utility module** (supporting)
  - [x] Create `src/lib/utils/date-ranges.ts`
  - [x] Implement getThisMonth, getLastMonth, getThisQuarter, getLastQuarter, getThisYear
  - [x] Write unit tests with timezone handling

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 5.1 OF EPIC 5:** The first story of Epic 5 (Export Comptable), initiating the CSV export feature set.

**Epic 5 Overview:** Export Comptable - Allow users to export their tickets as CSV for their accountant.

**Dependencies:**
- Story 3.1 (Dexie Schema - DONE): Tickets table with date fields
- Story 4.3 (Filter by Date - DONE): DateRangeFilter component with preset logic (REUSE!)
- No external dependencies - this is a self-contained UI-only story

**Related Stories:**
- Story 5.2 (CSV Export Generation) - Will use the date range from this story
- Story 5.3 (File Download) - Will trigger download of generated CSV

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |
| dexie | 4.x | IndexedDB queries |
| dexie-react-hooks | 1.x | useLiveQuery for reactive ticket count |
| lucide-react | latest | Icons (Download, Calendar, FileText) |
| tailwindcss | 4.x | Styling with @theme tokens |
| shadcn/ui | latest | Button, Card components |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **useLiveQuery is the single source of truth** for IndexedDB data
- **useState only for ephemeral UI state** (date range selection, preset highlight)
- **Data Formats:** Dates in UI use dd/MM/yyyy, Money as integer centimes

**From architecture.md:**

- **Offline-First:** Export page must work offline using local IndexedDB data
- **API Routes for business logic:** CSV generation will be in Story 5.2

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

- **Touch Targets:** 48px minimum for buttons
- **Quick Presets:** Reduces cognitive load for common periods
- **Clear Feedback:** Show ticket count immediately when period changes
- **Mobile-First:** Native date inputs work well on mobile

**Export Page UI Pattern:**
```
┌─────────────────────────────────────────┐
│ Export Comptable                        │
├─────────────────────────────────────────┤
│                                         │
│ Sélectionnez une période                │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Ce mois    │ Mois dernier │ Ce trim │ │
│ │ Trim. der. │ Cette année            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Ou période personnalisée :              │
│ ┌─────────────┐  ┌─────────────┐       │
│ │ 01/01/2026  │→ │ 31/01/2026  │       │
│ └─────────────┘  └─────────────┘       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📊 Aperçu de l'export               │ │
│ │                                     │ │
│ │    15 tickets                       │ │
│ │    Total: 1 234,50 €                │ │
│ │    Du 01/01/2026 au 31/01/2026      │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │        Exporter en CSV              │ │
│ └─────────────────────────────────────┘ │
│ (disabled until Story 5.2)              │
└─────────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────────┐
│ 📊 Aperçu de l'export                   │
│                                         │
│    Aucun ticket pour cette période      │
│    Sélectionnez une autre période       │
│                                         │
└─────────────────────────────────────────┘
```

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**REUSE DateRangeFilter helpers (src/components/features/tickets/DateRangeFilter.tsx):**

```typescript
// Already implemented! Copy/adapt these helper functions:
function getThisWeek(): { start: string; end: string }
function getThisMonth(): { start: string; end: string }
function getThisQuarter(): { start: string; end: string }

// Add new helpers for export presets:
function getLastMonth(): { start: string; end: string }
function getLastQuarter(): { start: string; end: string }
function getThisYear(): { start: string; end: string }
```

**EXISTING TICKET HOOKS (src/hooks/useTickets.ts):**

```typescript
// useTickets hook - can query by user and date range
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

// For export preview, query tickets in date range:
const tickets = useLiveQuery(
  async () => {
    return db.tickets
      .where('impressionDate')
      .between(startDate, endDate, true, true)
      .and(t => t.userId === userId)
      .toArray();
  },
  [startDate, endDate, userId]
);
```

**FORMAT UTILITIES (src/lib/utils/format.ts):**

```typescript
// Already implemented:
export function formatCurrency(centimes: number): string // "12,50 €"
export function formatDate(isoDate: string): string // "26/01/2026"
```

**SHADCN/UI COMPONENTS:**

```typescript
// Already available
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

### Component Structure

```
src/app/(app)/export/
├── page.tsx                    # MODIFY - Add ExportPageClient
├── ExportPageClient.tsx        # NEW - Client component with state
├── ExportPageClient.test.tsx   # NEW - Tests

src/components/features/export/
├── PeriodSelector.tsx          # NEW - Preset buttons + custom range
├── PeriodSelector.test.tsx     # NEW - Tests
├── ExportPreviewCard.tsx       # NEW - Preview with count/total
├── ExportPreviewCard.test.tsx  # NEW - Tests
├── index.ts                    # NEW - Barrel export

src/hooks/
├── useExportPreview.ts         # NEW - Query for export preview
├── useExportPreview.test.ts    # NEW - Tests
├── index.ts                    # MODIFY - Export useExportPreview
```

### Date Range Utility Functions (to create)

```typescript
// src/lib/utils/date-ranges.ts

/**
 * Get date ranges for export presets
 * All functions return { start: string, end: string } in YYYY-MM-DD format
 */

export function getThisMonth(): DateRange { ... } // Copy from DateRangeFilter
export function getLastMonth(): DateRange { ... }
export function getThisQuarter(): DateRange { ... } // Copy from DateRangeFilter
export function getLastQuarter(): DateRange { ... }
export function getThisYear(): DateRange { ... }

export type ExportPreset =
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-year'
  | 'custom';

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}
```

### Testing Strategy

**Unit Tests (co-located):**
- PeriodSelector: renders all presets, click selects, highlights active, custom range inputs work
- ExportPreviewCard: shows count/total, loading skeleton, empty state
- useExportPreview: returns correct count, handles date range changes, handles empty result
- ExportPageClient: integrates all components, default preset selected

**Test Mocks:**
```typescript
// Mock Dexie
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      where: vi.fn(() => ({
        between: vi.fn(() => ({
          and: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([]),
            count: vi.fn().mockResolvedValue(0),
          })),
        })),
      })),
    },
  },
}));

// Mock useLiveQuery
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((fn) => {
    // Return mock data based on test scenario
  }),
}));
```

### Previous Story Intelligence (Story 4.7)

**Learnings to apply:**
1. Sheet pattern works well for mobile but for export we use a full page layout
2. Loading states are essential - show skeleton while computing
3. Clear feedback when no data (empty state)
4. Button disabled states with clear messaging

**Established patterns from Epic 4:**
- `'use client'` directive for interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Test mocking pattern for hooks and Dexie

### Git Intelligence (Recent Commits)

```
c107ec2 feat(story-4-7): Implement NF525-compliant ticket cancellation with CancellationDialog and useCancelTicket hook
3562689 feat(story-4-6): Implement Market Assignment in Verification Form
a7150d2 feat(story-4-5): Implement Market Management (CRUD)
8389ea7 feat(story-4-4): Implement Market Filtering for Ticket List with URL Persistence
768c2ed feat(story-4-3): Implement Date Filtering for Ticket List with URL Persistence
```

**Commit message pattern:**
```
feat(story-5-1): Implement Export Page with Period Selection and Preview
```

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - always use Dexie.js
- useEffect for data fetching - use useLiveQuery
- Hard-coded date formats - use format utilities
- Skip loading states - always show skeleton
- Ignore empty states - show clear message
- Mix naming conventions - camelCase in frontend, snake_case in DB/API

### References

- [Source: epics.md#Story-5.1] - Acceptance criteria and user story
- [Source: project-context.md#Data-Formats] - Date and money formatting
- [Source: src/components/features/tickets/DateRangeFilter.tsx] - Date range helpers to reuse
- [Source: src/lib/utils/format.ts] - formatCurrency, formatDate utilities
- [Source: src/hooks/useTickets.ts] - useLiveQuery pattern for tickets

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Fixed timezone issues in date-ranges utility by using local date formatting instead of toISOString()
- Fixed ExportPageClient tests timeout by replacing vi.useFakeTimers with act() pattern for async state updates

### Completion Notes List

1. Created date-ranges utility module with all export preset functions
2. Implemented useExportPreview hook with useLiveQuery for reactive data
3. Created PeriodSelector component with preset buttons and custom date inputs
4. Created ExportPreviewCard component with loading and empty states
5. Created ExportPageClient component managing all state and composition
6. Updated export page server component with new layout and client component
7. Created barrel exports for components and hooks
8. All 51 Story 5.1 tests passing, 1011 total tests passing

### File List

**New Files:**
- `src/lib/utils/date-ranges.ts` - Date range utility functions
- `src/lib/utils/date-ranges.test.ts` - Unit tests (15 tests)
- `src/hooks/useExportPreview.ts` - Export preview hook
- `src/hooks/useExportPreview.test.ts` - Unit tests (5 tests)
- `src/components/features/export/PeriodSelector.tsx` - Period selection UI
- `src/components/features/export/PeriodSelector.test.tsx` - Unit tests (12 tests)
- `src/components/features/export/ExportPreviewCard.tsx` - Preview card
- `src/components/features/export/ExportPreviewCard.test.tsx` - Unit tests (8 tests)
- `src/components/features/export/index.ts` - Barrel export
- `src/app/(app)/export/ExportPageClient.tsx` - Client component
- `src/app/(app)/export/ExportPageClient.test.tsx` - Unit tests (11 tests)

**Modified Files:**
- `src/app/(app)/export/page.tsx` - Updated with ExportPageClient
- `src/hooks/index.ts` - Added useExportPreview export

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-26 | Story created - comprehensive context for Export Page with Period Selection | Claude Opus 4.5 |
| 2026-01-26 | Story implemented - all 6 tasks completed, 51 tests passing | Claude Opus 4.5 |
