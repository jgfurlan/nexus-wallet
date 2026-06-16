# Progress Tracker: Âncora de Estado NexusWallet

## Fase Atual do Projeto
**Fase 1: Fundação**

## Implementação Ativa
- **Tarefa Atual:** GH12 — README + Documentação de decisões técnicas
- **Status:** ⏳ In Review
- **Branch:** `spec/GH12-readme-docs`

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
| GH11 | Deploy: Railway (API) + Vercel (web) | ✅ Concluído | — |
| GH12 | README + Documentação de decisões técnicas | ⏳ In Review | `spec/GH12-readme-docs` |

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
