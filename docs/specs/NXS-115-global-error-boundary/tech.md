# NXS-115: Tech Spec

## Contexto
O ecossistema React exige o uso de Componentes de Classe para implementar os ciclos de vida de captura de erro (`componentDidCatch` e `getDerivedStateFromError`). 

## Alterações Cirúrgicas Propostas
1. Criar o arquivo `apps/web/src/components/ErrorBoundary.tsx`.
2. Implementar a classe estendendo `React.Component` com estado `hasError` e captura de exceção, exibindo UI de fallback estilizada.
3. No arquivo `apps/web/src/App.tsx`, importar o `ErrorBoundary` e englobar todo o Provider raiz da aplicação.

## Rastreabilidade das Modificações
O `ErrorBoundary` é agnóstico à aplicação e engloba o topo da árvore React, protegendo tudo que for renderizado, inclusive Providers (Auth, Theme).

## Passos para Validação
1. Rodar `pnpm test` e Linter.
2. Forçar um erro de renderização manualmente num componente e verificar se a tela do Error Boundary substitui a tela branca.
