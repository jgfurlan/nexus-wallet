# Progress Tracker: Âncora de Estado NexusWallet

## Fase Atual do Projeto
**Fase 1: Fundação**

## Implementação Ativa
- **Tarefa Atual:** NXS-8 — Histórico de transações (paginado)
- **Status:** 🚀 Implementando
- **Branch:** `spec/NXS-8-history`

---

## Fila de Funcionalidades (Issues GitHub)

| ID | Funcionalidade | Status | Branch |
|----|----------------|--------|--------|
| NXS-1 | Scaffold do projeto (monorepo + Fastify + Prisma + DB schema) | ✅ Concluído | `NXS-1-project-scaffold` |
| NXS-2 | Módulo de Auth (registro, login, JWT, refresh token) | ✅ Concluído | `spec/NXS-2-auth-jwt` |
| NXS-3 | Módulo de Wallet (auto-criação no registro, busca de saldos) | ✅ Concluído | `spec/NXS-3-wallet-balances` |
| NXS-4 | Módulo de Ledger (entradas append-only, endpoint de auditoria) | ✅ Concluído | `spec/NXS-4-ledger-audit` |
| NXS-5 | Webhook de Depósito (idempotência, crédito, tratamento de erro) | ✅ Concluído | `spec/NXS-5-deposit-webhook` |
| NXS-6 | Módulo de Swap (endpoint de cotação + execução) | ⏳ Em Revisão (PR) | `spec/NXS-6-swap-module` |
| NXS-7 | Módulo de Saque (Withdrawal) | ⏳ Em Revisão (PR) | `spec/NXS-7-withdrawal` |
| NXS-8 | Endpoint de histórico de transações (paginado) | 🚀 Implementando | `spec/NXS-8-history` |
| NXS-9 | Cache Redis para cotações CoinGecko (30s TTL) | ✅ Concluído | — |
| NXS-10 | Frontend React (dashboard, formulário swap, histórico) | 🔲 Todo | — |
| NXS-11 | Deploy: Railway (API) + Vercel (web) | 🔲 Todo | — |
| NXS-12 | README + Documentação de decisões técnicas | 🔲 Todo | — |

---

## Funcionalidades Concluídas
- **NXS-1**: Scaffold do projeto (monorepo + Fastify + Prisma + DB schema) - 2026-06-12
- **NXS-2**: Módulo de Auth (registro, login, JWT, refresh token) - 2026-06-13
- **NXS-3**: Módulo de Wallet (auto-criação no registro, busca de saldos) - 2026-06-13
- **NXS-4**: Módulo de Ledger (entradas append-only, endpoint de auditoria) - 2026-06-13
- **NXS-5**: Webhook de Depósito (idempotência, crédito, tratamento de erro) - 2026-06-13
- **NXS-6**: Módulo de Swap (endpoint de cotação + execução) - 2026-06-14
- **NXS-7**: Módulo de Saque (Withdrawal) - 2026-06-14
- **NXS-9**: Cache Redis para cotações CoinGecko (30s TTL) - 2026-06-14

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
Agentes retomando o trabalho devem:
1. Ler este arquivo para identificar a tarefa ativa.
2. Executar `graphify query "active implementation"` para contexto total.
3. Ler `docs/specs/NXS-<active-id>/` antes de tocar em qualquer arquivo.
