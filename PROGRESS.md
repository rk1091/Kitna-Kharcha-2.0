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
| 1 | Project Scaffolding | 🔄 IN PROGRESS | — | Files created. npm install running. Need: prisma generate, first commit |
| 2 | Provider-Agnostic LLM Layer | ⬜ NOT STARTED | — | GeminiProvider + LLMService + factory |
| 3 | PII Masking Engine | ⬜ NOT STARTED | — | 9 strategies + encryption + confidence scoring |
| 4 | Multi-Input Ingestion | ⬜ NOT STARTED | — | CSV/Excel/Text ingesters + controller |
| 5 | Parsing Layer | ⬜ NOT STARTED | — | HDFC/SBI strategies + LLM fallback + merchant normalizer |
| 6 | Tiered Classification | ⬜ NOT STARTED | — | Compound rule engine + LLM classifier + feedback |
| 7 | Deduplication | ⬜ NOT STARTED | — | Statement fingerprinting + transaction dedup |
| 8 | Multi-Currency | ⬜ NOT STARTED | — | Currency detection + exchange rate conversion |
| 9 | BullMQ Pipeline | ⬜ NOT STARTED | — | Async processing: mask → parse → dedup → classify |
| 10 | Auth + Seed + Integration Tests | ⬜ NOT STARTED | — | Auth module, 70+ rules, integration tests |

## Commits Log
<!-- Append each commit here as it's made -->
_No commits yet — first commit pending after npm install + prisma generate_

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
