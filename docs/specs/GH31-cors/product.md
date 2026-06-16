# GH31: Resolução de Network Error (CORS)

## Objetivo
Permitir que o Frontend (hospedado na Vercel) consiga estabelecer comunicação segura com a API (hospedada na Railway), resolvendo o erro genérico de "Network Error" durante as requisições do navegador.

## O Problema
A API do NexusWallet foi arquitetada sem uma política de CORS (Cross-Origin Resource Sharing). Com a separação de domínios em Produção (Frontend = Vercel, Backend = Railway), os navegadores modernos interceptam e bloqueiam sumariamente chamadas Ajax/Fetch por medida de segurança, o que impossibilita as ações de Cadastro, Login, etc.

## Requisitos
1. **Segurança:** O Backend não pode aceitar requisições de qualquer site do mundo (`*`), deve ter origens controladas.
2. **Ambientes:** A API deve aceitar requisições tanto do ambiente de Produção (domínio oficial da Vercel) quanto do ambiente de Desenvolvimento Local (localhost).
