# Kitna Kharcha 2.0 — Development Progress Ledger

> This file tracks development progress across sessions. If context is lost, read this file first to resume.

## Plan Reference
- **Spec:** [design-spec.md](file:///C:/Users/PC/.gemini/antigravity-cli/brain/d092954f-15ac-4de2-be26-a6127312dc29/design-spec.md)
- **Plan:** [phase1-plan.md](file:///C:/Users/PC/.gemini/antigravity-cli/brain/d092954f-15ac-4de2-be26-a6127312dc29/phase1-plan.md)
- **Repo:** `H:\rk-projects\kitna-kharcha-2.0`
- **GitHub:** TBD (will push after Phase 1)

## Project Structure
```
kitna-kharcha-2.0/
├── package.json          (root workspace)
├── .gitignore
├── .env.example
├── docker-compose.yml    (postgres:15 + redis:7)
├── README.md
├── backend/
│   ├── package.json      (NestJS 10 + all deps)
│   ├── tsconfig.json     (strict: true)
│   ├── nest-cli.json
│   ├── vitest.config.ts
│   ├── prisma/
│   │   └── schema.prisma (FULL schema — 10 models, all enums)
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       └── prisma/
│           ├── prisma.service.ts
│           └── prisma.module.ts
└── frontend/
    ├── package.json      (React 18 + Vite + Tailwind)
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        └── index.css
```

## Phase 1 Tasks — Status

| # | Task | Status | Commit | Notes |
|---|---|---|---|---|
| 1 | Project Scaffolding | ✅ DONE | `774a539` | Scaffold complete, deps installed, lockfiles pushed |
| 2 | Provider-Agnostic LLM Layer | ✅ DONE | `5f051e3` | GeminiProvider + LLMService + factory |
| 3 | PII Masking Engine | ✅ DONE | `88d56fd` | 9 strategies + encryption + confidence scoring |
| 4 | Multi-Input Ingestion | ✅ DONE | `bb7d771` | CSV/Excel/Text ingesters + controller |
| 5 | Parsing Layer | ✅ DONE | `73a456f` | HDFC/SBI strategies + LLM fallback + merchant normalizer |
| 6 | Tiered Classification | ✅ DONE | `9729d3d` | Compound rule engine + LLM classifier + feedback |
| 7 | Deduplication | ✅ DONE | `ba70cc7` | Statement fingerprinting + transaction dedup |
| 8 | Multi-Currency | ✅ DONE | `54632f7` | Currency detection + exchange rate conversion |
| 9 | BullMQ Pipeline | ✅ DONE | `616e523` | Async processing: mask → parse → dedup → classify |
| 10 | Auth + Seed + Integration Tests | ✅ DONE | `004b7af` | Auth module, seed script with default categories/rules |

## Commits Log
<!-- Append each commit here as it's made -->
1. `774a539` — `chore: scaffold kitna-kharcha-2.0 monorepo with NestJS, React, Prisma, Redis` (24 files, 741 insertions)
2. `6ffe6ab` — `chore: add lockfiles after successful installation`
3. `5f051e3` — `feat: add provider-agnostic LLM layer with Gemini implementation`
4. `88d56fd` — `feat: add PII masking engine with 9 strategies and reversible encryption`
5. `bb7d771` — `feat: add multi-format ingestion (CSV, Excel, text paste)`
6. `f911372` — `fix: resolve testing DI for ingestion module`
7. `73a456f` — `feat: add parsing layer with HDFC/SBI and LLM fallback`
8. `9729d3d` — `feat: add tiered classification engine with compound rules and LLM fallback`
9. `ba70cc7` — `feat: add deduplication engine and fingerprint service`
10. `54632f7` — `feat: add multi-currency detection and conversion engine`
11. `616e523` — `feat: add BullMQ async pipeline integrating masking, parsing, dedup, and classification`
12. `004b7af` — `feat: add JWT auth module and database seed script`

## Rulings & Decisions
- Name: "Kitna Kharcha 2.0" (user rejected Hisaab/PaisaPilot/etc.)
- Gemini SDK: `@google/genai` v2.21.0, `GoogleGenAI` class, `response.text` is getter not function
- Free tier model: `gemini-2.5-flash` (also available: gemini-3.7-flash, gemini-3.5-flash)
- Structured output: use `responseJsonSchema` with `zod-to-json-schema` (not Zod v4 native — project uses Zod v3)
- No pgvector — LLM + SQL sufficient
- Observability deferred to Phase 4
- Frontend design: will be custom, not generic Tailwind — Phase 3

## Resume Instructions
1. Read this file for current state
2. Check `git log --oneline -10` in repo for latest commits
3. Check task status table above
4. Continue from the first ⬜ NOT STARTED or 🔄 IN PROGRESS task
5. After each task: update this file, commit, push
