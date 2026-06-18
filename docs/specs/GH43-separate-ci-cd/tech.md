# Technical Spec: Separation of CI and CD

**See `product.md` for user-facing behavior and invariants.**
**Issue:** NXS-43

---

## 1. Context
Nossos deploys (Railway e Vercel) estão em Auto-Deploy configurado para observar a branch `main`. Quando um PR é "merged", as builds iniciam imediatamente sem validações da sanidade do código. Já lidamos com erros em produção por falhas de tipo de TypeScript porque a CI estava acoplada ao Build do deploy.

---

## 2. Proposed Changes

### Architecture / Data Flow
1. GitHub Actions hospedará o pipeline de CI rodando a cada `push` e `pull_request` nas branches principais.
2. Railway e Vercel terão o recurso de "Autodeploy" desativado nas configurações do dashboard.
3. O CD será controlado dentro do GitHub Actions após o sucesso da CI, acionando webhooks de implantação da Vercel e Railway via CLI (`vercel deploy --prod` e `railway up` ou usando Action oficial) OR exigiremos acionamento manual até estarmos maduros.

### Modules Touched
| File | Change Type | Description |
|------|-------------|-------------|
| `.github/workflows/ci.yml` | New | Pipeline de CI principal |
| `.github/workflows/cd.yml` | New | Pipeline de CD (deploy) |
| `docs/guidelines/architecture.md` | Modified | Documentar nova infraestrutura de CI/CD |

### Tradeoffs
| Option | Chose | Reason |
|--------|-------|--------|
| GitHub Actions | ✅ | Nativo do GitHub, grande ecossistema de integrações. |
| Vercel/Railway CI | ❌ | Mantém acoplamento; queremos agnóstico. |
| Husky pre-push | ❌ | Contorna apenas localmente, não protege contra force pushes. |

---

## 3. Implementation Checklist
- [ ] Escrever workflow `ci.yml` que instala `pnpm`, depende de Node.js e roda os checks.
- [ ] Rodar um teste de validação forçando o erro de build.
- [ ] Configurar Branch Protection Rules no GitHub (exigir status checks para merge).
- [ ] Desativar o autodeploy nas plataformas externas.
- [ ] Escrever o webhook ou action de deploy contínuo em `cd.yml`.
- [ ] Atualizar documentação `progress-tracker.md`.
- [ ] Commit: `feat: [NXS-43] implementa separacao entre CI e CD via github actions`
