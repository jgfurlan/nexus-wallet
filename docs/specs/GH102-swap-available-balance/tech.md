# Spec Técnica: GH102 - Exibir Saldo Disponível no SwapDrawer

## 1. Modificações em SwapDrawer.tsx
O componente `apps/web/src/components/drawers/SwapDrawer.tsx` atualmente não conhece os saldos do usuário, apenas a lógica de cotação via `SwapService`.

### Obtenção dos Saldos
- Adicionar no state local do drawer a variável `balances` inicializada vazia (tipo `Balance[]`).
- Criar um `useEffect` engatilhado na propriedade `isOpen` que chame `WalletService.getBalances()` (caso o drawer seja aberto) para abastecer a lista de saldos de todas as moedas.
- *(Nota)*: O carregamento silencioso garante que os saldos exibidos são perfeitamente atualizados antes da intenção do usuário ser confirmada.

### Renderização UI e Formatação
- Derivar do hook de forms o valor `fromToken` (já existe `const fromToken = watch('fromToken')`).
- Buscar no array de `balances` o item correspondente ao `fromToken`.
- Acima ou integrado à secção da `Label` "Você envia", renderizar o saldo disponível:
  ```tsx
  const currentBalance = balances.find(b => b.token === fromToken)?.amount || '0';
  const displayBalance = fromToken === 'BRL' ? formatCurrency(Number(currentBalance)) : formatToken(currentBalance);
  ```
- Estrutura proposta para inserção limpa:
  ```tsx
  <div className="flex justify-between items-center">
    <Label htmlFor="amount">Você envia</Label>
    <span className="text-xs text-subtle font-medium">
      Saldo: {displayBalance} {fromToken !== 'BRL' && fromToken}
    </span>
  </div>
  ```

## 2. Padrões Existentes (Conformidade)
- Não alterar a lógica matemática existente, apenas utilizar o `formatCurrency` ou `formatToken` do diretório `lib/formatters.ts`.
- Tipagem `Balance` deve ser extraída de `../../types`.

## 3. Sinais de Conclusão (RLVR)
- Componente devidamente renderizando saldos estritamente filtrados pela select box do `fromToken`.
- O cache de `isOpen` funciona para refetchar toda vez que a drawer for instanciada.
