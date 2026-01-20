# Story 3.5: Manual Entry Fallback

Status: complete

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to enter ticket data manually when OCR fails**,
So that **I can still digitize damaged or unclear tickets** (FR8).

## Acceptance Criteria

1. **Given** OCR has failed or I choose manual entry
   **When** I tap "Saisie manuelle"
   **Then** an empty form is displayed with all required fields
   **And** fields include: date d'impression, montant TTC, mode de règlement, numéro ticket
   **And** date picker defaults to today
   **And** amount field accepts decimal input (converted to centimes)

2. **Given** I complete the manual entry form
   **When** all required fields are filled
   **Then** the VALIDER button becomes active
   **And** I can proceed to validation

3. **Given** I am on the scan screen
   **When** I want to bypass OCR
   **Then** I can tap "Saisie manuelle" to directly access manual entry

4. **Given** form validation fails
   **When** I try to submit
   **Then** inline error messages appear below invalid fields
   **And** the form does not submit until corrected

## Tasks / Subtasks

- [x] **Task 1: Add Manual Entry Button to OcrError Component** (AC: #1, #3)
  - [x] OcrError already has onManualEntry prop support (from Story 3.3)
  - [x] Button navigates to `/scan/manual` via ScanPageClient handler
  - [x] Button is prominent (secondary style, but visible)
  - [x] OcrError tests already cover manual entry button

- [x] **Task 2: Add Manual Entry Link to Scan Screen** (AC: #3)
  - [x] Update `src/app/(app)/scan/ScanPageClient.tsx` to show "Saisie manuelle" link
  - [x] Link appears below capture button (fixed bottom)
  - [x] Link navigates to `/scan/manual`
  - [x] Updated ScanPageClient tests

- [x] **Task 3: Create Manual Entry Page Route** (AC: #1)
  - [x] Create `src/app/(app)/scan/manual/page.tsx` - Server component wrapper
  - [x] Create `src/app/(app)/scan/manual/ManualEntryClient.tsx` - Client component
  - [x] Route protected by (app) layout group

- [x] **Task 4: Create useManualEntry Hook** (AC: #1, #2)
  - [x] Create `src/hooks/useManualEntry.ts`
  - [x] Initialize form with empty default values (date = today)
  - [x] Reuse TicketVerificationSchema from validation/ticket.ts
  - [x] Provide createTicket function to save new ticket
  - [x] Track form dirty state and validation
  - [x] Export from `src/hooks/index.ts`

- [x] **Task 5: Create ManualEntryForm Component** (AC: #1, #2, #4)
  - [x] Create `src/components/features/scanner/ManualEntryForm.tsx`
  - [x] Thin wrapper that renders VerificationForm with confidence=null
  - [x] Date picker defaults to today
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 6: Create ManualEntryHeader Component** (AC: #1)
  - [x] Create `src/components/features/scanner/ManualEntryHeader.tsx`
  - [x] Display "Saisie manuelle" title
  - [x] Add back button to return to scanner
  - [x] Show NF525 badge (consistency with verification screen)
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 7: Integrate Manual Entry Flow** (AC: #2)
  - [x] ManualEntryClient creates new ticket in Dexie on form submit
  - [x] Ticket created with status "draft" and ocrStatus "manual_entry"
  - [x] On successful creation, navigate to verification screen `/scan/verify/[id]`
  - [x] Handle errors with inline error display

- [x] **Task 8: Create Unit Tests** (AC: #1, #2, #4)
  - [x] Create `src/app/(app)/scan/manual/ManualEntryClient.test.tsx` (12 tests)
  - [x] Create `src/components/features/scanner/ManualEntryForm.test.tsx` (9 tests)
  - [x] Create `src/components/features/scanner/ManualEntryHeader.test.tsx` (5 tests)
  - [x] Create `src/hooks/useManualEntry.test.ts` (14 tests)
  - [x] Updated `src/app/(app)/scan/ScanPageClient.test.tsx` (2 new tests)
  - [x] Mock Dexie for ticket creation
  - [x] Test form validation behavior
  - [x] Test navigation flow

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE MANUAL ENTRY FALLBACK STORY FOR EPIC 3:** This story implements the manual data entry option when OCR fails or when users prefer to enter data manually. It shares components with Story 3.4 (Verification Screen) and feeds into Story 3.6 (Ticket Validation with NF525 Compliance).

**Epic 3 Overview:** Scan & Validation (Core Flow + Offline) - The core product value.

**Dependencies:**
- Story 3.1 (Local Database Schema) - DONE: tickets table ready
- Story 3.3 (OCR Processing) - DONE: OcrError component exists
- Story 3.4 (Verification Screen) - DONE: **VerificationForm, PaymentEditor, CurrencyInput, ValidateButton, Zod schema ALL REUSABLE**

### Component Reuse Strategy (CRITICAL)

**REUSE FROM STORY 3.4:**
| Component | Location | Reuse Strategy |
|-----------|----------|----------------|
| VerificationForm | `src/components/features/scanner/VerificationForm.tsx` | Use directly with empty default values |
| PaymentEditor | `src/components/features/scanner/PaymentEditor.tsx` | Used by VerificationForm |
| ValidateButton | `src/components/features/scanner/ValidateButton.tsx` | Use directly |
| CurrencyInput | `src/components/ui/currency-input.tsx` | Used by VerificationForm |
| ConfidenceIndicator | `src/components/features/scanner/ConfidenceIndicator.tsx` | NOT needed (no OCR = no confidence) |
| TicketVerificationSchema | `src/lib/validation/ticket.ts` | Use directly |

**DO NOT DUPLICATE CODE** - The VerificationForm is designed to accept any form instance, so pass it a form initialized with empty values.

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| dexie | ^4.2.1 | Local storage (INSTALLED) |
| dexie-react-hooks | ^4.2.0 | useLiveQuery (INSTALLED) |
| react-hook-form | ^7.x | Form state management (INSTALLED) |
| @hookform/resolvers | ^3.x | Zod integration (INSTALLED) |
| zod | ^3.x | Validation schemas (INSTALLED) |

### Architecture Compliance (CRITICAL)

**From architecture.md - Manual Entry Flow:**
```
User Flow: Scanner → [OCR Fail] → Manual Entry → Verification → Validation
Alternative: Scanner → Manual Entry (bypass) → Verification → Validation
```

**Project Structure (FOLLOW EXACTLY):**
```
src/
├── app/
│   └── (app)/
│       └── scan/
│           ├── manual/
│           │   ├── page.tsx              # NEW - Server component
│           │   └── ManualEntryClient.tsx # NEW - Client component
│           ├── verify/
│           │   └── [id]/                 # EXISTING - Receives manual entries
│           └── ScanPageClient.tsx        # MODIFY - Add manual entry link
├── components/
│   └── features/
│       └── scanner/
│           ├── ManualEntryForm.tsx       # NEW (thin wrapper or reuse VerificationForm)
│           ├── ManualEntryForm.test.tsx  # NEW
│           ├── ManualEntryHeader.tsx     # NEW
│           ├── ManualEntryHeader.test.tsx# NEW
│           ├── OcrError.tsx              # MODIFY - Add manual entry button
│           ├── VerificationForm.tsx      # EXISTING - REUSE
│           └── index.ts                  # UPDATE
├── hooks/
│   ├── useManualEntry.ts                 # NEW
│   ├── useManualEntry.test.ts            # NEW
│   └── index.ts                          # UPDATE
```

### Z-Ticket Data Model (From Story 3.3/3.4)

All fields for manual entry (same as verification):

```typescript
interface ZTicketFields {
  type: 'STATISTIQUES';           // Default: STATISTIQUES
  impressionDate: string;         // YYYY-MM-DD, default: today
  lastResetDate: string;          // YYYY-MM-DD, default: today
  resetNumber: number;            // Integer, default: 0
  ticketNumber: number;           // Integer, default: 1
  discountValue: number;          // Centimes, default: 0
  cancelValue: number;            // Centimes, default: 0
  cancelNumber: number;           // Integer, default: 0
  payments: Payment[];            // Array, default: [{ mode: 'CB', value: 0 }]
  total: number;                  // Centimes, default: 0
}

interface Payment {
  mode: 'CB' | 'ESPECES' | 'CHEQUE' | 'VIREMENT';
  value: number;  // Centimes
}
```

### Default Values for Manual Entry

```typescript
const defaultManualEntryValues: TicketVerificationForm = {
  type: 'STATISTIQUES',
  impressionDate: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
  lastResetDate: new Date().toISOString().split('T')[0],  // Today
  resetNumber: 0,
  ticketNumber: 1, // Start at 1, not 0
  discountValue: 0,
  cancelValue: 0,
  cancelNumber: 0,
  payments: [{ mode: 'CB', value: 0 }], // Default payment mode
  total: 0,
};
```

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**Manual Entry Flow:**
- Accessible from OcrError screen ("Saisie manuelle" button)
- Accessible from Scan screen (small link below capture button)
- Same form layout as Verification screen
- Same validation rules
- Same VALIDER button (80px green)

**Form Patterns:**
- Labels au-dessus (jamais placeholder-only)
- Validation inline immédiate
- Erreurs en rouge sous le champ
- Date picker defaults to today

**Button Hierarchy:**
- Primary (Valider): Vert plein, 80px
- Secondary (Saisie manuelle): Outline style
- 1 Primary par écran, toujours en thumb zone

**Color Tokens:**
- Primary green: `#16A34A` (Tailwind `green-600`)
- Surface: `#F8FAFC` (Tailwind `slate-50`)
- Foreground: `#0F172A` (Tailwind `slate-900`)

### OcrError Component Update

Current OcrError component shows error message and retry button. Add manual entry option:

```tsx
// In OcrError.tsx
<div className="space-y-4">
  <Button onClick={onRetry} variant="default">
    Réessayer
  </Button>
  <Button
    onClick={() => router.push('/scan/manual')}
    variant="outline"
  >
    Saisie manuelle
  </Button>
</div>
```

### ScanPageClient Update

Add small link below capture button:

```tsx
// In ScanPageClient.tsx, below capture button
<Link
  href="/scan/manual"
  className="text-sm text-gray-500 underline mt-2"
>
  Saisie manuelle
</Link>
```

### useManualEntry Hook Implementation

```typescript
// src/hooks/useManualEntry.ts
export function useManualEntry(): UseManualEntryResult {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<TicketVerificationForm>({
    resolver: zodResolver(TicketVerificationSchema),
    defaultValues: defaultManualEntryValues,
    mode: 'onBlur',
  });

  const createTicket = useCallback(async () => {
    const formData = form.getValues();

    // Create new ticket in Dexie
    const ticketId = await db.tickets.add({
      ...formData,
      status: 'draft',
      ocrStatus: 'manual_entry',
      createdAt: new Date().toISOString(),
      userId: /* get from auth context */,
    });

    return ticketId;
  }, [form]);

  return {
    form,
    createTicket,
    isDirty: form.formState.isDirty,
    isSaving,
    saveError,
  };
}
```

### French Localization

**Page Title:**
- "Saisie manuelle" (Manual Entry)

**Button Labels:**
| Context | Label |
|---------|-------|
| OcrError button | Saisie manuelle |
| Scan screen link | Saisie manuelle |
| Page header | Saisie manuelle |

**Error Messages (same as Story 3.4):**
| Validation | Message |
|------------|---------|
| Required field | Ce champ est obligatoire |
| Invalid date | Date invalide |
| Invalid number | Nombre invalide |
| Must be positive | Doit être positif |
| At least one payment | Au moins un mode de paiement requis |
| Total mismatch | Le total doit correspondre à la somme des paiements |

### Previous Story Intelligence (Story 3.4)

**Learnings to apply:**
1. **Form initialization** - Use `values` prop pattern (not reset) for form sync
2. **Controller pattern** - Use React Hook Form Controller for all inputs
3. **Date inputs** - Need explicit `value={field.value || ''}` binding
4. **Number inputs** - Use `parseInt()` in onChange handler
5. **Test patterns** - Mock Dexie with fake-indexeddb

**Code Review Issues from Story 3.4 to avoid:**
- Don't leave DEBUG panels in code
- Document all files in File List
- Use Controller pattern for all form inputs

### Integration with Other Stories

| Story | Integration Point |
|-------|------------------|
| 3.3 OCR Processing | OcrError component receives manual entry button |
| 3.4 Verification Screen | Shares VerificationForm, receives manual entry tickets |
| 3.6 Ticket Validation | Receives validated form data (same as OCR path) |

### Testing Strategy

**Component Tests:**
- Render ManualEntryForm with empty values
- Verify all fields display with defaults
- Test inline validation on blur
- Test form submission flow
- Test navigation to verification

**Hook Tests:**
- Test form initialization with defaults
- Test createTicket function
- Test Dexie ticket creation

**Integration Tests:**
- Test full flow: Scan → Manual Entry → Verification
- Test OcrError → Manual Entry flow
- Test validation errors

### Forbidden Patterns (NEVER DO)

- Duplicate VerificationForm code (REUSE IT)
- Skip form validation on blur
- Hard-code currency formatting (use locale)
- Direct Dexie access in components (use hooks)
- Skip loading/error states
- Use `any` type
- Leave DEBUG panels in code

### References

- [Source: epics.md#Story-3.5] - Acceptance criteria
- [Source: ux-design-specification.md#Form-Patterns] - Form validation patterns
- [Source: story-3.4] - VerificationForm component to reuse
- [Source: architecture.md] - Project structure

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None - clean implementation.

### Completion Notes List

1. **Component Reuse**: Successfully reused VerificationForm, ValidateButton from Story 3.4 as designed
2. **ValidateButton Enhancement**: Added `label` and `loadingLabel` props to ValidateButton for customization
3. **OcrStatus Extension**: Added 'manual_entry' to OcrStatus type for tracking manual entries
4. **OcrError Already Ready**: The OcrError component already had onManualEntry prop support from Story 3.3
5. **Navigation Pattern**: Updated handleManualEntry in ScanPageClient to navigate to /scan/manual instead of /scan/verify
6. **All Tests Pass**: 610 tests passing, including 40 new tests for manual entry components

### File List

| File | Status | Description |
|------|--------|-------------|
| `src/app/(app)/scan/manual/page.tsx` | Created | Server component wrapper |
| `src/app/(app)/scan/manual/ManualEntryClient.tsx` | Created | Client component with form and flow integration |
| `src/app/(app)/scan/manual/ManualEntryClient.test.tsx` | Created | 14 unit tests (12 original + 2 error display tests) |
| `src/components/features/scanner/ManualEntryForm.tsx` | Created | Thin wrapper around VerificationForm |
| `src/components/features/scanner/ManualEntryForm.test.tsx` | Created | 9 unit tests |
| `src/components/features/scanner/ManualEntryHeader.tsx` | Created | Header with back link and NF525 badge |
| `src/components/features/scanner/ManualEntryHeader.test.tsx` | Created | 5 unit tests |
| `src/components/features/scanner/CameraView.tsx` | Modified | Added manual entry link below capture button |
| `src/components/features/scanner/CameraView.test.tsx` | Modified | Added 2 tests for manual entry link |
| `src/app/(app)/scan/ScanPageClient.tsx` | Modified | Updated handleManualEntry, uses shared hash utility |
| `src/app/(app)/scan/ScanPageClient.test.tsx` | Modified | Removed manual entry link tests (moved to CameraView) |
| `src/components/features/scanner/ValidateButton.tsx` | Modified | Added label/loadingLabel props |
| `src/components/features/scanner/index.ts` | Modified | Added ManualEntryHeader, ManualEntryForm exports |
| `src/hooks/useManualEntry.ts` | Created | Manual entry form hook with ticket creation |
| `src/hooks/useManualEntry.test.ts` | Created | 14 unit tests |
| `src/hooks/index.ts` | Modified | Added useManualEntry export |
| `src/lib/ocr/types.ts` | Modified | Added 'manual_entry' to OcrStatus type |
| `src/lib/utils/hash.ts` | Created | Shared SHA-256 hash utility for NF525 compliance |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-20 | Story created with comprehensive task breakdown for manual entry fallback | Claude Opus 4.5 |
| 2026-01-20 | Implementation complete - all 8 tasks done, 40 new tests, 610 total tests passing | Claude Opus 4.5 |
| 2026-01-20 | Code review complete - fixed 6 issues: extracted hash utility (DRY), added error display tests (AC#4), fixed login link accessibility, dynamic test dates, CSS class consistency, updated file list | Claude Opus 4.5 |
