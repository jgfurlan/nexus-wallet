# GH29: Especificação Técnica - Restore Frontend

## 1. Arquitetura
- **Framework:** React com Vite
- **Roteamento:** React Router DOM (v7+)
- **Estilização:** Tailwind CSS (Vanilla utilities)
- **Gerenciamento de Formulários:** React Hook Form + Zod resolvers
- **Integração de Rede:** Axios com interceptors de requisição (para injetar JWT).

## 2. Restauração do Git
A restauração do código fará um resgate (cherry-pick/merge) das implementações órfãs na branch `origin/spec/NXS-10-frontend`:
- Commit original de interface: `075c0fe` (Dashboard com Rose Pine Dark)
- Hotfix TypeScript: `3be2175`

## 3. Prevenção de Erros da CI/CD (Causa Raiz)
A reversão no passado se deu por conta de **erros de tipagem do TypeScript** (`tsc --noEmit`). A Vercel (assim como o Github Actions) possui uma política rigorosa que impede o build se `tsc` encontrar falhas de importação ou conflitos de tipagem.
- **Ação Mitigatória:** Antes do push final para a revisão de PR, o desenvolvedor (IA) garantirá a execução local limpa de `pnpm typecheck` no frontend. Quaisquer dependências quebradas do `@hookform/resolvers` ou conflitos em componentes UI (ex: `BalanceCard.tsx`) serão patcheados manualmente.

## 4. Integração Back-End
- `VITE_API_URL` será a URL base.
- Chamadas utilizarão Axios exportado de `src/services/api.ts` com Header `Authorization: Bearer <token>`.
- Todos os contratos de Request/Response utilizarão os tipos inferidos pelo sistema ou validados por Zod no Client-Side.
