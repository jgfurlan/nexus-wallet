# Product Spec: Correção de Bugs de Exibição de Moeda (BRL e Duplo R$)

**Issue:** GH79 — [BUG] Fix Currency Display Bugs (BRL R$ 1.00 & Double R$)
**Figma/Design:** N/A

---

## Resumo
Esta especificação descreve as correções necessárias para o componente de exibição de saldo (`BalanceCard`) e para o preenchimento de dados na página de painel principal (`DashboardPage`). Atualmente, existem dois problemas de exibição:
1. O valor em moeda fiduciária do Real Brasileiro (BRL) está fixado em `1.00` (`≈ R$ 1.00`), independentemente do saldo real da carteira do usuário.
2. A exibição do valor fiduciário estimado de outros ativos (BTC e ETH) mostra o símbolo monetário duplicado (por exemplo, `≈ R$ R$ 0,00`), pois a formatação ocorre de maneira redundante na página e no componente.

---

## Problema
1. O saldo em BRL deve refletir a quantidade exata de BRL que o usuário possui no momento. Atualmente, a propriedade `fiatValue` do `BalanceCard` de BRL está codificada como `"1.00"` de forma estática no frontend.
2. O método `formatCurrency` já adiciona o símbolo da moeda local (`R$`) com base na localidade configurada (`pt-BR`). Ao passar o valor já formatado para a propriedade `fiatValue` do `BalanceCard`, que por sua vez concatena o valor com `{symbol}`, ocorre a duplicação `R$ R$`.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Exibir o saldo correto em BRL como o valor monetário real fiduciário.
- [ ] Eliminar a duplicação do símbolo monetário (`R$`) na exibição de saldos de todos os cards de ativos (BRL, BTC, ETH).
- [ ] Manter a formatação regionalizada correta para todas as moedas e saldos.

**Não-Objetivos:**
- Alterar as regras de conversão de câmbio ou cotações de mercado no backend.
- Modificar o modelo de dados de carteira (`Wallet`) ou transações.

---

## Experiência do Usuário & Invariantes

### Caminho Feliz
1. O usuário entra na página do painel principal (Dashboard).
2. O sistema carrega os saldos atualizados da carteira (ex: `1500.50` BRL, `0.005` BTC, `0.05` ETH).
3. O card de BRL exibe:
   - Quantidade principal: `R$ 1.500,50`
   - Estimativa fiduciária: `≈ R$ 1.500,50` (corretamente preenchido com o saldo real do usuário)
4. Os cards de BTC e ETH exibem as estimativas fiduciárias formatadas sem duplicação de símbolos, ex: `≈ R$ 13.500,00` em vez de `≈ R$ R$ 13.500,00`.

### Invariantes
- O valor fiduciário de um saldo em BRL deve ser exatamente igual ao saldo de BRL do usuário.
- O componente `BalanceCard` deve renderizar o valor fiduciário de forma limpa, confiando na formatação prévia ou tratando o símbolo sem duplicações.

---

## Critérios de Sucesso
- [ ] O card de saldo do Real Brasileiro exibe o saldo real do banco de dados na estimativa fiduciária.
- [ ] Nenhum card de ativo exibe símbolos monetários duplicados como `R$ R$`.
- [ ] Todos os testes locais e verificações de tipagem e linters continuam passando sem regressões.
