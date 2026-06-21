# Especificação Técnica: UX Fixes

## Mudanças
- `DepositDrawer.tsx`: Modificado `defaultValues.amount` para `''`.
- `WithdrawDrawer.tsx`: Removidas as chamadas a `setValue('amount', ...)` no método `handleAutofill`.
- `DashboardPage.tsx`: Removido o `<Button>` do componente Header de Atividades Recentes.

## Riscos
- Mínimos. Nenhuma alteração arquitetural ou de lógica de negócios profunda. Apenas modificações no DOM e initial values dos formulários.
