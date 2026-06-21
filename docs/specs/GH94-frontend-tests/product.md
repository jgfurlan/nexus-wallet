# Product Spec: Implementação de Testes Unitários no Frontend React

**Issue:** GH94 — [TESTS] Implement Frontend Unit Tests for Contexts, Hooks, and Drawers
**Figma/Design:** N/A

---

## Resumo
Esta especificação descreve os requisitos para configurar e escrever os primeiros testes unitários e de integração automatizados no frontend React (`apps/web`). Os testes focarão na validação de lógica de estado nos contextos de comutação de temas e controle de drawers, além de interações críticas nos drawers de transações (como depósito customizado e autopreenchimento de saques).

---

## Problema
Embora o backend possua uma suíte completa de testes de integração, o frontend atualmente não tem cobertura de testes automatizados. Isso expõe a aplicação a regressões visuais ou de lógica de formulário (como validação incorreta de valores ou falhas ao preencher dados de teste) que só seriam detectadas em smoke tests manuais.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Configurar um ambiente de testes no frontend (`apps/web`) utilizando `vitest`, `@testing-library/react` e `jsdom`.
- [ ] Criar testes unitários para validar o comportamento do `ThemeContext` (alternância entre tema claro/escuro e persistência no localStorage).
- [ ] Criar testes unitários para validar o `DrawerContext` (abrir e fechar gavetas correspondentes).
- [ ] Criar testes de componente para validar a lógica de formulário e interações no `DepositDrawer` (seleção de cotação e envio de dados dinâmicos).
- [ ] Criar testes de componente para o `WithdrawDrawer` (garantindo que o botão de "Autopreencher" injeta as credenciais corretas dependendo do token selecionado).

**Não-Objetivos:**
- Testar fluxos de rede reais (as chamadas HTTP da API serão mockadas nos testes).
- Escrever testes E2E com ferramentas pesadas como Cypress ou Playwright.

---

## Invariantes
- A suíte de testes deve rodar inteiramente localmente com comandos simples (e.g. `pnpm test`).
- Os testes do frontend não devem depender de uma instância ativa da API backend ou de banco de dados (devem usar mocks completos).

---

## Critérios de Sucesso
- [ ] Executar o comando de teste do frontend e confirmar que todos os novos testes de contextos e drawers passam.
- [ ] Integrar os testes do frontend no pipeline de CI para rodar em cada PR e push.
- [ ] A taxa de cobertura para os arquivos focados (`ThemeContext`, `DrawerContext`, `DepositDrawer`, `WithdrawDrawer`) é verificada.
