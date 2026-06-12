# ADR 0011: Pino + Request-ID para Structured Logging

## Status
Aprovada

## Contexto
Em produção, logs textuais simples (como `console.log`) dificultam o monitoramento, a indexação por agregadores de log e a correlação de ações disparadas pela mesma requisição HTTP.

## Decisão
Optei por utilizar o logger estruturado **Pino**, que já vem integrado nativamente no Fastify. Decidi configurar um middleware/hook que injeta um `request-id` exclusivo em cada requisição HTTP e propaga esse identificador em todos os logs disparados pelo fluxo daquela requisição.

## Consequências
- **Positivas:** Logs estruturados em formato JSON de alta performance, permitindo correlacionar todas as operações de banco de dados, cotações e regras de negócio de um fluxo de swap ou saque a partir de um único `request-id`.
- **Negativas:** Logs estruturados são menos legíveis para humanos no terminal sem um formatador (como `pino-pretty`). Para mitigar isso, configurei o formatador bonito apenas para o ambiente de desenvolvimento local.
