# Especificação de Funcionalidade: Correção da sintaxe do Proxy Vercel e SPA Fallback (NXS-136)

## 1. Visão Geral
Após a implementação do NXS-135, requisições de API feitas pelo frontend passaram a retornar o arquivo `index.html` (com erro 405 Method Not Allowed) em vez da resposta da API. O erro ocorreu porque a sintaxe de regex usada no `vercel.json` (`(.*)`) é incompatível com o Vercel Edge Proxy sem a sintaxe de path segment explícita. Adicionalmente, a regra original de SPA fallback (`/(.*)` -> `/index.html`) havia sido removida.

## 2. Escopo
- Corrigir a sintaxe da regra de rewrite no `vercel.json` para utilizar `/:path*`.
- Restaurar a regra de rewrite de SPA fallback que redireciona navegação direta para `index.html`.

## 3. Critérios de Aceite
- **Obrigatório:** Requisições `/api/alguma-rota` devem ser roteadas corretamente para `https://api-production-d866.up.railway.app/alguma-rota`.
- **Obrigatório:** O SPA fallback deve retornar `index.html` para não quebrar a navegação no React Router em hard refreshes.
