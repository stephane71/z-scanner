# Story 3.6: Ticket Validation with NF525 Compliance

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to validate my ticket with one tap**,
So that **my data is securely archived and legally compliant** (FR11, FR12, FR14, FR31).

## Acceptance Criteria

1. **Given** I am on the verification screen with valid data
   **When** I tap the VALIDER button (80px green, thumb zone)
   **Then** a SHA-256 hash is computed from: impressionDate, total, payments, ticketNumber, userId (@noble/hashes)
   **And** a cryptographic timestamp is recorded (client + server time)
   **And** the ticket is saved to Dexie with status "validated"
   **And** the ticket data becomes immutable (FR12)
   **And** validation works offline (FR31)

2. **Given** validation succeeds
   **When** the ticket is saved
   **Then** a checkmark animation plays with haptic vibration
   **And** the message "Conforme NF525" is displayed
   **And** after 2 seconds, I auto-return to the camera (per UX spec)

3. **Given** I am offline
   **When** I validate a ticket
   **Then** the ticket is marked as validated locally
   **And** it is added to the sync queue for later upload
   **And** I can continue using the app normally

4. **Given** a ticket has been validated
   **When** I try to modify it
   **Then** modification is not possible (immutable)
   **And** only cancellation is allowed (Story 4.7)

## Tasks / Subtasks

- [x] **Task 1: Implement SHA-256 Hash Utility** (AC: #1)
  - [x] Create `src/lib/crypto/hash.ts` with computeTicketHash function
  - [x] Use @noble/hashes for SHA-256 computation (already in package.json)
  - [x] Hash includes: impressionDate, total, payments (serialized), ticketNumber, userId
  - [x] Return hex-encoded hash string
  - [x] Create `src/lib/crypto/hash.test.ts` with unit tests
  - [x] Export from `src/lib/crypto/index.ts`

- [x] **Task 2: Create Validation Success Component** (AC: #2)
  - [x] Create `src/components/features/scanner/ValidationSuccess.tsx`
  - [x] Animated checkmark (CSS animation, green circle with check)
  - [x] "Conforme NF525" message with badge
  - [x] Display timestamp of validation
  - [x] 2-second auto-dismiss timer
  - [x] Create `src/components/features/scanner/ValidationSuccess.test.tsx`
  - [x] Export from `src/components/features/scanner/index.ts`

- [x] **Task 3: Implement Haptic Feedback Utility** (AC: #2)
  - [x] Create `src/lib/utils/haptic.ts` with triggerHaptic function
  - [x] Use Vibration API: `navigator.vibrate([100])` for success
  - [x] Fallback gracefully if Vibration API not supported
  - [x] Create `src/lib/utils/haptic.test.ts`
  - [x] Export from `src/lib/utils/index.ts`

- [x] **Task 4: Create useTicketValidation Hook** (AC: #1, #3)
  - [x] Create `src/hooks/useTicketValidation.ts`
  - [x] Accept ticket data and userId
  - [x] Compute SHA-256 hash using crypto utility
  - [x] Generate client timestamp (ISO 8601)
  - [x] Update ticket in Dexie: status="validated", dataHash, validatedAt, clientTimestamp
  - [x] Add to syncQueue with entityType="ticket", action="validate"
  - [x] Return { validateTicket, isValidating, validationError }
  - [x] Create `src/hooks/useTicketValidation.test.ts`
  - [x] Export from `src/hooks/index.ts`

- [x] **Task 5: Integrate Validation Flow in VerifyPageClient** (AC: #1, #2)
  - [x] Update `src/app/(app)/scan/verify/[id]/VerifyPageClient.tsx`
  - [x] Replace current handleValidate with useTicketValidation hook
  - [x] On success: show ValidationSuccess component instead of immediate redirect
  - [x] Trigger haptic feedback on success (handled by useTicketValidation hook)
  - [x] Auto-return to /scan after 2 seconds (using ValidationSuccess timer)
  - [x] Handle validation errors with inline error display
  - [x] Skipped VerifyPageClient.test.tsx (does not exist, will add in Task 7)

- [x] **Task 6: Protect Validated Tickets from Modification** (AC: #4)
  - [x] VerifyPageClient already checks ticket.status !== "draft" and redirects
  - [x] If status === "validated", redirects to /scan (no ticket detail page yet)
  - [x] useTicketValidation throws error if ticket already validated ("déjà validé")
  - [x] Test coverage in useTicketValidation.test.ts for "already validated" case

- [x] **Task 7: Create Unit Tests** (AC: #1, #2, #3)
  - [x] Hash utility tests (13 tests): deterministic output, correct fields, hex encoding
  - [x] ValidationSuccess component tests (10 tests): animation, timer, callback, accessibility
  - [x] Haptic utility tests (10 tests): API call, fallback, pattern selection
  - [x] useTicketValidation hook tests (11 tests): hash generation, Dexie update, sync queue
  - [x] Mock Dexie with fake-indexeddb in test/setup.ts
  - [x] Mock Vibration API with vi.fn()

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE NF525 COMPLIANCE STORY FOR EPIC 3:** This story implements the core validation mechanism that makes Z-Scanner legally compliant with French fiscal regulations. It's the "money moment" of the entire app - the point where user effort converts to legal peace of mind.

**Epic 3 Overview:** Scan & Validation (Core Flow + Offline) - The core product value.

**NF525 Compliance Requirements (ISCA):**
| Requirement | Implementation |
|-------------|----------------|
| **Inaltérabilité** | Append-only model, status changes only, no UPDATE on validated tickets |
| **Sécurisation** | SHA-256 hash of ticket data via @noble/hashes |
| **Conservation** | 6-year retention, Dexie persistent storage + Supabase sync |
| **Archivage** | Exportable data (Story 5.2 CSV export) |

**Dependencies:**
- Story 3.1 (Local Database Schema) - DONE: tickets table with dataHash, status, validatedAt
- Story 3.4 (Verification Screen) - DONE: VerifyPageClient, useVerification, ValidateButton
- Story 3.5 (Manual Entry Fallback) - DONE: Manual entry creates draft tickets

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| @noble/hashes | ^1.x | SHA-256 cryptographic hash (INSTALLED) |
| dexie | ^4.2.1 | IndexedDB storage (INSTALLED) |
| dexie-react-hooks | ^4.2.0 | useLiveQuery (INSTALLED) |

### Architecture Compliance (CRITICAL)

**From architecture.md - NF525 Compliance:**
```
| Requirement | Implementation |
|-------------|----------------|
| Immutabilité | Append-only tables, no UPDATE/DELETE |
| Hash Integrity | SHA-256 via @noble/hashes sur chaque ticket |
| Timestamps | PostgreSQL created_at + client timestamp |
| Retention 6 ans | Supabase retention policy + backups |
| Audit Trail | syncQueue logs toutes les opérations |
```

**Project Structure (FOLLOW EXACTLY):**
```
src/
├── lib/
│   ├── crypto/
│   │   ├── hash.ts               # IMPLEMENT - SHA-256 utility
│   │   ├── hash.test.ts          # NEW
│   │   └── index.ts              # NEW - exports
│   └── utils/
│       ├── haptic.ts             # NEW - Vibration API wrapper
│       └── haptic.test.ts        # NEW
├── components/
│   └── features/
│       └── scanner/
│           ├── ValidationSuccess.tsx      # NEW - Success animation
│           ├── ValidationSuccess.test.tsx # NEW
│           └── index.ts                   # UPDATE - add export
├── hooks/
│   ├── useTicketValidation.ts    # NEW
│   ├── useTicketValidation.test.ts # NEW
│   └── index.ts                  # UPDATE - add export
└── app/
    └── (app)/
        └── scan/
            └── verify/
                └── [id]/
                    ├── VerifyPageClient.tsx      # MODIFY
                    └── VerifyPageClient.test.tsx # MODIFY
```

### SHA-256 Hash Implementation (CRITICAL)

**Fields to include in hash (order matters for determinism):**
1. `impressionDate` (string, YYYY-MM-DD)
2. `total` (number, centimes)
3. `payments` (JSON.stringify sorted by mode)
4. `ticketNumber` (number)
5. `userId` (string, Supabase auth.uid())

**Implementation Pattern:**
```typescript
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

interface TicketHashData {
  impressionDate: string;
  total: number;
  payments: Payment[];
  ticketNumber: number;
  userId: string;
}

export function computeTicketHash(data: TicketHashData): string {
  // Sort payments for deterministic JSON
  const sortedPayments = [...data.payments].sort((a, b) =>
    a.mode.localeCompare(b.mode)
  );

  // Create canonical string representation
  const canonical = JSON.stringify({
    impressionDate: data.impressionDate,
    total: data.total,
    payments: sortedPayments,
    ticketNumber: data.ticketNumber,
    userId: data.userId,
  });

  // Compute SHA-256 hash
  const hash = sha256(new TextEncoder().encode(canonical));
  return bytesToHex(hash);
}
```

### Validation Success Animation (UX Critical)

**From ux-design-specification.md:**
- Checkmark animation plays with haptic vibration
- Message "Conforme NF525" displayed
- 2-second auto-return to camera

**Animation Specification:**
```css
@keyframes checkmark-draw {
  0% { stroke-dashoffset: 50; }
  100% { stroke-dashoffset: 0; }
}

@keyframes circle-scale {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

**Component Structure:**
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
  <div className="text-center">
    {/* Animated checkmark in green circle */}
    <div className="animate-circle-scale mx-auto mb-4 h-24 w-24 rounded-full bg-green-100">
      <svg className="h-full w-full text-green-600" ...>
        <path className="animate-checkmark-draw" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    {/* NF525 Badge */}
    <NF525Badge className="mx-auto mb-2" />
    {/* Message */}
    <p className="text-lg font-semibold text-green-600">Conforme NF525</p>
    <p className="text-sm text-gray-500">Ticket validé et archivé</p>
  </div>
</div>
```

### Haptic Feedback Implementation

**Vibration API Pattern:**
```typescript
export function triggerHaptic(pattern: 'success' | 'warning' | 'error' = 'success'): void {
  if (!('vibrate' in navigator)) return;

  const patterns = {
    success: [100],        // Single short vibration
    warning: [50, 50, 50], // Two short pulses
    error: [200, 100, 200] // Long-short-long
  };

  navigator.vibrate(patterns[pattern]);
}
```

### useTicketValidation Hook Implementation

```typescript
interface UseTicketValidationResult {
  validateTicket: (ticketId: number, formData: TicketVerificationForm, userId: string) => Promise<void>;
  isValidating: boolean;
  validationError: string | null;
  validationSuccess: boolean;
}

export function useTicketValidation(): UseTicketValidationResult {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);

  const validateTicket = useCallback(async (
    ticketId: number,
    formData: TicketVerificationForm,
    userId: string
  ) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      // 1. Compute hash
      const dataHash = computeTicketHash({
        impressionDate: formData.impressionDate,
        total: formData.total,
        payments: formData.payments,
        ticketNumber: formData.ticketNumber,
        userId,
      });

      // 2. Generate timestamps
      const clientTimestamp = new Date().toISOString();
      const validatedAt = clientTimestamp;

      // 3. Update ticket (make immutable)
      await db.tickets.update(ticketId, {
        ...formData,
        status: 'validated' as TicketStatus,
        dataHash,
        validatedAt,
        clientTimestamp,
        ocrStatus: 'validated',
      });

      // 4. Add to sync queue
      await db.syncQueue.add({
        entityType: 'ticket',
        entityId: ticketId,
        action: 'validate',
        payload: { dataHash, validatedAt },
        status: 'pending',
        retries: 0,
        createdAt: clientTimestamp,
      });

      // 5. Trigger haptic feedback
      triggerHaptic('success');

      setValidationSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la validation';
      setValidationError(message);
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return { validateTicket, isValidating, validationError, validationSuccess };
}
```

### VerifyPageClient Integration

**Key changes to handleValidate:**
```typescript
// Before (Story 3.4):
const handleValidate = useCallback(async () => {
  await updateTicket();
  router.push('/scan');
}, []);

// After (Story 3.6):
const handleValidate = useCallback(async () => {
  const isValid = await form.trigger();
  if (!isValid) return;

  try {
    await validateTicket(ticketId, form.getValues(), userId);
    // ValidationSuccess component will handle the redirect
  } catch (error) {
    // Error handled by hook
  }
}, [form, validateTicket, ticketId, userId]);
```

**Show ValidationSuccess overlay:**
```tsx
{validationSuccess && (
  <ValidationSuccess
    onComplete={() => router.push('/scan')}
    autoRedirectDelay={2000}
  />
)}
```

### Sync Queue Entry Format

```typescript
interface SyncQueueItem {
  id?: number;
  entityType: 'ticket' | 'photo' | 'market';
  entityId: number;
  action: 'create' | 'validate' | 'cancel';
  payload: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retries: number;
  createdAt: string;
}

// For validation:
{
  entityType: 'ticket',
  entityId: 123,
  action: 'validate',
  payload: {
    dataHash: 'abc123...',
    validatedAt: '2026-01-21T15:00:00.000Z',
  },
  status: 'pending',
  retries: 0,
  createdAt: '2026-01-21T15:00:00.000Z',
}
```

### French Localization

**Validation Messages:**
| Context | Message |
|---------|---------|
| Success overlay | Conforme NF525 |
| Subtitle | Ticket validé et archivé |
| Error generic | Erreur lors de la validation |
| Already validated | Ce ticket a déjà été validé |

### Testing Strategy

**Unit Tests:**
- Hash utility: deterministic output, correct field inclusion, hex encoding
- ValidationSuccess: animation render, timer fires, onComplete callback
- Haptic utility: vibrate called, fallback when not supported
- useTicketValidation: hash generation, Dexie update, sync queue entry

**Integration Tests:**
- Full validation flow: form submit → hash → save → animation → redirect
- Offline validation: works without network, sync queue populated
- Protected tickets: validated tickets redirect away from edit

**Test Mocking:**
```typescript
// Mock Vibration API
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(() => true),
  writable: true,
});

// Mock Dexie with fake-indexeddb
import 'fake-indexeddb/auto';
```

### Previous Story Intelligence (Story 3-5)

**Learnings to apply:**
1. **Form patterns** - Use Controller pattern for all form inputs
2. **Test patterns** - Mock Dexie with fake-indexeddb
3. **Navigation** - Use router.push, not window.location
4. **Error handling** - Set error state in hook, display in component

**Code Review Issues from Story 3-5 to avoid:**
- Don't leave DEBUG panels in code
- Document all files in File List
- Use explicit type annotations

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**Validation Feedback:**
- Checkmark animé + haptic + "Conforme NF525"
- Retour auto caméra 2 secondes après validation

**Color Tokens:**
- Primary green: `#16A34A` (Tailwind `green-600`) for success
- Trust blue: `#1D4ED8` for NF525 badge
- Surface: `#F8FAFC` for overlays

**Button Hierarchy:**
- VALIDER button: 80px height, green-600, full width

### Forbidden Patterns (NEVER DO)

- Modify validated ticket data (IMMUTABLE - NF525 requirement)
- Delete tickets (APPEND-ONLY - NF525 requirement)
- Skip hash computation (REQUIRED for compliance)
- Use floating point for money (use integer centimes)
- Skip haptic feedback on validation success
- Hard-code 2-second delay (use constant)
- Call Supabase directly from client (use API routes + sync queue)

### Integration with Other Stories

| Story | Integration Point |
|-------|------------------|
| 3.4 Verification Screen | Uses VerifyPageClient, adds validation logic |
| 3.5 Manual Entry | Validates tickets created via manual entry |
| 3.8 Sync Queue | Adds validation to sync queue for upload |
| 4.7 Ticket Cancellation | Only action allowed after validation |

### References

- [Source: epics.md#Story-3.6] - Acceptance criteria
- [Source: architecture.md#NF525-Compliance] - Hash integrity requirements
- [Source: ux-design-specification.md#Validation-Feedback] - Animation specs
- [Source: project-context.md#NF525-Compliance-Rules] - Implementation rules
- [NF525 Requirements](https://amenitiz.com/fr/blog/nf-525) - ISCA requirements

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

| File | Status | Description |
|------|--------|-------------|
| `src/lib/crypto/hash.ts` | Created | SHA-256 hash computation utility using @noble/hashes |
| `src/lib/crypto/hash.test.ts` | Created | Unit tests for hash utility (13 tests) |
| `src/lib/crypto/index.ts` | Created | Exports for crypto module |
| `src/lib/utils/haptic.ts` | Created | Vibration API wrapper with pattern support |
| `src/lib/utils/haptic.test.ts` | Created | Unit tests for haptic utility (10 tests) |
| `src/lib/utils/index.ts` | Created | Exports for utils module |
| `src/components/features/scanner/ValidationSuccess.tsx` | Created | Success animation component with NF525 badge |
| `src/components/features/scanner/ValidationSuccess.test.tsx` | Created | Unit tests for ValidationSuccess (10 tests) |
| `src/hooks/useTicketValidation.ts` | Created | Validation hook with hash + sync + transaction |
| `src/hooks/useTicketValidation.test.ts` | Created | Unit tests for validation hook (11 tests) |
| `src/app/(app)/scan/verify/[id]/VerifyPageClient.tsx` | Modified | Integrated validation flow with useTicketValidation |
| `src/app/(app)/scan/verify/[id]/VerifyPageClient.test.tsx` | Created | Integration tests for validation flow (11 tests) |
| `src/components/features/scanner/index.ts` | Modified | Added ValidationSuccess export |
| `src/hooks/index.ts` | Modified | Added useTicketValidation export |
| `src/types/sync.ts` | Modified | Added 'validate' to SyncAction type |
| `src/test/setup.ts` | Modified | Added fake-indexeddb/auto import for Dexie tests |

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-21 | Story created with comprehensive task breakdown for NF525 validation | Claude Opus 4.5 |
| 2026-01-21 | Code review completed: fixed auth error handling, added VerifyPageClient integration tests, fixed race condition in validation success overlay | Claude Opus 4.5 |
