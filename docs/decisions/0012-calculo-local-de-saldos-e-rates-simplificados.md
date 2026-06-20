# ADR 0012: Cálculo Local de Equivalente em BRL e Endpoint de Rates Simplificado

## Status
Aprovada

## Contexto
Para exibir o valor equivalente em BRL dos saldos no Dashboard do frontend, o cliente realizava uma chamada ao endpoint `/swap/quote` para cada moeda cujo saldo fosse maior que zero. Essa abordagem gerava múltiplos registros transacionais com UUIDs no Redis (usados para a execução real de swap), poluindo o cache temporário sem que houvesse intenção real do usuário de realizar conversões.

## Decisão
Optei por criar um endpoint simplificado `GET /swap/rates` na API que retorna unicamente as cotações atuais de mercado (BTC e ETH em BRL) armazenadas no Redis a partir do cliente CoinGecko. No frontend, decidi buscar essas cotações em uma única chamada consolidada durante o carregamento do Dashboard e calcular o valor equivalente em BRL localmente utilizando a biblioteca `Decimal.js` para garantir precisão matemática.

## Consequências
- **Positivas:** Eliminação completa de poluição do banco de cache (Redis) com cotações fantasmas temporárias. Redução da latência no carregamento da tela inicial (substituindo múltiplas requisições sequenciais por apenas uma única chamada paralela rápida).
- **Negativas:** Adiciona o custo computacional do cálculo matemático no cliente frontend. No entanto, esse impacto é insignificante face ao ganho de performance de rede e economia de memória no servidor.
