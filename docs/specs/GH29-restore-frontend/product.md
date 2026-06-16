# GH29: Restore Frontend React

## 1. Visão Geral
O Frontend da aplicação (Dashboard, Histórico de Transações e Formulário de Swap) foi revertido acidentalmente do código principal (`main`) devido a uma falha na pipeline de CI em estágios anteriores do desenvolvimento. Esta funcionalidade visa **restaurar** as telas construídas usando React e integrá-las adequadamente à API.

## 2. Escopo do Produto
- **Dashboard:** Tela inicial com visualização agregada de saldos em carteira.
- **Histórico (Ledger):** Tabela detalhada mostrando todas as movimentações financeiras no estilo Append-Only, suportando paginação.
- **Swap (Câmbio):** Formulário permitindo o câmbio entre moedas fiduciárias e criptomoedas, consumindo a cotação ao vivo via API (Redis cache).
- **Autenticação (Login/Register):** Telas de autenticação conectadas aos endpoints JWT da API.

## 3. Critérios de Aceite
1. O usuário deve ser capaz de realizar Login/Cadastro e obter um token JWT salvo de forma segura.
2. O usuário deve poder acessar a rota `/dashboard` para ver seus saldos de carteira.
3. O usuário deve poder fazer um Swap utilizando o frontend (ex: trocar USD por BTC).
4. As rotas devem ser protegidas (React Router Guards) garantindo que apenas usuários autenticados acessem áreas privadas.
5. As requisições à API devem apontar dinamicamente para `VITE_API_URL` respeitando o ambiente (Local/Vercel).

## 4. Fora de Escopo
- Alterações no modelo de dados ou na lógica do Backend.
- Integração de webhooks no Frontend (o Frontend não recebe webhooks, apenas a API).
