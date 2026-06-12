# ADR 0010: Paginação Baseada em Cursor para o Histórico de Transações

## Status
Aprovada

## Contexto
O histórico de transações e o extrato do ledger podem conter milhares de registros. Retornar tudo de uma vez degradaria a performance. Havia a opção de usar paginação baseada em deslocamento (Offset-based) ou baseada em ponteiro/cursor (Cursor-based).

## Decisão
Optei por implementar **paginação baseada em cursor** (usando a data/ID do registro anterior e um limite) para os endpoints de histórico e extrato. Escolhi esse modelo porque o ledger e a tabela de transações são de escrita contínua (append-only), onde novos registros são criados constantemente. A paginação por offset sofre de "page-drift" (itens duplicados ou pulados quando novos registros são inseridos enquanto o usuário navega pelas páginas) e degradação de performance em tabelas grandes.

## Consequências
- **Positivas:** Performance constante (O(log N) em vez de O(N)), experiência de scroll infinito sem repetição de dados e consistência total sob fluxos contínuos de inserção.
- **Negativas:** Lógica de backend e frontend levemente mais complexa que a paginação por offset tradicional (não é possível pular diretamente para a "página 10").
