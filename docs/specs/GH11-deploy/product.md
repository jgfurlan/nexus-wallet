# GH11: Deploy Railway (API) + Vercel (Web) - Product Specification

## Descrição do Produto
O objetivo desta etapa é configurar o projeto para ter deploys contínuos e automatizados na nuvem, dividindo as responsabilidades: a API, banco de dados (PostgreSQL) e cache (Redis) ficarão no Railway; e o frontend (React) ficará na Vercel. O usuário final (desenvolvedores e testadores) terá endpoints públicos para ambas as camadas do NexusWallet.

## Invariantes e Comportamentos Esperados

1. **Deploy Frontend (Vercel)**
   - O frontend React deve poder ser acessado publicamente a partir da Vercel.
   - Atualizar a página (`refresh`) em qualquer rota interna (ex: `/dashboard`, `/swap`) não deve retornar erro `404 Not Found`, sendo redirecionado transparentemente para o `index.html`.
   - O build de produção deve utilizar corretamente as variáveis de ambiente setadas na Vercel (ex: `VITE_API_URL` apontando para o domínio do Railway).

2. **Deploy Backend (Railway)**
   - A API construída no Fastify deve iniciar corretamente se comunicando com o PostgreSQL e o Redis.
   - A inicialização (start) do serviço só deve rodar se as _migrations_ do Prisma forem executadas com sucesso via `prisma migrate deploy`.
   - O endpoint global `/health` deve estar disponível e responder HTTP 200, certificando ao Railway que a API subiu sem problemas.
   - Variáveis sensíveis como chaves de JWT e URLs de banco de dados e cache não devem ficar no código, sendo obrigatoriamente passadas ao ambiente.
