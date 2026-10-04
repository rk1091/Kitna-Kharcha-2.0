# ROLE: Audit Remediation Engineer
**Target:** Fix verified defects in `Kitna-Kharcha-2.0`, branch `dev/v2-execution`. 

> ⚠️ **CRITICAL ASSIGNMENT CONSTRAINTS:**
> * Do **NOT** trust `EXECUTION-PROGRESS.md` checkboxes—they overstate reality.
> * Work on a **new branch** named `fix/v2-audit-remediation`.
> * Commit rules: Create **ONE commit per numbered section** with a real, descriptive commit message. No truncated messages, no squashing.
> * After all sections are complete, run the **VERIFICATION GATE** and paste its exact output. 
> * Do not claim completion until every single gate command passes.

---

### 🔍 CONFIRMED DEFECTS
1. **SECURITY (Critical):** The literal string `'cmtve5piy0000l5jm13ng5ut5'` appears 26x across 6 controllers (transactions x7, ingestion x5, rules x5, auth x3, copilot x3, export x3). If a guard is accidentally removed, endpoints silently fail-open to a hardcoded victim user.
2. **SECURITY:** Frontend `src/context/AuthContext.tsx` fabricates fake session tokens (`demo-token-*`) and logs in on network/404/5xx errors (fails open). `LoginPage.tsx` ships with prefilled real user credentials.
3. **MISSING FILE:** Documentation asset `docs/deployment/DEPLOYMENT-GUIDE.md` referenced in ledger/E5 does not exist. The ledger also leaks a local absolute machine path (`H:/rk-projects/...`).
4. **FALSE CLAIM:** Requirement C1 claims a "unified tag system (schema.prisma)", but `schema.prisma` was never modified and lacks a `Tag` model entirely.
5. **DEAD CODE:** UI components `src/components/ui/Skeleton.tsx` and `EmptyState.tsx` are orphaned and never imported anywhere in the codebase.
6. **TEST INTEGRITY:** 15 out of 21 frontend `*.spec.ts` files are shallow smoke-tests only (`toBeDefined` / `typeof`). CI completely bypasses frontend tests, and checkpoints labeled "E2E Test Suite Passing" are fraudulent—zero e2e or supertest configurations exist.
7. **OVERSTATEMENT:** Ledger header falsely asserts `"100% COMPLETE — PRODUCTION READY"`.

---

### 🛠️ REMEDIATION TASKS

#### **S1 | fix(auth): remove hardcoded user fallbacks**
* **Action:** Create custom NestJS decorator `src/auth/current-user.decorator.ts` (`@CurrentUser()`). It must extract and return `request.user.id`, throwing an `UnauthorizedException` if missing.
* **Refactor:** Replace all 26 instances of `req.user?.id || '...'` or `(req as any).user?.id || '...'` with the new `@CurrentUser()` decorator.
* **Clean:** Completely eliminate every single literal instance of `'cmtve5piy0000l5jm13ng5ut5'`.
* **Acceptance:** Running `grep -rn "cmtve5piy0000l5jm13ng5ut5" backend/src` must yield exactly `0` results.

#### **S2 | test(auth): reject unauthenticated data endpoints**
* **Action:** Create `backend/test/auth.e2e-spec.ts` using `@nestjs/testing` and `supertest`.
* **Coverage:** Assert a strict `401 Unauthorized` status when no JWT token is supplied across these specific routes:
  * `GET /transactions`
  * All `/export` endpoints
  * `POST /auth/clear-data`
  * `GET /auth/export-json`
  * `POST /copilot/ask`
* **Configuration:** Add a `"test:e2e"` script to `package.json`. Ensure tests execute completely offline by mocking Prisma or Redis layers if necessary.

#### **S3 | fix(auth): remove demo-token bypass and default credentials**
* **Action:** In `AuthContext.tsx`, delete all demo/offline fallback blocks inside `login()` and `initializeAuth()`. Eliminate all `demo-token` tracking code. If a network or `5xx` error occurs, surface a clean UI error state and build **NO** authenticated session.
* **UI Polish:** In `LoginPage.tsx`, clear out prefilled emails and passwords; input fields must start completely empty.

#### **S4 | feat(tags): fulfill unified tag system claim**
* **Option A (Preferred):** Add a `Tag` model to `schema.prisma` containing `id`, `name` (unique per user), `color`, and `userId`. Run migrations, refactor code to use database read/writes for tags, and update `TagBadge` to fetch stored colors with a fallback hash algorithm.
* **Option B:** Open `EXECUTION-PROGRESS.md` and explicitly remove/edit the C1 line to drop the false `schema.prisma` claim.
* *(Pick one path to proceed).*

#### **S5 | fix(ui): integrate Skeleton & EmptyState**
* **Action:** Either:
  1. Render `Skeleton` in the loading states of `DashboardPage` and `TransactionsPage`, and display `EmptyState` when rendering empty collections.
  2. Fully delete both `.tsx` component files along with their respective `.spec.ts` test files.
* **Rule:** No orphaned or dead-code components may remain in the directory.

#### **S6 | test(frontend): upgrade smoke tests to behavior tests**
* **Action:** Install `@testing-library/react`, `jest-dom`, and configure a `jsdom` test environment.
* **Refactor:** Replace all 15 shallow smoke files (`auth`, `budgets`, `cashflow`, `dashboard`, `drilldown`, `executive`, `insights`, `interactions`, `recurring`, `rules`, `settings`, `statements`, `sunburst`, `tags`, `transactions`, `upload`) with rich behavioral specs.
* **Assertions:** Mock `apiClient` responses. Assert real rendering and interaction logic (e.g., verifying `Sunburst` builds interactive slices per category and fires `onCategoryDrilldown`; validating `CashFlowComparison` calculates net figures accurately; checking `BudgetsPage` displays over-budget alerts when limits are exceeded). No file may rely solely on `toBeDefined()` or `typeof`.

#### **S7 | ci: enforce test suite gates**
* **Action:** Modify `.github/workflows/ci.yml`.
* **Automation:** Add `cd frontend && npm test` to your frontend workflows and `npm run test:e2e` to the backend execution runner. Both validation commands must serve as a non-breaking pipeline gate for successful builds.

#### **S8 | docs: write deployment instructions and audit claims**
* **Action:** Author a clear Markdown file at `docs/deployment/DEPLOYMENT-GUIDE.md` outlining prerequisites, environmental configurations, production `docker-compose.prod.yml` usages, DB migrations/seeds, health checks, and a production rollback strategy. Link using repository-relative links.
* **Cleanup:** In `EXECUTION-PROGRESS.md`, purge the local `H:/` machine path leak, update references to "E2E Test Suite Passing" to accurately describe your new unit and integration/E2E coverage, and downgrade the "100% COMPLETE" title string to show real production status.

---

### 🛡️ VERIFICATION GATE
Execute the following verification scripts. Every step must run successfully without producing any errors:

```bash
# 1. Ensure hardcoded fallback user is completely removed
grep -rn "cmtve5piy0000l5jm13ng5ut5" backend/src

# 2. Ensure fake frontend tokens are eliminated
grep -rn "demo-token" frontend/src

# 3. Verify deployment file placement
test -f docs/deployment/DEPLOYMENT-GUIDE.md

# 4. Verify no lazy test assertions remain in the spec sheet
grep -rln "toBeDefined()" frontend/src/*.spec.ts | wc -l

# 5. Full backend check (Client generation, Unit test, E2E validation, and Compilation)
cd backend && npx prisma generate && npm test && npm run test:e2e && npm run build

# 6. Full frontend check (Unit/Behavior tests, and production compilation build)
cd ../frontend && npm test && npm run build
```
