# Project Overview: NexusWallet

## Mission
Build a production-grade REST API for a simplified crypto wallet that supports multi-token balances (BRL, BTC, ETH), deposits via webhook, token swaps with real-time pricing, and withdrawals — all backed by an immutable, auditable ledger. A React frontend deployed on Vercel consumes the API, giving the Nexus team an end-to-end demonstration of architecture quality, financial domain modelling, and TypeScript discipline.

## Success Criteria Benchmarks

| Criterion | Verifiable Signal |
|-----------|------------------|
| Auth works | `POST /auth/register` + `POST /auth/login` return valid JWT pair; protected routes return 401 without token |
| Wallet integrity | Balance reconstructed from ledger matches `walletBalance.amount` in DB at all times |
| Idempotency | Sending the same `idempotencyKey` twice to `/webhooks/deposit` credits only once |
| Swap accuracy | `destinationAmount = sourceAmount * rate * (1 - 0.015)`; three ledger entries generated per swap |
| Ledger auditability | Running `SELECT SUM(delta) FROM ledger_entries WHERE wallet_balance_id = X` equals current balance |
| Frontend live | Vercel deployment URL accessible; dashboard shows balances, swap form, and transaction history |

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Runtime** | Node.js 20 LTS + TypeScript 5 | Required by test |
| **Framework** | Fastify | Faster than Express; schema-first with JSON Schema; preferred by Nexus team |
| **ORM** | Prisma | Type-safe queries; migration-first; excellent DX |
| **Database** | PostgreSQL 16 | Required by test; ACID transactions critical for ledger |
| **Validation** | Zod | Runtime schema validation; composable with Prisma types |
| **Cache** | Redis (ioredis) | Rate-limit CoinGecko calls; cache quotes for 30s TTL |
| **Auth** | JWT (access 15m + refresh 7d) | Stateless; refresh token stored hashed in DB |
| **Frontend** | React 18 + Vite + TailwindCSS | Fast dev server; Vercel-native |
| **Deploy: API** | Railway | Free tier; native PostgreSQL + Redis; env var management |
| **Deploy: UI** | Vercel | Requested by HR; seamless React deployment |
| **Testing** | Vitest + Supertest | Fast; native ESM; compatible with Fastify |
| **Knowledge Base** | Graphify Knowledge Graph | Session resumption for agentic workflows |
