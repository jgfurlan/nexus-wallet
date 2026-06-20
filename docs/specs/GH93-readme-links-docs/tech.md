# Technical Spec: Link de Arquitetura no README e Diretrizes de Documentação

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH93

---

## 1. Contexto
- O arquivo [`README.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/README.md) na raiz do projeto será atualizado.
- O novo guia de diretrizes será criado em `docs/guidelines/documentation.md`.

---

## 2. Mudanças Propostas

### Mudanças nos Módulos

| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`README.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/README.md) | Modificado | Adicionar uma seção curta com link para o Blueprint de Evolução Arquitetural. |
| [`docs/guidelines/documentation.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/docs/guidelines/documentation.md) | [NEW] | Guia estruturado de boas práticas para comentários e documentação inline com TSDoc/JSDoc. |

### Detalhes de Conteúdo do Guia (documentation.md)
O guia em `docs/guidelines/documentation.md` deve conter as seguintes seções estruturadas:
1.  **Objetivo do Guia:** Foco na legibilidade e indexação por IA.
2.  **Padrão de Escrita:**
    - Comentários de código devem ser em **Inglês** (alinhados com o código-fonte).
    - Documentação de alto nível e especificações (Specs, ADRs) em **Português (PT-BR)**.
3.  **Tags Permitidas e Obrigatórias:**
    - `@param <nome> <descrição>` - parâmetros de entrada.
    - `@returns <descrição>` - tipo/finalidade do retorno.
    - `@throws {TipoDeErro} <descrição>` - tratamento e propagação de erros de negócio.
4.  **Exemplos Práticos:**
    - Exemplo de documentação para componentes React (destacando a interface de `Props`).
    - Exemplo de documentação para helpers puros e hooks customizados.
    - Exemplo de documentação para métodos assíncronos e operações com transações de banco.

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Criar o arquivo [`documentation.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/docs/guidelines/documentation.md) com o conteúdo estruturado e exemplos.
- [ ] Modificar o [`README.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/README.md) para referenciar o `docs/architecture/evolution-blueprint.md` de forma destacada.
- [ ] Atualizar o arquivo [`CLAUDE.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/CLAUDE.md) se for necessário registrar a existência do novo guia de documentação no índice de diretrizes.
- [ ] Validar que os links markdown funcionam e apontam para os caminhos corretos.

---

## 4. Testes e Validação
- **Verificação de Links:** Clicar nos links inseridos nos arquivos markdown localmente para validar que o caminho relativo está correto e sem caminhos absolutos quebrados.
