# Progress Tracker: Âncora de Estado NexusWallet

## Fase Atual do Projeto
**Fase 1: Fundação**

## Implementação Ativa
- **Tarefa Atual:** Nenhuma
- **Status:** —
- **Branch:** —

---

## Fila de Funcionalidades (Issues GitHub)

| ID | Funcionalidade | Status | Branch |
|----|----------------|--------|--------|
| GH1 | Scaffold do projeto (monorepo + Fastify + Prisma + DB schema) | ✅ Concluído | `GH1-project-scaffold` |
| GH2 | Módulo de Auth (registro, login, JWT, refresh token) | ✅ Concluído | `spec/GH2-auth-jwt` |
| GH3 | Módulo de Wallet (auto-criação no registro, busca de saldos) | ✅ Concluído | `spec/GH3-wallet-balances` |
| GH4 | Módulo de Ledger (entradas append-only, endpoint de auditoria) | ✅ Concluído | `spec/GH4-ledger-audit` |
| GH5 | Webhook de Depósito (idempotência, crédito, tratamento de erro) | ✅ Concluído | `spec/GH5-deposit-webhook` |
| GH6 | Módulo de Swap (endpoint de cotação + execução) | ✅ Concluído | `spec/GH6-swap-module` |
| GH7 | Módulo de Saque (Withdrawal) | ✅ Concluído | `spec/GH7-withdrawal` |
| GH8 | Endpoint de histórico de transações (paginado) | ✅ Concluído | `spec/GH8-history` |
| GH9 | Cache Redis para cotações CoinGecko (30s TTL) | ✅ Concluído | — |
| GH10 | Frontend React (dashboard, formulário swap, histórico) | ✅ Concluído | `spec/GH10-frontend` |
| GH11 | Deploy: Railway (API) + Vercel (web) | ✅ Concluído | `spec/GH11-deploy` |
| GH12 | README + Documentação de decisões técnicas | ✅ Concluído | — |
| GH29 | Restore Frontend React (Resgate da V1) | ✅ Concluído | `spec/GH29-restore-frontend` |
| GH31 | Resolução de Network Error (CORS via Fastify Fallback) | ✅ Concluído | `fix/cors-fallback` |
| GH32 | Resolver Railway Ghost Cache & Deploy a partir da Main | ✅ Concluído | `spec/GH32-railway-cache` |
| GH41 | UX Revamp: Drawers Navigation, Faucet, e Fale Conosco | ✅ Concluído | `spec/GH41-ux-revamp` |
| GH43 | Separação de CI (GitHub Actions) e CD (Railway/Vercel) | ✅ Concluído | — |
| GH46 | Otimizar CD com Jobs Paralelos e Gate de Validação | ✅ Concluído | `spec/NXS-46-parallel-cd` |
| GH91 | JSDoc/TSDoc no Backend API | ✅ Concluído | `spec/GH91-backend-tsdoc` |
| GH92 | JSDoc/TSDoc no Frontend Web | ✅ Concluído | `spec/GH92-frontend-tsdoc` |
| GH93 | Links de Blueprint no README e Guia de Documentação | ✅ Concluído | `spec/GH93-readme-links-docs` |
| GH94 | Testes Unitários Frontend (Contextos, Hooks, Drawers) | ✅ Concluído | `spec/GH94-frontend-tests` |
| GH95 | Redesenho do README Premium e Roadmap OpenTelemetry | ✅ Concluído | `spec/GH95-readme-revamp` |
| GH102 | Exibir Saldo Disponível no SwapDrawer | ✅ Concluído | `spec/GH102-swap-available-balance` |
| GH103 | Forçar Atualização do Progress Tracker no Workflow de PR | ✅ Concluído | `spec/GH103-enforce-progress-tracker` |
| NXS-107 | Exibição de Saldo no Saque | ✅ Concluído | `spec/NXS-107-withdraw-balance` |
| NXS-108 | Remoção de Valores de Conversão em BRL | ✅ Concluído | `spec/NXS-108-remove-fiat-values` |
| NXS-109 | Correção: Crash de formatadores ao digitar input | ✅ Concluído | `spec/NXS-109-formatters-crash` |
| NXS-111 | Correção: Drawer não possui animação | ✅ Concluído | `spec/NXS-111-drawer-animation` |
| NXS-112 | Correção: `formatToken` renderiza NaN | ✅ Concluído | `spec/NXS-112-format-token-nan` |
| NXS-114 | Token JWT armazenado em localStorage | ✅ Concluído | `spec/NXS-114-jwt-httponly-cookie` |
| NXS-115 | Sem tratamento de erro global (ausência de Error Boundary) | ✅ Concluído | `spec/NXS-115-error-boundary` |
| NXS-116 | Correção de auto-resolução de token no SwapDrawer | ✅ Concluído | `spec/NXS-116-swap-token-conflict` |
| NXS-117 | Correção de erro 500 no Histórico de Transações | ✅ Concluído | `fix/NXS-117-history-authguard` |
| NXS-120 | Implementar Fluxo Ideal de Desenvolvimento 10/10 | ✅ Concluído | `spec/NXS-120-ideal-workflow` |
| NXS-121 | Correção de ordem do plugin Fastify JWT Cookie | ✅ Concluído | `fix/NXS-121-cookie-plugin-order` |

---

## Funcionalidades Concluídas
- **GH1**: Scaffold do projeto (monorepo + Fastify + Prisma + DB schema) - 2026-06-12
- **GH2**: Módulo de Auth (registro, login, JWT, refresh token) - 2026-06-13
- **GH3**: Módulo de Wallet (auto-criação no registro, busca de saldos) - 2026-06-13
- **GH4**: Módulo de Ledger (entradas append-only, endpoint de auditoria) - 2026-06-13
- **GH5**: Webhook de Depósito (idempotência, crédito, tratamento de erro) - 2026-06-13
- **GH6**: Módulo de Swap (endpoint de cotação + execução) - 2026-06-14
- **GH7**: Módulo de Saque (Withdrawal) - 2026-06-14
- **GH8**: Endpoint de histórico de transações (paginado) - 2026-06-14
- **GH9**: Cache Redis para cotações CoinGecko (30s TTL) - 2026-06-14
- **GH10**: Frontend React (dashboard, formulário swap, histórico) - 2026-06-15
- **GH11**: Deploy: Railway (API) + Vercel (web) - 2026-06-16
- **GH12**: README + Documentação de decisões técnicas - 2026-06-18
- **GH41**: UX Revamp: Drawers Navigation, Faucet, e Fale Conosco - 2026-06-17
- **GH43**: Separação de CI (GitHub Actions) e CD (Railway/Vercel) - 2026-06-19
- **GH46**: Otimizar CD com Jobs Paralelos e Gate de Validação - 2026-06-19
- **GH94**: Testes Unitários Frontend (Contextos, Hooks, Drawers) - 2026-06-20
- **GH91**: JSDoc/TSDoc no Backend API - 2026-06-20
- **GH92**: JSDoc/TSDoc no Frontend Web - 2026-06-20
- **GH93**: Links de Blueprint no README e Guia de Documentação - 2026-06-20
- **GH95**: Redesenho do README Premium e Roadmap OpenTelemetry - 2026-06-20
- **GH102**: Exibir Saldo Disponível no SwapDrawer - 2026-06-21
- **GH103**: Forçar Atualização do Progress Tracker no Workflow de PR - 2026-06-21
- **NXS-107**: Exibição de Saldo no Saque - 2026-06-21
- **NXS-108**: Remoção de Valores de Conversão em BRL - 2026-06-21
- **NXS-109**: Correção: Crash de formatadores ao digitar input - 2026-06-21
- **NXS-111**: Correção: Drawer não possui animação - 2026-06-21
- **NXS-112**: Correção: `formatToken` renderiza NaN - 2026-06-21
- **NXS-114**: Token JWT armazenado em localStorage - 2026-06-21
- **NXS-115**: Sem tratamento de erro global (ausência de Error Boundary) - 2026-06-21
- **NXS-116**: Correção de auto-resolução de token no SwapDrawer - 2026-06-21
- **NXS-117**: Correção de erro 500 no Histórico de Transações - 2026-06-21
- **NXS-120**: Implementar Fluxo Ideal de Desenvolvimento 10/10 - 2026-06-21
- **NXS-121**: Correção de ordem do plugin Fastify JWT Cookie - 2026-06-21

---

## Decisões Históricas

| Data | Decisão |
|------|----------|
| 2026-06-12 | Adoção de Desenvolvimento Orientado a Specs com Padrão Router |
| 2026-06-12 | Escolha de Fastify sobre NestJS (leve, schema-first, cold start mais rápido) |
| 2026-06-12 | Escolha de Railway para deploy da API (PG + Redis nativos) |
| 2026-06-12 | Escolha de Vercel para deploy do frontend (Requisito RH) |
| 2026-06-12 | Escolha de `decimal.js` para toda matemática monetária |
| 2026-06-14 | **Padronização de Idioma:** Commits e Docs em PT-BR; Código em EN |

---

## Ponto de Restauração de Sessão
Agentes retomar o trabalho devem:
1. Ler este arquivo para identificar a tarefa ativa.
2. Executar `graphify query "active implementation"` para contexto total.
3. Ler `docs/specs/NXS-<active-id>/` antes de tocar em qualquer arquivo.
 
