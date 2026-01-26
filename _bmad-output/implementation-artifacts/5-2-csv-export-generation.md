# Story 5.2: CSV Export Generation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to export my tickets as a CSV file**,
So that **my accountant can import them into their software** (FR23).

## Acceptance Criteria

1. **Given** I have selected a valid date range with tickets
   **When** I tap "Exporter CSV"
   **Then** a CSV file is generated containing all tickets in the period
   **And** CSV columns include: date, montant_ttc, mode_reglement, numero_ticket, marche, statut, hash, validated_at
   **And** amounts are formatted in euros with 2 decimals (e.g., "12,50")
   **And** dates are formatted as dd/MM/yyyy
   **And** cancelled tickets are included with status "Annulé"

## Tasks / Subtasks

- [x] **Task 1: Create useExportTickets Hook** (AC: #1)
  - [x] Create `src/hooks/useExportTickets.ts`
  - [x] Query tickets in date range using useLiveQuery
  - [x] Filter by userId and date range (impressionDate)
  - [x] Include all ticket statuses (validated and cancelled)
  - [x] Return tickets with market names resolved
  - [x] Write unit tests

- [x] **Task 2: Create CSV Generation Utility** (AC: #1)
  - [x] Create `src/lib/utils/csv.ts`
  - [x] Create `generateCsv(tickets: ExportTicket[]): string` function
  - [x] Define CSV columns: date, montant_ttc, mode_reglement, numero_ticket, marche, statut, hash, validated_at
  - [x] Format amounts as euros with comma decimal (12,50)
  - [x] Format dates as dd/MM/yyyy
  - [x] Handle special characters (escape quotes, semicolons)
  - [x] Use semicolon delimiter (French Excel compatible)
  - [x] Add UTF-8 BOM for Excel compatibility
  - [x] Write unit tests

- [x] **Task 3: Create useGenerateExport Hook** (AC: #1)
  - [x] Create `src/hooks/useGenerateExport.ts`
  - [x] Combine useExportTickets + CSV generation
  - [x] Return `{ generateCsv, isGenerating, error }`
  - [x] Handle empty ticket case gracefully
  - [x] Write unit tests

- [x] **Task 4: Update ExportPageClient with CSV Generation** (AC: #1)
  - [x] Import useGenerateExport hook
  - [x] Wire export button to generate CSV
  - [x] Show loading state during generation
  - [x] Pass generated CSV blob to download handler (Story 5.3)
  - [x] Write integration tests

- [x] **Task 5: Export Hooks from Barrel** (AC: all)
  - [x] Export useExportTickets from `src/hooks/index.ts`
  - [x] Export useGenerateExport from `src/hooks/index.ts`

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 5.2 OF EPIC 5:** The second story of Epic 5 (Export Comptable), implementing CSV file generation.

**Epic 5 Overview:** Export Comptable - Allow users to export their tickets as CSV for their accountant.

**Dependencies:**
- Story 5.1 (Export Page & Period Selection - DONE): ExportPageClient, useExportPreview, date-ranges utilities
- Story 3.1 (Dexie Schema - DONE): Tickets and Markets tables
- Story 4.5 (Market Management - DONE): Markets CRUD for resolving market names

**Related Stories:**
- Story 5.3 (File Download) - Will use the CSV string from this story to trigger download

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |
| dexie | 4.x | IndexedDB queries |
| dexie-react-hooks | 1.x | useLiveQuery for reactive ticket data |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **useLiveQuery is the single source of truth** for IndexedDB data
- **Data Formats:**
  - Dates in JSON: ISO 8601
  - Dates in UI/Export: dd/MM/yyyy
  - Money as integer centimes (1250 = 12,50€)

**From architecture.md:**

- **Offline-First:** CSV generation must work offline using local IndexedDB data
- **No API Routes needed:** This is client-side CSV generation

### CSV Format Specification (MANDATORY)

**CSV Columns (in order):**

| Column | Source Field | Format | Example |
|--------|-------------|--------|---------|
| date | impressionDate | dd/MM/yyyy | 26/01/2026 |
| montant_ttc | total | euros, 2 decimals, comma | 12,50 |
| mode_reglement | payments[0].mode | string | CB |
| numero_ticket | ticketNumber | integer | 1234 |
| marche | market.name | string or empty | Marché de Rungis |
| statut | status | Validé/Annulé | Validé |
| hash | dataHash | string | abc123... |
| validated_at | validatedAt | dd/MM/yyyy HH:mm | 26/01/2026 14:30 |

**CSV Format Rules:**
- **Delimiter:** Semicolon (`;`) - French Excel default
- **Encoding:** UTF-8 with BOM (`\uFEFF` prefix)
- **Line endings:** CRLF (`\r\n`) for Windows compatibility
- **Quote escaping:** Double quotes for fields containing semicolons or quotes
- **Header row:** Required, using column names above

**Example CSV Output:**
```csv
date;montant_ttc;mode_reglement;numero_ticket;marche;statut;hash;validated_at
26/01/2026;125,50;CB;1234;Marché de Rungis;Validé;abc123...;26/01/2026 14:30
25/01/2026;45,00;Espèces;1233;;Validé;def456...;25/01/2026 10:15
24/01/2026;80,25;CB;1232;Marché du Dimanche;Annulé;ghi789...;24/01/2026 09:00
```

### Type Definitions for Export

```typescript
// src/types/export.ts (NEW)

import type { Ticket } from './ticket';
import type { Market } from './market';

/**
 * Ticket data formatted for CSV export
 * Joins ticket data with market name
 */
export interface ExportTicket {
  /** Impression date (YYYY-MM-DD) */
  date: string;
  /** Total amount in centimes */
  montantTtc: number;
  /** Primary payment mode (first payment) */
  modeReglement: string;
  /** Ticket number */
  numeroTicket: number;
  /** Market name (resolved from marketId) or empty string */
  marche: string;
  /** Ticket status: 'Validé' or 'Annulé' */
  statut: 'Validé' | 'Annulé';
  /** SHA-256 hash for NF525 */
  hash: string;
  /** Validation timestamp (ISO 8601) */
  validatedAt: string;
}

/**
 * Result from useExportTickets hook
 */
export interface UseExportTicketsResult {
  tickets: ExportTicket[];
  isLoading: boolean;
}

/**
 * Result from useGenerateExport hook
 */
export interface UseGenerateExportResult {
  /** Generate CSV string for the selected period */
  generateCsv: () => string | null;
  /** Whether CSV is currently being generated */
  isGenerating: boolean;
  /** Error message if generation failed */
  error: string | null;
}
```

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**EXISTING FORMAT UTILITIES (src/lib/utils/format.ts):**

```typescript
// Already implemented:
export function formatDate(isoDate: string): string // "26/01/2026"
export function formatDateTime(isoDate: string): string // "26/01/2026 14:30"
export function formatCurrency(centimes: number): string // "12,50 €"
```

**NOTE:** For CSV export, create a separate `formatCurrencyForCsv(centimes: number): string` that returns "12,50" WITHOUT the € symbol.

**EXISTING DATE UTILITIES (src/lib/utils/date-ranges.ts):**

Already available from Story 5.1 - no changes needed.

**EXISTING HOOKS (src/hooks/):**

```typescript
// useExportPreview.ts - Already counts tickets in date range
// useTickets.ts - Query patterns to follow
// useMarkets.ts - For resolving market names
```

**EXISTING TYPES (src/types/ticket.ts):**

```typescript
interface Ticket {
  id?: number;
  dataHash: string;
  userId: string;
  marketId?: number;
  status: TicketStatus; // 'draft' | 'validated' | 'cancelled'
  impressionDate: string;
  ticketNumber: number;
  payments: Payment[];
  total: number;
  validatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}
```

### Component Structure

```
src/hooks/
├── useExportTickets.ts         # NEW - Query tickets for export
├── useExportTickets.test.ts    # NEW - Tests
├── useGenerateExport.ts        # NEW - CSV generation hook
├── useGenerateExport.test.ts   # NEW - Tests
├── index.ts                    # MODIFY - Export new hooks

src/lib/utils/
├── csv.ts                      # NEW - CSV generation utility
├── csv.test.ts                 # NEW - Tests

src/types/
├── export.ts                   # NEW - Export type definitions
├── index.ts                    # MODIFY - Export new types

src/app/(app)/export/
├── ExportPageClient.tsx        # MODIFY - Wire export button
├── ExportPageClient.test.tsx   # MODIFY - Add export tests
```

### Testing Strategy

**Unit Tests (co-located):**

- `csv.test.ts`:
  - Generates correct CSV header
  - Formats amounts without € symbol
  - Formats dates as dd/MM/yyyy
  - Handles empty payments array (mode_reglement empty)
  - Escapes semicolons and quotes in market names
  - Includes UTF-8 BOM
  - Uses CRLF line endings
  - Maps status to French (Validé/Annulé)

- `useExportTickets.test.ts`:
  - Returns tickets in date range only
  - Resolves market names from marketId
  - Returns empty string for tickets without market
  - Handles loading state
  - Includes both validated and cancelled tickets

- `useGenerateExport.test.ts`:
  - Returns null when no tickets
  - Returns CSV string when tickets exist
  - Shows loading state during generation
  - Handles errors gracefully

**Test Mocks:**
```typescript
// Mock useLiveQuery
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    tickets: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
    },
    markets: {
      get: vi.fn(),
    },
  },
}));
```

### Previous Story Intelligence (Story 5.1)

**Learnings to apply:**
1. useLiveQuery pattern for reactive ticket queries (copy from useExportPreview)
2. Filter by `impressionDate` field (not `createdAt`)
3. Only export validated and cancelled tickets (not drafts)
4. Timezone-safe date formatting (use formatLocalDate pattern from date-ranges.ts)

**Established patterns from Story 5.1:**
- `'use client'` directive for hooks
- Test mocking pattern for useLiveQuery
- act() pattern for async state updates in tests

### Git Intelligence (Recent Commits)

```
4a1dfeb feat(story-5-1): Implement Export Page with Period Selection and Preview functionality
c107ec2 feat(story-4-7): Implement NF525-compliant ticket cancellation with CancellationDialog and useCancelTicket hook
3562689 feat(story-4-6): Implement Market Assignment in Verification Form
a7150d2 feat(story-4-5): Implement Market Management (CRUD)
```

**Commit message pattern:**
```
feat(story-5-2): Implement CSV Export Generation with French-compatible format
```

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - always use Dexie.js
- useEffect for data fetching - use useLiveQuery
- Hard-coded date formats - use format utilities
- Float arithmetic for money - use integer centimes
- Mix CSV delimiter formats - always use semicolon
- Skip UTF-8 BOM - French Excel requires it
- Include draft tickets in export - only validated/cancelled
- Format amounts with € symbol in CSV - just numbers

### References

- [Source: epics.md#Story-5.2] - Acceptance criteria and user story
- [Source: project-context.md#Data-Formats] - Date and money formatting
- [Source: src/lib/utils/format.ts] - Existing format utilities
- [Source: src/types/ticket.ts] - Ticket type definition
- [Source: src/hooks/useExportPreview.ts] - Query pattern to follow

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

None - all tests passed on first run.

### Completion Notes List

1. **Task 1 - useExportTickets Hook**: Created hook using useLiveQuery pattern from useExportPreview. Filters tickets by userId, date range, and status (validated/cancelled only). Resolves market names from marketId via db.markets.get(). 7 unit tests passing.

2. **Task 2 - CSV Generation Utility**: Created `csv.ts` with French Excel compatibility:
   - Semicolon delimiter (`;`)
   - UTF-8 BOM (`\uFEFF`)
   - CRLF line endings (`\r\n`)
   - Currency formatting with comma decimal (e.g., "12,50")
   - Proper quote escaping for fields with special characters
   - 27 unit tests passing

3. **Task 3 - useGenerateExport Hook**: Combined useExportTickets + generateCsv with error handling. Returns `{ generateCsv, isGenerating, error }`. 7 unit tests passing.

4. **Task 4 - ExportPageClient Integration**: Wired export button to generate CSV. Shows loading spinner during generation. Stores CSV in `window.__pendingCsvExport` and dispatches `csvExportReady` event for Story 5.3. 17 tests passing (11 existing + 6 new).

5. **Task 5 - Barrel Exports**: Exported useExportTickets and useGenerateExport from `src/hooks/index.ts`. Exported export types from `src/types/index.ts`.

**Total: 58 tests for Story 5.2, all passing.**

### File List

**New Files:**
- `src/types/export.ts` - Export type definitions (ExportTicket, UseExportTicketsResult, UseGenerateExportResult)
- `src/lib/utils/csv.ts` - CSV generation utility with French Excel compatibility
- `src/lib/utils/csv.test.ts` - 27 unit tests for CSV utility
- `src/hooks/useExportTickets.ts` - Hook to query tickets for export with market names
- `src/hooks/useExportTickets.test.ts` - 7 unit tests for useExportTickets
- `src/hooks/useGenerateExport.ts` - Hook combining ticket query and CSV generation
- `src/hooks/useGenerateExport.test.ts` - 7 unit tests for useGenerateExport

**Modified Files:**
- `src/types/index.ts` - Added export types
- `src/hooks/index.ts` - Added useExportTickets and useGenerateExport exports
- `src/app/(app)/export/ExportPageClient.tsx` - Integrated CSV generation with export button
- `src/app/(app)/export/ExportPageClient.test.tsx` - Added 6 new tests for CSV generation

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-26 | Story created - comprehensive context for CSV Export Generation | Claude Opus 4.5 |
| 2026-01-26 | Implemented all 5 tasks - CSV generation with French Excel compatibility, 58 tests passing | Claude Opus 4.5 |
| 2026-01-26 | Code review fixes: (1) Removed non-breaking space from thousands separator for CSV compatibility, (2) Added cancelledAt fallback for cancelled tickets, (3) Made datetime tests timezone-agnostic, (4) Added chronological sorting by impressionDate | Claude Opus 4.5 |
