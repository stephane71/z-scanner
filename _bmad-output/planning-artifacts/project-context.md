---
project_name: 'z-scanner'
user_name: 'Stephane'
date: '2026-01-15'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - quality_rules
  - workflow_rules
  - anti_patterns
status: 'complete'
rule_count: 47
optimized_for_llm: true
---

# Z-Scanner Project Context

_AI agent implementation rules. Follow these constraints exactly._

---

## Technology Stack (Exact Versions)

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 16.1.1 | App Router, Turbopack default |
| React | 19.2.3 | React Compiler automatic memoization |
| TypeScript | 5.x | strict mode required |
| Tailwind CSS | 4.x | CSS-first @theme config |
| shadcn/ui | latest | Copy to `src/components/ui/` |
| Serwist | 9.5.0 | Service Worker PWA |
| Dexie.js | 4.x | IndexedDB + useLiveQuery |
| Supabase | 2.x | PostgreSQL + Auth + Storage |
| @noble/hashes | 1.x | SHA-256 NF525 compliance |
| Tesseract.js | latest | Local OCR processing |
| Zod | latest | Shared validation schemas |
| Vitest | latest | Unit testing |

---

## Critical Implementation Rules

### TypeScript Rules

- **strict mode is mandatory** - Never disable any strict options
- Use `satisfies` operator for type narrowing with literal types
- Prefer `interface` for object shapes, `type` for unions/intersections
- No `any` - use `unknown` with type guards
- All async functions must have proper error handling

### React/Next.js Rules

- **useLiveQuery is the single source of truth** for IndexedDB data
- useState only for ephemeral UI state (modals, forms, loading)
- No useEffect for data fetching - use useLiveQuery or Server Components
- App Router only - no pages/ directory
- Route groups: `(auth)/` for public auth routes, `(app)/` for authenticated
- API Routes handle all business logic - never call Supabase directly from client

### NF525 Compliance Rules (CRITICAL)

- **APPEND-ONLY data model** - Never UPDATE or DELETE tickets
- Every ticket must have SHA-256 hash calculated via @noble/hashes
- Hash includes: date, montantTTC, modeReglement, numeroTicket, userId
- Store both client timestamp AND server timestamp
- **6-year retention** - No data deletion functionality
- All sync operations logged to syncQueue for audit trail

### Offline-First Architecture

- Dexie.js is primary storage - all reads from IndexedDB
- Service Worker precaches app shell with StaleWhileRevalidate
- syncQueue stores pending operations with exponential retry (5 attempts)
- Photos stored locally only (IndexedDB blobs), uploaded on sync
- 7-day offline grace period after JWT expiration

---

## Naming Conventions (MANDATORY)

| Context | Convention | Example |
|---------|------------|---------|
| Database tables | snake_case, plural | `tickets`, `sync_queue` |
| Database columns | snake_case | `user_id`, `created_at` |
| API endpoints | kebab-case, plural | `/api/tickets`, `/api/sync-queue` |
| React components | PascalCase | `TicketCard.tsx` |
| Hooks | camelCase, use prefix | `useTickets.ts` |
| TypeScript types | PascalCase | `Ticket`, `SyncQueueItem` |
| Variables/functions | camelCase | `getTickets()`, `ticketData` |

### Data Transformation

- **API boundary transforms snake_case ↔ camelCase automatically**
- Database and API use snake_case
- Frontend code uses camelCase
- Never mix conventions in the same context

---

## Data Formats (REQUIRED)

| Data | Format | Example |
|------|--------|---------|
| Dates in JSON | ISO 8601 | `"2026-01-15T14:30:00.000Z"` |
| Dates in UI | dd/MM/yyyy | `15/01/2026` |
| Money amounts | Integer centimes | `1250` = 12,50 EUR |
| Booleans | true/false | Never 1/0 |

### API Response Format (ALWAYS use)

```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "..." } }

// Paginated
{ success: true, data: [...], meta: { total, page, pageSize } }
```

---

## Project Structure (FOLLOW EXACTLY)

```
src/
├── app/
│   ├── (auth)/           # Public auth routes (login, register)
│   ├── (app)/            # Authenticated routes with BottomNav
│   └── api/              # Next.js API Routes
├── components/
│   ├── ui/               # shadcn/ui components
│   └── features/         # Feature-specific (auth/, scanner/, tickets/, sync/)
├── lib/
│   ├── db/               # Dexie schema, migrations
│   ├── supabase/         # Supabase clients
│   ├── ocr/              # Tesseract wrapper
│   ├── sync/             # Sync queue, engine
│   ├── crypto/           # SHA-256 hash
│   └── utils/            # Format, transform, validation
├── hooks/                # Custom React hooks
├── types/                # Shared TypeScript types
└── styles/               # Global CSS, tokens
```

---

## Error Handling Pattern

| Layer | Pattern |
|-------|---------|
| API Routes | try/catch → `{ success: false, error }` |
| Components | Error Boundary at `(app)/layout.tsx` |
| Hooks | Return `{ data, error, isLoading }` |
| Dexie operations | try/catch + Sentry log |

### Loading States

- Variables: `isLoading`, `isSubmitting`, `isSyncing`
- UI: Skeleton for lists, Spinner for actions
- Minimum 300ms to prevent flash

---

## Forbidden Patterns (NEVER DO)

- Direct IndexedDB access - always use Dexie.js
- Direct Supabase client calls from components - use API Routes
- UPDATE or DELETE on tickets table - append-only (NF525)
- Float for money amounts - use integer centimes
- Skip loading states - always show feedback
- Mix naming conventions in same context
- Create files outside defined structure
- Store sensitive data in localStorage - use IndexedDB
- Synchronous blocking in Service Worker
- useEffect for data fetching

---

## Testing Rules

- Unit tests co-located: `Component.test.tsx`
- Integration tests: `__tests__/integration/`
- E2E tests (post-MVP): `e2e/`
- Test coverage focus: business logic, NF525 compliance, sync queue
- Mock Dexie with in-memory adapter for tests

---

## Sync Queue Pattern

1. User action → Write to Dexie (immediate)
2. Add to syncQueue with status "pending"
3. Background sync processes queue when online
4. Retry 5 times with exponential backoff (1s→16s)
5. Mark "completed" or "failed" after all retries
6. Never delete queue items (audit trail)

**Priority:** Tickets metadata > Photos (binary data)

---

## Service Worker Caching

| Resource | Strategy | TTL |
|----------|----------|-----|
| App Shell | Precache + StaleWhileRevalidate | Auto-update |
| Static Assets | CacheFirst | 1 year |
| API /tickets | NetworkFirst → Cache | Fresh when online |
| Photos | IndexedDB only | Permanent |

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

_Last updated: 2026-01-15_
_Architecture version: 1.0_
