# GH12: README + Documentação Técnica - Product Spec

## Descrição do Produto
O projeto foi totalmente estruturado, e a API bem como o Frontend estão concluídos e preparados para deploy. O objetivo final da Fase 1 é garantir que o projeto seja acessível, legível e auditável por qualquer novo desenvolvedor ou avaliador técnico. O produto final desta tarefa é a documentação principal consolidada.

## Invariantes e Comportamentos Esperados
1. **README.md (Raiz):**
   - O README deve agir como a "vitrine" do projeto, apresentando o NexusWallet.
   - Deve conter as tecnologias chave utilizadas (Fastify, React, Prisma, Redis, PostgreSQL).
   - Deve fornecer passos explícitos de "Getting Started" de como instalar as dependências (`pnpm install`), rodar o banco de dados (docker-compose ou local) e inicializar os servidores de desenvolvimento.
   - Deve descrever brevemente a separação em Monorepo (`apps/api` e `apps/web`).
2. **Documentação de Arquitetura:**
   - Devemos consolidar o resultado do rastreamento arquitetural do `graphify` num documento final.
   - Decisões técnicas importantes (uso de Decimal.js, adoção de spec-driven development, etc) devem estar centralizadas e lincadas a partir do README.
