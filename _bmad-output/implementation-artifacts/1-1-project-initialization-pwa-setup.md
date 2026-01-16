# Story 1.1: Project Initialization & PWA Setup

Status: done

## Story

As a **developer**,
I want **to initialize the project with Next.js 16, Tailwind CSS 4, and PWA configuration**,
So that **the technical foundation is ready for feature development**.

## Acceptance Criteria

1. **Given** a fresh development environment
   **When** the initialization scripts are run
   **Then** a Next.js 16.1.1 project is created with TypeScript strict mode

2. **Given** the project is initialized
   **When** Tailwind CSS is configured
   **Then** Tailwind CSS 4.x is set up with CSS-first @theme configuration

3. **Given** Tailwind is configured
   **When** shadcn/ui is initialized
   **Then** Button and Card components are available in `src/components/ui/`

4. **Given** the project structure is ready
   **When** Serwist is configured
   **Then** Service Worker is generated with precaching for PWA support

5. **Given** PWA is configured
   **When** manifest.json is created
   **Then** it includes app name "Z-Scanner", icons (192px, 512px), standalone display mode, and theme color

6. **Given** the app is deployed or served
   **When** accessed on mobile
   **Then** the app can be installed on home screen (FR34)

7. **Given** all setup is complete
   **When** `npm run dev` is executed
   **Then** development server starts without errors

## Tasks / Subtasks

- [x] **Task 1: Create Next.js 16 project** (AC: #1)
  - [x] Run `npx create-next-app@latest z-scanner --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [x] Verify TypeScript strict mode in tsconfig.json
  - [x] Confirm App Router structure in src/app/
  - [x] Remove boilerplate content from page.tsx

- [x] **Task 2: Configure Tailwind CSS 4.x with @theme** (AC: #2)
  - [x] Configure CSS-first @theme inline in globals.css (Tailwind 4.x has no config file)
  - [x] Create src/app/globals.css with @theme tokens
  - [x] Add design tokens: --color-primary (#16A34A), --color-trust (#1D4ED8), --color-danger (#DC2626)
  - [x] Configure --min-touch (48px), --radius-thumb (12px)
  - [x] Create src/styles/tokens.ts for JS/TS token access

- [x] **Task 3: Initialize shadcn/ui** (AC: #3)
  - [x] Run `npx shadcn@latest init` with default configuration
  - [x] Add Button component: `npx shadcn@latest add button`
  - [x] Add Card component: `npx shadcn@latest add card`
  - [x] Verify components in src/components/ui/

- [x] **Task 4: Install core dependencies** (AC: #1)
  - [x] Install Serwist: `npm install serwist @serwist/next`
  - [x] Install Dexie: `npm install dexie dexie-react-hooks`
  - [x] Install Supabase: `npm install @supabase/supabase-js @supabase/ssr`
  - [x] Install crypto: `npm install @noble/hashes`
  - [x] Install validation: `npm install zod`

- [x] **Task 5: Configure Serwist Service Worker** (AC: #4)
  - [x] Create src/app/sw.ts with Serwist configuration
  - [x] Update next.config.ts with @serwist/next plugin
  - [x] Configure precache for app shell (StaleWhileRevalidate)
  - [x] Configure runtime caching strategies per architecture

- [x] **Task 6: Create PWA manifest** (AC: #5, #6)
  - [x] Create public/manifest.json with full PWA configuration
  - [x] Add icons: public/icons/icon-192.png, icon-512.png, apple-touch-icon.png
  - [x] Configure: name, short_name, theme_color, background_color, display: standalone
  - [x] Add meta tags in src/app/layout.tsx for PWA

- [x] **Task 7: Create project structure** (AC: #7)
  - [x] Create directory structure per architecture spec
  - [x] Add placeholder files for lib/, hooks/, types/
  - [x] Create .env.example with Supabase variable templates
  - [x] Verify build and dev server work correctly

## Dev Notes

### Technical Stack (Exact Versions Required)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | Framework (App Router, Turbopack) |
| react | 19.x | UI library (React Compiler auto-memoization) |
| typescript | 5.x | Language (strict mode mandatory) |
| tailwindcss | 4.x | Styling (CSS-first @theme config) |
| serwist | 9.5.0 | Service Worker PWA |
| @serwist/next | 9.5.0 | Next.js SW integration |
| dexie | 4.x | IndexedDB wrapper |
| dexie-react-hooks | 1.x | React integration |
| @supabase/supabase-js | 2.x | Backend client |
| @supabase/ssr | 0.x | Server components |
| @noble/hashes | 1.x | SHA-256 for NF525 |
| zod | latest | Validation schemas |

### Project Structure (MANDATORY)

```
z-scanner/
├── .env.example
├── .env.local (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json (shadcn)
├── public/
│   ├── manifest.json
│   ├── sw.js (generated)
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── apple-touch-icon.png
└── src/
    ├── app/
    │   ├── layout.tsx (root + PWA meta)
    │   ├── page.tsx (landing placeholder)
    │   ├── globals.css (@theme tokens)
    │   ├── sw.ts (Serwist config)
    │   ├── (auth)/ (route group placeholder)
    │   └── (app)/ (route group placeholder)
    ├── components/
    │   ├── ui/ (shadcn components)
    │   └── features/ (empty placeholder)
    ├── lib/
    │   ├── db/ (Dexie placeholder)
    │   ├── supabase/ (client placeholder)
    │   ├── ocr/ (Tesseract placeholder)
    │   ├── sync/ (queue placeholder)
    │   ├── crypto/ (hash placeholder)
    │   └── utils/ (formatters placeholder)
    ├── hooks/ (placeholder)
    ├── types/ (placeholder)
    └── styles/ (tokens placeholder)
```

### Design Tokens (globals.css)

```css
@theme {
  /* Colors - Emotional Design */
  --color-primary: #16A34A;      /* Green - Validation, soulagement */
  --color-trust: #1D4ED8;        /* Blue - NF525 badge, confiance */
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-foreground: #0F172A;
  --color-muted: #64748B;
  --color-danger: #DC2626;       /* Red - Annulation, erreurs */
  --color-warning: #F59E0B;      /* Orange - Sync pending */

  /* Touch Targets - Mobile UX */
  --min-touch: 48px;
  --button-primary: 64px;
  --button-hero: 80px;

  /* Spacing */
  --radius-thumb: 12px;
  --margin-screen: 16px;
}
```

### PWA Manifest Configuration

```json
{
  "name": "Z-Scanner",
  "short_name": "Z-Scanner",
  "description": "Digitalisez vos tickets Z en conformité NF525",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#16A34A",
  "background_color": "#FFFFFF",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

### Serwist Configuration (next.config.ts)

```typescript
import withSerwist from '@serwist/next';

const nextConfig = {
  // Next.js 16 config
};

export default withSerwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
})(nextConfig);
```

### Service Worker Caching Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| App Shell | Precache + StaleWhileRevalidate | Auto-update |
| Static Assets | CacheFirst | 1 year |
| API /tickets | NetworkFirst → Cache | Fresh when online |
| Photos | IndexedDB only | Permanent |

### Environment Variables (.env.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Sentry
NEXT_PUBLIC_SENTRY_DSN=
```

### Forbidden Patterns (NEVER DO)

- Do NOT use `pages/` directory - App Router only
- Do NOT disable TypeScript strict mode
- Do NOT use tailwind.config.js - use .ts extension
- Do NOT skip PWA manifest configuration
- Do NOT hardcode Supabase credentials
- Do NOT commit .env.local to git

### Naming Conventions

| Context | Convention | Example |
|---------|------------|---------|
| React components | PascalCase | `Button.tsx` |
| Hooks | camelCase + use prefix | `useTickets.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `Ticket.ts` |
| API routes | kebab-case | `/api/tickets` |

### Project Structure Notes

- Route groups `(auth)` and `(app)` separate public and protected routes
- `lib/` contains business logic, `hooks/` contains React hooks
- `components/ui/` is shadcn territory, `components/features/` is custom
- All Dexie operations go in `lib/db/`
- All Supabase client creation in `lib/supabase/`

### References

- [Source: architecture.md#Starter-Template-Evaluation] - Initialization command and dependencies
- [Source: architecture.md#Project-Structure-Boundaries] - Complete directory structure
- [Source: architecture.md#Service-Worker-Caching-Strategy] - Serwist configuration
- [Source: ux-design-specification.md#Design-System-Foundation] - Design tokens
- [Source: ux-design-specification.md#Color-System] - Color palette
- [Source: project-context.md#Technology-Stack] - Exact versions
- [Source: epics.md#Story-1.1] - Acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Project was already partially initialized with Next.js 16.1.1 by create-next-app
- Migrated from `app/` to `src/app/` to conform to architecture spec
- Updated tsconfig.json paths from `@/*` -> `./*` to `@/*` -> `./src/*`
- Added `webworker` lib to tsconfig for Service Worker types
- Serwist configured with `disable: process.env.NODE_ENV !== "production"` for Turbopack compatibility
- shadcn/ui added additional CSS variables to globals.css (sidebar, chart tokens)
- shadcn CSS tokens harmonized with Z-Scanner brand colors (green primary, red destructive)
- PWA icons properly sized (192x192, 512x512, 180x180) from SVG sources using sharp
- Vitest test framework installed with initial Button component test suite
- Build and dev server verified working

### File List

**Created:**
- src/app/sw.ts (Serwist Service Worker)
- src/app/offline/page.tsx (Offline fallback page)
- src/app/favicon.ico (Z-Scanner favicon 32x32)
- src/lib/db/index.ts (Dexie placeholder)
- src/lib/supabase/client.ts (Supabase browser client placeholder)
- src/lib/supabase/server.ts (Supabase server client placeholder)
- src/lib/ocr/index.ts (Tesseract.js placeholder)
- src/lib/sync/queue.ts (Sync queue placeholder)
- src/lib/sync/engine.ts (Sync engine placeholder)
- src/lib/crypto/hash.ts (NF525 hash placeholder)
- src/lib/utils/format.ts (Formatters placeholder)
- src/lib/utils.ts (shadcn cn utility)
- src/hooks/index.ts (Hooks index)
- src/types/index.ts (Types index)
- src/styles/tokens.ts (Design tokens for JS/TS)
- src/test/setup.ts (Vitest test setup)
- src/components/ui/button.tsx (shadcn Button)
- src/components/ui/button.test.tsx (Button component tests)
- src/components/ui/card.tsx (shadcn Card)
- public/manifest.json (PWA manifest)
- public/icons/icon-192.png (App icon 192x192)
- public/icons/icon-512.png (App icon 512x512)
- public/icons/apple-touch-icon.png (Apple touch icon 180x180)
- public/icons/icon-192.svg (SVG source)
- public/icons/icon-512.svg (SVG source)
- public/icons/apple-touch-icon.svg (SVG source)
- .env.example (Environment template)
- components.json (shadcn config)
- vitest.config.ts (Vitest configuration)
- scripts/generate-icons.mjs (Icon generation script)

**Modified:**
- next.config.ts (Added Serwist plugin)
- tsconfig.json (Added webworker lib, updated paths)
- src/app/globals.css (Design tokens + shadcn variables + Z-Scanner brand colors)
- src/app/layout.tsx (PWA meta tags, Inter font)
- src/app/page.tsx (Removed boilerplate)
- package.json (All dependencies + test scripts added)

**Deleted:**
- app/ (Migrated to src/app/)

## Change Log

| Date | Change |
|------|--------|
| 2026-01-16 | Initial implementation - All 7 tasks completed |
| 2026-01-16 | Code review fixes - PWA icons, Vitest, CSS tokens harmonized |

## Code Review Record

**Reviewer:** Claude Opus 4.5 (adversarial review)
**Date:** 2026-01-16
**Status:** PASSED (all issues fixed)

### Issues Found & Fixed

| Severity | Issue | Resolution |
|----------|-------|------------|
| HIGH | Invalid 1x1 pixel PWA icons | Generated proper 192x192, 512x512, 180x180 PNGs using sharp |
| HIGH | Missing Vitest test framework | Installed Vitest with test setup and Button component tests |
| MEDIUM | CSS token conflicts (shadcn gray vs Z-Scanner green) | Harmonized shadcn tokens to use Z-Scanner brand colors |
| MEDIUM | False claim about tailwind.config.ts | Updated story to reflect Tailwind 4 CSS-first config |
| MEDIUM | Empty src/styles/ directory | Added tokens.ts for JS/TS design token access |
| MEDIUM | Incomplete File List | Updated with all created/modified/deleted files |
| LOW | app/ directory deletion unstaged | Staged deletions with git add |
| LOW | Missing favicon.ico | Generated and placed in src/app/ |
| LOW | Unstaged deletions in git | Properly staged all changes |

### Verification

- Build passes: `npm run build` ✓
- Tests pass: `npm run test:run` (5/5 tests) ✓
- Dev server works: `npm run dev` ✓
