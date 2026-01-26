# Story 4.6: Assign Ticket to Market

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to assign a ticket to a market during verification**,
So that **I can track sales by location** (FR21).

## Acceptance Criteria

1. **Given** I am on the verification screen (before validation)
   **When** the form loads
   **Then** a "Marché" field is displayed in the form
   **And** the field shows "Aucun marché" if no market is selected
   **And** the field is optional (empty is allowed)

2. **Given** I tap on the "Marché" field
   **When** the market picker opens
   **Then** a Sheet/Drawer displays my list of existing markets
   **And** markets are sorted alphabetically by name
   **And** I can see an option to add a new market ("+ Ajouter un marché")
   **And** I can select a market or leave empty

3. **Given** I select a market from the picker
   **When** the selection is made
   **Then** the picker closes
   **And** the selected market name is displayed in the form field
   **And** the marketId is stored in the form state

4. **Given** I tap "+ Ajouter un marché" in the picker
   **When** the quick-add form opens
   **Then** I can enter a market name
   **And** on save, the market is created via `addMarket()` + `queueCreate('market', ...)`
   **And** the new market is automatically selected
   **And** the picker closes

5. **Given** I validate a ticket with a market assigned
   **When** the ticket is saved to Dexie
   **Then** the `marketId` field is stored with the ticket
   **And** the ticket appears when filtering by that market (Story 4.4)

6. **Given** I validate a ticket without a market
   **When** the ticket is saved
   **Then** the `marketId` field is `undefined`
   **And** the ticket appears in "Non assigné" when filtering

## Tasks / Subtasks

- [x] **Task 1: Create MarketPicker Component** (AC: #2, #3)
  - [x] Create `src/components/features/scanner/MarketPicker.tsx`
  - [x] Sheet-based picker (bottom slide up) for mobile UX
  - [x] List markets using `useMarkets(userId)` hook
  - [x] Display markets sorted by name with MapPin icon
  - [x] "Aucun marché" option at top to deselect
  - [x] Selected market has checkmark indicator
  - [x] Close on selection
  - [x] Write unit tests (5 tests: render, list markets, select, deselect, close)

- [x] **Task 2: Add Quick-Create Market Feature** (AC: #4)
  - [x] Add inline form in MarketPicker for quick market creation
  - [x] Text input + "Ajouter" button
  - [x] Call `addMarket()` + `queueCreate('market', ...)` on submit
  - [x] Auto-select newly created market
  - [x] Show loading state during creation
  - [x] Write unit tests (3 tests: render form, create market, auto-select)

- [x] **Task 3: Create MarketField Component** (AC: #1)
  - [x] Create `src/components/features/scanner/MarketField.tsx`
  - [x] Display button that shows selected market name or "Aucun marché"
  - [x] MapPin icon prefix
  - [x] Chevron indicator for picker
  - [x] Click opens MarketPicker
  - [x] Write unit tests (3 tests: render empty, render selected, open picker)

- [x] **Task 4: Integrate MarketField into VerificationForm** (AC: #1, #5, #6)
  - [x] Add `marketId` field to `TicketVerificationSchema` (optional number)
  - [x] Add MarketField to VerificationForm component
  - [x] Position after payments section, before total
  - [x] Pass userId to MarketField for useMarkets hook
  - [x] Wire up form Controller for marketId
  - [x] Update unit tests for VerificationForm

- [x] **Task 5: Update useVerification Hook** (AC: #5, #6)
  - [x] Include `marketId` in ticketFormValues mapping
  - [x] Ensure marketId is included in updateTicket save
  - [x] Update type definitions if needed
  - [x] Write unit tests (2 tests: load market, save market)

- [x] **Task 6: Update Ticket Validation** (AC: #5)
  - [x] Ensure `validateTicket` in useTicketValidation includes marketId
  - [x] Verify syncQueue payload includes marketId for ticket sync
  - [x] Update tests if needed

- [x] **Task 7: Update Barrel Exports** (AC: all)
  - [x] Export MarketPicker, MarketField from `src/components/features/scanner/index.ts`

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 4.6 OF EPIC 4:** Completing the market → ticket association cycle started in Stories 4.4 and 4.5.

**Epic 4 Overview:** Gestion des Tickets & Marchés - Views, filters, and management of tickets and markets.

**Dependencies:**
- Story 3.4 (Verification Screen - DONE): VerificationForm where MarketField will be added
- Story 3.6 (Ticket Validation - DONE): useTicketValidation hook to update with marketId
- Story 4.4 (Filter by Market - DONE): Filtering by marketId already works
- Story 4.5 (Market Management CRUD - DONE): `useMarkets`, `addMarket`, `queueCreate` all exist

**Completing the Feature Cycle:**
```
Story 4.5: Create markets → Story 4.6: Assign to tickets → Story 4.4: Filter by market
     ↓                              ↓                              ↓
 Settings page            Verification screen              Tickets list page
```

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |
| react-hook-form | latest | Form state management (already used in VerificationForm) |
| dexie-react-hooks | 1.x | useLiveQuery for reactive market list |
| lucide-react | latest | Icons (MapPin, Check, ChevronRight, Plus) |
| tailwindcss | 4.x | Styling with @theme tokens |
| shadcn/ui | latest | Sheet, Button, Input, Label |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **Data Source:** useLiveQuery is THE SINGLE SOURCE OF TRUTH for IndexedDB data
- **NF525 Compliance:** marketId is stored with ticket, part of the immutable record
- **Offline-First:** Market selection works offline (markets cached in IndexedDB)
- **Error Handling:** Hooks return `{ data, error, isLoading }` pattern
- **Loading States:** Skeleton for lists, Spinner for actions

**From architecture.md:**

- **State Management:** useLiveQuery for reactive data
- **Naming:** Components PascalCase, hooks camelCase with `use` prefix
- **Feature Components:** Place in `src/components/features/scanner/`
- **Form Integration:** Use React Hook Form Controller for marketId

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

- **Touch Target:** 48px minimum for all interactive elements
- **One-Hand Use:** Sheet from bottom for picker (thumb zone)
- **Simple Language:** "Marché", "Ajouter un marché", no jargon
- **Immediate Feedback:** Selected market shows instantly in form

**Market Field UI Pattern:**
```
┌─────────────────────────────────────────┐
│ Form Field                              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📍 Marché Bastille              [>] │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ or (if no market selected):             │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📍 Aucun marché                 [>] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Market Picker Sheet:
┌─────────────────────────────────────────┐
│ Sélectionner un marché            [X]  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Aucun marché                    [✓] │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📍 Marché Aligre                    │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📍 Marché Bastille                  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ + Ajouter un marché                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [__Nom du marché___] [Ajouter]      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**EXISTING HOOKS (src/hooks/useMarkets.ts) - REUSE ALL:**

```typescript
// REACTIVE QUERIES
export function useMarkets(userId: string) { ... }      // Get active markets list

// CRUD OPERATIONS
export async function addMarket(market: Omit<Market, 'id'>): Promise<number> { ... }
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
import { Sheet, SheetContent, SheetTitle, SheetClose, SheetHeader } from '@/components/ui/sheet';
```

**VERIFICATION FORM (src/components/features/scanner/VerificationForm.tsx):**

```typescript
// Add MarketField after PaymentEditor section
// Use Controller from react-hook-form for marketId field
<Controller
  name="marketId"
  control={control}
  render={({ field }) => (
    <MarketField
      value={field.value}
      onChange={field.onChange}
      userId={userId}
    />
  )}
/>
```

**VERIFICATION HOOK (src/hooks/useVerification.ts):**

```typescript
// Add marketId to ticketFormValues mapping
const ticketFormValues = useMemo(() => {
  if (!ticket) return undefined;
  return {
    // ... existing fields ...
    marketId: ticket.marketId, // Add this line
  };
}, [ticket]);
```

**TICKET VALIDATION (src/hooks/useTicketValidation.ts):**

```typescript
// Ensure marketId is included when saving the ticket
// The marketId should come from the form values
await db.tickets.update(ticketId, {
  // ... existing fields ...
  marketId: formData.marketId, // Add this line
});
```

### Database Schema Reference

```typescript
// src/types/ticket.ts - marketId field already exists!
interface Ticket {
  // ...
  /** Optional foreign key to markets table */
  marketId?: number;
  // ...
}

// src/types/market.ts
interface Market {
  id?: number;           // Auto-increment PK
  name: string;          // Market name
  userId: string;        // Owner's Supabase UID
  createdAt: string;     // ISO 8601 timestamp
  deletedAt?: string;    // Soft-delete timestamp (NF525)
}
```

### Validation Schema Update

```typescript
// src/lib/validation/ticket.ts - Add marketId field
export const TicketVerificationSchema = z.object({
  // ... existing fields ...
  marketId: z.number().optional(), // Add this field
});

export interface TicketVerificationForm {
  // ... existing fields ...
  marketId?: number; // Add this field
}
```

### Component Structure

```
src/components/features/scanner/
├── MarketPicker.tsx         # Sheet picker with market list + quick-add
├── MarketPicker.test.tsx    # 8 tests
├── MarketField.tsx          # Form field button that opens picker
├── MarketField.test.tsx     # 3 tests
├── VerificationForm.tsx     # MODIFIED - Add MarketField
├── VerificationForm.test.tsx # UPDATE tests
└── index.ts                 # Barrel exports - ADD new components
```

### Testing Strategy

**Unit Tests (co-located):**
- MarketPicker: render, list markets, select market, deselect, close, quick-add form, create market, auto-select
- MarketField: render empty, render with selection, open picker on click

**Test Mocks:**
```typescript
// Mock all hooks from barrel
vi.mock('@/hooks', () => ({
  useMarkets: vi.fn(() => ({ markets: [], isLoading: false })),
  addMarket: vi.fn(() => Promise.resolve(1)),
  queueCreate: vi.fn(() => Promise.resolve(1)),
}));

// Mock Supabase for auth
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: vi.fn() },
  }),
}));
```

### Previous Story Intelligence (Story 4.5)

**Learnings to apply:**
1. `useMarkets` hook works correctly - confirmed in MarketFilter and Settings usage
2. Sheet pattern for bottom-sheet UIs on mobile (from EditMarketDialog)
3. 48px touch targets for buttons (min 32px for secondary actions)
4. Form validation: trim inputs, reject empty strings
5. `addMarket()` + `queueCreate()` pattern for offline-first sync

**Established patterns:**
- `'use client'` directive for interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Sheet with custom header layout (title + close on same row)
- Controller from react-hook-form for form fields

### Git Intelligence (Recent Commits)

```
a7150d2 feat(story-4-5): Implement Market Management (CRUD) with Add, Edit, and Delete functionality
8389ea7 feat(story-4-4): Implement Market Filtering for Ticket List with URL Persistence
768c2ed feat(story-4-3): Implement Date Filtering for Ticket List with URL Persistence
9a549ba feat(story-4-2): Implement Ticket Detail View with components and tests
79980ce feat(story-4-1): Implement Ticket List page with loading and empty states
```

**Pattern from commits:**
- Feature commits prefixed with `feat(story-X-Y):`
- All stories include "with components and tests" or similar
- Related functionality grouped in single commit

### Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - use Dexie hooks
- Create new CRUD hooks - useMarkets already has everything
- Forget sync queue - every market create must call queueCreate()
- Skip loading states - maintain existing skeleton pattern
- Hardcoded colors - use Tailwind theme tokens
- Mix server/client - all picker components are client
- Skip form Controller - always use react-hook-form integration
- Duplicate market list logic - reuse useMarkets hook

### References

- [Source: epics.md#Story-4.6] - Acceptance criteria and user story
- [Source: project-context.md#Critical-Rules] - NF525, offline-first rules
- [Source: ux-design-specification.md#Anti-Patterns] - Simple settings
- [Source: architecture.md#Frontend] - State management, component structure
- [Source: src/hooks/useMarkets.ts] - Complete CRUD operations to reuse
- [Source: src/hooks/useSyncQueue.ts#queueCreate] - Sync queue pattern
- [Source: src/components/features/scanner/VerificationForm.tsx] - Form to modify
- [Source: src/hooks/useVerification.ts] - Hook to update
- [Source: src/types/ticket.ts] - Ticket type with marketId field
- [Source: src/lib/validation/ticket.ts] - Zod schema to update

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 927 tests passing (no regressions)
- MarketPicker: 11 tests
- MarketField: 6 tests
- VerificationForm: 14 tests (existing tests continue to pass)
- useVerification: 10 tests passing
- useTicketValidation: 15 tests passing

### Completion Notes List

1. **MarketPicker Component** - Sheet-based picker with market list, sorting, selection indicators, and quick-add form
2. **MarketField Component** - Form field button showing selected market or "Aucun marché" with MapPin icon
3. **VerificationForm Integration** - Added marketId field using Controller, positioned after payments section
4. **Validation Schema Update** - Added optional `marketId: z.number().int().positive().optional()` to TicketVerificationSchema
5. **useVerification Hook** - Added marketId to ticketFormValues mapping and updateTicket save
6. **useTicketValidation Hook** - Added marketId to ticket update during validation
7. **Barrel Exports** - Exported MarketPicker and MarketField from scanner components index

### File List

**New Files:**
- `src/components/features/scanner/MarketPicker.tsx`
- `src/components/features/scanner/MarketPicker.test.tsx`
- `src/components/features/scanner/MarketField.tsx`
- `src/components/features/scanner/MarketField.test.tsx`

**Modified Files:**
- `src/lib/validation/ticket.ts` - Added marketId field to schema and labels
- `src/components/features/scanner/VerificationForm.tsx` - Added MarketField integration with MarketPicker
- `src/components/features/scanner/index.ts` - Exported new components
- `src/hooks/useVerification.ts` - Added marketId to form values and save
- `src/hooks/useTicketValidation.ts` - Added marketId to validation save
- `src/app/(app)/scan/verify/[id]/VerifyPageClient.tsx` - Pass userId to VerificationForm

### Code Review Fixes (2026-01-26)

Adversarial code review identified 5 issues. 4 were valid and fixed:

1. **Issue #1 (MEDIUM)**: Missing test coverage for MarketField in VerificationForm
   - **Fix**: Added 3 tests for MarketField integration with userId prop

2. **Issue #2 (LOW)**: Missing type exports for MarketPickerProps and MarketFieldProps
   - **Fix**: Exported interface types from components and barrel file

3. **Issue #3 (LOW)**: MarketField shows "Aucun marché" when market was deleted
   - **Fix**: Added "Marché supprimé" display when marketId is set but market not found
   - Added test for this case

4. **Issue #4 (MEDIUM)**: AC mismatch - no "+ Ajouter un marché" button as specified
   - **Fix**: Added collapsible "+ Ajouter un marché" button that reveals the quick-add form
   - Updated tests to click button before interacting with form

5. **Issue #5 (HIGH - FALSE POSITIVE)**: syncQueue payload structure concern
   - **Analysis**: The sync engine correctly loads full ticket data from IndexedDB (line 174)
   - marketId is properly included via `ticket.marketId`, not from payload
   - No fix needed - implementation is correct

**Test Results After Fixes**: 35 tests passing (MarketPicker: 11, MarketField: 7, VerificationForm: 17)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-26 | Story created - comprehensive context for market assignment feature | Claude Opus 4.5 |
| 2026-01-26 | Story implemented - all 7 tasks completed, 17 new tests, 927 total tests passing | Claude Opus 4.5 |
| 2026-01-26 | Code review completed - 4 issues fixed, 1 false positive identified, 35 tests passing | Claude Opus 4.5 |
