# Kitna Kharcha 2.0 — Execution Progress Ledger

- **Active Phase:** Phase A (Foundation & Critical Fixes)
- **Active Branch:** dev/v2-execution
- **Last Completed Task:** A2: Fix Rule Engine & Seed Classification Rules (`seed.ts`, `rule-engine.service.ts`)
- **Next Task:** A3: Implement React Router & 10 Page Skeletons (`routes.tsx`, `Sidebar.tsx`)
- **Pending Blocker:** None
- **User Action Required:** None (All dependencies, including `react-router-dom` v6.30.6, are pre-installed)

---

## Task Progress Checklist

### Step 0: Working Tree Hygiene
- [x] Stage/commit exploration changes and ledgers (Commit a21ac49)

### Phase A: Foundation & Critical Fixes (Branch: `dev/v2-execution`)
- [x] **A1:** Rewrite Merchant Normalization Engine (`merchant-normalizer.ts`)
- [x] **A2:** Fix Rule Engine & Seed Classification Rules (`seed.ts`, `rule-engine.service.ts`)
- [ ] **A3:** Implement React Router & 10 Page Skeletons (`routes.tsx`, `Sidebar.tsx`) *(Pre-installed: `react-router-dom` v6.30.6)*
- [ ] **A4:** Port Auth Flow & Re-enable JWT Backend Guards (`LoginPage.tsx`, `AuthContext.tsx`)
- [ ] **A5:** Build Full Analytical Dashboard Page (`DashboardPage.tsx`)
- [ ] **A6:** Build Statements Management Page (`StatementsPage.tsx`)
- [ ] **A7:** Build Dedicated Transactions Ledger Page (`TransactionsPage.tsx`)
- [ ] **A8:** Build Rules Management Page (`RulesPage.tsx`)
- [ ] **A9:** Build Multi-Format Upload Page (`UploadPage.tsx`)
- [ ] **A10:** Patch PII Masking Engine Gaps (`hsn.strategy.ts`, `gstin.strategy.ts`, etc.)
- [ ] **A11:** Implement Reliable Upload Polling & Toast Alerts (`UploadPage.tsx`)
- [ ] **A12:** Port KK1 Deterministic Generic Parser (`generic.strategy.ts`)
- [ ] **Checkpoint A:** Full Foundation E2E Test Suite Passing

### Phase B: Intelligence Engine & Copilot (`feat/intelligence`)
- [ ] **B1:** Recurring Transaction & Subscription Detection (`recurring.service.ts`)
- [ ] **B2:** Implement All 8 Copilot Tools (`copilot.service.ts`)
- [ ] **B3:** Budget Management & Real-Time Alerting (`budget.service.ts`)
- [ ] **B4:** Proactive Financial Insights Engine (`insights.service.ts`)
- [ ] **B5:** Advanced Trend Analysis Aggregations (`analytics.service.ts`)
- [ ] **B6:** Build Recurring Subscriptions & EMIs Page (`RecurringPage.tsx`)
- [ ] **B7:** Build Budgets Page with AI Recommender (`BudgetsPage.tsx`)
- [ ] **B8:** Proactive Insights Dashboard Widget (`InsightsPanel.tsx`)
- [ ] **Checkpoint B:** Intelligence & Copilot E2E Test Suite Passing

### Phase C: Unified Tags, Advanced Visuals & Copilot UX (`feat/ux-and-visuals`)
- [ ] **C1:** Unified Category + Colorful Tag System (`TagBadge.tsx`, `schema.prisma`)
- [ ] **C2:** Sunburst Hierarchical Category-Merchant Chart (`SunburstSpendingChart.tsx`)
- [ ] **C3:** Income & Cash Flow Visualization (`CashFlowComparison.tsx`)
- [ ] **C4:** Category Sub-Breakdown Modal (`CategoryDrilldownModal.tsx`)
- [ ] **C5:** Copilot Chat UI Revamp (`CopilotFloatingChat.tsx`)
- [ ] **C6:** User Settings & Customization Page (`SettingsPage.tsx`)
- [ ] **Checkpoint C:** Visuals, Tags & UX E2E Test Suite Passing

### Phase D: Design Polish, Micro-Interactions & Mobile (`feat/polish`)
- [ ] **D1:** Bespoke Design System & Typography (`tailwind.config.js`, `index.css`)
- [ ] **D2:** Dashboard Storytelling Executive Summary (`ExecutiveSummaryHeader.tsx`)
- [ ] **D3:** Micro-Interactions, Shimmer Skeletons & Toasts (`Skeleton.tsx`, `Toaster.tsx`)
- [ ] **D4:** Mobile-Responsive Layout & Touch Drawer (`MobileNav.tsx`, `AppLayout.tsx`)
- [ ] **D5:** Interactive Column Mapping UI for CSV/Excel (`ColumnMapperModal.tsx`)
- [ ] **Checkpoint D:** Design Polish & Mobile E2E Test Suite Passing

### Phase E: Production, Observability & DevOps (`feat/production`)
- [ ] **E1:** Multi-Format Data Export Engine (`export.service.ts`, `ExportModal.tsx`)
- [x] **E2:** Multi-Stage Production Dockerfiles & Compose (`Dockerfile`, `docker-compose.prod.yml`)
- [x] **E3:** Automated CI/CD Pipeline Workflow (`.github/workflows/ci.yml`)
- [ ] **E4:** LLM Observability & Cost/Latency Tracking (`llm-tracker.service.ts`)
- [x] **E5:** Production Health Checks & Cloud Deployment Guide (`docs/deployment/DEPLOYMENT-GUIDE.md`)
- [ ] **Checkpoint E:** Final Production Verification Gate
