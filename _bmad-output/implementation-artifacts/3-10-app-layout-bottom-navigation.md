# Story 3.10: App Layout & Bottom Navigation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to navigate between main app sections easily**,
So that **I can access all features with my thumb**.

## Acceptance Criteria

1. **Given** I am logged in
   **When** I view any app page
   **Then** a Bottom Tab Bar is visible with 4 tabs: Scanner, Historique, Export, Paramètres
   **And** touch targets are 48px minimum
   **And** the current tab is highlighted
   **And** tapping a tab navigates to that section

2. **Given** I am on any authenticated page
   **When** I tap a navigation tab
   **Then** the page transitions smoothly without full reload
   **And** the active tab indicator updates immediately

3. **Given** I am using the app one-handed
   **When** I need to navigate
   **Then** all navigation tabs are reachable in the thumb zone
   **And** the navigation bar stays fixed at the bottom

4. **Given** I navigate between sections
   **When** I return to a previously visited section
   **Then** the scroll position and state are preserved (where applicable)

## Tasks / Subtasks

- [x] **Task 1: Create BottomNavigation Component** (AC: #1, #3)
  - [x] Create `src/components/features/navigation/BottomNavigation.tsx`
  - [x] Implement 4 tabs with icons: Scanner (Camera), Historique (List), Export (Download), Paramètres (Settings)
  - [x] Use Lucide React icons for consistency
  - [x] Touch targets 48px minimum height
  - [x] Fixed bottom positioning with safe-area-inset handling
  - [x] Write unit tests (5 tests)

- [x] **Task 2: Create Tab Icons and Active States** (AC: #1, #2)
  - [x] Import icons from lucide-react: Camera, List, Download, Settings
  - [x] Active state: primary green (#16A34A) fill
  - [x] Inactive state: muted gray (#64748B)
  - [x] Active indicator: underline or background highlight
  - [x] Smooth transition animation (150ms)

- [x] **Task 3: Implement Navigation Logic with Next.js App Router** (AC: #2, #4)
  - [x] Use `usePathname()` from next/navigation to detect active route
  - [x] Use `<Link>` for navigation (client-side, no full reload)
  - [x] Routes: `/scan`, `/tickets`, `/export`, `/settings`
  - [x] Handle nested routes (e.g., `/tickets/[id]` still highlights Historique)

- [x] **Task 4: Create Placeholder Pages for Empty Sections** (AC: #1)
  - [x] Update `src/app/(app)/tickets/page.tsx` - placeholder "Historique" page with icon
  - [x] Update `src/app/(app)/export/page.tsx` - placeholder "Export" page with icon
  - [x] Update `src/app/(app)/settings/page.tsx` - enhanced "Paramètres" page with header icon
  - [x] Each placeholder shows section title and "À venir dans Epic X" message
  - [x] Use EmptyState pattern from UX design

- [x] **Task 5: Integrate BottomNavigation into App Layout** (AC: #1, #3)
  - [x] Update `src/app/(app)/layout.tsx` to include BottomNavigation
  - [x] Position navigation below main content with proper spacing
  - [x] Ensure content doesn't overlap navigation (pb-20 on main)
  - [x] Build passes successfully

- [x] **Task 6: Handle Safe Area Insets for Mobile** (AC: #3)
  - [x] Add `env(safe-area-inset-bottom)` via inline style for iOS notch/home indicator
  - [x] Navigation uses fixed positioning with z-50
  - [x] Navigation is fully visible and tappable

- [x] **Task 7: Accessibility and Polish** (AC: #1, #2, #3)
  - [x] Add proper aria-labels to navigation items
  - [x] Add aria-current="page" to active tab
  - [x] Keyboard navigation support with focus-visible:ring-2
  - [x] Focus visible states (ring-2 primary)
  - [x] role="navigation" and aria-label on nav element

## Dev Notes

### Story Context (CRITICAL)

**THIS IS THE FINAL STORY OF EPIC 3:** This story completes the core scanning flow by adding proper navigation between app sections. After this story, the main scanning workflow (scan → verify → validate) is fully functional with navigation.

**Epic 3 Overview:** Scan & Validation (Core Flow + Offline) - The core product value.

**Dependencies:**
- Story 3.1-3.9 (All DONE): Core scanning, validation, sync infrastructure
- Story 4.1 (Ticket List): Will use `/tickets` route we create
- Story 5.1 (Export): Will use `/export` route we create
- Story 6.4 (Settings): Will use `/settings` route we create

### Technical Stack Requirements (EXACT VERSIONS)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App Router, usePathname, Link |
| react | 19.x | Components |
| lucide-react | latest | Icon library |
| tailwindcss | 4.x | Styling with @theme tokens |

### Architecture Compliance (CRITICAL)

**From project-context.md:**

- **Route Groups:** `(app)/` for authenticated routes with BottomNav
- **Navigation:** Use Next.js `<Link>` for client-side navigation
- **Layout:** Single column, bottom-anchored actions
- **Touch Targets:** 48px minimum

### UX Design Requirements (MANDATORY)

**From ux-design-specification.md:**

**Bottom Navigation Pattern:**
- Fixed at bottom, above safe area
- 4 tabs maximum (per mobile best practices)
- Icons with optional labels below
- Touch targets 48x48px minimum
- Current tab clearly highlighted

**Visual Design:**
- Active: Primary green (#16A34A)
- Inactive: Muted gray (#64748B)
- Background: White with subtle shadow or border-top
- Height: 64-72px including padding

**Thumb Zone Optimization:**
- All tabs reachable one-handed
- Center and right tabs most used (Scanner as default, Settings for sync retry)

### Navigation Routes

| Tab | Icon | Route | Future Story |
|-----|------|-------|--------------|
| Scanner | Camera | `/scan` | Already implemented (3.2) |
| Historique | List | `/tickets` | Epic 4 (4.1 Ticket List) |
| Export | Download | `/export` | Epic 5 (5.1 Export Page) |
| Paramètres | Settings | `/settings` | Epic 6 (6.4 Settings Page) |

### Component Structure

```typescript
// src/components/features/navigation/BottomNavigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, List, Download, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/scan', icon: Camera, label: 'Scanner' },
  { href: '/tickets', icon: List, label: 'Historique' },
  { href: '/export', icon: Download, label: 'Export' },
  { href: '/settings', icon: Settings, label: 'Paramètres' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full min-h-[48px]',
                'transition-colors duration-150',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Layout Integration

```typescript
// src/app/(app)/layout.tsx
import { AppHeader } from '@/components/features/sync/AppHeader';
import { SyncEngineProvider } from '@/components/features/sync/SyncEngineProvider';
import { BottomNavigation } from '@/components/features/navigation/BottomNavigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SyncEngineProvider>
      <AppHeader />
      <main className="pb-20"> {/* Space for bottom nav */}
        {children}
      </main>
      <BottomNavigation />
    </SyncEngineProvider>
  );
}
```

### Placeholder Page Pattern

```typescript
// src/app/(app)/tickets/page.tsx
import { List } from 'lucide-react';

export default function TicketsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.20))] p-4">
      <List className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-xl font-semibold text-foreground mb-2">Historique</h1>
      <p className="text-muted-foreground text-center">
        La liste de vos tickets validés sera disponible dans Epic 4.
      </p>
    </div>
  );
}
```

### Safe Area Handling

**CSS for iOS Home Indicator:**
```css
/* In global CSS or Tailwind plugin */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

**Or using Tailwind's arbitrary values:**
```tsx
<nav className="pb-[env(safe-area-inset-bottom)]">
```

### Testing Strategy

**Unit Tests (BottomNavigation.test.tsx):**
- Renders all 4 navigation items
- Highlights active tab based on pathname
- Uses Link components for navigation
- Has proper accessibility attributes
- Handles nested routes (e.g., /tickets/123)

**Manual Testing:**
- Test on mobile viewport (375px, 390px)
- Test touch interactions
- Test navigation transitions
- Test safe area on iPhone simulator
- Test with VoiceOver

### Previous Story Intelligence (Story 3-9)

**Learnings to apply:**
1. Layout already has SyncEngineProvider - add BottomNavigation alongside
2. AppHeader is separate from layout content - keep structure consistent
3. Test file co-location pattern: `Component.test.tsx`
4. Export from index file: `src/components/features/navigation/index.ts`

**Established patterns:**
- `'use client'` directive for interactive components
- cn() utility for conditional classNames
- Lucide icons with aria-hidden="true"
- Fixed positioning with safe area insets

### Existing Code to Integrate With

**From src/app/(app)/layout.tsx:**
```typescript
// Current structure (Story 3.9)
<SyncEngineProvider>
  <AppHeader />
  {children}
</SyncEngineProvider>

// After Story 3.10
<SyncEngineProvider>
  <AppHeader />
  <main className="pb-20">{children}</main>
  <BottomNavigation />
</SyncEngineProvider>
```

**From src/lib/utils.ts:**
```typescript
// cn utility for classnames
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Forbidden Patterns (NEVER DO)

- Navigation in Service Worker (use Next.js routing)
- Full page reloads on navigation (use Link)
- Overlapping content with fixed nav (use padding)
- Touch targets < 48px (accessibility violation)
- Missing aria attributes (screen reader fails)
- Hardcoded colors (use Tailwind tokens)

### References

- [Source: epics.md#Story-3.10] - Acceptance criteria
- [Source: project-context.md#Project-Structure] - Route groups pattern
- [Source: ux-design-specification.md#Navigation] - Bottom nav pattern
- [Source: ux-design-specification.md#Touch-Targets] - 48px minimum
- [Source: architecture.md#PWA] - Safe area handling

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build passes successfully with all routes
- 782 tests pass (5 new tests added for BottomNavigation)

### Completion Notes List

- Created BottomNavigation component with 4 tabs, fixed positioning, and safe area handling
- Implemented active state detection supporting nested routes (e.g., /tickets/123)
- Added 5 unit tests covering: rendering, active state, Link usage, nested routes, touch targets
- Updated placeholder pages with icons and improved UX pattern
- Integrated navigation into app layout with proper spacing (pb-20)
- Full accessibility support: aria-labels, aria-current, focus-visible states

### File List

| File | Status | Description |
|------|--------|-------------|
| `src/components/features/navigation/BottomNavigation.tsx` | Created | Main bottom navigation component with 4 tabs |
| `src/components/features/navigation/BottomNavigation.test.tsx` | Created | Unit tests for navigation (6 tests) |
| `src/components/features/navigation/index.ts` | Created | Barrel export |
| `src/app/(app)/tickets/page.tsx` | Modified | Added icon and improved empty state layout |
| `src/app/(app)/export/page.tsx` | Modified | Added icon and improved empty state layout |
| `src/app/(app)/settings/page.tsx` | Modified | Added header icon and improved layout |
| `src/app/(app)/layout.tsx` | Modified | Integrated BottomNavigation with pb-20 spacing |

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-01-22
**Outcome:** ✅ APPROVED (after fixes)

### Issues Found and Fixed

| Severity | Issue | File | Fix Applied |
|----------|-------|------|-------------|
| MEDIUM | Hardcoded colors (bg-white, border-gray-200) instead of theme tokens | BottomNavigation.tsx:51 | Changed to bg-background, border-border |
| LOW | Double pb-20 padding causing excessive spacing | settings/page.tsx:24 | Removed duplicate pb-20 |
| LOW | Magic number 8rem in min-height calculation | tickets/page.tsx, export/page.tsx | Updated to 9rem (nav + layout padding) |
| LOW | Missing accessibility test for nav element | BottomNavigation.test.tsx | Added test for role="navigation" and aria-label |

### Review Summary

- All 4 Acceptance Criteria verified as implemented
- All 7 tasks verified as complete
- Git changes match story File List claims
- 6 tests pass (5 original + 1 new accessibility test)
- Build passes successfully
- Note: Pre-existing overlap issue in ManualEntryClient.tsx and VerifyPageClient.tsx (outside story scope)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-22 | Story created with comprehensive navigation implementation guide | Claude Opus 4.5 |
| 2026-01-22 | Tasks 1-7 implemented: BottomNavigation, placeholder pages, layout integration | Claude Opus 4.5 |
| 2026-01-22 | Code review: Fixed 4 issues (1 MEDIUM, 3 LOW), added accessibility test | Claude Opus 4.5 |
