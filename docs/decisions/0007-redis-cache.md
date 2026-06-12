# ADR 0007: Cache de Cotações com Redis (30s TTL)

## Status
Aprovada

## Contexto
O cálculo de conversão no Swap depende de cotações de mercado em tempo real obtidas da API pública da CoinGecko. No entanto, a API pública possui limites estritos de requisições (rate limits). Chamar a API externa a cada requisição de swap ou cotação causaria lentidão e inevitavelmente geraria erros de rate limit (HTTP 429).

## Decisão
Decidi implementar uma camada de cache em memória usando **Redis** intermediando as chamadas para a CoinGecko. Optei por definir um Time-to-Live (TTL) estrito de **30 segundos** para as cotações. Toda requisição de cotação consulta primeiro o Redis; se houver um cache válido, retorna imediatamente. Caso contrário, busca na CoinGecko e atualiza o Redis.

## Consequências
- **Positivas:** Redução drástica da latência da API, proteção contra rate limit da CoinGecko, e conformidade com o diferencial técnico solicitado no documento do teste.
- **Negativas:** Usuários podem realizar Swaps com cotações atrasadas em até 30 segundos em relação ao mercado real. Decidi que essa variação é aceitável para o propósito do teste prático.
