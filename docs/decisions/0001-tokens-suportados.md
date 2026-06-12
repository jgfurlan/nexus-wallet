# ADR 0001: Tokens Suportados (BRL, BTC, ETH)

## Status
Aprovada

## Contexto
O documento de requisitos (PDF) solicita que a carteira suporte "pelo menos 3 tokens" e demonstra no exemplo de fluxo o uso de USDT. No entanto, adicionar múltiplos tokens ou permitir tokens dinâmicos aumentaria a complexidade do banco de dados e da lógica de cotação desnecessariamente para um teste prático.

## Decisão
Optei por suportar de forma estática apenas três tokens: **BRL**, **BTC** e **ETH** através de um enum no banco de dados Prisma e TypeScript. Escolhi ignorar o USDT do exemplo do PDF, uma vez que ele serve apenas como ilustração de fluxo e três tokens atendem perfeitamente ao requisito mínimo.

## Consequências
- **Positivas:** Simplificação extrema da modelagem do banco de dados, da lógica de swap e da integração com a API da CoinGecko.
- **Negativas:** Se no futuro for necessário adicionar novos tokens, será preciso alterar o enum no Prisma Schema e executar uma migração de banco de dados.
