# Product Spec: Documentação de Código Frontend com JSDoc/TSDoc

**Issue:** GH92 — [DOCS] Add Comprehensive JSDoc/TSDoc Comments to Frontend Web Components & Services
**Figma/Design:** N/A

---

## Resumo
Esta especificação estabelece as diretrizes para documentar os componentes principais, hooks, serviços e contextos do frontend React (`apps/web`). Comentários JSDoc estruturados serão adicionados para esclarecer os contratos de propriedades (interfaces de Props), explicar os estados internos dos contextos globais e detalhar os métodos de comunicação HTTP com a API.

---

## Problema
A base de código do frontend cresceu e agora inclui múltiplos drawers de transações, contextos globais de temas e gerenciamento de gavetas de interface, além de serviços de comunicação HTTP. A ausência de explicações de propriedades (`Props`) e de contratos de estado dificulta o entendimento de como compor e utilizar estes componentes, aumentando a complexidade de manutenção e integração.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Documentar os principais componentes visuais (e.g. `Layout.tsx`, `WithdrawDrawer.tsx`, `DepositDrawer.tsx`, `HistoryDrawer.tsx`, `SwapDrawer.tsx`, `ContactWidget.tsx`, `BalanceCard.tsx`) com comentários detalhando seu papel na interface.
- [ ] Explicar o contrato das interfaces de `Props` de cada componente principal.
- [ ] Documentar os contextos globais (`DrawerContext.tsx`, `ThemeContext.tsx`, `AuthContext.tsx`) explicando o gerenciamento de estados internos (ex: comutação de temas claro/escuro e visibilidade das gavetas de transação).
- [ ] Adicionar documentação TSDoc detalhada nos serviços de frontend (`apps/web/src/services/`) descrevendo os parâmetros e retornos esperados de cada chamada HTTP.

**Não-Objetivos:**
- Reescrever componentes ou alterar sua lógica.
- Modificar estilos visuais ou paletas do Rose Pine.

---

## Invariantes
- A inclusão de documentação não deve alterar o comportamento lógico ou visual do frontend (zero alterações de runtime).
- Respeitar a sintaxe JSDoc para que ferramentas de IDE exibam corretamente o autocomplete e tooltips para os desenvolvedores.

---

## Critérios de Sucesso
- [ ] Todos os componentes React indicados, hooks e serviços possuem documentação estruturada.
- [ ] A build do frontend (`pnpm build` ou `tsc --noEmit`) compila sem erros.
- [ ] O linter do frontend passa com sucesso na branch do projeto.
