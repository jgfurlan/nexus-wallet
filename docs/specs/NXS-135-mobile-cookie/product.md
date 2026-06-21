# Especificação de Funcionalidade: Resolução de Bloqueio de Cookie ITP em Mobile (NXS-135)

## 1. Visão Geral
No celular (particularmente iOS Safari e navegadores em modo estrito), o login executa com sucesso, porém o usuário retorna à tela inicial em menos de 2 segundos. Isso ocorre porque o cookie JWT (`nexus_token`) gerado pelo servidor é bloqueado por políticas de Intelligent Tracking Prevention (ITP) contra cookies de terceiros cross-site (`SameSite=None`), resultando em erros 401 na primeira requisição após o login.

## 2. Escopo
- Alterar o fluxo de comunicação do Vercel (Frontend) para a Railway (Backend API).
- Configurar proxy no Vercel para que a API seja acessada via rota relativa (`/api`).
- Garantir que o cookie JWT seja visto pelo navegador como first-party.

## 3. Critérios de Aceite
- **Obrigatório:** Navegadores mobile e desktop strict (Safari, Brave) devem salvar o cookie de login.
- **Obrigatório:** Requisições autenticadas subsequentes não devem retornar erro 401 por ausência de cookie.
- **Obrigatório:** Frontend deve alternar adequadamente o proxy no modo PROD (`/api`) enquanto preserva funcionalidade dev local.
