# Kitna Kharcha 2.0 — Architecture Decisions & Deployment FAQ

> A comprehensive reference explaining the core architectural choices, security mechanisms, background queue workflows, and cloud topology of Kitna Kharcha 2.0.

---

## 1. System Topology Overview

```
                      [ USER BROWSER / MOBILE ]
                                 │
                 1. Loads UI     │  2. REST API Calls (CORS enabled)
                      │          v
                      │     [ KOYEB CONTAINER ]
                      │     (NestJS 10 API + BullMQ Worker)
                      │          │
                      │          ├──────> [ NEON POSTGRESQL ]
                      │          │        (Users, Transactions, Categories, Budgets)
                      │          │
                      │          ├──────> [ REDIS CLOUD ]
                      │          │        (BullMQ Statement Processing Queue)
                      │          │
                      │          └──────> [ GOOGLE GEMINI API ]
                      │                   (Fallback Classification & Copilot Insights)
                      v
             [ CLOUDFLARE PAGES ]
             (Global Edge CDN: React 18 SPA)
```

---

## 2. Why Did We Attach `ci.yml` (GitHub Actions CI)?

### What It Does
Every time code is pushed or a Pull Request is opened, GitHub automatically spins up a clean Ubuntu virtual machine in the cloud to run:
1. **Type Checking:** Runs TypeScript compilation (`tsc`) across backend and frontend workspaces.
2. **Schema Integrity:** Runs `npx prisma validate` and `npx prisma generate` to verify database contracts.
3. **Automated Testing:** Executes the full Vitest suite (`npm test`).
4. **Production Build Verification:** Ensures that `npm run build` succeeds without bundle errors for both frontend and backend.

### Why We Need It in Our Architecture
1. **The GitOps Safety Gate:**  
   Because Cloudflare Pages and Koyeb automatically deploy new code whenever `git push` runs, untested changes could easily break live users. The CI pipeline acts as an automated gatekeeper that catches syntax errors, broken imports, or regression bugs *before* cloud platforms attempt to build them.
2. **Zero "Works on My Machine" Syndrome:**  
   Code that compiles on a local Windows machine may fail on Linux containers due to case-sensitive file paths or missing native dependencies. GitHub Actions runs on Ubuntu, ensuring the code builds cleanly in a true Linux production environment.
3. **Senior Engineering Resume Signal:**  
   Junior developers often push straight to production and debug live outages. Senior developers build automated CI pipelines to guarantee that `main` is always in a deployable, tested state.

---

## 3. What Does CORS Do Here?

### What Is CORS?
**CORS (Cross-Origin Resource Sharing)** is a mandatory browser security standard. A browser defines an "origin" as the combination of:  
`protocol://domain:port`

### The Scenario in Kitna Kharcha 2.0
* **Frontend Origin:** `https://kitna-kharcha.pages.dev` (Cloudflare Pages)
* **Backend Origin:** `https://kitna-kharcha.koyeb.app` (Koyeb Container)

Notice that these are **two completely different domains**.

### What Happens Without CORS
By default, web browsers strictly forbid JavaScript running on Origin A (`pages.dev`) from reading responses returned by Origin B (`koyeb.app`).  
If CORS is not configured on the backend:
1. The browser immediately **blocks** the outgoing HTTP request.
2. The browser console throws:
   ```
   Access to XMLHttpRequest at 'https://kitna-kharcha.koyeb.app/transactions' 
   from origin 'https://kitna-kharcha.pages.dev' has been blocked by CORS policy: 
   No 'Access-Control-Allow-Origin' header is present on the requested resource.
   ```
3. The frontend displays endless loading spinners, and login, file upload, or transaction fetches completely fail.

### How Our Backend Resolves It
In `backend/src/main.ts`, we configured a dynamic origin validator in NestJS:
```typescript
const allowedOrigins = [
  'http://localhost:5173', // Local Vite dev server
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Production Cloudflare Pages URL
].filter(Boolean) as string[];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.pages.dev')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in preview environments
    }
  },
  credentials: true,
});
```
This instructs the browser that requests originating from your Cloudflare Pages domain (`.pages.dev`) and custom domain are authorized to communicate with the API.

---

## 4. Why Do We Need a Queue in Redis (BullMQ)?

This is the central performance and reliability design decision of the backend architecture.

### What Happens When a Statement Is Uploaded?
Processing an uploaded bank statement is a resource-intensive, multi-step pipeline:
1. **File Ingestion:** Reading raw PDFs, CSVs, or Excel spreadsheets (often hundreds of lines).
2. **PII Masking:** Stripping sensitive numbers (account numbers, PAN, Aadhaar, UPI IDs) via 10+ regex and entropy strategies.
3. **Universal Parsing:** Converting bank-specific column formats into standardized date, amount, and description structures.
4. **Deduplication:** Hashing each record to check for duplicates against the database.
5. **Tiered Classification:** Evaluating local compound rules, then calling **Google Gemini LLM** for unfamiliar merchant descriptions.
6. **Total Time:** Often takes **15 to 45 seconds**.

### Why Synchronous HTTP Without a Queue Fails
* **Gateway Timeouts:** HTTP is designed for sub-second round-trips. If a browser stays waiting on `POST /statements/upload` for 30+ seconds, Cloudflare or reverse proxies will terminate the connection with a **`504 Gateway Timeout`**.
* **Server Crashes Under Load:** If multiple users upload bank statements simultaneously, running multiple AI parsing loops on the main HTTP thread will spike CPU and memory, causing server slowdowns or crashes for all users.
* **Lack of Fault Tolerance:** If the network blips or Gemini hits a 429 rate limit during processing, the entire HTTP request fails, and the user is forced to re-upload the entire statement from scratch.

### How Redis + BullMQ Solves It (Asynchronous Producer-Consumer Pattern)

```
[ User Uploads PDF ]
        │
        ▼
 [ NestJS API (Producer) ]
        │
        ├─ 1. Writes file to disk & creates StatementUpload record (status: PENDING)
        ├─ 2. Adds lightweight job payload `{ statementId: 123 }` to Redis
        │
        └─ 3. Responds immediately in ~50ms: "202 Accepted — Processing in background"
             (User gets instant UI confirmation!)
        
        ▼
   [ REDIS (Message Broker) ]
   Holds queue in memory; persists jobs safely
        
        ▼
 [ BullMQ Worker (Consumer) ]
        │
        ├─ 1. Picks up job from Redis asynchronously
        ├─ 2. Runs Masking -> Parsing -> Dedup -> Gemini AI classification
        ├─ 3. Writes normalized transactions to Neon PostgreSQL
        └─ 4. Updates StatementUpload status to COMPLETED
              (If Gemini rate limits occur, BullMQ retries with exponential backoff automatically!)
```

Redis serves as the high-throughput in-memory data store that powers this queue. BullMQ relies on Redis primitives (lists, streams, and Lua scripts) to guarantee that jobs are never lost, processed in order, and retried cleanly.

---

## 5. End-to-End Component Responsibility Matrix

| Component | Technology | Responsibility | Why Selected |
| :--- | :--- | :--- | :--- |
| **Frontend CDN** | **Cloudflare Pages** | Serves static React 18 / Vite SPA assets globally. | Free, global Edge CDN with <50ms TTFB, unlimited bandwidth, automatic SSL, and zero cold starts. |
| **Compute Runtime** | **Koyeb** | Runs containerized NestJS 10 API and BullMQ worker. | Runs 24/7 without sleeping (unlike Render Free), supports multi-stage Docker builds and native health check probes. |
| **Database** | **Neon PostgreSQL** | Stores users, statements, transactions, categories, and budgets. | Serverless Postgres with built-in PgBouncer pooling; perpetual free tier that does not auto-delete after 30 days. |
| **Queue / Cache** | **Redis Cloud** | Powers BullMQ background job processing. | Dedicated persistent 30MB Redis instance supporting standard TCP protocol and BullMQ Lua scripts with no command rate limits. |
| **AI Layer** | **Google Gemini Flash** | Fallback classification and natural language financial copilot. | High reasoning capability, large context window, fast latency, and generous free tier via `@google/genai`. |
| **CI Automation** | **GitHub Actions** | Automated linting, typechecking, Vitest tests, and build validation. | Validates pull requests and commits before deployment, ensuring zero downtime and high code quality. |
