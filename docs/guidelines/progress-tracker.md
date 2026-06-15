# Progress Tracker: NexusWallet State Anchor

## Current Project Phase
**Phase 1: Foundation**

## Active Implementation
- **Current Task:** NXS-7 — Withdrawal module
- **Status:** Todo
- **Branch:** —

---

## Feature Queue (GitHub Issues)

| ID | Feature | Status | Branch |
|----|---------|--------|--------|
| NXS-1 | Project scaffold (monorepo + Fastify + Prisma + DB schema) | ✅ Done | `NXS-1-project-scaffold` |
| NXS-2 | Auth module (register, login, JWT, refresh token) | ✅ Done | `spec/NXS-2-auth-jwt` |
| NXS-3 | Wallet module (auto-create on register, get balances) | ✅ Done | `spec/NXS-3-wallet-balances` |
| NXS-4 | Ledger module (append-only entries, audit endpoint) | ✅ Done | `spec/NXS-4-ledger-audit` |
| NXS-5 | Deposit webhook (idempotency, credit, error handling) | ✅ Done | `spec/NXS-5-deposit-webhook` |
| NXS-6 | Swap module (quote endpoint + execute endpoint) | ✅ Done | `spec/NXS-6-swap-module` |
| NXS-7 | Withdrawal module | 🔲 Todo | — |
| NXS-8 | Transaction history endpoint (paginated) | 🔲 Todo | — |
| NXS-9 | Redis cache for CoinGecko quotes (30s TTL) | ✅ Done | — |
| NXS-10 | React frontend (dashboard, swap form, history) | 🔲 Todo | — |
| NXS-11 | Deploy: Railway (API) + Vercel (web) | 🔲 Todo | — |
| NXS-12 | README + technical decisions doc | 🔲 Todo | — |

---

## Completed Features
- **NXS-1**: Project scaffold (monorepo + Fastify + Prisma + DB schema) - 2026-06-12
- **NXS-2**: Auth module (register, login, JWT, refresh token) - 2026-06-13
- **NXS-3**: Wallet module (auto-create on register, get balances) - 2026-06-13
- **NXS-4**: Ledger module (append-only entries, audit endpoint) - 2026-06-13
- **NXS-5**: Deposit webhook (idempotency, credit, error handling) - 2026-06-13
- **NXS-6**: Swap module (quote endpoint + execute endpoint) - 2026-06-14
- **NXS-9**: Redis cache for CoinGecko quotes (30s TTL) - 2026-06-14

---

## Historical Decisions

| Date | Decision |
|------|----------|
| 2026-06-12 | Adopted Spec-Driven Development with Router Pattern |
| 2026-06-12 | Chose Fastify over NestJS (lighter, schema-first, faster cold start on Railway) |
| 2026-06-12 | Chose Railway for API deploy (native PG + Redis on free tier) |
| 2026-06-12 | Chose Vercel for frontend deploy (HR requirement) |
| 2026-06-12 | Chose `decimal.js` for all monetary math (no floating-point risk) |

---

## Session Restoration Point
Agents resuming work must:
1. Read this file to identify the active task.
2. Run `graphify query "active implementation"` for full context.
3. Read `docs/specs/NXS-<active-id>/` before touching any file.
