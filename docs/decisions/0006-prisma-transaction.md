# ADR 0006: Atomicidade com Prisma $transaction (Serializable)

## Status
Aprovada

## Contexto
Operações como Swap e Saque exigem que múltiplas tabelas (WalletBalance, LedgerEntry, Transaction) sejam atualizadas simultaneamente. Se ocorrer um erro no meio do processo (ex: erro ao creditar o token de destino), o sistema não pode deixar o saldo do usuário inconsistente (débito sem crédito).

## Decisão
Optei por utilizar o recurso `$transaction` do Prisma ORM configurado com o nível de isolamento **Serializable** para todas as transações financeiras críticas (Swap, Depósito, Saque). Decidi que abordagens complexas como Saga Pattern ou compensações manuais de erro não fazem sentido, já que toda a aplicação opera sobre um único banco de dados relacional PostgreSQL.

## Consequências
- **Positivas:** Atomicidade garantida a nível de banco de dados, rollback automático em caso de qualquer falha no fluxo, e prevenção total de condições de corrida (race conditions) em atualizações de saldo concorrentes.
- **Negativas:** Nível de isolamento Serializable pode aumentar a concorrência e gerar erros de serialização (deadlocks/retry errors) sob tráfego massivo. Para o escopo deste teste e o volume esperado, os benefícios de consistência superam de longe os riscos de vazão.
