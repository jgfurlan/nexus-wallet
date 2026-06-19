# Technical Spec: Separation of CI and CD

**See `product.md` for user-facing behavior and invariants.**
**Issue:** NXS-43

---

## 1. Context
Nossos deploys (Railway e Vercel) estão em Auto-Deploy configurado para observar a branch `main`. Quando um PR é "merged", as builds iniciam imediatamente sem validações da sanidade do código. Já lidamos com erros em produção por falhas de tipo de TypeScript porque a CI estava acoplada ao Build do deploy.

---

## 2. Proposed Changes

### Architecture / Data Flow
1. **CI Pipeline (`ci.yml`)**:
   - **Gatilhos**: `push` em qualquer branch (exceto `main` se quisermos evitar duplicidade, ou em todas para garantir histórico limpo) e `pull_request` para `main`.
   - **Permissões**: Restritas ao mínimo necessário (`permissions: contents: read`).
   - **Fases**:
     - Setup & Cache (Node.js + `pnpm` cache com chave baseada no lockfile).
     - Instalação limpa (`pnpm install --frozen-lockfile`).
     - **DevSecOps Audit**: Execução de `pnpm audit --audit-level=high` para detecção de vulnerabilidades conhecidas em dependências.
     - Validações: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
2. **CD Pipeline (`cd.yml`)**:
   - **Gatilhos**: `push` na branch `main` (ou seja, quando um PR é mergeado com sucesso após passar na CI).
   - **Fases**:
     - Deploy para Railway (API) usando `railway-deploy` action ou Railway CLI com token de deploy seguro.
     - Deploy para Vercel (Frontend) usando Vercel CLI (`vercel deploy --prod`) com token de deploy seguro.
     - **Health Check Gate (Post-Deploy)**: Um script que executa chamadas HTTP contra as URLs de produção (Railway `/health` e Vercel `/`) garantindo retorno `200 OK` antes de marcar a pipeline como sucesso.
3. **Plataformas de Infraestrutura**:
   - Desativação do Auto-Deploy nativo conectado ao GitHub no Railway e no Vercel.

### Modules Touched
| File | Change Type | Description |
|------|-------------|-------------|
| `.github/workflows/ci.yml` | New | Pipeline de CI principal com validações e auditorias de segurança |
| `.github/workflows/cd.yml` | New | Pipeline de CD para deploy em Railway e Vercel após validações |
| `docs/guidelines/architecture.md` | Modified | Documentar nova infraestrutura de CI/CD |

### Tradeoffs
| Option | Chose | Reason |
|--------|-------|--------|
| GitHub Actions | ✅ | Nativo do GitHub, controle granular de permissões e secrets seguros. |
| Vercel/Railway CI | ❌ | Mantém acoplamento; queremos agnóstico e seguro contra falhas. |

---

## 3. Implementation Checklist
- [ ] Criar diretório `.github/workflows` se não existir.
- [ ] Escrever workflow `ci.yml` com caching de `pnpm`, auditoria de segurança e validações de build/teste.
- [ ] Escrever workflow `cd.yml` com deployment seguro em Railway/Vercel e validação de health check pós-implantação.
- [ ] Adicionar documentação na arquitetura sobre o fluxo de CI/CD.
- [ ] Atualizar documentação `progress-tracker.md`.
- [ ] Commit das especificações: `spec: [NXS-43] create specifications for CI/CD separation`
- [ ] Commit da implementação: `feat: [NXS-43] implement separation of CI and CD via GitHub Actions`

