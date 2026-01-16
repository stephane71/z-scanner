# Story 1.3: Landing Page (Public)

Status: done

## Story

As a **visitor**,
I want **to see a landing page presenting Z-Scanner's value proposition**,
So that **I understand what the app does and can decide to register** (FR35).

## Acceptance Criteria

1. **Given** a visitor navigates to the root URL (/)
   **When** the landing page loads
   **Then** the page renders with SSR (SEO optimized)

2. **Given** the landing page is displayed
   **When** I view the hero section
   **Then** the value proposition is clearly displayed: "Scanne ton ticket Z, valide en 1 tap, c'est conforme"

3. **Given** the landing page is displayed
   **When** I look for the main call-to-action
   **Then** a "Commencer" CTA button is visible in the thumb zone

4. **Given** the landing page is rendered
   **When** performance is measured
   **Then** the page meets Core Web Vitals (LCP < 2.5s)

5. **Given** the page source is inspected
   **When** SEO elements are checked
   **Then** meta tags and Open Graph are properly configured

6. **Given** the page is viewed on different devices
   **When** responsive behavior is tested
   **Then** the page is mobile-first with max-width ~480px content area

## Tasks / Subtasks

- [x] **Task 1: Create Landing Page Route** (AC: #1)
  - [x] Create `src/app/(auth)/page.tsx` as Server Component for SSR (route group per architecture)
  - [x] Ensure route is public (no auth required)
  - [x] Verify page renders without JavaScript (SSR test)

- [x] **Task 2: Hero Section Implementation** (AC: #2, #3)
  - [x] Create `src/components/features/landing/HeroSection.tsx`
  - [x] Display headline: "Scanne ton ticket Z, valide en 1 tap, c'est conforme"
  - [x] Add subheadline: "L'app qui simplifie ta comptabilité de marché"
  - [x] Include "Commencer" CTA button (primary green, 64px height, thumb zone)
  - [x] Link CTA to `/register` route

- [x] **Task 3: Feature Highlights Section** (AC: #2)
  - [x] Create `src/components/features/landing/FeaturesSection.tsx`
  - [x] Display 3 key features with icons:
    - OCR intelligent: "Photo → Données en 5 secondes"
    - Conforme NF525: "Archivage certifié et horodaté"
    - 100% offline: "Fonctionne sans connexion"
  - [x] Use shadcn Card components for feature cards

- [x] **Task 4: Trust Section** (AC: #2)
  - [x] Create `src/components/features/landing/TrustSection.tsx`
  - [x] Display NF525 badge prominently (trust blue color)
  - [x] Add reassuring text about data security and compliance
  - [x] Add shield icon illustration

- [x] **Task 5: Final CTA Section** (AC: #3)
  - [x] Create `src/components/features/landing/CTASection.tsx`
  - [x] Secondary CTA at bottom: "S'inscrire gratuitement"
  - [x] Link to `/register` route

- [x] **Task 6: SEO & Meta Tags** (AC: #5)
  - [x] Configure metadata in `src/app/page.tsx` using Next.js Metadata API
  - [x] Set title: "Z-Scanner - Digitalisez vos tickets Z"
  - [x] Set description: "Application mobile pour maraîchers et commerçants. Scannez, validez, archivez vos tickets Z en conformité NF525."
  - [x] Configure Open Graph: og:title, og:description, og:type, og:locale, og:siteName
  - [x] Configure Twitter card metadata
  - [x] Verify robots meta allows indexing

- [x] **Task 7: Responsive Layout** (AC: #6)
  - [x] Apply mobile-first CSS with max-width container (~480px via max-w-md)
  - [x] Center content on larger screens (mx-auto)
  - [x] Ensure touch targets are 48px minimum (h-16 for CTA = 64px)
  - [x] Responsive text sizes (text-2xl md:text-3xl)

- [x] **Task 8: Performance Optimization** (AC: #4)
  - [x] Ensure no client-side JavaScript blocks rendering (all Server Components)
  - [x] No images used - icons via SVG (optimal performance)
  - [x] Build succeeds with static prerendering
  - [x] Minimal CSS via Tailwind utilities

- [x] **Task 9: Visual Polish** (AC: #2, #6)
  - [x] Apply design system colors (primary green, trust blue)
  - [x] Use Inter font from design system (via layout.tsx)
  - [x] High contrast text colors (foreground on background)
  - [x] Proper spacing using Tailwind spacing scale (p-4, py-12, gap-4)

## Dev Notes

### Technical Stack Requirements (EXACT)

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.1 | SSR page rendering |
| Tailwind CSS | 4.x | Styling with design tokens |
| shadcn/ui | latest | Button, Card components |

**Dependencies already installed in Story 1.1** - Do NOT reinstall.

### Landing Page Architecture

The landing page MUST be a **Server Component** for optimal SEO:

```typescript
// src/app/(auth)/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Z-Scanner - Digitalisez vos tickets Z',
  description: 'Application mobile pour maraîchers et commerçants...',
  openGraph: {
    title: 'Z-Scanner - Digitalisez vos tickets Z',
    description: 'Application mobile pour maraîchers et commerçants...',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <TrustSection />
      <CTASection />
    </main>
  )
}
```

### Route Group Structure

Per project structure, use route groups:
- `(auth)/` - Public routes (landing, login, register)
- `(app)/` - Authenticated routes

The landing page goes in `src/app/(auth)/page.tsx` as the root `/` route.

### Design System Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | #16A34A | CTA buttons, success states |
| `--trust` | #1D4ED8 | NF525 badge, trust indicators |
| `--background` | #FFFFFF | Page background |
| `--foreground` | #0F172A | Main text |
| `--muted` | #64748B | Secondary text |

### Typography Scale

| Element | Size | Tailwind Class |
|---------|------|----------------|
| Hero headline | 24-28px | text-2xl md:text-3xl |
| Subheadline | 16-18px | text-base md:text-lg |
| Feature titles | 18px | text-lg |
| Body text | 16px | text-base |

### Responsive Breakpoints

| Device | Width | Behavior |
|--------|-------|----------|
| Small | 320-374px | Full width, compact spacing |
| Standard | 375-413px | Primary target |
| Large | 414px+ | Centered with max-width |

```css
/* Container pattern */
.landing-container {
  @apply mx-auto max-w-md px-4;
}
```

### CTA Button Specifications

```typescript
// Primary CTA (Commencer)
<Button
  className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary/90"
  asChild
>
  <Link href="/register">Commencer</Link>
</Button>
```

- Height: 64px (h-16)
- Width: Full width on mobile
- Color: Primary green (#16A34A)
- Font: 18px bold

### SEO Requirements

**Meta Tags (Required):**
```typescript
export const metadata: Metadata = {
  title: 'Z-Scanner - Digitalisez vos tickets Z',
  description: 'Application mobile pour maraîchers et commerçants. Scannez, validez, archivez vos tickets Z en conformité NF525.',
  keywords: ['ticket Z', 'maraîcher', 'commerçant', 'NF525', 'OCR', 'conformité fiscale'],
  authors: [{ name: 'Z-Scanner' }],
  openGraph: {
    title: 'Z-Scanner - Digitalisez vos tickets Z',
    description: 'Scannez, validez, archivez vos tickets Z en conformité NF525.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Z-Scanner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Z-Scanner - Digitalisez vos tickets Z',
    description: 'Scannez, validez, archivez vos tickets Z en conformité NF525.',
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TTI | < 3.5s | Lighthouse |

**Optimization Strategies:**
1. Server Component (no client JS for render)
2. Critical CSS inlined
3. No heavy images in above-fold
4. Font preload (Inter)

### File Structure (MUST FOLLOW)

```
src/
├── app/
│   └── (auth)/
│       └── page.tsx          # Landing page (Server Component)
└── components/
    └── features/
        └── landing/
            ├── HeroSection.tsx
            ├── FeaturesSection.tsx
            ├── TrustSection.tsx
            └── CTASection.tsx
```

### Content Copy (French)

**Hero:**
- Headline: "Scanne ton ticket Z, valide en 1 tap, c'est conforme"
- Subheadline: "L'app qui simplifie ta comptabilité de marché"

**Features:**
1. "OCR intelligent" - "Photo → Données en 5 secondes"
2. "Conforme NF525" - "Archivage certifié et horodaté"
3. "100% offline" - "Fonctionne sans connexion"

**Trust:**
- "Vos données sont sécurisées et conservées 6 ans conformément à la réglementation fiscale"

**CTA:**
- Primary: "Commencer"
- Secondary: "S'inscrire gratuitement"

### Forbidden Patterns (NEVER DO)

- Do NOT use Client Components for the main page (breaks SSR)
- Do NOT add heavy images without next/image optimization
- Do NOT use useEffect or useState in landing page
- Do NOT create inline styles (use Tailwind only)
- Do NOT skip metadata configuration
- Do NOT use placeholder text (use actual French copy)

### Previous Story Intelligence (Story 1.2)

**Learnings to apply:**

1. Project uses src/ directory structure with path alias `@/*` → `./src/*`
2. Tailwind CSS 4 uses CSS-first @theme configuration
3. shadcn/ui components are in `src/components/ui/`
4. TypeScript strict mode is ON - all types must be correct
5. Build verification: `npm run build` must pass
6. Testing: Vitest for unit tests

**Files created in 1.1/1.2 to reuse:**
- Button component from shadcn/ui
- Card component from shadcn/ui
- Design tokens in global CSS

### Testing Approach

**Manual Tests:**
1. Open `http://localhost:3000/` - verify page loads
2. View page source - verify SSR (HTML content present)
3. Run Lighthouse - verify performance scores
4. Test on mobile viewport (Chrome DevTools)
5. Click "Commencer" - verify navigation to /register

**Automated Tests (Optional for MVP):**
- Component snapshot tests for landing sections
- SEO metadata verification test

### References

- [Source: epics.md#Story-1.3] - Acceptance criteria
- [Source: ux-design-specification.md#Defining-Experience] - Value proposition
- [Source: ux-design-specification.md#Visual-Design-Foundation] - Color tokens, typography
- [Source: ux-design-specification.md#Responsive-Design] - Mobile-first approach
- [Source: project-context.md#Project-Structure] - File organization
- [Source: architecture.md] - Route group structure

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Route Structure**: Landing page placed at `src/app/(auth)/page.tsx` per project architecture (route groups for public auth routes).

2. **Server Components**: All landing page components are Server Components (no 'use client' directive) for optimal SSR and SEO performance.

3. **Icon Implementation**: Used inline SVG icons instead of images for optimal performance - no image optimization needed, instant rendering.

4. **Test Setup Fix**: Added `@testing-library/jest-dom` package and updated `src/test/setup.ts` to properly import jest-dom matchers for Vitest compatibility.

5. **French Text Handling**: Used HTML entities (`&apos;`, `&eacute;`) for French special characters in JSX to ensure proper rendering across environments.

6. **Design System Tokens**: Leveraged existing Tailwind CSS 4 design tokens (primary, trust, foreground, muted) configured in `globals.css`.

7. **Test Coverage**: 17 new tests added for landing page components (HeroSection: 5, FeaturesSection: 4, TrustSection: 4, CTASection: 4), total suite now at 31 tests.

8. **Build Performance**: Build time ~2.0s with static prerendering in ~218ms for all routes.

### Code Review Fixes Applied (2026-01-16)

1. **[HIGH] Route Structure Fixed**: Moved landing page from `src/app/page.tsx` to `src/app/(auth)/page.tsx` to comply with documented architecture.

2. **[MEDIUM] Open Graph Image Added**: Added `og:image` and Twitter image configuration with placeholder path `/og-image.png` (1200x630).

3. **[MEDIUM] MetadataBase Added**: Added `metadataBase` configuration to resolve social media image URLs properly.

4. **[MEDIUM] CTA Height Consistency Fixed**: Updated secondary CTA button in CTASection from `h-12` to `h-16` (64px) to match primary CTA height.

### File List

**Created:**
- `src/app/(auth)/page.tsx` - Landing page with SEO metadata (route group structure)
- `src/components/features/landing/HeroSection.tsx` - Hero section with headline, subheadline, NF525 badge, and CTA button
- `src/components/features/landing/FeaturesSection.tsx` - Three feature cards with SVG icons
- `src/components/features/landing/TrustSection.tsx` - NF525 trust section with shield icon and trust indicators
- `src/components/features/landing/CTASection.tsx` - Secondary CTA section with register button and login link
- `src/components/features/landing/index.ts` - Export barrel file
- `src/components/features/landing/HeroSection.test.tsx` - Unit tests for HeroSection (5 tests)
- `src/components/features/landing/FeaturesSection.test.tsx` - Unit tests for FeaturesSection (4 tests)
- `src/components/features/landing/TrustSection.test.tsx` - Unit tests for TrustSection (4 tests)
- `src/components/features/landing/CTASection.test.tsx` - Unit tests for CTASection (4 tests)

**Modified:**
- `src/test/setup.ts` - Fixed jest-dom matchers import for Vitest

**Dependencies Added:**
- `@testing-library/jest-dom` - Jest DOM matchers for Vitest testing
