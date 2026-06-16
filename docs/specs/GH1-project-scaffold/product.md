# Product Spec: Estrutura Inicial do Projeto (Scaffold)

**Issue:** GH1 — Project Scaffold
**Figma/Design:** N/A

---

## Resumo
Este especificação define a fundação do monorepo do **NexusWallet**. Ela estabelece a estrutura de workspaces usando `pnpm`, configura os compiladores TypeScript tanto para a API quanto para o Web, cria o banco de dados inicial usando PostgreSQL e Prisma com os modelos de dados corretos (User, Wallet, WalletBalance, LedgerEntry, Transaction), e inicia o servidor Fastify base com rotas de health-check e tratamento básico de erros.

---

## Problema
Atualmente, o projeto não possui código-fonte, dependências instaladas ou estrutura de arquivos inicial. É impossível começar o desenvolvimento de funcionalidades sem antes estabelecer as regras de empacotamento, scripts de build, banco de dados e servidor básico.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Configurar o monorepo usando `pnpm workspaces` dividindo em `/apps/api` e `/apps/web`.
- [ ] Configurar TypeScript para backend e frontend.
- [ ] Definir o schema do Prisma com todos os modelos exigidos (User, Wallet, WalletBalance, LedgerEntry, Transaction) e executar a migração inicial.
- [ ] Inicializar o servidor Fastify na API com suporte a Swagger e Zod.
- [ ] Criar testes iniciais provando que a API de health-check funciona.

**Não-Objetivos:**
- Implementar fluxo de autenticação JWT funcional (será feito no GH2).
- Desenvolver a interface do usuário em React (será feito no GH10).
- Configurar deploy na nuvem ou pipelines de CI/CD complexos (será feito no GH11).

---

## Experiência do Usuário & Invariantes

### Fluxo Principal
1. O desenvolvedor clona o repositório e executa `pnpm install`.
2. Executa as migrações do banco de dados via `pnpm db:migrate`.
3. Executa `pnpm dev` na raiz para iniciar a API no porto `3000`.
4. Uma chamada `GET http://localhost:3000/health` retorna `{ status: "ok" }`.
5. Uma chamada `GET http://localhost:3000/docs` exibe a interface do Swagger UI.

### Casos de Erro e Edge Cases
| Cenário | Comportamento Esperado |
|---------|------------------------|
| Banco de dados desconectado | Health check falha ou endpoint retorna erro com status HTTP 500 |
| Rota inexistente | Retorna HTTP 404 com JSON estruturado `{ error: "NOT_FOUND", message: "Route not found" }` |
| Erro interno não tratado | Retorna HTTP 500 com JSON estruturado contendo ID da requisição nos logs |

---

## Critérios de Aceitação
- [ ] Comando `pnpm install` executa sem erros na raiz.
- [ ] O banco de dados PostgreSQL é inicializado com as tabelas User, Wallet, WalletBalance, LedgerEntry, Transaction.
- [ ] O endpoint de health-check responde HTTP 200 `{ status: "ok" }`.
- [ ] As ferramentas de verificação integradas executam com sucesso: `pnpm test`, `pnpm lint`, `pnpm typecheck` retornam código de saída 0.
