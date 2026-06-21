# Especificação de Funcionalidade: Correção de Ordem do Plugin de Cookie

## Problema
O endpoint de histórico de transações estava retornando 500/401 porque o plugin `@fastify/jwt` não conseguia ler o cookie `nexus_token` corretamente.

## Solução
Inverter a ordem de registro dos plugins no Fastify, garantindo que o `@fastify/cookie` seja registrado antes do `@fastify/jwt`, conforme documentação oficial.

## Critérios de Aceitação
- Usuário autenticado consegue acessar `/wallet/history` com sucesso via token em cookie HTTP-Only.
- Todas as rotas autenticadas validam a sessão corretamente.
