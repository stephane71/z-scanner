# Story 5.3: File Download

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to download the exported CSV file to my device**,
So that **I can share it with my accountant** (FR25).

## Acceptance Criteria

1. **Given** CSV generation is complete
   **When** the file is ready
   **Then** the file automatically downloads to my device
   **And** the filename follows pattern: z-scanner_export_YYYY-MM-DD_YYYY-MM-DD.csv
   **And** a success toast confirms the download

2. **Given** I am on iOS Safari
   **When** I export
   **Then** a share sheet appears allowing me to save or share the file

3. **Given** I want to export again
   **When** I return to the export page
   **Then** I can select a new period and generate another export

## Tasks / Subtasks

- [x] **Task 1: Create useDownloadCsv Hook** (AC: #1, #2)
  - [x] Create `src/hooks/useDownloadCsv.ts`
  - [x] Accept CSV string and date range parameters
  - [x] Generate filename: `z-scanner_export_YYYY-MM-DD_YYYY-MM-DD.csv`
  - [x] Create Blob with UTF-8 encoding and proper MIME type
  - [x] Detect platform (iOS Safari vs others)
  - [x] For iOS Safari: Use Web Share API with file sharing
  - [x] For other browsers: Use anchor element download trick
  - [x] Return `{ downloadCsv, isDownloading, error }`
  - [x] Write unit tests

- [x] **Task 2: Create Download Success Toast** (AC: #1)
  - [x] Use existing useToast hook from Story 3.9
  - [x] Show "Export téléchargé avec succès" on successful download
  - [x] Show error toast if download fails
  - [x] Write tests for toast integration

- [x] **Task 3: Integrate Download into ExportPageClient** (AC: #1, #2, #3)
  - [x] Call useDownloadCsv when CSV is ready (direct call, not event-based)
  - [x] Show success toast feedback after download
  - [x] Show error toast on download failure
  - [x] Allow repeated exports by resetting state
  - [x] Write integration tests (7 new tests)

- [x] **Task 4: Export Hook from Barrel** (AC: all)
  - [x] Export useDownloadCsv from `src/hooks/index.ts`

## Dev Notes

### Story Context (CRITICAL)

**THIS IS STORY 5.3 OF EPIC 5:** The final story of Epic 5 (Export Comptable), implementing file download functionality.

**Epic 5 Overview:** Export Comptable - Allow users to export their tickets as CSV for their accountant.

**Dependencies:**
- Story 5.1 (Export Page & Period Selection - DONE): ExportPageClient, date-ranges utilities
- Story 5.2 (CSV Export Generation - DONE): useGenerateExport, CSV string generation, `csvExportReady` event
- Story 3.9 (Background Sync - DONE): useToast hook for notifications

**Related Stories:**
- This completes Epic 5. After this, Epic 6 (Dashboard & Insights) begins.

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, Server/Client components |
| react | 19.x | Components, hooks |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **Offline-First:** Download works with locally-generated CSV data
- **No API Routes needed:** This is client-side file download
- **useToast pattern:** Use existing toast hook from Story 3.9

**From architecture.md:**

- Touch targets minimum 48px
- Feedback required for all user actions (toast on success/error)

### File Download Implementation Strategy

**Two approaches for cross-platform support:**

1. **Desktop/Android browsers:** Use anchor element with `download` attribute
   ```typescript
   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = filename;
   a.click();
   URL.revokeObjectURL(url);
   ```

2. **iOS Safari:** Use Web Share API (navigator.share) with file
   ```typescript
   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
   const file = new File([blob], filename, { type: 'text/csv' });
   await navigator.share({ files: [file] });
   ```

**iOS Detection:**
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOSSafari = isIOS && isSafari;
```

### Filename Format (MANDATORY)

Pattern: `z-scanner_export_YYYY-MM-DD_YYYY-MM-DD.csv`

Example: `z-scanner_export_2026-01-01_2026-01-31.csv`

```typescript
function generateFilename(startDate: string, endDate: string): string {
  return `z-scanner_export_${startDate}_${endDate}.csv`;
}
```

### Integration with Story 5.2

~~Story 5.2 originally used event-based approach with `window.__pendingCsvExport` and `csvExportReady` event.~~

**ACTUAL IMPLEMENTATION (Story 5.3):** Direct integration in `handleExport()`:
1. Generate CSV with `generateCsv()`
2. Call `downloadCsv(csv, startDate, endDate)` directly
3. Check boolean return value for success/failure
4. Show appropriate toast based on result

This approach is cleaner and more maintainable than the event-based pattern.

### Existing Code to Leverage (CRITICAL - DO NOT REINVENT!)

**EXISTING TOAST HOOK (src/hooks/useToast.ts):**

```typescript
// Already implemented in Story 3.9:
export function useToast(): UseToastResult {
  return {
    success: (message: string, options?: ToastOptions) => toast.success(message, options),
    error: (message: string, options?: ToastOptions) => toast.error(message, options),
    info: (message: string, options?: ToastOptions) => toast.info(message, options),
    warning: (message: string, options?: ToastOptions) => toast.warning(message, options),
  };
}
```

**EXISTING DATE RANGE STATE (ExportPageClient):**

```typescript
// startDate and endDate are already in state
const [startDate, setStartDate] = useState(defaultRange.start);
const [endDate, setEndDate] = useState(defaultRange.end);
```

**EXISTING HOOKS (src/hooks/index.ts):**

```typescript
// Toast hook
export { useToast, type ToastOptions, type ToastType, type UseToastResult } from './useToast';

// Export hooks from Story 5.2
export { useExportTickets } from './useExportTickets';
export { useGenerateExport } from './useGenerateExport';
```

### Component Structure

```
src/hooks/
├── useDownloadCsv.ts           # NEW - File download hook
├── useDownloadCsv.test.ts      # NEW - Tests
├── index.ts                    # MODIFY - Export new hook

src/app/(app)/export/
├── ExportPageClient.tsx        # MODIFY - Wire download after CSV ready
├── ExportPageClient.test.tsx   # MODIFY - Add download tests
```

### Type Definitions

```typescript
// Add to src/hooks/useDownloadCsv.ts

export interface UseDownloadCsvResult {
  /** Trigger download of CSV file */
  downloadCsv: (csv: string, startDate: string, endDate: string) => Promise<void>;
  /** Whether download is in progress */
  isDownloading: boolean;
  /** Error message if download failed */
  error: string | null;
}
```

### Testing Strategy

**Unit Tests (co-located):**

- `useDownloadCsv.test.ts`:
  - Generates correct filename from date range
  - Creates Blob with correct MIME type
  - Calls anchor element download for desktop browsers
  - Calls navigator.share for iOS Safari (mock detection)
  - Handles download errors gracefully
  - Returns proper loading/error states

**Integration Tests (ExportPageClient.test.tsx):**

- Listens for csvExportReady event
- Triggers download when CSV is ready
- Shows success toast after download
- Shows error toast on failure
- Clears pending export after download
- Allows repeated exports

**Test Mocks:**

```typescript
// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

// Mock navigator.share
const mockShare = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true,
});

// Mock document.createElement for anchor
const mockClick = vi.fn();
const mockAnchor = { href: '', download: '', click: mockClick };
vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
```

### Previous Story Intelligence (Story 5.2)

**Learnings to apply:**
1. `window.__pendingCsvExport` stores the CSV string
2. `csvExportReady` custom event signals CSV is ready
3. CSV has UTF-8 BOM prefix already included
4. Export button shows loading state during generation

**Integration point:**
The download hook should be called right after CSV generation succeeds in handleExport().

**Established patterns from Story 5.2:**
- `'use client'` directive for hooks
- Test mocking pattern for browser APIs
- act() pattern for async state updates in tests

### Git Intelligence (Recent Commits)

```
49d4df8 feat(story-5-2): Implement CSV Export Generation with error handling and loading state
4a1dfeb feat(story-5-1): Implement Export Page with Period Selection and Preview functionality
c107ec2 feat(story-4-7): Implement NF525-compliant ticket cancellation with CancellationDialog and useCancelTicket hook
```

**Commit message pattern:**
```
feat(story-5-3): Implement File Download with cross-platform support and toast feedback
```

### Forbidden Patterns (NEVER DO)

- Direct DOM manipulation outside React patterns
- Skip error handling for download failures
- Ignore iOS Safari share sheet requirement
- Create download without user interaction (browser blocks this)
- Leave object URLs without revoking (memory leak)
- Skip toast feedback on success/error
- Assume navigator.share is always available (must check)

### Edge Cases to Handle

1. **navigator.share not available:** Fall back to anchor download
2. **User cancels iOS share sheet:** Not an error, just silently succeed
3. **Blob creation fails:** Show error toast
4. **Empty CSV:** Should not reach download (button disabled in Story 5.2)
5. **Very large CSV:** May need chunked processing (unlikely for this app)

### References

- [Source: epics.md#Story-5.3] - Acceptance criteria and user story
- [Source: project-context.md] - Toast pattern, error handling
- [Source: src/hooks/useToast.ts] - Existing toast hook
- [Source: src/app/(app)/export/ExportPageClient.tsx] - Integration point
- [MDN Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) - File sharing reference

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

None required - implementation straightforward.

### Completion Notes List

1. **Simplified integration approach:** Instead of using event-based approach (`csvExportReady` event), implemented direct download call in `handleExport()`. This is cleaner and more maintainable.

2. **Cross-platform support:** iOS Safari uses Web Share API (`navigator.share`) for native share sheet, other browsers use anchor element download trick.

3. **AbortError handling:** When user cancels iOS share sheet, `DOMException` with name "AbortError" is thrown - this is not treated as an error since it's intentional user action.

4. **Memory management:** Object URLs are properly revoked after download to prevent memory leaks.

5. **Toast feedback:** Success toast "Export téléchargé avec succès" and error toast "Erreur lors du téléchargement" integrated.

6. **Test cleanup:** Removed obsolete tests for `window.__pendingCsvExport` and `csvExportReady` event since Story 5.3 uses direct download approach.

7. **Code review fix:** Changed `downloadCsv` to return `boolean` indicating success, ensuring toast feedback is accurate even when download fails silently.

8. **CSV Export Fix:** Modified `useExportTickets` to generate one line per payment mode (not per ticket), addressing user feedback about export format.

### File List

**NEW FILES:**
- `src/hooks/useDownloadCsv.ts` - Core download hook with cross-platform support (returns boolean for success)
- `src/hooks/useDownloadCsv.test.ts` - 11 unit tests for download hook

**MODIFIED FILES:**
- `src/hooks/index.ts` - Added useDownloadCsv export
- `src/app/(app)/export/ExportPageClient.tsx` - Integrated download and toast hooks
- `src/app/(app)/export/ExportPageClient.test.tsx` - Updated tests (20 total, 7 new for download)

**ADDITIONAL FILES (CSV Export Fix - one line per payment):**
- `src/hooks/useExportTickets.ts` - Modified to generate one line per payment mode
- `src/hooks/useExportTickets.test.ts` - Added test for multiple payments
- `src/types/export.ts` - Updated comments to reflect payment-level export

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-26 | Story created - comprehensive context for File Download implementation | Claude Opus 4.5 |
