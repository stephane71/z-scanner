# Story 3.2: Camera Capture UI

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to capture a photo of my ticket Z using my phone camera**,
So that **I can digitize my sales data** (FR5).

## Acceptance Criteria

1. **Given** I am logged in and on /scan
   **When** the page loads
   **Then** the camera viewfinder is displayed immediately (direct to scanner per UX)
   **And** a dotted guide frame shows where to position the ticket
   **And** a capture button (64px, green) is visible in the thumb zone

2. **Given** I tap the capture button
   **When** the photo is taken
   **Then** a flash animation confirms capture
   **And** the image is compressed to WebP 80% (~100KB)
   **And** a thumbnail is generated at WebP 60% (~10KB)
   **And** I am navigated to the verification screen

3. **Given** camera permission is denied
   **When** I try to access /scan
   **Then** a clear message explains camera is required
   **And** a button to retry permission is shown

## Tasks / Subtasks

- [x] **Task 1: Create Camera Hook** (AC: #1, #3)
  - [x] Create `src/hooks/useCamera.ts` - MediaDevices getUserMedia wrapper
  - [x] Implement permission request with proper error handling (NotAllowedError, NotFoundError, NotReadableError)
  - [x] Support rear camera selection via `facingMode: "environment"`
  - [x] Clean up stream on unmount (stop all tracks)
  - [x] Handle device changes with `ondevicechange` event
  - [x] Export from `src/hooks/index.ts`

- [x] **Task 2: Create CameraView Component** (AC: #1)
  - [x] Create `src/components/features/scanner/CameraView.tsx`
  - [x] Display video stream from camera in viewfinder
  - [x] Add dotted guide frame overlay for ticket positioning
  - [x] Handle loading state while camera initializes
  - [x] Responsive design for mobile viewport (~480px max)

- [x] **Task 3: Create CaptureButton Component** (AC: #1, #2)
  - [x] Create `src/components/features/scanner/CaptureButton.tsx`
  - [x] 64px circular green button (#16A34A per UX spec)
  - [x] Position in thumb zone (bottom-anchored per UX)
  - [x] Touch target minimum 48px (accessibility)
  - [x] Disabled state while capturing/processing

- [x] **Task 4: Implement Image Compression** (AC: #2)
  - [x] Create `src/lib/utils/image.ts` - Image compression utilities
  - [x] Capture frame from video via canvas.toBlob()
  - [x] Compress to WebP 80% quality (~100KB target)
  - [x] Generate thumbnail at WebP 60% quality (~10KB target)
  - [x] Handle Safari fallback (no WebP → JPEG 85%)
  - [x] Return both Blobs for storage in Photos table

- [x] **Task 5: Implement Flash Animation** (AC: #2)
  - [x] Create flash/shutter effect on capture
  - [x] White overlay that fades out (200ms)
  - [x] Add haptic feedback via Navigator.vibrate() if available

- [x] **Task 6: Create Camera Permission Error UI** (AC: #3)
  - [x] Create `src/components/features/scanner/CameraPermissionError.tsx`
  - [x] Clear French message: "L'accès à la caméra est nécessaire pour scanner vos tickets"
  - [x] "Réessayer" button to request permission again
  - [x] Instructions for enabling camera in browser settings
  - [x] Different messages for NotFoundError vs NotAllowedError

- [x] **Task 7: Integrate into Scan Page** (AC: #1, #2, #3)
  - [x] Update `src/app/(app)/scan/page.tsx` with camera components
  - [x] Implement capture flow: capture → compress → store in Photos table → navigate
  - [x] Create draft ticket with photo reference in Dexie
  - [x] Navigate to verification screen (route to be created in Story 3.4)
  - [x] Add loading states for camera init and compression

- [x] **Task 8: Create Unit Tests** (AC: #1, #2, #3)
  - [x] Create `src/hooks/useCamera.test.ts` - Mock MediaDevices API
  - [x] Create `src/components/features/scanner/CameraView.test.tsx`
  - [x] Create `src/lib/utils/image.test.ts` - Test compression utilities
  - [x] Test permission error states
  - [x] Test image compression output sizes

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE CAMERA CAPTURE STORY FOR EPIC 3:** This story implements the camera capture UI that feeds into the OCR processing pipeline (Story 3.3) and verification screen (Story 3.4).

**Epic 3 Overview:** Scan & Validation (Core Flow + Offline) - The core product value.

**Dependency:** Story 3.1 (Local Database Schema) is DONE - the Photos and Tickets tables are ready for use.

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| browser-image-compression | ^2.x | WebP compression with Web Worker (TO INSTALL) |
| dexie | ^4.2.1 | Photos table storage (INSTALLED) |
| dexie-react-hooks | ^4.2.0 | useLiveQuery (INSTALLED) |

**New dependency required:** `browser-image-compression` for efficient client-side image compression with Web Worker support.

### Architecture Compliance (CRITICAL)

**From project-context.md:**
- useLiveQuery is the single source of truth for IndexedDB data
- useState only for ephemeral UI state (camera stream, loading states)
- All photos stored in Dexie IndexedDB as Blobs
- Photos uploaded to Supabase Storage on sync (Story 3.9)

**From architecture.md - Image Architecture:**
```
Photos stored in Dexie:
├── Original: WebP 80% quality (~100KB)
├── Thumbnail: WebP 60% quality (~10KB)
└── Linked to ticket via ticketId
```

**From ux-design-specification.md:**
- Direct to scanner: app launch goes directly to camera (no onboarding)
- Touch targets: 48px minimum, capture button 64px
- Bottom-anchored actions for thumb zone usability
- Flash animation + haptic vibration on capture

### Project Structure (FOLLOW EXACTLY)

```
src/
├── app/(app)/
│   └── scan/
│       └── page.tsx              # UPDATE - Integrate camera components
├── components/
│   └── features/
│       └── scanner/              # NEW folder
│           ├── CameraView.tsx    # NEW - Video viewfinder
│           ├── CameraView.test.tsx
│           ├── CaptureButton.tsx # NEW - 64px green button
│           ├── CameraPermissionError.tsx # NEW - Error states
│           └── index.ts          # NEW - Re-exports
├── hooks/
│   ├── useCamera.ts              # NEW - MediaDevices wrapper
│   ├── useCamera.test.ts         # NEW - Tests with mocked API
│   └── index.ts                  # UPDATE - Export useCamera
├── lib/
│   └── utils/
│       ├── image.ts              # NEW - Compression utilities
│       └── image.test.ts         # NEW - Compression tests
```

### MediaDevices getUserMedia Implementation Pattern

**From Web Research ([MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)):**

```typescript
// src/hooks/useCamera.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  error: CameraError | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  captureFrame: () => Promise<Blob | null>;
}

type CameraErrorType = 'not-allowed' | 'not-found' | 'not-readable' | 'unknown';

interface CameraError {
  type: CameraErrorType;
  message: string;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<CameraError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prefer rear camera for ticket scanning
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const error = err as DOMException;

      if (error.name === 'NotAllowedError') {
        setError({ type: 'not-allowed', message: 'Permission refusée' });
      } else if (error.name === 'NotFoundError') {
        setError({ type: 'not-found', message: 'Aucune caméra détectée' });
      } else if (error.name === 'NotReadableError') {
        setError({ type: 'not-readable', message: 'Caméra déjà utilisée' });
      } else {
        setError({ type: 'unknown', message: error.message || 'Erreur inconnue' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Auto-request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/webp',
        0.8 // 80% quality
      );
    });
  }, []);

  return {
    videoRef,
    stream,
    error,
    isLoading,
    requestPermission,
    captureFrame,
  };
}
```

### Image Compression Pattern

**From Web Research ([browser-image-compression](https://www.npmjs.com/package/browser-image-compression)):**

```typescript
// src/lib/utils/image.ts
import imageCompression from 'browser-image-compression';

interface CompressedImages {
  original: Blob;
  thumbnail: Blob;
}

export async function compressTicketImage(blob: Blob): Promise<CompressedImages> {
  const file = new File([blob], 'ticket.webp', { type: 'image/webp' });

  // Original: WebP 80% quality, ~100KB target
  const originalOptions = {
    maxSizeMB: 0.1, // 100KB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
  };

  // Thumbnail: WebP 60% quality, ~10KB target
  const thumbnailOptions = {
    maxSizeMB: 0.01, // 10KB
    maxWidthOrHeight: 200,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.6,
  };

  const [original, thumbnail] = await Promise.all([
    imageCompression(file, originalOptions),
    imageCompression(file, thumbnailOptions),
  ]);

  return { original, thumbnail };
}

// Safari fallback (no WebP support in canvas.toBlob)
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}
```

### Photo Storage Integration (From Story 3.1)

**Using Photos table from Story 3.1:**

```typescript
// Integration with existing hooks
import { db } from '@/lib/db';
import type { Photo } from '@/types';

async function savePhotoToLocal(ticketId: number, original: Blob, thumbnail: Blob): Promise<number> {
  const photo: Photo = {
    ticketId,
    blob: original,
    thumbnail,
    createdAt: new Date().toISOString(),
  };

  return await db.photos.add(photo);
}
```

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

| Element | Specification |
|---------|---------------|
| Capture button | 64px circular, green (#16A34A) |
| Touch targets | 48px minimum |
| Position | Bottom-anchored (thumb zone) |
| Guide frame | Dotted white border, 80% viewport width |
| Flash animation | White overlay, 200ms fade out |
| Haptic feedback | Navigator.vibrate([50]) on capture |

**Color Tokens:**
- Primary green (capture): `#16A34A` (Tailwind `green-600`)
- Button disabled: `#9CA3AF` (Tailwind `gray-400`)
- Guide frame: `rgba(255, 255, 255, 0.5)`

### CameraView Component Pattern

```typescript
// src/components/features/scanner/CameraView.tsx
'use client';

import { useCamera } from '@/hooks/useCamera';
import { CaptureButton } from './CaptureButton';
import { CameraPermissionError } from './CameraPermissionError';

export function CameraView() {
  const { videoRef, stream, error, isLoading, requestPermission, captureFrame } = useCamera();

  if (error) {
    return <CameraPermissionError error={error} onRetry={requestPermission} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black">
      {/* Video viewfinder */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dotted guide frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[80%] aspect-[3/4] border-2 border-dashed border-white/50 rounded-lg"
          aria-hidden="true"
        />
      </div>

      {/* Capture button in thumb zone */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <CaptureButton onCapture={captureFrame} />
      </div>
    </div>
  );
}
```

### Flash Animation Pattern

```typescript
// Flash effect with haptic feedback
async function handleCapture() {
  // Trigger haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  // Show flash overlay
  setShowFlash(true);
  setTimeout(() => setShowFlash(false), 200);

  // Capture and compress
  const blob = await captureFrame();
  if (blob) {
    const { original, thumbnail } = await compressTicketImage(blob);
    // Save to Dexie and navigate...
  }
}
```

### Previous Story Intelligence (Story 3.1)

**Learnings to apply:**
1. **TypeScript strict mode** - No `any` types, proper error handling
2. **useLiveQuery pattern** - Already have Photos table hooks ready
3. **Test patterns** - Use fake-indexeddb for storage tests
4. **Component testing** - Mock MediaDevices API for camera tests

**Code Review Issues from Story 3.1:**
- Wrap async operations in transactions for atomicity
- Add comprehensive tests for all CRUD operations
- Return `{ data, isLoading }` from all hooks

### Git Intelligence (Recent Commits)

| Commit | Insight |
|--------|---------|
| `d275dbc` | Story 3.1 - Dexie schema with Photos table ready |
| `8c1c2e8` | Story 2.5 - Middleware patterns for protected routes |
| `0b9df15` | Story 2.4 - Component testing patterns |

**Photos Table Schema (from Story 3.1):**
```typescript
interface Photo {
  id?: number;           // Auto-increment
  ticketId: number;      // FK to tickets table
  blob: Blob;            // WebP original (~100KB)
  thumbnail: Blob;       // WebP thumbnail (~10KB)
  createdAt: string;     // ISO 8601
}
```

### Data Formats (MANDATORY)

| Data | Format | Example |
|------|--------|---------|
| Image format | WebP (JPEG fallback Safari) | `image/webp` |
| Quality original | 80% | ~100KB |
| Quality thumbnail | 60% | ~10KB |
| Timestamps | ISO 8601 | `"2026-01-17T14:30:00.000Z"` |

### Error Messages (French)

| Error Type | Message |
|------------|---------|
| NotAllowedError | "L'accès à la caméra a été refusé. Autorisez l'accès dans les paramètres de votre navigateur." |
| NotFoundError | "Aucune caméra n'a été détectée sur cet appareil." |
| NotReadableError | "La caméra est déjà utilisée par une autre application." |
| Compression failed | "Erreur lors du traitement de l'image. Veuillez réessayer." |

### Forbidden Patterns (NEVER DO)

- Use `navigator.getUserMedia` (deprecated) - use `navigator.mediaDevices.getUserMedia`
- Store raw camera frames without compression
- Skip cleanup of MediaStream tracks on unmount
- Use `any` type for error handling
- Hardcode colors - use Tailwind design tokens
- Skip loading states during camera init or compression
- Create synchronous blocking during image compression (use Web Worker)

### Testing Strategy

**Mocking MediaDevices API:**

```typescript
// src/hooks/useCamera.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCamera } from './useCamera';

const mockGetUserMedia = vi.fn();
const mockEnumerateDevices = vi.fn();

beforeEach(() => {
  vi.stubGlobal('navigator', {
    mediaDevices: {
      getUserMedia: mockGetUserMedia,
      enumerateDevices: mockEnumerateDevices,
    },
    vibrate: vi.fn(),
  });
});

describe('useCamera', () => {
  it('should request camera permission on mount', async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
    mockGetUserMedia.mockResolvedValueOnce(mockStream);

    const { result } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.objectContaining({
          facingMode: { ideal: 'environment' },
        }),
      })
    );
  });

  it('should handle NotAllowedError', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError');
    mockGetUserMedia.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(result.current.error?.type).toBe('not-allowed');
    });
  });
});
```

### Integration with Future Stories

| Story | Integration Point |
|-------|------------------|
| 3.3 OCR Processing | Receives compressed image blob for Tesseract.js |
| 3.4 Verification Screen | Navigation target after capture |
| 3.7 Photo Archival | Photos already stored in Dexie from this story |
| 3.9 Background Sync | Photos in syncQueue for cloud upload |

### References

- [Source: epics.md#Story-3.2] - Acceptance criteria
- [Source: architecture.md#Image-Format] - WebP compression specs
- [Source: project-context.md#Project-Structure] - Component organization
- [Source: ux-design-specification.md#Touch-Targets] - Button sizing
- [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) - Camera API reference
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) - Compression library
- [LogRocket React Camera](https://blog.logrocket.com/responsive-camera-component-react-hooks/) - React patterns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Fixed test failures in CameraView.test.tsx by using more specific text matchers to avoid multiple element matches (e.g., `/Accès à la caméra refusé/` instead of `/refusé/i`)
- Fixed Image constructor mocking in image.test.ts using `vi.stubGlobal('Image', MockImage)` class pattern instead of `vi.spyOn`

### Completion Notes List

- All 8 tasks completed successfully
- 318 tests pass (12 new tests for ScanPageClient)
- Story ready for code review

### File List

**New Files Created:**
- `src/hooks/useCamera.ts` - MediaDevices getUserMedia wrapper hook
- `src/hooks/useCamera.test.ts` - 22 unit tests for camera hook
- `src/components/features/scanner/CameraView.tsx` - Main viewfinder component
- `src/components/features/scanner/CameraView.test.tsx` - 14 component tests
- `src/components/features/scanner/CaptureButton.tsx` - 64px green capture button
- `src/components/features/scanner/CameraPermissionError.tsx` - French error messages UI
- `src/components/features/scanner/FlashOverlay.tsx` - White flash with haptic feedback
- `src/components/features/scanner/index.ts` - Barrel exports
- `src/lib/utils/image.ts` - WebP compression with Safari JPEG fallback
- `src/lib/utils/image.test.ts` - 16 compression tests
- `src/app/(app)/scan/ScanPageClient.tsx` - Client component with capture flow
- `src/app/(app)/scan/ScanPageClient.test.tsx` - 12 integration tests

**Modified Files:**
- `src/hooks/index.ts` - Added useCamera exports
- `src/app/(app)/scan/page.tsx` - Updated to use ScanPageClient
- `package.json` - Added browser-image-compression dependency

## Code Review Notes

**Review Date:** 2026-01-17
**Reviewer:** Claude Opus 4.5 (Adversarial Code Review)
**Outcome:** APPROVED with fixes applied

### Issues Found and Fixed (6 total)

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | MEDIUM | `ScanPageClient.tsx` | Missing `setIsProcessing(false)` on success path | Added `finally` block |
| 2 | MEDIUM | `ScanPageClient.tsx` | Type assertion `as Ticket` bypasses validation | Used `satisfies` operator |
| 3 | LOW | `FlashOverlay.tsx` | useEffect missing cleanup for early unmount | Added `isMounted` ref guard |
| 4 | LOW | `CameraPermissionError.tsx` | Async onClick may fire twice on mobile | Added ref-based double-tap guard |
| 5 | LOW | `useCamera.ts` | Missing `onloadedmetadata` cleanup | Added cleanup in useEffect return |
| 6 | INFO | `image.ts` | No blob size validation | Added 20MB input size limit |

### Test Coverage

- **320 tests passing** (318 original + 2 new for size validation)
- All acceptance criteria verified
- Edge cases covered

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-17 | Story created with comprehensive developer context for camera capture UI | Claude Opus 4.5 |
| 2026-01-17 | Implementation complete: All 8 tasks done, 318 tests passing, ready for review | Claude Opus 4.5 |
| 2026-01-17 | Code review complete: 6 issues found and fixed, 320 tests passing, APPROVED | Claude Opus 4.5 |
