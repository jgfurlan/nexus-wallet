# Technical Spec: Estrutura Inicial do Projeto (Scaffold)

**Veja `product.md` para detalhes sobre o comportamento esperado e critérios de aceitação.**
**Issue:** GH1

---

## 1. Contexto
Este é o primeiro ticket de implementação do projeto. Atualmente, o repositório contém apenas arquivos de documentação (`docs/` e `CLAUDE.md`).
Precisamos construir a infraestrutura do monorepo e configurar o Fastify e o Prisma para dar início ao desenvolvimento de funcionalidades.

---

## 2. Mudanças Propostas

### Estrutura de Diretórios Proposta

```
nexus-wallet/
├── package.json                     # Arquivo de configuração raiz do monorepo
├── pnpm-workspace.yaml              # Define os workspaces (apps/api e apps/web)
├── pnpm-lock.yaml                   # Lockfile compartilhado
├── apps/
│   ├── api/                         # Backend Fastify
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── app.ts               # Setup principal do Fastify
│   │   │   ├── server.ts            # Ponto de entrada (escuta porta 3000)
│   │   │   ├── lib/                 # Singletons (prisma.ts, redis.ts)
│   │   │   └── modules/             # Funcionalidades modulares
│   │   │       └── health/
│   │   │           └── health.routes.ts
│   │   ├── prisma/                  # Schema do Prisma e migrações
│   │   │   └── schema.prisma
│   │   └── vitest.config.ts
│   └── web/                         # Frontend React (Estrutura básica de scaffold)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
```

### Modelo de Dados no Prisma (prisma/schema.prisma)
O schema Prisma deve implementar as entidades e enums descritos em `docs/guidelines/architecture.md`.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

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

---

## 3. Lista de Implementação

- [ ] Criar arquivo `package.json` raiz e `pnpm-workspace.yaml`.
- [ ] Criar diretório `apps/api` e configurar `package.json` com dependências básicas: `fastify`, `@fastify/swagger`, `@fastify/swagger-ui`, `zod`, `fastify-type-provider-zod`, `@prisma/client`, `ioredis`, `decimal.js`. Configure `devDependencies` incluindo `typescript`, `vitest`, `supertest`, `eslint`, `prisma`.
- [ ] Inicializar o schema Prisma em `apps/api/prisma/schema.prisma` com o modelo definido.
- [ ] Criar o singleton do Prisma em `apps/api/src/lib/prisma.ts`.
- [ ] Criar o singleton do Redis em `apps/api/src/lib/redis.ts`.
- [ ] Criar setup do Fastify com suporte a rotas, type-provider-zod e Swagger em `apps/api/src/app.ts`.
- [ ] Implementar rota simples de health check (`/health`) em `apps/api/src/modules/health/health.routes.ts`.
- [ ] Criar arquivo de testes de integração em `apps/api/src/modules/health/__tests__/health.test.ts` usando Supertest e Vitest.
- [ ] Criar scaffold básico em `apps/web` (React + Vite + TailwindCSS) configurando arquivos mínimos.
- [ ] Executar migrações do Prisma locais contra uma instância local (se disponível) ou configurar ambiente de teste em memória / sqlite para execução dos testes unitários se necessário (no entanto, usaremos postgres local do usuário ou docker para desenvolvimento/migrações).
- [ ] Garantir que `pnpm test`, `pnpm lint`, e `pnpm typecheck` estejam rodando perfeitamente.

---

## 4. Testes e Validação

| Invariante | Localização do Teste | Método de Verificação |
|------------|-----------------------|-----------------------|
| Health check retorna status ok | `apps/api/src/modules/health/__tests__/health.test.ts` | Supertest GET `/health` verifica status code 200 e resposta `{ status: "ok" }` |
| Rota inválida retorna 404 estruturado | `apps/api/src/modules/health/__tests__/health.test.ts` | Supertest GET `/invalid-route` verifica status code 404 |
