# Kitna Kharcha 2.0 — Privacy-First AI Finance Intelligence

Upload bank statements, auto-categorize transactions with a tiered AI engine, and get intelligent financial insights — all while your sensitive data stays masked.

## What's Different from v1

- **PII Masking Engine** — 10+ masking strategies strip sensitive data (account numbers, PAN, Aadhaar, UPI IDs, etc.) before any AI interaction
- **Tiered Classification** — Rule engine handles 80% of transactions (free, instant) → Gemini LLM classifies the rest → user corrections auto-generate new rules
- **Universal Parsing** — Works with any bank statement, not just HDFC/SBI. LLM-powered fallback for unknown formats
- **Multi-Input** — PDF, copy-paste, TXT, CSV, Excel
- **Financial Copilot** — Ask natural language questions about your spending ("How much on Swiggy last month?")
- **Provider-Agnostic AI** — Ships with free Gemini. Swap to OpenAI/Anthropic via env var
- **Production Patterns** — BullMQ job queue, deduplication, recurring detection, multi-currency

## Tech Stack

- **Backend**: NestJS 10, TypeScript (strict)
- **Frontend**: React 18, Vite, Tailwind CSS
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5
- **Job Queue**: BullMQ + Redis
- **AI**: Gemini via `@google/genai` (provider-agnostic layer)
- **Validation**: Zod (everywhere — backend DTOs + LLM schemas)
- **Testing**: Vitest + Supertest

## Local Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL + Redis)

### 1. Clone and setup

```bash
git clone https://github.com/rk1091/kitna-kharcha-2.0.git
cd kitna-kharcha-2.0
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

### 3. Backend

```bash
cd backend
cp ../.env.example .env
# Edit .env with your Gemini API key

npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev          # http://localhost:3001
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

## Architecture

```
Input (PDF/CSV/Text) → PII Masking → Parsing → Dedup → Classification → Intelligence
                         ↑                                    ↑
                    100% local                          Tiered: Rules first
                    Never sent to AI                    AI fallback only
```

## License

MIT
