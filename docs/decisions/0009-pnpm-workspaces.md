# ADR 0009: pnpm Workspaces para Estrutura Monorepo

## Status
Aprovada

## Contexto
O projeto contém uma API (`/apps/api`) e uma aplicação web (`/apps/web`). Mantê-los em repositórios separados dificulta a orquestração do desenvolvimento local, compartilhamento de tipos e sincronização de mudanças. Alternativas incluem npm/yarn workspaces, Lerna ou Turborepo.

## Decisão
Optei por utilizar **pnpm workspaces** para estruturar o monorepo. Escolhi o `pnpm` por ser extremamente rápido e eficiente no uso de espaço em disco através de hard links. Decidi não utilizar Turborepo por considerar que o pipeline de build para apenas dois projetos é simples o suficiente para não justificar a complexidade e tempo de configuração de um orquestrador de cache de build.

## Consequências
- **Positivas:** Gerenciamento centralizado de dependências, capacidade de compartilhar tipos TypeScript facilmente entre API e Web, inicialização simplificada do ambiente de desenvolvimento.
- **Negativas:** Exige que a máquina do desenvolvedor e os ambientes de CI/CD tenham o `pnpm` instalado.
