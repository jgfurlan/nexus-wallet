# NXS-109 / NXS-112: Tech Spec

## Contexto
O arquivo `apps/web/src/lib/formatters.ts` expõe métodos que encapsulam a instanciação de `new Decimal(value)`. Sem um bloco `try/catch` local ou verificação inicial, valores parciais de digitação ou campos `undefined` provenientes de hooks não inicializados quebram o ciclo de vida do componente React.

## Alterações Cirúrgicas Propostas
Modificar as três funções de `apps/web/src/lib/formatters.ts`:
1. `formatCurrency`: Envolver corpo em `try/catch`. Checar vazios e retornar fallback.
2. `formatToken`: Envolver corpo em `try/catch`. Checar vazios e aplicar fallback de zeros truncares usando regex `formatted.replace(/\.?0+$/, '')`.
3. `formatDate`: Envolver corpo em `try/catch` e testar a validade da conversão de data com `isNaN(d.getTime())`.

## Rastreabilidade das Modificações
O escopo é 100% contido no arquivo `formatters.ts`, blindando qualquer componente que os consuma no nível mais baixo possível da stack do frontend.

## Passos para Validação (Testes)
1. Rodar a bateria de testes e Typecheck `pnpm test`.
2. Validar que na interface um valor de `"1."` ou `""` não gera tela branca no componente de saque.
