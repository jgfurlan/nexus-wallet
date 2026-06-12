# ADR 0004: Import Direto entre Módulos

## Status
Aprovada

## Contexto
Em sistemas maiores, o acoplamento forte entre módulos pode dificultar a manutenção. Alternativas comuns incluem Injeção de Dependência (DI) via plugins Fastify ou arquiteturas baseadas em eventos (Event-Driven Architecture) para comunicação assíncrona.

## Decisão
Optei por utilizar imports diretos do TypeScript entre os Services dos diferentes módulos (ex: `swap_service` importa diretamente `ledger_service`). Decidi que a comunicação direta é mais legível, rastreável e simples para o escopo do projeto, e o compilador do TypeScript fornece validação estática imediata. 
Defini a seguinte regra de arquitetura para evitar acoplamento circular:
- Módulos de domínio (`swap`, `withdrawal`, `wallet`, `auth`) podem importar o `ledger_service` e as bibliotecas compartilhadas (`lib/*`).
- Módulos laterais não devem importar uns aos outros (ex: `swap` nunca deve importar `auth`).

## Consequências
- **Positivas:** Simplicidade de código, facilidade de depuração com stack traces claros, e tipagem estática garantida.
- **Negativas:** Acoplamento direto entre classes de serviço. Em um cenário real de microserviços ou escala massiva, isso exigiria refatoração para eventos ou DI.
