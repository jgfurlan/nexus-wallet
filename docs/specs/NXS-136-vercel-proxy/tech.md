# Especificação Técnica: Correção da sintaxe do Proxy Vercel e SPA Fallback (NXS-136)

## 1. Arquitetura
A plataforma de roteamento Edge da Vercel utiliza uma sintaxe específica baseada em "path segments" (`:path*`) para encaminhar parâmetros complexos em "rewrites", garantindo que strings de query e headers sejam repassados adequadamente para o downstream sem interrupções. 

## 2. Mudanças de Código
1. **`apps/web/vercel.json`**
   - Alterar "source" do proxy de `/api/(.*)` para `/api/:path*`.
   - Alterar "destination" do proxy de `https://api-production-d866.up.railway.app/$1` para `https://api-production-d866.up.railway.app/:path*`.
   - Incluir a rota de SPA Fallback após a regra da API para prevenir falsos-positivos na captura de arquivos estáticos.

## 3. Riscos e Mitigações
- N/A. Correção direta de uma configuração inválida do ambiente de hospedagem.
