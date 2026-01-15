# System-Level Test Design - Z-Scanner

**Generated**: 2026-01-15
**Mode**: System-Level (Phase 3 - Testability Review)
**Project**: Z-Scanner PWA
**Architecture Version**: 1.0

---

## Testability Assessment

### Controllability

**Status**: ✅ PASS

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| **System State Control** | ✅ Excellent | Dexie.js IndexedDB with in-memory adapter available for tests. Supabase PostgreSQL supports test database seeding via API routes. |
| **External Dependencies Mockable** | ✅ Excellent | Architecture uses Next.js API Routes as single entry point - never direct Supabase calls from client. All external services (Supabase, Tesseract.js) are wrapped in lib modules (`lib/supabase/`, `lib/ocr/`). |
| **Error Condition Triggering** | ✅ Good | Service Worker (Serwist) supports offline mode simulation. Network interception possible via Playwright. Sync queue with retry logic (5 attempts) testable via mock failures. |
| **Data Reset** | ✅ Excellent | Dexie.js supports `db.delete()` and `db.clear()` for test isolation. Append-only NF525 model means we test creation paths, not mutation paths. |

**Controllability Notes:**
- Tesseract.js runs locally - can be tested with known ticket images
- Offline mode testable via Service Worker and `context.setOffline(true)`
- Sync queue behavior controllable by mocking network responses
- Auth tokens (JWT 30 days) can be injected via cookies for test setup

### Observability

**Status**: ✅ PASS

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| **System State Inspection** | ✅ Excellent | useLiveQuery from Dexie provides reactive data inspection. IndexedDB directly queryable in tests. |
| **Deterministic Results** | ✅ Good | Append-only data model (NF525) ensures predictable state. SHA-256 hashes are deterministic. Only concern: OCR results may vary - handled via threshold confidence checking. |
| **NFR Validation** | ⚠️ Concerns | Performance metrics require instrumentation (OCR <5s, validation <1s). Suggest adding Server-Timing headers to API routes. |
| **Logging & Monitoring** | ✅ Good | Architecture includes Sentry error tracking + Vercel Analytics. Structured logging via console with correlation possible. |

**Observability Notes:**
- IndexedDB data directly accessible via Dexie for assertions
- API response format standardized (`{ success, data, error }`) - easy to validate
- Sync status visible in UI (`syncQueue` table) and queryable
- Missing: Server-Timing headers for performance validation (recommendation for Sprint 0)

### Reliability

**Status**: ✅ PASS

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| **Test Isolation** | ✅ Excellent | Each test can use fresh Dexie database. No shared global state. useLiveQuery scoped to component lifecycle. |
| **Reproducible Failures** | ✅ Good | Deterministic waits via network interception. Known ticket images for OCR testing. Seed data via API. |
| **Loosely Coupled Components** | ✅ Excellent | Clear layer separation: Presentation → Data Access → API → External. Feature-based component organization supports independent testing. |
| **Parallel Safety** | ✅ Good | IndexedDB per-origin, but tests can use unique database names. Supabase RLS ensures user isolation. |

**Reliability Notes:**
- Architecture's layer separation (presentation/data/API) enables focused testing at each level
- Offline-first design means components must handle disconnected state - testable via mocks
- Service Worker caching strategies (StaleWhileRevalidate, NetworkFirst) require specific test patterns

---

## Architecturally Significant Requirements (ASRs)

### High-Risk ASRs (Score ≥6)

| ID | Requirement | Category | Probability | Impact | Score | Mitigation |
|----|-------------|----------|-------------|--------|-------|------------|
| ASR-001 | NF525 Immutability (no UPDATE/DELETE on tickets) | SEC/BUS | 3 | 3 | **9** | Integration tests verify API refuses mutations. E2E validates UI has no edit option on validated tickets. |
| ASR-002 | SHA-256 Hash Integrity (ticket validation) | SEC | 2 | 3 | **6** | Unit tests verify hash calculation. Integration tests verify hash stored correctly. E2E validates "Conforme NF525" display. |
| ASR-003 | Offline OCR Processing (Tesseract.js local) | TECH | 2 | 3 | **6** | E2E tests run with `context.setOffline(true)`. Verify OCR works without network. |
| ASR-004 | 6-Year Data Retention | SEC | 1 | 3 | **3** | Database retention policy configuration. Audit trail verification. |
| ASR-005 | Sync Queue Reliability (99%+ success) | TECH/DATA | 2 | 3 | **6** | Integration tests verify retry logic (5 attempts, exponential backoff). E2E validates sync indicator behavior. |

### Medium-Risk ASRs (Score 3-5)

| ID | Requirement | Category | Probability | Impact | Score | Mitigation |
|----|-------------|----------|-------------|--------|-------|------------|
| ASR-006 | OCR Performance (<5s) | PERF | 2 | 2 | **4** | Performance tests measure OCR processing time on reference images. |
| ASR-007 | Validation Performance (<1s) | PERF | 1 | 2 | **2** | Unit tests verify hash calculation <100ms. API response time logged. |
| ASR-008 | JWT Offline Grace (7 days) | SEC | 2 | 2 | **4** | Integration tests verify offline access with expired-but-within-grace token. |
| ASR-009 | Photo Archival (WebP compression) | TECH | 1 | 2 | **2** | Unit tests verify compression output size (~100KB). E2E validates photo display. |
| ASR-010 | Multi-Market Filtering | BUS | 1 | 1 | **1** | E2E tests verify filter UI behavior. |

### ASR Risk Summary

- **Critical (Score 9)**: 1 - NF525 Immutability (BLOCKER if not mitigated)
- **High (Score 6-8)**: 3 - Hash Integrity, Offline OCR, Sync Reliability
- **Medium (Score 3-5)**: 2 - OCR Performance, JWT Grace
- **Low (Score 1-2)**: 4 - Validation Performance, Photo Archival, Filtering

---

## Test Levels Strategy

Based on architecture analysis (PWA, offline-first, API-centric, NF525 compliance):

### Recommended Split

| Level | Target % | Rationale |
|-------|----------|-----------|
| **Unit** | 40% | Business logic heavy: hash calculation, OCR parsing, date/currency formatting, Zod validations |
| **Integration** | 35% | Critical API routes, Dexie operations, sync queue, Supabase client |
| **E2E** | 25% | User journeys (scan→validate→sync), offline flows, NF525 compliance verification |

### Unit Test Focus Areas

- `lib/crypto/hash.ts` - SHA-256 calculation for NF525
- `lib/ocr/parser.ts` - OCR result extraction (date, amount, ticket number)
- `lib/utils/format.ts` - Date formatting (dd/MM/yyyy), currency (centimes → euros)
- `lib/utils/transform.ts` - snake_case ↔ camelCase conversion
- `lib/utils/validation.ts` - Zod schemas (ticket, market, export)
- `lib/sync/retry.ts` - Exponential backoff calculation

### Integration Test Focus Areas

- `app/api/tickets/route.ts` - CRUD operations, NF525 immutability enforcement
- `app/api/sync/route.ts` - Batch sync processing
- `app/api/auth/*` - Login, register, password reset flows
- `lib/db/` - Dexie schema, migrations, useLiveQuery behavior
- `lib/sync/queue.ts` - Sync queue operations (add, update status, retry)
- `lib/supabase/` - Supabase client integration (RLS, storage)

### E2E Test Focus Areas

- **Critical Journey 1**: First scan → OCR → Verify → Validate → NF525 confirmation
- **Critical Journey 2**: Offline scan → Validate → Return online → Sync success
- **Critical Journey 3**: Login → Historical ticket view → Filter by date/market
- **Critical Journey 4**: Export CSV → Download file → Verify content format
- **Compliance Path**: Validated ticket → Attempt edit (blocked) → Cancel flow

---

## NFR Testing Approach

### Security (NFR-S1 to NFR-S6)

**Testing Tools**: Playwright E2E, Vitest unit tests, npm audit (CI)

| NFR | Testing Approach | Evidence |
|-----|-----------------|----------|
| NFR-S1: HTTPS | Vercel deployment auto-HTTPS. CI check for non-HTTPS links in code. |
| NFR-S2: Encryption at rest | Supabase handles. No client-side testing needed. |
| NFR-S3: Password hashing | Supabase Auth handles. Integration test verifies password not in response. |
| NFR-S4: Immutability | **Critical** - API integration tests verify PUT/DELETE return 403. E2E validates no edit UI on validated tickets. |
| NFR-S5: 6-year retention | Database policy config. No functional test - operational verification. |
| NFR-S6: Crypto timestamp | Unit test verifies timestamp format. Integration test verifies timestamp stored with ticket. |

**Security Test Examples:**

```typescript
// Integration: NF525 Immutability
test('should reject ticket update after validation', async ({ request }) => {
  const ticket = await createValidatedTicket();
  const response = await request.put(`/api/tickets/${ticket.id}`, {
    data: { montantTTC: 9999 }
  });
  expect(response.status()).toBe(403);
  expect((await response.json()).error.code).toBe('NF525_IMMUTABLE');
});

// E2E: No edit option on validated ticket
test('validated ticket has no edit button', async ({ page }) => {
  await page.goto('/tickets/validated-ticket-id');
  await expect(page.getByText('Conforme NF525')).toBeVisible();
  await expect(page.getByRole('button', { name: /modifier/i })).not.toBeVisible();
});
```

### Performance (NFR-P1 to NFR-P4)

**Testing Tools**: Vitest (unit timing), k6 (load testing post-MVP), Lighthouse (Core Web Vitals)

| NFR | Testing Approach | SLO Threshold |
|-----|-----------------|---------------|
| NFR-P1: OCR <5s | Unit test with reference images. Measure `tesseract.recognize()` duration. | p95 < 5000ms |
| NFR-P2: Validation <1s | Unit test hash calculation. E2E measure from button click to "Conforme" display. | p95 < 1000ms |
| NFR-P3: Dashboard <3s | E2E measure page load. Add Server-Timing header to API. | LCP < 3000ms |
| NFR-P4: 3G usability | Lighthouse throttled test. CI check bundle size. | Bundle < 500KB gzipped |

**Performance Test Patterns:**

```typescript
// Unit: OCR Performance
test('OCR processes ticket in under 5 seconds', async () => {
  const start = performance.now();
  const result = await processTicketImage(testTicketImage);
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(5000);
  expect(result.montantTTC).toBeTruthy();
});

// E2E: Validation Performance
test('validation completes in under 1 second', async ({ page }) => {
  await page.goto('/scan/verify');
  const validatePromise = page.waitForResponse('**/api/tickets');

  const start = Date.now();
  await page.click('[data-testid="validate-button"]');
  await validatePromise;
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(1000);
  await expect(page.getByText('Conforme NF525')).toBeVisible();
});
```

### Reliability (NFR-R1 to NFR-R4)

**Testing Tools**: Playwright (offline simulation), Vitest (sync queue logic)

| NFR | Testing Approach | Evidence |
|-----|-----------------|----------|
| NFR-R1: Offline mode | E2E with `context.setOffline(true)`. Verify scan/validate works. |
| NFR-R2: Sync 99%+ | Integration test retry logic. Mock transient failures. Verify eventual success. |
| NFR-R3: No data loss | E2E: validate ticket → force close → reopen → ticket persists in IndexedDB. |
| NFR-R4: Photo redundancy | Integration: verify photo upload to Supabase Storage with hash verification. |

**Reliability Test Patterns:**

```typescript
// E2E: Offline Validation
test('can validate ticket while offline', async ({ page, context }) => {
  await page.goto('/scan');
  await context.setOffline(true);

  await page.click('[data-testid="capture-button"]');
  // ... complete scan flow
  await page.click('[data-testid="validate-button"]');

  await expect(page.getByText('Conforme NF525')).toBeVisible();
  await expect(page.getByText('Non synchronisé')).toBeVisible();

  await context.setOffline(false);
  await expect(page.getByText('Non synchronisé')).not.toBeVisible({ timeout: 30000 });
});

// Integration: Sync Retry
test('sync retries on transient failures', async () => {
  let attemptCount = 0;
  mockApi.onPost('/api/sync').reply(() => {
    attemptCount++;
    if (attemptCount < 3) return [503, { error: 'Service Unavailable' }];
    return [200, { success: true }];
  });

  const result = await syncQueue.process();

  expect(attemptCount).toBe(3);
  expect(result.status).toBe('completed');
});
```

### Maintainability

**Testing Tools**: Vitest (coverage), jscpd (duplication), npm audit (vulnerabilities)

| Metric | Target | CI Enforcement |
|--------|--------|----------------|
| Test Coverage | ≥80% lines | `vitest run --coverage` with threshold |
| Code Duplication | <5% | `jscpd src/ --threshold 5` |
| Vulnerabilities | 0 critical/high | `npm audit --audit-level=high` |
| Type Coverage | 100% (strict mode) | `tsc --noEmit` in CI |

---

## Test Environment Requirements

### Local Development

| Resource | Tool | Configuration |
|----------|------|---------------|
| IndexedDB | Dexie with fake-indexeddb | In-memory adapter for isolation |
| Supabase | Local Supabase CLI or mock | `supabase start` for local PostgreSQL |
| OCR | Tesseract.js | Pre-loaded language data |
| Auth | JWT mock | Generated test tokens |

### CI Environment

| Resource | Tool | Configuration |
|----------|------|---------------|
| Browser | Playwright (Chromium, WebKit) | Headless mode |
| Database | Supabase test project | Seeded via API, reset between runs |
| Storage | Mock or test bucket | Isolated from production |
| Network | Playwright route mocking | For offline and failure tests |

### Test Data Strategy

1. **Factories**: Use faker.js for unique, deterministic test data
2. **Fixtures**: Reference ticket images for OCR testing
3. **Seed Scripts**: API-based seeding for integration tests
4. **Cleanup**: Automatic via test fixtures (before/after hooks)

---

## Testability Concerns

### No Blocking Concerns

The architecture is well-designed for testability with clear layer separation, mockable dependencies, and isolated storage.

### Minor Concerns (Recommendations)

| Concern | Impact | Recommendation |
|---------|--------|----------------|
| OCR result variance | CONCERNS | Create reference ticket images with known values. Define acceptable confidence threshold (e.g., 85%). |
| Service Worker testing | CONCERNS | Use Playwright's Service Worker debugging. Consider skip-SW mode for unit/integration. |
| Crypto timestamp verification | CONCERNS | Mock Date.now() for deterministic timestamps in tests. |
| Performance baselines | CONCERNS | Establish baseline measurements during Sprint 0. |

### Positive Testability Patterns

- **API Routes as boundary**: All external calls through Next.js routes - easy to mock at API level
- **Append-only model**: NF525 compliance simplifies testing (no mutation side effects)
- **useLiveQuery**: Reactive data makes UI assertions straightforward
- **Standardized API responses**: `{ success, data, error }` format enables consistent assertions

---

## Recommendations for Sprint 0

### Test Infrastructure Setup

1. **Vitest Configuration**
   - Configure `vitest.config.ts` with coverage thresholds (80%)
   - Set up fake-indexeddb for Dexie mocking
   - Create test utilities for API mocking

2. **Playwright Configuration**
   - Configure `playwright.config.ts` for Chromium + WebKit
   - Set up global auth state for authenticated tests
   - Create fixtures for offline mode testing

3. **CI Pipeline**
   - Add lint + typecheck + test jobs
   - Configure coverage reporting
   - Add bundle size check

### Test Utilities to Create

```
src/
├── __tests__/
│   ├── fixtures/
│   │   ├── db-fixture.ts       # Dexie setup/teardown
│   │   ├── auth-fixture.ts     # JWT token generation
│   │   └── api-fixture.ts      # API mocking helpers
│   ├── factories/
│   │   ├── ticket-factory.ts   # createTicket()
│   │   ├── market-factory.ts   # createMarket()
│   │   └── user-factory.ts     # createUser()
│   └── test-images/
│       └── reference-ticket.jpg # Known OCR values
```

### Priority Test Implementation Order

1. **Unit Tests First** (Sprint 0)
   - Hash calculation (NF525 critical)
   - OCR parser
   - Format utilities
   - Zod schemas

2. **Integration Tests** (Sprint 1-2)
   - API routes (tickets, sync)
   - Dexie operations
   - Auth flows

3. **E2E Tests** (Sprint 2-3)
   - Core scan flow
   - Offline validation
   - Export functionality

---

## Quality Gate Criteria

### Release Readiness

| Criteria | Threshold | Enforcement |
|----------|-----------|-------------|
| Unit test pass rate | 100% | CI blocks merge |
| Integration test pass rate | 100% | CI blocks merge |
| E2E test pass rate | 95%+ | CI blocks merge |
| Code coverage | ≥80% | CI warning at 75% |
| Critical risks (score=9) | 0 OPEN | Manual gate check |
| High risks (score≥6) | All mitigated | Manual gate check |

### NF525 Compliance Gate

**MANDATORY before any production release:**

- [ ] Immutability test passes (no UPDATE/DELETE on validated tickets)
- [ ] Hash integrity test passes (SHA-256 verification)
- [ ] Timestamp test passes (crypto timestamp stored)
- [ ] Annulation workflow test passes (append-only cancellation)
- [ ] Photo archival test passes (linked to ticket)

---

## Output Summary

**Workflow**: System-Level Test Design (Phase 3)
**Status**: COMPLETE

**Testability Assessment**:
- Controllability: ✅ PASS
- Observability: ✅ PASS (minor: add Server-Timing headers)
- Reliability: ✅ PASS

**ASR Risk Summary**:
- Critical (Score=9): 1 (NF525 Immutability - mitigated with tests)
- High (Score 6-8): 3 (Hash, Offline OCR, Sync - mitigated with tests)
- Medium: 2 | Low: 4

**Test Levels Strategy**:
- Unit: 40%
- Integration: 35%
- E2E: 25%

**NFR Testing Defined**:
- Security: Playwright E2E + API integration for NF525
- Performance: Unit timing + Lighthouse + k6 (post-MVP)
- Reliability: Offline E2E + sync queue integration
- Maintainability: CI coverage + duplication + audit

**Testability Concerns**: No blockers. Minor recommendations documented.

**Next Steps**:
1. Sprint 0: Configure Vitest, Playwright, CI pipeline
2. Sprint 0: Create test factories and fixtures
3. Sprint 1: Implement unit tests for hash/OCR/validation
4. Sprint 2: Implement integration tests for API/Dexie/sync
5. Sprint 3: Implement E2E tests for core journeys

---

**Document Status**: Ready for Implementation Readiness Review
