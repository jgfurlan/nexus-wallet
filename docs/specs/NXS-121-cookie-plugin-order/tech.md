# Especificação Técnica: Correção de Ordem do Plugin de Cookie

## Mudanças Arquiteturais
- Nenhuma. Apenas ajuste na inicialização do servidor.

## Implementação
- **Arquivo modificado**: `apps/api/src/app.ts`
- **Alteração**: Mover `app.register(cookie)` para uma linha anterior à `app.register(fastifyJwt)`. Isso permite que o fastify-jwt tenha acesso ao parser de cookies da requisição antes de tentar verificar a assinatura do JWT.

## Riscos
- **Regressão**: Muito baixo. Os plugins já estavam presentes, a ordem apenas estava errada.
- **Testes**: Executar a suíte de testes existente para garantir que a autenticação ainda funciona (tanto mockada quanto em integração).
