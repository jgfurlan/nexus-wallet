# Product Spec: Histórico de Transações (Paginado)

**Issue:** NXS-8 — [Transaction History](https://github.com/users/jgfurlan/projects/nexus-wallet/issues/8)

---

## Sumário
Permite que o usuário consulte o histórico completo de suas atividades financeiras (Depósitos, Saques e Swaps) de forma organizada, com suporte a filtros e paginação eficiente. A resposta detalha o impacto de cada transação nos saldos através dos registros do Ledger.

---

## Problema
Sem um histórico, o usuário não tem visibilidade sobre como seu patrimônio evoluiu. Para conformidade financeira e boa experiência (UX), é vital listar as movimentações passadas de forma clara e auditável.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Endpoint `GET /wallet/history` retornando transações do usuário.
- [ ] Suporte a filtros por `token` (BRL/BTC/ETH) e `type` (DEPOSIT/SWAP/WITHDRAWAL).
- [ ] Implementar paginação baseada em cursor (performance).
- [ ] Incluir detalhes do impacto no saldo (Ledger entries) em cada item da lista.

**Não-Objetivos:**
- Exportação de extrato em PDF/CSV (fora de escopo).
- Filtro por período de datas (YAGNI para o MVP do teste).

---

## Experiência do Usuário & Invariantes

### Fluxo Principal
1. Usuário acessa sua aba de atividades.
2. Sistema busca as transações mais recentes (ordem decrescente).
3. Para cada transação, exibe: Tipo, Valor Original, Valor Destino (se swap), Taxa e Saldo Resultante.
4. Se houver mais de 20 itens, sistema fornece um cursor para carregar a próxima página.

### Casos de Borda
| Cenário | Comportamento Esperado |
|----------|------------------|
| Sem transações | Retorna `data: []` com HTTP 200 |
| Filtro sem resultados | Retorna `data: []` com HTTP 200 |
| Cursor inválido | Retorna 400 Bad Request |
| Usuário não autenticado | Retorna 401 |

---

## Critérios de Sucesso
- [ ] Testes em `__tests__/history.test.ts` comprovam paginação correta.
- [ ] Filtros aplicados via query params funcionam perfeitamente.
- [ ] O sinal RLVR de **Auditabilidade** é visível na resposta (Ledger integrado).
- [ ] Performance da query é constante independente do número de registros (uso de índices).
