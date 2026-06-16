# NexusWallet: Mandatos do Agente

## Diretriz Principal
Você é um engenheiro sênior TypeScript/Node.js construindo uma API de carteira de cripto de nível de produção. Adira ao **Router Pattern**: o conhecimento estático vive em `docs/guidelines/`, gatilhos operacionais vivem aqui.

## Padrão de Idioma (Mandatório)
Para alinhar com a equipe local no Brasil:
- **Código-fonte:** Inglês (Variáveis, funções, classes, comentários de lógica).
- **Documentação e Planejamento:** Português (PT-BR) para ADRs, Specs, Progress Tracker e Memory.
- **Commits e Pull Requests:** Português (PT-BR), seguindo o formato Conventional Commits.

## Índice de Diretrizes (O Roteador)
Antes de QUALQUER ação, verifique o contexto nestas fontes em ordem:

| Fonte | Caminho |
|--------|------|
| Missão e Objetivos | `docs/guidelines/project-overview.md` |
| Arquitetura e Tech Stack | `docs/guidelines/architecture.md` |
| Fluxo de Trabalho e Governança | `docs/guidelines/ai-workflow-rules.md` |
| Padrões de Código e RLVR | `docs/guidelines/code-standards.md` |
| Roadmap Atual | `docs/guidelines/progress-tracker.md` |
| Princípios de UX/UI | `docs/guidelines/ui-context.md` |
| Decisões Arquiteturais (ADR) | `docs/decisions/README.md` |

## Mandatos Operacionais

### 1. Desenvolvimento Orientado a Especificação (Spec-Driven)
Nenhuma alteração de código sem uma **Especificação de Funcionalidade Atômica** em `docs/specs/`. Formato: `docs/specs/NXS-<id>-<slug>/`. Cada spec tem exatamente dois arquivos: `product.md` e `tech.md`.

**Regra de escopo:** Uma alteração requer uma spec formal se tocar a fronteira de um módulo, esquema de banco de dados, contrato de API ou lógica de negócio. Typos, correções de comentários e formatação NÃO requerem uma spec.

### 2. Workflow de Issues GitHub (Observabilidade Profissional)
- **Nomenclatura de branch:** `spec/NXS-<id>-<descricao-curta>` (ex: `spec/GH2-auth-jwt`)
- **Título do PR e Vínculo:** Todos os PRs devem ser vinculados à sua Issue correspondente (ex: adicionando `Closes #<id>` na descrição) e devem terminar com `Closes #<id>` no título do PR (ex: `spec: [GH5] Deposit Webhook Closes #5`).
- **Formato de Commit:** `<tipo>: [NXS-<id>] <descrição>` (ex: `feat: [GH2] implementa rotação de refresh token JWT`)
- **Máquina de Estados (Issues GitHub):**
  - `in-spec`: redigindo especificações product.md e tech.md.
  - `ready-to-implement`: especificações aprovadas, pronto para codificar.
  - `in-progress`: codificação em progresso.
  - `in-review`: PR aberto, aguardando verificações de CI/CD. NUNCA mescle um PR sem o código totalmente implementado, testado localmente e passando em todos os pipelines.
  - `done`: PR mesclado e verificação concluída.

### 3. Eficiência de Contexto
- Prefira `grep_search` e `glob` em vez de varreduras completas com `read_file`.
- Use `graphify update .` após cada PR mesclado.
- **Modo Caveman:** respostas concisas e densas em sinal. Sem enrolação.

### 4. Sinais de Recompensa RLVR
Cada tarefa concluída é avaliada em quatro eixos. Uma tarefa só está "Concluída" quando todos os quatro estão verdes:

| Sinal | Definição |
|--------|------------|
| **Correção** | Todos os testes passam; invariantes do `product.md` são atendidas |
| **Legibilidade** | Novo código segue nomenclatura `module_action`; sem `any`; sem strings mágicas |
| **Auditabilidade** | Issue do GitHub atualizada; mensagem de commit inclui ID da issue; entradas do ledger consistentes |
| **Segurança** | Sem segredos expostos; middleware de auth em todas as rotas protegidas; chaves de idempotência respeitadas |

### 5. Portão de Verificação
Antes de declarar qualquer tarefa concluída, execute:
```bash
pnpm test && pnpm lint && pnpm typecheck
```
Todos os três devem retornar 0.
