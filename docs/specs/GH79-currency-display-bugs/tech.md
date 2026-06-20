# Technical Spec: Correção de Bugs de Exibição de Moeda

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH79

---

## 1. Contexto
Os bugs de exibição estão localizados no frontend da aplicação Nexus Wallet.
- O componente [BalanceCard](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/ui/BalanceCard.tsx) concatena a propriedade `symbol` com `fiatValue`.
- A página [DashboardPage](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/pages/DashboardPage.tsx) envia valores formatados que já possuem o símbolo monetário inserido pela função `formatCurrency`.
- A página [DashboardPage](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/pages/DashboardPage.tsx) possui o valor fiduciário de BRL fixado como `"1.00"`.

---

## 2. Mudanças Propostas

### Mudanças nos Módulos

| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`BalanceCard.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/ui/BalanceCard.tsx) | Modificado | Remover a concatenação redundante do `symbol` quando o `fiatValue` já contiver o símbolo monetário, ou renderizar `fiatValue` diretamente. |
| [`DashboardPage.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/pages/DashboardPage.tsx) | Modificado | Substituir o valor estático `"1.00"` pelo saldo real de BRL formatado usando `formatCurrency` e ajustar a passagem de propriedades. |

### Detalhes técnicos da alteração no BalanceCard.tsx
No componente `BalanceCard`, alteraremos a linha 45 de:
```tsx
<span className="text-subtle font-medium">
  {symbol} {fiatValue}
</span>
```
Para:
```tsx
<span className="text-subtle font-medium">
  {fiatValue}
</span>
```
Dessa forma, o componente apenas renderiza o valor fiduciário formatado fornecido pelo componente pai, que já contém o símbolo monetário correto. A propriedade `symbol` pode ser mantida como opcional na interface de propriedades para compatibilidade.

### Detalhes técnicos da alteração no DashboardPage.tsx
No `DashboardPage.tsx`, atualizaremos as chamadas do `BalanceCard` para remover a prop `symbol` (ou deixá-la em branco) e passar o saldo de BRL de forma dinâmica:
```tsx
<BalanceCard
  token="Real Brasileiro"
  amount={formatCurrency(getBalance('BRL'))}
  fiatValue={formatCurrency(getBalance('BRL'))}
  icon={<Coins className="w-6 h-6" />}
  isLoading={isLoading}
/>
```

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Ajustar o componente [`BalanceCard.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/ui/BalanceCard.tsx) para renderizar apenas `{fiatValue}`.
- [ ] Atualizar o componente [`DashboardPage.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/pages/DashboardPage.tsx) para passar `fiatValue` dinamicamente para o card de BRL e ajustar os outros cards de saldos.
- [ ] Executar o frontend localmente e verificar visualmente a correção dos dois bugs.
- [ ] Rodar `pnpm lint` e `pnpm typecheck` no frontend para garantir conformidade.

---

## 4. Testes e Validação

### Testes Manuais de Fumaça:
1. Iniciar os serviços locais do Nexus Wallet (`pnpm dev`).
2. Fazer login na aplicação.
3. Verificar o card "Real Brasileiro" na Dashboard: o valor estimado abaixo do saldo principal deve ser igual ao saldo principal (por exemplo, se o saldo principal for `R$ 1.000,00`, o estimado deve exibir `≈ R$ 1.000,00`, não `≈ R$ 1.00`).
4. Verificar os cards "Bitcoin" e "Ethereum" na Dashboard: as estimativas fiduciárias devem exibir apenas um único `R$` (por exemplo, `≈ R$ 0,00`, não `≈ R$ R$ 0,00`).
