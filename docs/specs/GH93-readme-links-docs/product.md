# Product Spec: Link de Arquitetura no README e Diretrizes de Documentação

**Issue:** GH93 — [DOCS] Link Architectural Blueprint in README and Standardize Documentation Guidelines
**Figma/Design:** N/A

---

## Resumo
Esta especificação descreve duas ações de padronização documental para o repositório:
1.  **Destaque de Arquitetura:** Adicionar uma seção proeminente no `README.md` principal que aponte diretamente para o blueprint de resiliência e evolução arquitetural (`docs/architecture/evolution-blueprint.md`).
2.  **Guia de Documentação:** Criar o arquivo `docs/guidelines/documentation.md` que estabelece as regras e padrões de JSDoc/TSDoc para que desenvolvedores futuros possam manter o mesmo padrão de comentários inline introduzido pelas frentes de documentação.

---

## Problema
- O blueprint de evolução arquitetural (`docs/architecture/evolution-blueprint.md`) contém cotações teóricas e pilares importantes da carteira (ledger, Serializable, outbox, cache, rate limits), porém novos desenvolvedores que acessam o repositório não têm conhecimento fácil da sua existência devido à falta de referências no `README.md`.
- Não há um local centralizado no repositório descrevendo como e quando usar comentários JSDoc/TSDoc, o que pode fazer com que novos arquivos ou funções adicionados futuramente fiquem sem documentação adequada ou com padrões inconsistentes.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Adicionar um link e resumo de destaque para o `docs/architecture/evolution-blueprint.md` no `README.md` principal do projeto.
- [ ] Criar o guia de diretrizes de documentação no arquivo `docs/guidelines/documentation.md`.
- [ ] Definir no guia quais arquivos precisam ser documentados, quais tags usar (como `@param`, `@returns`, `@throws`) e dar exemplos práticos para componentes React, funções de helper, e rotas Fastify.

**Não-Objetivos:**
- Modificar códigos-fonte ou lógicas de negócio.
- Criar documentações externas adicionais.

---

## Invariantes
- Os caminhos de links para arquivos locais devem ser clicáveis no GitHub e em leitores de markdown.

---

## Critérios de Sucesso
- [ ] O `README.md` contém o link funcional para o Blueprint de Arquitetura.
- [ ] O arquivo `docs/guidelines/documentation.md` foi criado e contém as regras estruturadas de TSDoc/JSDoc definidas.
- [ ] A build e testes locais passam sem nenhuma regressão.
