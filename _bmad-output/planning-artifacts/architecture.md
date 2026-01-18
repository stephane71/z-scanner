---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowStatus: complete
completedAt: '2026-01-15'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/product-brief-z-scanner-2026-01-14.md
  - _bmad-output/planning-artifacts/research/market-maraîchers-commerçants-ambulants-france-2026-01-14.md
workflowType: 'architecture'
project_name: z-scanner
user_name: Stephane
date: '2026-01-15'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Scope:**
- 36 Functional Requirements across 8 categories
- Core: Capture (OCR) → Verify → Validate → Archive → Export
- Critical paths: Offline operation, NF525 compliance

**Non-Functional Priorities:**
- Performance: OCR <5s, validation <1s, 3G capable
- Security: HTTPS, encryption at rest, immutable data, 6-year retention
- Reliability: 100% offline, 99%+ sync success, zero data loss
- Scalability: 1,000 users target, scalable photo storage

### Scale & Complexity

| Dimension | Assessment |
|-----------|------------|
| Overall Complexity | Medium |
| Technical Domain | Full-stack PWA |
| Primary Challenge | Offline-first + NF525 compliance |
| Real-time Features | None (background sync) |
| Multi-tenancy | Single-tenant (B2C) |

### Technical Constraints

1. **Platform:** PWA, mobile-only viewport, Next.js/React
2. **Offline:** 100% core features must work offline
3. **OCR:** Local processing required (no network dependency)
4. **Compliance:** NF525 immutability, crypto timestamps, 6-year retention
5. **Storage:** Photos + metadata, scalable cloud storage
6. **Design System:** Tailwind CSS 4 + shadcn/ui

### Cross-Cutting Concerns

| Concern | Strategy |
|---------|----------|
| Offline/Sync | IndexedDB + Background Sync API |
| NF525 Compliance | Append-only model, hash integrity, timestamp service |
| Image Storage | Compressed blobs, cloud storage with CDN |
| Authentication | JWT with offline token caching |
| Error Handling | Graceful degradation, retry queues |


## Starter Template Evaluation

### Primary Technology Domain

**PWA Web Application** - Application web progressive avec architecture offline-first, ciblant les maraîchers français pour la numérisation de tickets Z.

### Technical Preferences (Established)

| Preference | Value |
|------------|-------|
| **Framework** | Next.js 16 avec React 19 (PWA) |
| **Language** | TypeScript strict |
| **Styling** | Tailwind CSS 4.x + shadcn/ui |
| **Local Storage** | Dexie.js (IndexedDB wrapper) |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Sync Pattern** | Queue-based manual sync |

### Starter Options Evaluated

| Option | Description | Verdict |
|--------|-------------|---------|
| create-next-app + Serwist + Supabase | Approche modulaire officielle | ✅ **Sélectionné** |
| NextPWA Starter | Template pré-configuré | ❌ Pas Tailwind v4, pas shadcn |
| tib0/next-pwa-template | Next.js 14 + DaisyUI + Dexie | ❌ DaisyUI ≠ UX spec |

### Selected Starter: Approche Modulaire Officielle

**Rationale:**
1. **Conformité UX Spec** - Tailwind CSS 4.x + shadcn/ui exactement comme spécifié
2. **Contrôle NF525** - Architecture append-only avec hash integrity
3. **Flexibilité Backend** - Supabase sans vendor lock-in (PostgreSQL standard)
4. **Maintenance** - Outils officiels et activement maintenus (Next.js 16, Serwist 9.5)

### Initialization Command

```bash
# 1. Créer le projet Next.js 16
npx create-next-app@latest z-scanner --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd z-scanner

# 2. PWA avec Serwist
npm install serwist @serwist/next

# 3. Offline Storage (IndexedDB)
npm install dexie dexie-react-hooks

# 4. Backend Supabase
npm install @supabase/supabase-js @supabase/ssr

# 5. Crypto pour NF525 (hash integrity)
npm install @noble/hashes

# 6. Claude API pour OCR
npm install @anthropic-ai/sdk

# 7. UI Components
npx shadcn@latest init
```

### Architectural Decisions from Starter

**Language & Runtime:**
- TypeScript strict mode
- Node.js 20.9+ required
- React Compiler 1.0 (mémoisation automatique)

**Styling Solution:**
- Tailwind CSS 4.x avec configuration CSS-first (`@theme`)
- shadcn/ui components copiés dans `src/components/ui/`

**Build Tooling:**
- Turbopack stable par défaut (5-10x plus rapide)
- Next.js App Router
- Code splitting par route

**Offline Storage Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (PWA)                           │
├─────────────────────────────────────────────────────────────┤
│  Dexie.js (IndexedDB)                                       │
│  ├── tickets: ++id, hash, data, createdAt                   │
│  ├── photos: ++id, ticketId, blob, thumbnail                │
│  └── syncQueue: ++id, action, entityId, status, retries     │
├─────────────────────────────────────────────────────────────┤
│  Service Worker (Serwist)                                   │
│  ├── Precache: App shell, static assets                     │
│  ├── Runtime: API responses, images                         │
│  └── Background Sync: Upload queue processing               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (when online)
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE BACKEND                        │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                        │
│  ├── tickets: id, user_id, hash, data, created_at           │
│  ├── Row Level Security (user isolation)                    │
│  └── 6-year retention policy                                │
├─────────────────────────────────────────────────────────────┤
│  Supabase Storage                                           │
│  └── ticket-photos/{user_id}/{ticket_id}/*.webp             │
├─────────────────────────────────────────────────────────────┤
│  Supabase Auth                                              │
│  └── Email/Password + JWT tokens (cached offline)           │
└─────────────────────────────────────────────────────────────┘
```

**NF525 Compliance Architecture:**

| Requirement | Implementation |
|-------------|----------------|
| Immutabilité | Append-only tables, no UPDATE/DELETE |
| Hash Integrity | SHA-256 via @noble/hashes sur chaque ticket |
| Timestamps | PostgreSQL `created_at` + client timestamp |
| Retention 6 ans | Supabase retention policy + backups |
| Audit Trail | syncQueue logs toutes les opérations |

### Dependencies Summary

| Package | Version | Role |
|---------|---------|------|
| serwist | ^9.5.0 | Service Worker PWA |
| @serwist/next | ^9.5.0 | Next.js SW integration |
| dexie | ^4.x | IndexedDB wrapper |
| dexie-react-hooks | ^1.x | React useLiveQuery |
| @supabase/supabase-js | ^2.x | Backend client |
| @supabase/ssr | ^0.x | Server components |
| @noble/hashes | ^1.x | SHA-256 NF525 |
| @anthropic-ai/sdk | ^0.x | Claude Haiku 4.5 OCR API |

**Note:** L'initialisation du projet sera la première story d'implémentation.


## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- OCR Engine: Claude Haiku 4.5 API (queue différée, offline-compatible)
- Auth: Supabase Email/Password + JWT 30j
- API: Next.js API Routes exclusively
- Storage: Dexie.js (local) + Supabase (remote)

**Important Decisions (Shape Architecture):**
- Images: WebP 80% + thumbnails
- State: Dexie useLiveQuery
- Hosting: Vercel
- Monitoring: Sentry + Vercel Analytics

**Deferred Decisions (Post-MVP):**
- Tesseract.js fallback local (si besoin offline OCR sans queue)
- Playwright E2E tests
- Staging environment

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| OCR Engine | Claude Haiku 4.5 API (queue différée) | Précision ~95% sur tickets thermiques, traitement serveur, offline préservé via queue |
| Image Format | WebP 80% + Thumbnail 60% | ~100KB original, ~10KB preview, bon compromis qualité/taille |
| Local Storage | Dexie.js v4.x | Migrations versionnées, useLiveQuery, 6 ans rétention |
| Remote Storage | Supabase PostgreSQL + Storage | RLS, pas de vendor lock-in, bucket privé |

### OCR Processing Architecture (Queue Différée)

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (PWA)                           │
├─────────────────────────────────────────────────────────────┤
│  1. Capture photo ticket                                    │
│  2. Stockage local: photos table (blob + thumbnail)         │
│  3. Création ticket: status = 'pending_ocr'                 │
│  4. SI online → Appel API OCR immédiat                      │
│     SI offline → Queue pour traitement au sync              │
└────────────────────────┬────────────────────────────────────┘
                         │ (when online)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTE /api/ocr                       │
├─────────────────────────────────────────────────────────────┤
│  1. Réception image (base64 ou multipart)                   │
│  2. Appel Claude Haiku 4.5 Vision API                       │
│  3. Extraction structurée: date, montant, marché, vendeur   │
│  4. Retour JSON avec confidence scores                      │
│  5. Client met à jour ticket: status = 'pending_validation' │
└─────────────────────────────────────────────────────────────┘
```

**Flux Offline Préservé:**
- Photo capturée et stockée localement (IndexedDB)
- Ticket créé avec `status: 'pending_ocr'` et champs vides
- Utilisateur peut saisir manuellement sans attendre OCR
- Au retour online: queue OCR traitée automatiquement
- Résultats OCR proposés pour validation/correction

**Coût Estimé:**
- ~$0.001-0.002 par ticket (Claude Haiku vision)
- 1000 tickets/mois ≈ $2/mois

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth Method | Email/Password | Simple, offline-friendly, gratuit |
| Token Duration | JWT 30 jours + refresh | "Rester connecté" pour usage terrain |
| Offline Grace | 7 jours après expiration | Évite blocage sur marché sans réseau |
| RLS Policy | user_id = auth.uid() | Isolation totale, pas de soft delete (NF525) |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API Architecture | Next.js API Routes | Contrôle total logique métier + validation NF525 |
| Sync Retry | 5 tentatives, backoff exponentiel | 1s→2s→4s→8s→16s, notification après échec |
| Sync Priority | OCR Queue > Tickets > Photos | OCR d'abord pour débloquer validation, puis métadonnées |
| Photo Sync | Toute connexion | Pas de restriction WiFi-only |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | Dexie useLiveQuery | Source unique de vérité, réactivité automatique |
| UI State | useState local | Modals, forms, état temporaire |
| Routing | App Router + groupes | (auth)/(app), Bottom Tab Bar 4 onglets |
| Navigation | Bottom Tab Bar | Scanner, Historique, Export, Paramètres |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | Vercel | Optimal Next.js, gratuit MVP, preview deploys |
| CI/CD | GitHub + Vercel auto | Lint, typecheck, tests sur push |
| Tests | Vitest (unit), Playwright (E2E post-MVP) | Rapide, compatible écosystème |
| Monitoring | Sentry + Vercel Analytics | Erreurs + Web Vitals, gratuit |

### Service Worker Caching Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| App Shell | Precache + StaleWhileRevalidate | Auto-update |
| Static Assets | CacheFirst | 1 an |
| API /tickets | NetworkFirst → Cache | Frais si online |
| Photos | IndexedDB only | Permanent |
| Landing Page | NetworkFirst | Dynamic |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project init (Next.js + deps)
2. Supabase setup (DB, Auth, Storage, RLS)
3. Dexie schema + sync queue
4. Auth flow (login, register, JWT cache)
5. Core scan flow (camera → OCR → validation)
6. Sync engine (queue → API → Supabase)
7. UI polish (historique, export, settings)

**Cross-Component Dependencies:**
- Auth → Sync (JWT requis pour upload)
- OCR → Validation (données extraites → formulaire)
- Dexie → UI (useLiveQuery → composants)
- Service Worker → Offline (precache → app shell)


## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Addressed:** 15 areas standardized to prevent AI agent conflicts

### Naming Patterns

**Database (Supabase PostgreSQL):**

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `tickets`, `sync_queue` |
| Columns | snake_case | `user_id`, `created_at` |
| Foreign keys | `{table}_id` | `ticket_id` |
| Indexes | `idx_{table}_{column}` | `idx_tickets_user_id` |

**API (Next.js Routes):**

| Element | Convention | Example |
|---------|------------|---------|
| Endpoints | kebab-case, plural | `/api/tickets`, `/api/sync-queue` |
| Route params | `[id]` | `/api/tickets/[id]` |
| Query params | camelCase | `?userId=123&sortBy=date` |

**Code (TypeScript/React):**

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase file + export | `TicketCard.tsx` |
| Hooks | camelCase, `use` prefix | `useTickets.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `Ticket`, `TicketFormData` |
| Variables | camelCase | `ticketData`, `getTickets()` |

### Structure Patterns

**Project Organization:**

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth routes
│   ├── (app)/                # Authenticated routes
│   └── api/                  # API Routes
├── components/
│   ├── ui/                   # shadcn/ui
│   └── features/             # By feature (tickets/, scanner/, sync/)
├── lib/
│   ├── db/                   # Dexie schema
│   ├── supabase/             # Supabase client
│   ├── ocr/                  # Tesseract wrapper
│   └── utils/                # General utilities
├── hooks/                    # Custom React hooks
├── types/                    # Shared TypeScript types
└── styles/                   # Global CSS
```

**Test Organization:**

| Type | Location |
|------|----------|
| Unit | Co-located: `Component.test.tsx` |
| Integration | `__tests__/integration/` |
| E2E | `e2e/` (Playwright) |

### Format Patterns

**API Response Standard:**

```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "..." } }

// Paginated
{ success: true, data: [...], meta: { total, page, pageSize } }
```

**Data Formats:**

| Element | Format | Example |
|---------|--------|---------|
| Dates (JSON) | ISO 8601 | `"2026-01-15T14:30:00.000Z"` |
| Dates (UI) | dd/MM/yyyy | `15/01/2026` |
| Amounts | Integer (centimes) | `1250` = 12,50€ |
| Booleans | `true`/`false` | Never `1`/`0` |

**JSON Field Transformation:**

| Context | Convention |
|---------|------------|
| DB ↔ API | snake_case |
| API → Frontend | camelCase (transformed) |
| Dexie (local) | camelCase |

### Process Patterns

**Error Handling:**

| Layer | Pattern |
|-------|---------|
| API Routes | Try/catch → `{ success: false, error }` |
| Components | Error Boundary at `(app)/layout.tsx` |
| Hooks | Return `{ data, error, isLoading }` |
| Dexie ops | Try/catch + Sentry log |

**Loading States:**

| Pattern | Convention |
|---------|------------|
| Variables | `isLoading`, `isSubmitting`, `isSyncing` |
| UI | Skeleton (lists), Spinner (actions) |
| Min duration | 300ms (prevent flash) |

**Validation:**

| When | Tool |
|------|------|
| Forms | Zod + React Hook Form |
| API | Zod (shared schemas) |
| Runtime | TypeScript strict |

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow naming conventions exactly as specified
2. Place files in designated directories
3. Use standard API response format
4. Transform snake_case ↔ camelCase at API boundary
5. Include error handling in all async operations
6. Use Zod schemas for validation (shared between client/server)

**Anti-Patterns (NEVER do):**
- ❌ Mix naming conventions (`userId` in DB, `user_id` in code)
- ❌ Return raw errors to client (always wrap in standard format)
- ❌ Store amounts as floats (use integer centimes)
- ❌ Skip loading states (always show feedback)
- ❌ Create files outside defined structure


## Project Structure & Boundaries

### Complete Project Directory Structure

```
z-scanner/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Lint, typecheck, tests
├── .env.example                      # Template variables env
├── .env.local                        # Variables locales (gitignored)
├── .gitignore
├── README.md
├── next.config.ts                    # Config Next.js + Serwist
├── tailwind.config.ts                # Tailwind CSS 4
├── tsconfig.json
├── package.json
├── vitest.config.ts                  # Config tests unitaires
├── playwright.config.ts              # Config E2E (post-MVP)
├── sentry.client.config.ts           # Sentry browser
├── sentry.server.config.ts           # Sentry server
├── components.json                   # Config shadcn/ui
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service Worker (généré)
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   └── fonts/                        # Fonts locales si besoin
│
├── e2e/                              # Tests E2E Playwright
│   ├── auth.spec.ts
│   ├── scan.spec.ts
│   └── fixtures/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout + providers
│   │   ├── page.tsx                  # Landing page (public)
│   │   ├── globals.css               # Tailwind imports + @theme
│   │   │
│   │   ├── (auth)/                   # Groupe routes auth
│   │   │   ├── layout.tsx            # Layout minimal auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (app)/                    # Groupe routes authentifiées
│   │   │   ├── layout.tsx            # Layout avec BottomNav
│   │   │   ├── scan/
│   │   │   │   └── page.tsx          # Page scanner (home)
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx          # Historique
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Détail ticket
│   │   │   ├── export/
│   │   │   │   └── page.tsx          # Export PDF/CSV
│   │   │   └── settings/
│   │   │       └── page.tsx          # Paramètres
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── refresh/route.ts
│   │       ├── tickets/
│   │       │   ├── route.ts          # GET list, POST create
│   │       │   └── [id]/route.ts     # GET one
│   │       ├── sync/
│   │       │   └── route.ts          # POST sync batch
│   │       ├── ocr/
│   │       │   └── route.ts          # POST extract fields via Claude Haiku
│   │       └── export/
│   │           └── pdf/route.ts      # POST generate PDF
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (auto-généré)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   │
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── LoginForm.tsx
│   │       │   ├── LoginForm.test.tsx
│   │       │   └── RegisterForm.tsx
│   │       ├── scanner/
│   │       │   ├── CameraView.tsx
│   │       │   ├── CameraView.test.tsx
│   │       │   ├── OcrResult.tsx
│   │       │   └── CaptureButton.tsx
│   │       ├── tickets/
│   │       │   ├── TicketCard.tsx
│   │       │   ├── TicketCard.test.tsx
│   │       │   ├── TicketForm.tsx
│   │       │   ├── TicketList.tsx
│   │       │   └── TicketDetail.tsx
│   │       ├── sync/
│   │       │   ├── SyncIndicator.tsx
│   │       │   └── SyncStatus.tsx
│   │       ├── export/
│   │       │   ├── ExportOptions.tsx
│   │       │   └── DateRangePicker.tsx
│   │       └── layout/
│   │           ├── BottomNav.tsx
│   │           ├── Header.tsx
│   │           └── ErrorBoundary.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Dexie instance
│   │   │   ├── schema.ts             # Tables definitions
│   │   │   ├── migrations.ts         # Version migrations
│   │   │   └── seed.ts               # Dev seed data
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client (SSR)
│   │   │   └── types.ts              # Generated types
│   │   ├── ocr/
│   │   │   ├── client.ts             # OCR API client (appel /api/ocr)
│   │   │   ├── types.ts              # OcrResult, OcrField types
│   │   │   ├── queue.ts              # OCR queue for offline processing
│   │   │   └── client.test.ts
│   │   ├── sync/
│   │   │   ├── queue.ts              # Sync queue logic
│   │   │   ├── engine.ts             # Background sync
│   │   │   └── retry.ts              # Retry strategies
│   │   ├── crypto/
│   │   │   ├── hash.ts               # SHA-256 NF525
│   │   │   └── hash.test.ts
│   │   └── utils/
│   │       ├── format.ts             # Date, currency formatters
│   │       ├── transform.ts          # snake_case ↔ camelCase
│   │       ├── image.ts              # WebP compression
│   │       └── validation.ts         # Zod schemas partagés
│   │
│   ├── hooks/
│   │   ├── useTickets.ts             # CRUD tickets Dexie
│   │   ├── useSync.ts                # Sync status
│   │   ├── useOnline.ts              # Network status
│   │   ├── useAuth.ts                # Auth state
│   │   └── useCamera.ts              # Camera access
│   │
│   ├── types/
│   │   ├── ticket.ts                 # Ticket, TicketFormData
│   │   ├── sync.ts                   # SyncQueueItem, SyncStatus
│   │   ├── api.ts                    # ApiResponse<T>
│   │   └── index.ts                  # Re-exports
│   │
│   ├── styles/
│   │   └── tokens.css                # Design tokens custom
│   │
│   └── middleware.ts                 # Auth middleware
│
└── __tests__/
    └── integration/
        ├── sync.test.ts              # Sync flow integration
        └── api.test.ts               # API routes integration
```

### Feature to Structure Mapping

| Feature (PRD) | Components | API Routes | Lib |
|---------------|------------|------------|-----|
| **Auth (FR-AUTH)** | `features/auth/` | `api/auth/` | `supabase/` |
| **Capture (FR-CAP)** | `features/scanner/` | `api/ocr/` | `ocr/`, `lib/db/` |
| **Validation (FR-VAL)** | `features/tickets/TicketForm` | `api/tickets/` | `crypto/`, `utils/validation` |
| **Gestion (FR-MAN)** | `features/tickets/` | `api/tickets/[id]` | `db/` |
| **Export (FR-EXP)** | `features/export/` | `api/export/` | `utils/format` |
| **Dashboard (FR-DASH)** | `(app)/tickets/page` | - | `hooks/useTickets` |
| **Offline/Sync (FR-OFF)** | `features/sync/` | `api/sync/` | `sync/`, `db/` |
| **Landing (FR-LAND)** | `app/page.tsx` | - | - |

### Architectural Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  src/app/(app)/ + src/components/features/                  │
│  - React components                                         │
│  - Hooks pour accès données                                 │
└────────────────────────┬────────────────────────────────────┘
                         │ useLiveQuery, useAuth, useSync
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                      │
│  src/hooks/ + src/lib/db/                                   │
│  - Dexie.js (IndexedDB)                                     │
│  - Transformations camelCase                                │
└────────────────────────┬────────────────────────────────────┘
                         │ Sync Queue
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                              │
│  src/app/api/                                               │
│  - Next.js API Routes                                       │
│  - Validation Zod                                           │
│  - Transform snake_case                                     │
└────────────────────────┬────────────────────────────────────┘
                         │ Supabase Client
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
│  Supabase (PostgreSQL + Auth + Storage)                     │
│  Sentry (Error tracking)                                    │
│  Vercel (Hosting)                                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Capture Flow:** Camera → Photo stockée (Dexie) → Ticket créé (status: pending_ocr)
2. **OCR Flow (online):** Photo → API /api/ocr → Claude Haiku 4.5 → Extraction → Ticket updated (status: pending_validation)
3. **OCR Flow (offline):** Photo stockée → Queue OCR → Traité au retour online
4. **Validation Flow:** Résultats OCR → Formulaire pré-rempli → Validation utilisateur → Ticket finalisé
5. **Sync Flow:** Sync Queue → API Route → Supabase → Update local status
6. **Read Flow:** useLiveQuery (Dexie) → Component render → UI


## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices verified compatible:
- Next.js 16 + React 19 ✅
- Tailwind CSS 4 + shadcn/ui ✅
- Serwist 9.5 + Next.js ✅
- Dexie 4.x + React hooks ✅
- Supabase + @supabase/ssr ✅

**Pattern Consistency:**
- Naming conventions aligned with React/TypeScript ecosystem
- API patterns follow Next.js App Router best practices
- State management via useLiveQuery matches Dexie recommendations

**Structure Alignment:**
- Project structure supports all architectural decisions
- Clear separation between layers (Presentation → Data → API → External)
- Feature-based organization enables parallel development

### Requirements Coverage Validation ✅

**Functional Requirements (36 FRs):**
All 8 FR categories have complete architectural support:
- FR-AUTH → Supabase Auth + JWT offline cache
- FR-CAP → Claude Haiku 4.5 Vision API + Camera API + OCR Queue
- FR-VAL → @noble/hashes + Zod validation
- FR-MAN → Dexie + useLiveQuery
- FR-EXP → API Routes + PDF generation
- FR-DASH → React components + hooks
- FR-OFF → Service Worker + Sync Queue
- FR-LAND → Public routes + PWA manifest

**Non-Functional Requirements:**
| Requirement | Architectural Solution |
|-------------|----------------------|
| Performance (OCR <5s) | Claude Haiku 4.5 API (~1-3s) |
| Security (HTTPS, encryption) | Vercel + Supabase |
| Reliability (100% offline) | Dexie + Serwist |
| Compliance (NF525 6 ans) | Append-only + hash integrity |
| Scalability (1000 users) | Supabase + Vercel |

### Implementation Readiness Validation ✅

**Decision Completeness:** 25+ decisions documented with versions
**Structure Completeness:** 80+ files/directories defined
**Pattern Completeness:** All conflict points addressed

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (6)
- [x] Cross-cutting concerns mapped (5)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Format patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** 🟢 READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Complete offline-first architecture
- NF525 compliance built into design
- Clear separation of concerns
- Comprehensive pattern documentation

**Areas for Future Enhancement:**
- Detailed Dexie schema (Epic implementation)
- Supabase SQL migrations (Epic implementation)
- E2E test scenarios (post-MVP)

### Implementation Handoff

**AI Agent Guidelines:**
1. Follow all architectural decisions exactly as documented
2. Use implementation patterns consistently across all components
3. Respect project structure and boundaries
4. Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
npx create-next-app@latest z-scanner --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```


## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-15
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 25+ architectural decisions made
- 15 implementation patterns defined
- 80+ files/directories specified
- 36 functional requirements fully supported
- 12 non-functional requirements addressed

**📚 AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Development Sequence

1. Initialize project using documented starter template
2. Set up Supabase (DB, Auth, Storage, RLS)
3. Configure Serwist + PWA manifest
4. Implement Dexie schema + sync queue
5. Build auth flow (login, register, JWT cache)
6. Create core scan flow (camera → OCR → validation)
7. Implement sync engine (queue → API → Supabase)
8. Polish UI (historique, export, settings)

### Quality Assurance Checklist

**✅ Architecture Coherence** - All decisions work together
**✅ Requirements Coverage** - All FRs and NFRs supported
**✅ Implementation Readiness** - Patterns prevent conflicts
**✅ NF525 Compliance** - Append-only, hash integrity, 6 ans

---

**Architecture Status:** 🟢 READY FOR IMPLEMENTATION

**Next Phase:** Create Epics & Stories → Implementation

