# NXS-108: Tech Spec

## Contexto
Atualmente, o `DashboardPage.tsx` possui um estado local `fiatValues` que mapeia cada token para o seu valor em reais (BRL). Esse estado é populado usando `SwapService.getRates()`. A exibição é controlada pelo `BalanceCard.tsx` que recebe a propriedade `fiatValue`.

## Alterações Cirúrgicas Propostas
1. **Em `BalanceCard.tsx`**:
   - Remover `fiatValue?: string;` da interface de propriedades do componente.
   - Remover a renderização do bloco `div` que contém `<span className="text-subtle">≈</span>` e o `fiatValue`.
2. **Em `DashboardPage.tsx`**:
   - Remover as declarações de estado `const [fiatValues, setFiatValues] = useState...`.
   - Remover a chamada a `SwapService.getRates()` e o preenchimento de `fiatMap` dentro da função `loadData()`.
   - Remover a propriedade `fiatValue` passada às instâncias do `<BalanceCard>`.
   - Remover dependências não utilizadas como `SwapService` e `Decimal` dos imports.

## Rastreabilidade das Modificações
- O objetivo é simplificação máxima do componente. Qualquer dead-code que nossa exclusão provocar deve ser removido.
- Se algum import como o `SwapService` ficar sem uso no `DashboardPage.tsx`, ele deve ser removido do arquivo.

## Passos para Validação (Testes)
1. Rodar `pnpm lint`, `pnpm typecheck` e `pnpm test` no módulo `apps/web`. A remoção não deve quebrar a build.
2. Acessar manualmente a página do Dashboard e verificar se o crash não ocorre, e se os saldos dos tokens estão aparecendo de forma singular, sem as conversões de BRL estimadas.
