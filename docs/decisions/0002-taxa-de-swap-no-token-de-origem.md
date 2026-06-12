# ADR 0002: Cobrança de Taxa de Swap no Token de Origem

## Status
Pendente de Validação (Proposta)

## Contexto
No fluxo de exemplo do PDF, a taxa de swap é debitada do token de destino. No entanto, se o saldo final no token de destino for menor do que a taxa a ser cobrada, o saldo após a transação poderia ficar negativo temporariamente durante o cálculo, ou a transação falharia por insuficiência de fundos mesmo que o usuário tivesse saldo suficiente no token de origem.

## Decisão
Optei por cobrar a taxa de swap diretamente no token de **origem**. Decidi deduzir a taxa do montante de origem antes de aplicar a taxa de conversão. 
A fórmula aplicada é: `destinationAmount = (sourceAmount - fee) * rate`.
*Nota: Esta decisão precisa de validação com o recrutador para garantir alinhamento com a arquitetura esperada.*

## Consequências
- **Positivas:** Evita saldo negativo intermediário e simplifica a verificação de saldo suficiente antes da transação (basta validar se `saldo_origem >= sourceAmount`).
- **Negativas:** Desvia do fluxo de exemplo ilustrado no PDF de especificações do teste.
