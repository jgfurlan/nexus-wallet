## O Problema

O frontend (Vercel) não consegue se comunicar com a API (Railway) devido a um erro de CORS (`Network Error` / `400 Validation Error` / `404 Route not found` sem cabeçalhos CORS). 

Apesar de termos injetado os cabeçalhos de CORS via fallback forçado diretamente nos manipuladores do Fastify (`setErrorHandler`, `setNotFoundHandler` e tratamento explícito de `OPTIONS` na rota de auth) e alterado a configuração de build, **o comportamento do servidor na Railway não mudou.**

## Diagnóstico Avançado

A nossa investigação profunda na nuvem revelou uma sequência de problemas de Deployment:
1. **Falta de Build do TypeScript (Nixpacks Ghost Cache):** Inicialmente, a imagem Crash-Loop (`Cannot find module '/app/apps/api/dist/server.js'`) confirmou que o Nixpacks estava pulando a fase de compilação porque perdia o gatilho de Build (ignorando o `railway.toml`).
2. **Correção Aplicada:** Adicionamos um `nixpacks.toml` rígido na raiz para forçar o comando `pnpm build`. A compilação agora ocorre com sucesso (o `tsc` roda e não há crash de inicialização).
3. **Novo Sintoma (Servidor Zumbi):** Mesmo com o Build passando, a API continua não retornando a rota de Diagnóstico que injetamos (`/test-cors`), indicando que ela está rodando um código velho ou "fossilizado".
4. **Causa Mestra Encontrada:** A Railway e a Vercel estão conectadas ao **GitHub** na branch `main`. A Vercel puxou o commit `7925f42`, e a Railway muito provavelmente está fazendo o mesmo via webhook nativo do GitHub. No entanto, TODAS as nossas correções e injeções de diagnóstico foram empurradas para a branch `fix/cors-fallback`.
5. Como os códigos não foram "mergeados" para a `main`, a Railway simplesmente ignora nossos comandos locais e puxa o código velho diretamente do repositório remoto.

## Passos a Executar Amanhã

1. Fazer o **Merge** da branch `fix/cors-fallback` para a branch `main` no GitHub.
2. Acompanhar a Trigger (gatilho) do Deploy Automático na Railway assim que o Push da `main` chegar.
3. Observar a aba *Deploy Logs* da Railway na nuvem para garantir que a etapa de inicialização vai printar a listagem da pasta `dist` (injetamos `ls -la dist` no `package.json` para espionagem).
4. Disparar contra o endpoint `/test-cors` no navegador ou terminal: `curl -s -i -X GET https://api-production-d866.up.railway.app/test-cors`. O esperado é retornar `200 OK` com os cabeçalhos de CORS.
5. Em seguida, testar o cadastro pelo Vercel.

---
**Status:** 🚨 Bloqueante
**Prioridade:** Alta
