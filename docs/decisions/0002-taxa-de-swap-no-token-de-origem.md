# ADR 0002: Cobrança de Taxa de Swap no Token de Origem

## Status
Aprovada

## Contexto
No fluxo de exemplo do PDF, a taxa de swap é debitada do token de destino. Havia dúvida se deveríamos seguir à risca o destino ou simplificar cobrando na origem. O recrutador esclareceu que ambos os modelos são aceitáveis, importando apenas a consistência e rastreabilidade do ledger. Além disso, foi ressaltado que, operando com transações atômicas no banco de dados, estados intermediários negativos ou validações em duas etapas são desnecessários.

## Decisão
Optei por cobrar a taxa de swap diretamente no token de **origem**. Decidi deduzir a taxa do montante de origem antes de aplicar a taxa de conversão. 
A fórmula aplicada é: `destinationAmount = (sourceAmount - fee) * rate`.
Dado que as operações contábeis (OUT, FEE, IN) rodam dentro da mesma transação atômica do Prisma, a integridade é garantida nativamente pelo banco de dados.

## Consequências
- **Positivas:** Simplifica a verificação de saldo suficiente antes da transação (basta validar se `saldo_origem >= sourceAmount`) e mantém rastreabilidade impecável no ledger.
- **Negativas:** Nenhuma relevante, dado que ambos os modelos são aceitos pela avaliação do teste.
