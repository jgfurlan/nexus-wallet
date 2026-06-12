# ADR 0003: Ausência de Camada de Repository

## Status
Aprovada

## Contexto
Em arquiteturas corporativas maiores, é comum adotar o padrão Repository para desacoplar as regras de negócio (Services) do acesso direto ao banco de dados (ORM). No entanto, em um projeto de teste de escopo reduzido (5 módulos principais), adicionar uma camada de Repository para cada entidade pode gerar complexidade desnecessária (overengineering).

## Decisão
Escolhi não implementar uma camada de Repository explícita. Optei por fazer com que as classes de Service acessem diretamente o cliente do Prisma (`PrismaClient`). Como o Prisma já gera tipos TypeScript robustos e atua como uma abstração de acesso a dados altamente tipada, decidi que os Services podem fazer consultas e modificações diretamente.

## Consequências
- **Positivas:** Redução de boilerplate code, desenvolvimento mais ágil e direto, menos arquivos para manter.
- **Negativas:** Se decidirmos trocar o Prisma por outro ORM (como TypeORM) ou trocar de banco relacional para NoSQL, a refatoração nos Services será maior. No contexto de um teste prático, esse risco é desprezível.
