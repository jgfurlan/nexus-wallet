# Product Spec: Separation of CI and CD

**Issue:** NXS-43
**Figma/Design:** N/A

---

## Summary
Atualmente, qualquer commit na branch `main` dispara um deploy automático nas nossas plataformas de infraestrutura (Railway/Vercel). Isso tem causado interrupções caso o código contenha falhas de lint, typecheck ou testes (o famoso motivo do `/btw`). 
Para operar como uma equipe "Senior Worldclass", precisamos separar o processo de Integração Contínua (CI) do processo de Entrega Contínua (CD). A ideia é garantir que o deploy só ocorra APÓS a validação técnica da qualidade do código, evitando releases quebrados em produção.

---

## Problem
Como os gatilhos de deploy estão atrelados diretamente ao evento de `push` no repositório, o Railway/Vercel iniciam a construção do projeto em paralelo. Se o build quebrar (por exemplo, erro de TypeScript) no meio do caminho, temos um deploy falho no histórico e, dependendo do momento, indisponibilidade do sistema. Isso gera estresse operacional e poluição nos logs.

---

## Goals & Non-Goals

**Goals:**
- [x] Criar pipeline de CI (ex: GitHub Actions) rodando `pnpm test`, `pnpm typecheck` e `pnpm lint`.
- [x] Desativar o *auto-deploy* no Railway (API) e Vercel (Frontend).
- [x] Configurar o processo de CD para ser disparado APENAS quando a pipeline de CI passar (via Webhooks, GitHub Actions integrations, ou release manual).
- [x] Bloquear o merge de PRs na branch `main` caso a pipeline de CI falhe (Branch Protection Rules).

**Non-Goals:**
- Criar ambientes de *Staging* complexos (apenas garantir que a `main` fique segura).
- Alterar as ferramentas de infraestrutura hospedada atuais (continuaremos usando Railway e Vercel).

---

## User Experience & Invariants

A "UX" neste caso afeta diretamente nós, desenvolvedores:

### Happy Path
1. Desenvolvedor abre um PR.
2. A Action do GitHub roda a CI (Test, Lint, Typecheck).
3. A CI passa e fica verde ✅.
4. Desenvolvedor aprova e faz o merge.
5. O CD reage ao merge validado e aciona o deploy no Railway e Vercel sem falhas.

### Constraints
- Nunca implantar código onde `pnpm test`, `pnpm typecheck` ou `pnpm lint` retorne exit code `1` ou `2`.
- Não vazar chaves (secrets) nos logs do GitHub Actions.
