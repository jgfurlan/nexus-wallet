# GH31: Especificação Técnica de CORS

## Stack
- Fastify (v4)
- Pacote `@fastify/cors`

## Implementação
1. Instalar a dependência `@fastify/cors` no pacote `apps/api`.
2. Registrar o middleware no `apps/api/src/app.ts`.
3. Configurar a lista de origens (`origin`) para aceitar:
   - `http://localhost:5173` (Frontend em Dev)
   - `https://nexus-wallet-ashy.vercel.app` (URL Principal em Produção)
   - Opcionalmente, aceitar regex para Preview deploys da Vercel (`https://nexus-wallet-*.vercel.app`).
4. Configurar os cabeçalhos permitidos e métodos HTTP.

## Riscos
- Se a Regex for muito permissiva, abre brechas.
- Se a Vercel mudar o formato da URL, o CORS quebra. É mais seguro amarrar variáveis de ambiente no futuro, mas no momento a URL oficial atende bem.
