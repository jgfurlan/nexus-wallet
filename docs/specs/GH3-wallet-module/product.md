# Product Spec: Módulo de Carteira (Wallet Module)

**Issue:** GH3 — Wallet module (auto-create on register, get balances)

---

## Resumo
O Módulo de Carteira é responsável pela gestão das contas de ativos dos usuários. Ele garante que cada usuário registrado possua uma carteira única vinculada e fornece os meios para consultar os saldos de todas as moedas suportadas (BRL, BTC, ETH).

---

## O Problema
Após registrar-se e autenticar-se, o usuário precisa de um ponto centralizado para consultar suas moedas e os respectivos saldos na plataforma. Sem este endpoint, o cliente/frontend não consegue renderizar o dashboard financeiro ou validar limites antes de operações de swap e saques.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Garantir que cada usuário tenha exatamente uma carteira com saldos para BRL, BTC e ETH criados automaticamente no registro.
- [ ] Disponibilizar um endpoint seguro (`GET /wallet/balances`) para obter o saldo atual de cada moeda.
- [ ] Proteger o acesso de leitura com o middleware `authGuard`.

**Não-Objetivos:**
- Depositar ou transferir fundos diretamente por este endpoint (escopo das issues de Webhook e Ledger).
- Gerenciar chaves privadas de criptomoedas de fato (a carteira é custodial e representada pelo banco de dados).

---

## Experiência do Usuário & Invariantes

### Fluxo Feliz (Happy Path)
1. O usuário se registra (carteira criada automaticamente no banco de dados com saldo `0` em todas as moedas).
2. O usuário faz login e recebe seu token JWT.
3. O usuário chama `GET /wallet/balances` enviando o token no cabeçalho `Authorization`.
4. O sistema retorna o identificador da carteira (`walletId`) e a lista de saldos:
   - BRL: `0.00`
   - BTC: `0.00`
   - ETH: `0.00`

### Casos de Borda e Erros
| Cenário | Comportamento Esperado |
|----------|------------------|
| Chamada sem cabeçalho Authorization | Retorna `401 Unauthorized` |
| Chamada com token inválido ou expirado | Retorna `401 Unauthorized` |
| Usuário autenticado sem carteira criada (inconsistência) | Cria uma nova carteira com saldos zerados sob demanda e retorna `200 OK` (resiliência). |

### Restrições (Constraints)
- O saldo de cada moeda deve suportar até 18 casas decimais de precisão (armazenado como tipo `Decimal` no PostgreSQL).
- Nenhuma operação de consulta de saldo deve modificar saldos ou gerar registros no Ledger (operações puras de leitura).

---

## Critérios de Sucesso
- [ ] Criação e aprovação do teste de integração em `apps/api/src/modules/wallet/__tests__/wallet.test.ts`.
- [ ] Todos os testes passando com exito.
- [ ] Rota devidamente documentada no Swagger UI (`/docs`).
