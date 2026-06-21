# Progress Tracker: Âncora de Estado NexusWallet

## Fase Atual do Projeto
**Fase 1: Fundação**

## Implementação Ativa
- **Tarefa Atual:** GH102 — Exibir Saldo Disponível no SwapDrawer
- **Status:** Em Progresso
- **Branch:** `spec/GH102-swap-available-balance`

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
| GH102 | Exibir Saldo Disponível no SwapDrawer | 🔍 Em Revisão | `spec/GH102-swap-available-balance` |
| GH103 | Forçar Atualização do Progress Tracker no Workflow de PR | ✅ Concluído | `spec/GH103-enforce-progress-tracker` |

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
