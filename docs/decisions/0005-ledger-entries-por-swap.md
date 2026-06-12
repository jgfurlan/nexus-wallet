# ADR 0005: Ordem de Criação das Entradas do Ledger no Swap

## Status
Aprovada

## Contexto
O processo de swap envolve a cobrança de uma taxa, o débito do token de origem e o crédito do token de destino. A ordem em que essas movimentações são inseridas no banco de dados (ledger) afeta a integridade dos saldos intermediários (`balanceBefore` e `balanceAfter`).

## Decisão
Decidi registrar exatamente 3 entradas no ledger para cada operação de swap, executadas na seguinte ordem:
1. **SWAP_FEE:** Cobrança da taxa sobre o saldo do token de origem.
2. **SWAP_OUT:** Débito do valor de conversão sobre o saldo do token de origem.
3. **SWAP_IN:** Crédito do valor convertido no saldo do token de destino.

Optei por essa ordem porque o débito da taxa e do valor de saída ocorrem no mesmo token (origem) e, executados primeiro, garantem que a validação de fundos suficientes aconteça imediatamente. O saldo final nunca corre o risco de ficar negativo de forma espúria nas entradas do ledger.

## Consequências
- **Positivas:** Rastreabilidade absoluta da operação, garantindo que o saldo seja auditável linha a linha e sem saldos negativos intermediários.
- **Negativas:** Exige a escrita de 3 inserções no banco em vez de uma única consolidada, gerando um pouco mais de escrita, o que é compensado pela segurança e clareza da auditoria.
