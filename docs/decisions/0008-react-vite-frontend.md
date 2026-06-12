# ADR 0008: React + Vite + TailwindCSS para o Frontend

## Status
Aprovada

## Contexto
O teste avalia primordialmente a API REST (backend). Contudo, a criação de uma interface de usuário (frontend) é listada como um diferencial opcional muito valorizado. Havia a opção de usar Next.js para fazer o projeto inteiro, ou criar um frontend separado.

## Decisão
Decidi utilizar **React 18 + Vite + TailwindCSS** para a aplicação cliente (`/apps/web`), separada da API Fastify (`/apps/api`). 
Optei por essa divisão em vez de Next.js porque:
1. O backend Fastify foi a escolha principal para a API, e Next.js possui seu próprio servidor de rotas de API, o que causaria sobreposição de responsabilidades.
2. Vite é extremamente rápido para desenvolvimento local e gera pacotes estáticos leves para deploy na Vercel, o que atende às melhores práticas do mercado de interfaces de carteiras web.

## Consequências
- **Positivas:** Separação limpa de responsabilidades (API vs UI), build rápido com Vite, estilização moderna e produtiva com TailwindCSS, facilidade para deploy separado (Vercel para web, Railway para API).
- **Negativas:** Exige o gerenciamento de dois processos de desenvolvimento separados em dev local (`pnpm dev` na raiz rodando ambos).
