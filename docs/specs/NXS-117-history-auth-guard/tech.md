# NXS-117: Tech Spec

## Contexto
O Fastify expõe métodos para registrar middlewares (`onRequest`, `preHandler`, etc). O middleware `authGuard` injeta as propriedades do usuário logado na requisição e impede acesso anônimo. 

## Alterações Cirúrgicas Propostas
No arquivo `apps/api/src/modules/wallet/history.routes.ts`:
1. Importar o `authGuard` de `../../middleware/auth_guard`.
2. Adicionar o hook `onRequest: [authGuard]` na configuração da rota `GET /wallet/history`.

## Rastreabilidade das Modificações
O escopo é isolado apenas à declaração de rota do histórico, afetando apenas esta integração. O payload não é alterado, apenas a fase de autenticação.

## Passos para Validação
1. Rodar os testes de API.
2. Confirmar que requisições não autenticadas tomam 401.
