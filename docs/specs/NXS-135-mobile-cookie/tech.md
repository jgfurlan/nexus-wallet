# Especificação Técnica: Resolução de Bloqueio de Cookie ITP em Mobile (NXS-135)

## 1. Arquitetura
Como o frontend e o backend rodam em domínios diferentes (`*.vercel.app` e `*.up.railway.app`), os cookies com `SameSite=None` são considerados *Third-Party* e sumariamente descartados por navegadores que implementam ITP estrito (como Safari do iOS).

A arquitetura será alterada para:
- Adicionar proxy no Frontend (`vercel.json`), roteando qualquer requisição `/api/(.*)` para `https://api-production-d866.up.railway.app/$1`.
- O navegador enxerga e armazena os cookies sob o mesmo domínio do frontend, tratando-os como *First-Party*.

## 2. Mudanças de Código
1. **`apps/web/vercel.json`**
   - Inserir diretiva de "rewrites" associando `/api/(.*)` ao backend.
2. **`apps/web/src/services/api.ts`**
   - Interceptar o `baseURL` via variável de ambiente: em produção, rotear `baseURL` para `/api`.

## 3. Riscos e Mitigações
- **Risco:** Quebra de assets estáticos no Vercel (SPAs).
  - *Mitigação:* Usaremos apensas o rewrite estrito `/api/(.*)` e confiaremos nos defaults da Vercel para o roteamento do React Router sem adicionar fallback agressivo na mão.
