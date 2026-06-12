# Architecture: NexusWallet Systemic Boundaries & Invariants

## System Map

```
┌─────────────────────────────────────────────────────────┐
│  Vercel (Frontend)                                       │
│  React 18 + Vite + TailwindCSS                          │
│  /apps/web                                              │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS REST
┌─────────────────▼───────────────────────────────────────┐
│  Railway (Backend)                                       │
│  Fastify + TypeScript                                    │
│  /apps/api                                              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Auth    │  │  Wallet  │  │  Swap / Withdrawal   │  │
│  │  Module  │  │  Module  │  │  Module              │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Ledger Module (append-only, immutable entries)  │   │
│  └──────────────────────────────────────────────────┘   │
└──────┬──────────────────────────────────┬───────────────┘
       │ Prisma                           │ ioredis
┌──────▼──────┐                   ┌───────▼──────┐
│ PostgreSQL  │                   │    Redis     │
│ (Railway)   │                   │  (Railway)   │
└─────────────┘                   └──────────────┘
                                         │ HTTP
                                  ┌──────▼──────┐
                                  │  CoinGecko  │
                                  │  Public API │
                                  └─────────────┘
```

## Monorepo Structure

```
nexus-wallet/
├── CLAUDE.md                        ← Agent entry point
├── apps/
│   ├── api/                         ← Fastify backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── wallet/
│   │   │   │   ├── swap/
│   │   │   │   ├── withdrawal/
│   │   │   │   └── ledger/
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts
│   │   │   │   ├── redis.ts
│   │   │   │   └── coingecko.ts
│   │   │   ├── middleware/
│   │   │   │   └── auth_guard.ts
│   │   │   └── app.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── vitest.config.ts
│   └── web/                         ← React frontend
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── lib/api.ts
│       └── vercel.json
└── docs/
    ├── guidelines/                  ← Static agent context
    └── specs/                       ← Atomic Feature Specs
        └── NXS-<id>-<slug>/
            ├── product.md
            └── tech.md
```

## Database Schema (Prisma)

```prisma
model User {
  id           String          @id @default(cuid())
  email        String          @unique
  passwordHash String
  refreshToken String?
  wallet       Wallet?
  transactions Transaction[]
  createdAt    DateTime        @default(now())
}

model Wallet {
  id       String          @id @default(cuid())
  userId   String          @unique
  user     User            @relation(fields: [userId], references: [id])
  balances WalletBalance[]
}

model WalletBalance {
  id           String        @id @default(cuid())
  walletId     String
  wallet       Wallet        @relation(fields: [walletId], references: [id])
  token        TokenSymbol
  amount       Decimal       @default(0) @db.Decimal(36, 18)
  ledgerEntries LedgerEntry[]

  @@unique([walletId, token])
}

model LedgerEntry {
  id              String          @id @default(cuid())
  walletBalanceId String
  walletBalance   WalletBalance   @relation(fields: [walletBalanceId], references: [id])
  type            LedgerEntryType
  delta           Decimal         @db.Decimal(36, 18)
  balanceBefore   Decimal         @db.Decimal(36, 18)
  balanceAfter    Decimal         @db.Decimal(36, 18)
  transactionId   String?
  transaction     Transaction?    @relation(fields: [transactionId], references: [id])
  createdAt       DateTime        @default(now())
}

model Transaction {
  id             String          @id @default(cuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id])
  type           TransactionType
  fromToken      TokenSymbol?
  toToken        TokenSymbol?
  fromAmount     Decimal?        @db.Decimal(36, 18)
  toAmount       Decimal?        @db.Decimal(36, 18)
  feeAmount      Decimal?        @db.Decimal(36, 18)
  rate           Decimal?        @db.Decimal(36, 18)
  idempotencyKey String?         @unique
  ledgerEntries  LedgerEntry[]
  createdAt      DateTime        @default(now())
}

enum TokenSymbol {
  BRL
  BTC
  ETH
}

enum LedgerEntryType {
  DEPOSIT
  SWAP_IN
  SWAP_OUT
  SWAP_FEE
  WITHDRAWAL
}

enum TransactionType {
  DEPOSIT
  SWAP
  WITHDRAWAL
}
```

## Agentic Orchestration (CWD Framework)

All agentic features follow the **Coordinator-Worker-Delegator** pattern:

1. **Coordinator (LLM):** Reads the spec, plans the trajectory, identifies module boundaries.
2. **Worker (Tool):** Executes one atomic action at a time — write one file, run one test, make one DB query.
3. **Delegator (Microservice):** CoinGecko integration is an isolated delegator; swap logic never calls the HTTP client directly — it goes through `lib/coingecko.ts`.

## Systemic Invariants (Never Break)

| Invariant | Rule |
|-----------|------|
| **Ledger Immutability** | `LedgerEntry` rows are never updated or deleted. Balance corrections are new entries. |
| **Decimal Precision** | All monetary values use `Decimal` (prisma) / `decimal.js` (runtime). Never use `number` for amounts. |
| **Atomic Swap** | Swap debit + fee debit + credit happen inside a single Prisma `$transaction`. Partial execution is a bug. |
| **Idempotency** | `idempotencyKey` is unique in DB. Duplicate webhook = 200 OK with original transaction, no new credit. |
| **Trust Anchor** | `auth_guard` middleware must be registered on all routes except `/auth/*` and `/webhooks/*`. |
| **Stateless Auth** | Access tokens are never stored. Only hashed refresh tokens live in DB. |
