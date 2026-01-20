# Story 3.4: Verification Screen

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see and verify the extracted values before validation**,
So that **I can ensure accuracy** (FR7, FR9).

## Acceptance Criteria

1. **Given** OCR processing is complete
   **When** the verification screen loads
   **Then** the ticket photo thumbnail is displayed
   **And** the TOTAL TTC is shown in hero size (36px per UX)
   **And** all extracted fields are displayed in editable inputs
   **And** the NF525 badge is visible in the header

2. **Given** I want to correct a value (FR9)
   **When** I tap on a field
   **Then** I can edit the value inline
   **And** validation runs on blur (format checks)

3. **Given** all fields pass validation
   **When** the form is complete
   **Then** the VALIDER button is active and prominent (80px green per UX)

4. **Given** OCR has low confidence on a field
   **When** the verification screen displays
   **Then** that field is highlighted with a warning indicator (yellow border)
   **And** the user is prompted to verify the value

## Tasks / Subtasks

- [x] **Task 1: Create Verification Page Route** (AC: #1)
  - [x] Create `src/app/(app)/scan/verify/[id]/page.tsx` - Server component wrapper
  - [x] Create `src/app/(app)/scan/verify/[id]/VerifyPageClient.tsx` - Client component
  - [x] Add route validation (ticket must exist, status must be draft)
  - [x] Redirect to /scan if ticket not found or already validated
  - [x] Load ticket and photo data using useLiveQuery

- [x] **Task 2: Create VerificationHeader Component** (AC: #1)
  - [x] Create `src/components/features/scanner/VerificationHeader.tsx`
  - [x] Display NF525 badge in header (per UX spec)
  - [x] Add back button to return to camera
  - [x] Show "Vérification" title
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 3: Create PhotoThumbnail Component** (AC: #1)
  - [x] Create `src/components/features/scanner/PhotoThumbnail.tsx`
  - [x] Display ticket photo thumbnail (from Dexie photos table)
  - [x] Add tap-to-expand functionality (optional - can be deferred)
  - [x] Handle loading and error states
  - [x] Use object URL for blob display
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 4: Create TotalHero Component** (AC: #1)
  - [x] Create `src/components/features/scanner/TotalHero.tsx`
  - [x] Display total amount in 36px hero size per UX spec
  - [x] Format as French currency (€) with proper spacing
  - [x] Show confidence indicator if OCR confidence < 0.8
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 5: Create VerificationForm Component** (AC: #1, #2, #3, #4)
  - [x] Create `src/components/features/scanner/VerificationForm.tsx`
  - [x] Use React Hook Form with Zod validation
  - [x] Include all Z-ticket fields:
    - [x] impressionDate (date picker)
    - [x] ticketNumber (numeric input)
    - [x] resetNumber (numeric input)
    - [x] lastResetDate (date picker)
    - [x] payments array (dynamic list with mode + value)
    - [x] discountValue (currency input in centimes)
    - [x] cancelValue (currency input in centimes)
    - [x] cancelNumber (numeric input)
    - [x] total (currency input in centimes, hero display)
  - [x] Add inline validation on blur per UX spec
  - [x] Highlight low-confidence fields (yellow border for < 0.8)
  - [x] Labels above inputs, errors below (per form patterns)
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 6: Create PaymentEditor Component** (AC: #2)
  - [x] Create `src/components/features/scanner/PaymentEditor.tsx`
  - [x] Allow adding/removing payment entries
  - [x] Payment mode selector (CB, ESPECES, CHEQUE, VIREMENT)
  - [x] Value input in centimes (display as euros)
  - [x] Auto-calculate total from payments
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 7: Create ValidateButton Component** (AC: #3)
  - [x] Create `src/components/features/scanner/ValidateButton.tsx`
  - [x] 80px height, green primary color per UX spec
  - [x] Position in thumb zone (bottom of screen)
  - [x] Show loading state during validation
  - [x] Disabled when form has validation errors
  - [x] Text: "VALIDER" in uppercase
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 8: Create ConfidenceIndicator Component** (AC: #4)
  - [x] Create `src/components/features/scanner/ConfidenceIndicator.tsx`
  - [x] Three states: high (green > 0.8), medium (yellow 0.5-0.8), low (red < 0.5)
  - [x] Small badge/icon next to field
  - [x] Tooltip or aria-label explaining confidence
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 9: Create useVerification Hook** (AC: #1, #2, #3)
  - [x] Create `src/hooks/useVerification.ts`
  - [x] Load ticket data from Dexie by ID
  - [x] Load photo from Dexie photos table
  - [x] Handle form state with React Hook Form
  - [x] Provide updateTicket function for saving edits
  - [x] Track form dirty state
  - [x] Export from `src/hooks/index.ts`

- [x] **Task 10: Create Zod Validation Schema** (AC: #2)
  - [x] Create `src/lib/validation/ticket.ts` - Ticket form validation
  - [x] Validate impressionDate is valid date
  - [x] Validate ticketNumber is positive integer
  - [x] Validate payments array has at least one entry
  - [x] Validate total matches sum of payments
  - [x] Export from `src/lib/validation/index.ts`

- [x] **Task 11: Add Currency Input Component** (AC: #2)
  - [x] Create `src/components/ui/currency-input.tsx`
  - [x] Input accepts decimal euros, stores as centimes
  - [x] French number formatting (comma decimal separator)
  - [x] Proper keyboard type (numeric)
  - [x] Clear formatting on focus, format on blur

- [x] **Task 12: Create Unit Tests** (AC: #1, #2, #3, #4)
  - [x] Create `src/app/(app)/scan/verify/[id]/VerifyPageClient.test.tsx`
  - [x] Create `src/components/features/scanner/VerificationForm.test.tsx`
  - [x] Create `src/components/features/scanner/PaymentEditor.test.tsx`
  - [x] Create `src/components/features/scanner/TotalHero.test.tsx`
  - [x] Create `src/hooks/useVerification.test.ts`
  - [x] Create `src/lib/validation/ticket.test.ts`
  - [x] Mock Dexie for ticket/photo loading
  - [x] Test inline validation behavior
  - [x] Test confidence indicator display

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE VERIFICATION SCREEN STORY FOR EPIC 3:** This story implements the verification screen where users review and correct OCR-extracted data before validation. It receives data from Story 3.3 (OCR Processing) and prepares data for Story 3.6 (Ticket Validation with NF525 Compliance).

**Epic 3 Overview:** Scan & Validation (Core Flow + Offline) - The core product value.

**Dependencies:**
- Story 3.1 (Local Database Schema) - DONE: tickets and photos tables ready
- Story 3.2 (Camera Capture UI) - DONE: Photo capture with compression
- Story 3.3 (OCR Processing) - DONE: Claude Haiku extraction with Z-ticket model

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| dexie | ^4.2.1 | Local storage (INSTALLED) |
| dexie-react-hooks | ^4.2.0 | useLiveQuery (INSTALLED) |
| react-hook-form | ^7.x | Form state management (INSTALL IF NEEDED) |
| @hookform/resolvers | ^3.x | Zod integration (INSTALL IF NEEDED) |
| zod | ^3.x | Validation schemas (INSTALLED) |

### Architecture Compliance (CRITICAL)

**From architecture.md - Validation Flow:**
```
Validation Flow: Résultats OCR → Formulaire pré-rempli → Validation utilisateur → Ticket finalisé
```

**From architecture.md - Form Patterns:**
```
| Validation | Zod + React Hook Form |
```

**Project Structure (FOLLOW EXACTLY):**
```
src/
├── app/
│   └── (app)/
│       └── scan/
│           └── verify/
│               └── [id]/
│                   ├── page.tsx              # NEW - Server component
│                   └── VerifyPageClient.tsx  # NEW - Client component
├── components/
│   └── features/
│       └── scanner/
│           ├── VerificationHeader.tsx    # NEW
│           ├── VerificationHeader.test.tsx
│           ├── PhotoThumbnail.tsx        # NEW
│           ├── PhotoThumbnail.test.tsx
│           ├── TotalHero.tsx             # NEW
│           ├── TotalHero.test.tsx
│           ├── VerificationForm.tsx      # NEW
│           ├── VerificationForm.test.tsx
│           ├── PaymentEditor.tsx         # NEW
│           ├── PaymentEditor.test.tsx
│           ├── ValidateButton.tsx        # NEW
│           ├── ConfidenceIndicator.tsx   # NEW
│           └── index.ts                  # UPDATE
├── hooks/
│   ├── useVerification.ts                # NEW
│   ├── useVerification.test.ts           # NEW
│   └── index.ts                          # UPDATE
├── lib/
│   └── validation/
│       ├── ticket.ts                     # NEW
│       ├── ticket.test.ts                # NEW
│       └── index.ts                      # NEW
└── components/
    └── ui/
        └── currency-input.tsx            # NEW
```

### Z-Ticket Data Model (From Story 3.3)

All fields to display and allow editing:

```typescript
interface ZTicketFields {
  type: 'STATISTIQUES';           // Read-only, always STATISTIQUES
  impressionDate: string;         // YYYY-MM-DD, editable date picker
  lastResetDate: string;          // YYYY-MM-DD, editable date picker
  resetNumber: number;            // Integer, editable
  ticketNumber: number;           // Integer, editable
  discountValue: number;          // Centimes, editable
  cancelValue: number;            // Centimes, editable
  cancelNumber: number;           // Integer, editable
  payments: Payment[];            // Array, dynamic editing
  total: number;                  // Centimes, HERO display, editable
}

interface Payment {
  mode: 'CB' | 'ESPECES' | 'CHEQUE' | 'VIREMENT';
  value: number;  // Centimes
}
```

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**Écran Vérification:**
- Card avec miniature photo
- Total en hero (36px)
- Champs éditables si correction nécessaire
- Bouton VALIDER massif vert (80px)

**Form Patterns:**
- Labels au-dessus (jamais placeholder-only)
- Validation inline immédiate
- Erreurs en rouge sous le champ

**Button Hierarchy:**
- Primary (Valider): Vert plein, 64-80px
- 1 Primary par écran, toujours en thumb zone

**Color Tokens:**
- High confidence: `#16A34A` (Tailwind `green-600`)
- Medium confidence: `#CA8A04` (Tailwind `yellow-600`)
- Low confidence: `#DC2626` (Tailwind `red-600`)
- Primary green: `#16A34A`
- Trust blue: `#1D4ED8`

**Typography:**
- Total amount: 36px hero size
- Labels: 14px
- Inputs: 16px minimum

**Touch Targets:**
- All buttons: 48px minimum
- Validate button: 80px height
- Input fields: 48px height

### Confidence Indicator Logic

```typescript
function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

function getConfidenceColor(level: string): string {
  switch (level) {
    case 'high': return 'border-green-600';
    case 'medium': return 'border-yellow-600';
    case 'low': return 'border-red-600';
    default: return 'border-gray-300';
  }
}
```

### French Localization

**Field Labels:**
| Field | French Label |
|-------|--------------|
| impressionDate | Date d'impression |
| lastResetDate | Date dernière RAZ |
| resetNumber | N° RAZ |
| ticketNumber | N° Ticket |
| discountValue | Remises |
| cancelValue | Annulations (€) |
| cancelNumber | Nb annulations |
| payments | Modes de paiement |
| total | TOTAL TTC |
| CB | Carte bancaire |
| ESPECES | Espèces |
| CHEQUE | Chèque |
| VIREMENT | Virement |

**Error Messages:**
| Validation | Message |
|------------|---------|
| Required field | Ce champ est obligatoire |
| Invalid date | Date invalide |
| Invalid number | Nombre invalide |
| Must be positive | Doit être positif |
| At least one payment | Au moins un mode de paiement requis |

### Currency Formatting

```typescript
// Format centimes to display
function formatCurrency(centimes: number): string {
  return (centimes / 100).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Parse display to centimes
function parseCurrency(display: string): number {
  const normalized = display.replace(/\s/g, '').replace(',', '.');
  return Math.round(parseFloat(normalized) * 100);
}
```

### Previous Story Intelligence (Story 3.3)

**Learnings to apply:**
1. **Z-ticket data model** - Use exact field names from types/ticket.ts
2. **Dexie useLiveQuery pattern** - Use for reactive data loading
3. **TypeScript strict mode** - No `any` types
4. **Test patterns** - Mock Dexie operations properly
5. **Component testing** - Use React Testing Library

**Code Review Issues from Story 3.3 to avoid:**
- Don't mix old field names (date, montantTTC) with new Z-ticket fields
- Always use type guards for error handling
- Add `finally` block for cleanup in async operations

### Forbidden Patterns (NEVER DO)

- Use placeholder-only inputs (must have labels above)
- Skip form validation on blur
- Hard-code currency formatting (use locale)
- Direct Dexie access in components (use hooks)
- Skip loading/error states
- Use `any` type
- Mix naming conventions

### Integration with Other Stories

| Story | Integration Point |
|-------|------------------|
| 3.3 OCR Processing | Receives OCR data and confidence scores |
| 3.5 Manual Entry | Shares VerificationForm component |
| 3.6 Ticket Validation | Receives validated form data |
| 3.7 Photo Archival | Uses PhotoThumbnail component |

### Testing Strategy

**Component Tests:**
- Render with mock ticket data
- Verify all fields display correctly
- Test inline validation on blur
- Test confidence indicator colors
- Test form submission flow

**Hook Tests:**
- Test useLiveQuery mocking
- Test form state management
- Test updateTicket function

**Validation Tests:**
- Test Zod schema with valid data
- Test all error conditions
- Test edge cases (empty payments, zero values)

### References

- [Source: epics.md#Story-3.4] - Acceptance criteria
- [Source: ux-design-specification.md#Écran-Vérification] - UI specifications
- [Source: architecture.md#Form-Patterns] - Zod + React Hook Form
- [Source: story-3.3] - Z-ticket data model and OCR integration

## Dev Agent Record

### File List

| File | Status | Description |
|------|--------|-------------|
| `src/app/(app)/scan/verify/[id]/page.tsx` | Created | Server component wrapper for verification route |
| `src/app/(app)/scan/verify/[id]/VerifyPageClient.tsx` | Created | Client component with form integration |
| `src/app/(app)/scan/verify/[id]/VerifyPageClient.test.tsx` | Created | Unit tests for verification page |
| `src/components/features/scanner/VerificationHeader.tsx` | Created | Header with NF525 badge and back button |
| `src/components/features/scanner/VerificationHeader.test.tsx` | Created | Unit tests for header component |
| `src/components/features/scanner/PhotoThumbnail.tsx` | Created | Photo thumbnail with fullscreen option |
| `src/components/features/scanner/PhotoThumbnail.test.tsx` | Created | Unit tests for thumbnail component |
| `src/components/features/scanner/TotalHero.tsx` | Created | Hero display for total amount (36px) |
| `src/components/features/scanner/TotalHero.test.tsx` | Created | Unit tests for hero component |
| `src/components/features/scanner/VerificationForm.tsx` | Created | Full form with all Z-ticket fields |
| `src/components/features/scanner/VerificationForm.test.tsx` | Created | Unit tests for form component |
| `src/components/features/scanner/PaymentEditor.tsx` | Created | Dynamic payment mode editor |
| `src/components/features/scanner/PaymentEditor.test.tsx` | Created | Unit tests for payment editor |
| `src/components/features/scanner/ValidateButton.tsx` | Created | 80px green validation button |
| `src/components/features/scanner/ValidateButton.test.tsx` | Created | Unit tests for validate button |
| `src/components/features/scanner/ConfidenceIndicator.tsx` | Created | Color-coded confidence display |
| `src/components/features/scanner/ConfidenceIndicator.test.tsx` | Created | Unit tests for confidence indicator |
| `src/components/features/scanner/index.ts` | Modified | Added exports for all new components |
| `src/components/ui/currency-input.tsx` | Created | Currency input with centimes conversion |
| `src/components/ui/currency-input.test.tsx` | Created | Unit tests for currency input (23 tests) |
| `src/hooks/useVerification.ts` | Created | Form state management hook |
| `src/hooks/useVerification.test.ts` | Created | Unit tests for verification hook |
| `src/hooks/index.ts` | Modified | Added useVerification export |
| `src/lib/validation/ticket.ts` | Created | Zod validation schema |
| `src/lib/validation/ticket.test.ts` | Created | Unit tests for validation schema |
| `src/lib/validation/index.ts` | Created | Validation barrel export |
| `src/app/globals.css` | Modified | Added form element text color rules |
| `src/components/ui/input.tsx` | Modified | Added text-foreground class for proper theming |

## Code Review Notes

**Reviewed by:** Claude Opus 4.5 (Adversarial Code Review)
**Date:** 2026-01-20

### Issues Found and Fixed

| Severity | Issue | File | Fix Applied |
|----------|-------|------|-------------|
| HIGH | DEBUG panel with TODO left in code | VerifyPageClient.tsx | Removed debug panel (lines 175-193) |
| MEDIUM | currency-input.test.tsx missing from File List | Story doc | Added to Created Files |
| MEDIUM | globals.css, input.tsx modifications undocumented | Story doc | Added to Modified Files |

### Verification
- All 568 tests passing after fixes
- TypeScript compilation successful
- No regression in form functionality

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-18 | Story created with comprehensive task breakdown for verification screen | Claude Opus 4.5 |
| 2026-01-18 | Implementation complete: All 12 tasks done, 568 tests passing | Claude Opus 4.5 |
| 2026-01-18 | Code review: Fixed VerifyPageClient to use useVerification hook and VerificationForm components properly; VALIDER button now saves data before navigation | Claude Opus 4.5 |
| 2026-01-18 | Added Dev Agent Record with File List section | Claude Opus 4.5 |
| 2026-01-20 | Code review: Removed DEBUG panel, updated File List with missing files | Claude Opus 4.5 |
