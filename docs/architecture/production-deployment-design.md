# Production Deployment Design Spec — Kitna Kharcha 2.0

- **Date:** 2026-09-15
- **Status:** Approved / In Planning
- **Target Architecture:** Modern Cloud-Native GitOps (Cloudflare Pages + Koyeb + Neon Postgres + Redis Cloud)
- **Ongoing Cost:** $0.00 / month (100% Free Tiers with zero cold-starts and no 30-day database expiration)

---

## 1. System Topology & Architecture

```
                                  +-------------------------------------+
                                  |            Global Users             |
                                  +------------------+------------------+
                                                     |
                         HTTPS / Custom Domain       |
                                                     v
                                  +-------------------------------------+
                                  |       Cloudflare Pages (CDN)        |
                                  |   - React 18 + Vite Static SPA      |
                                  |   - Global Edge Caching & SSL       |
                                  |   - SPA Fallback (_redirects)       |
                                  +------------------+------------------+
                                                     |
                                                     | REST API Calls (CORS)
                                                     v
                                  +-------------------------------------+
                                  |        Koyeb Cloud Runtime          |
                                  |   - NestJS 10 API Service           |
                                  |   - BullMQ Persistent Worker        |
                                  |   - Multi-Stage Docker Container    |
                                  |   - 24/7 Uptime (Eco Free Instance) |
                                  +--------+--------------------+-------+
                                           |                    |
                  Database Queries (SSL)   |                    | Job Queue (TLS)
                                           v                    v
         +------------------------------------+   +------------------------------------+
         |       Neon Serverless Postgres     |   |         Redis Cloud (30MB)         |
         |   - Persistent Relational Storage  |   |   - BullMQ Statement Processing    |
         |   - Automatic PgBouncer Pooling    |   |   - Dedicated In-Memory Cache      |
         |   - No 30-day expiration           |   |   - Standard Redis TCP Protocol    |
         +------------------------------------+   +------------------------------------+
```

---

## 2. Component Specifications

### 2.1 Frontend (Cloudflare Pages)
- **Framework:** React 18, Vite, Tailwind CSS.
- **Build Command:** `npm run build`
- **Build Output Directory:** `dist`
- **Root Directory:** `frontend`
- **Environment Variables:**
  - `VITE_API_URL`: Points to the live Koyeb backend URL (`https://<koyeb-app-name>.koyeb.app`).
- **SPA Routing Rule:**
  - File: `frontend/public/_redirects`
  - Content: `/* /index.html 200`
  - Purpose: Ensures client-side routing (`react-router-dom`) functions properly when users refresh on deep URLs.

### 2.2 Backend & Worker (Koyeb Container)
- **Runtime:** Node.js 20 on Alpine Linux.
- **Service Type:** Web Service with persistent background worker.
- **Instance Type:** `eco-nano` / `eco-micro` (Free tier, 512MB RAM, no sleep).
- **Port:** `3001` (dynamically bound via `process.env.PORT`).
- **Environment Variables:**
  - `DATABASE_URL`: Neon PostgreSQL pooled connection string.
  - `DIRECT_URL`: Neon PostgreSQL direct connection string (for migrations).
  - `REDIS_URL`: Redis Cloud connection string (`rediss://...`).
  - `JWT_SECRET`: 32+ character cryptographically secure random string.
  - `JWT_EXPIRES_IN`: `7d`
  - `GEMINI_API_KEY`: Google Gemini API key.
  - `LLM_PROVIDER`: `gemini`
  - `LLM_MODEL`: `gemini-2.5-flash`
  - `FRONTEND_URL`: Allowed Cloudflare Pages origin for CORS.
- **Startup Lifecycle:**
  1. `npx prisma migrate deploy` (applies all database migrations automatically on boot).
  2. `node dist/src/main.js` (launches NestJS API server and BullMQ processor).

### 2.3 Database (Neon PostgreSQL)
- **Storage:** 0.5 GB Free Tier.
- **Connection Model:** Dual-mode:
  - Pooled (`pgbouncer=true`): High-concurrency client requests.
  - Direct: DDL operations (`prisma migrate deploy`).
- **Data Retention:** Perpetual (no 30-day auto-wipeout like Render).

### 2.4 Cache & Queue (Redis Cloud)
- **Capacity:** 30 MB Free Tier.
- **Protocol:** Standard Redis 7 TCP over TLS (`rediss://`).
- **Role:** Handles BullMQ statement ingestion, parsing, deduplication, and classification job queues.

---

## 3. Dynamic Continuous Deployment (GitOps Flow)

```
Developer runs `git push origin <branch>` (e.g. `prototype/v1-deployment` or `main`)
       |
       +---> Cloudflare Pages Webhook
       |        - Clones `frontend/`
       |        - Runs `npm install && npm run build`
       |        - Purges Edge CDN cache & updates live site (~30 seconds)
       |
       +---> Koyeb Webhook
                - Clones `backend/`
                - Builds multi-stage Docker image
                - Runs health checks
                - Executes zero-downtime rolling switch (~90 seconds)
```

---

## 4. Codebase Adaptations Required for v1

1. **`frontend/src/config/api.ts` & `frontend/src/App.tsx`**:
   - Refactor hardcoded `http://localhost:3001` calls to consume `import.meta.env.VITE_API_URL || 'http://localhost:3001'`.
2. **`frontend/public/_redirects`**:
   - Add single-page application fallback rule for Cloudflare Pages.
3. **`backend/src/app.module.ts`**:
   - Parse `process.env.REDIS_URL` in `BullModule.forRoot` to support Redis Cloud TLS connection strings.
4. **`backend/Dockerfile`**:
   - Implement production-optimized multi-stage build (`node:20-alpine`), create `/app/uploads` with non-root ownership, and run `prisma generate`.
5. **`docker-compose.prod.yml`**:
   - Provide local and self-hosted production compose configuration alongside the cloud setup.

---

## 5. Verification & Acceptance Criteria

- [ ] Backend Docker container builds cleanly without errors.
- [ ] Backend successfully connects to Neon PostgreSQL and applies Prisma migrations.
- [ ] Backend successfully connects to Redis Cloud and BullMQ queue initializes without crashing.
- [ ] Frontend successfully builds on Cloudflare Pages and renders analytics dashboard.
- [ ] Frontend communicates with live backend over HTTPS without CORS errors.
- [ ] Bank statement upload completes end-to-end (PII masking -> parsing -> dedup -> classification).
- [ ] Subsequent `git push` triggers automatic live updates on both frontend and backend.
