# Product Spec: Documentação de Código Backend com JSDoc/TSDoc

**Issue:** GH91 — [DOCS] Add Comprehensive JSDoc/TSDoc Comments to Backend API Modules
**Figma/Design:** N/A

---

## Resumo
Esta especificação descreve os requisitos para adicionar comentários JSDoc/TSDoc estruturados a todas as classes, métodos públicos, middlewares, schemas de validação e rotas do backend (`apps/api`). O objetivo é formalizar o comportamento de cada parte do sistema, aumentar a legibilidade do código-fonte para engenheiros humanos e facilitar a indexação semântica e contextualização para agentes baseados em IA.

---

## Problema
Atualmente, o backend (`apps/api`) possui pouca ou nenhuma documentação inline sobre as assinaturas de funções, tipos de retorno, tratamentos de erro e regras críticas de concorrência ou idempotência. Isso gera fricção para novos desenvolvedores, aumenta a chance de erros durante refatorações e limita a eficiência de assistentes de codificação de IA que necessitam de contexto de alto nível para trabalhar no código.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Adicionar blocos de comentário padrão TSDoc/JSDoc explicativos em todos os services do backend (`auth.service.ts`, `wallet.service.ts`, `history.service.ts`, `swap.service.ts`, `withdrawal.service.ts`, `deposit.service.ts`, `feedback.service.ts`, `faucet.service.ts`).
- [ ] Documentar o comportamento das funções descrevendo seus objetivos, todos os `@param`, `@returns` e exceções esperadas (`@throws`).
- [ ] Explicar a lógica de concorrência e integridade transacional (isolamento `Serializable`, retentativas automáticas e verificação de idempotência) diretamente nos arquivos dos serviços financeiros.
- [ ] Documentar a infraestrutura de controllers e middlewares (como o `require-auth.ts`) esclarecendo o ciclo de vida do request e o repasse de dados de sessão.

**Não-Objetivos:**
- Modificar o funcionamento lógico das rotas ou dos serviços.
- Alterar as assinaturas de tipos ou os retornos de API reais do backend.

---

## Invariantes
- A documentação de código não deve introduzir nenhuma alteração no código executável ou no comportamento lógico (zero alterações de runtime).
- A formatação do JSDoc/TSDoc deve estar alinhada com as melhores práticas (usando delimitadores `/** ... */`).

---

## Critérios de Sucesso
- [ ] Todos os arquivos de serviço listados contêm documentação de classe e de método nos padrões TSDoc.
- [ ] A build do backend (`pnpm build` ou `tsc --noEmit`) compila sem erros, garantindo que nenhum comentário corrompeu a sintaxe TypeScript.
- [ ] O linter do backend passa com sucesso.
