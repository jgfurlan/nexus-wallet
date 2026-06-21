# NXS-117: Correção do Acesso ao Histórico (500 Internal Server Error)

## Declaração do Problema
O endpoint `/wallet/history` está falhando com Erro 500 porque o handler de requisição está tentando ler `req.user.id`, mas a rota em si não está protegida pelo `authGuard`. Sem a verificação de autenticação, o objeto `user` não é anexado ao request.

## Invariantes Comportamentais Testáveis
1. O endpoint de histórico (`GET /wallet/history`) deve possuir a propriedade `onRequest: [authGuard]` para que apenas usuários autenticados possam acessá-lo.
2. Requisições ao histórico sem um JWT válido devem retornar 401 Unauthorized e não 500 Internal Server Error.
