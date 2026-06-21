# NXS-108: Remoção de Valores de Conversão em BRL

## Declaração do Problema
Os cards de saldo no Dashboard (DashboardPage) e no próprio componente BalanceCard estão exibindo uma linha secundária com `≈ R$ X,XX` (valor estimado em BRL) para todos os tokens. Para a moeda Real Brasileiro (BRL), o mesmo valor é exibido de forma redundante (ex: R$ 2.741,00 como saldo principal e ≈ R$ 2.741,00 como conversão fiat). Além de poluído, o usuário solicitou explicitamente a remoção desses valores convertidos.

## Invariantes Comportamentais Testáveis
1. O componente `BalanceCard` NÃO deve mais exigir nem exibir a propriedade `fiatValue`.
2. No `DashboardPage`, os cards de "Real Brasileiro", "Bitcoin" e "Ethereum" devem exibir apenas o saldo em sua respectiva moeda/unidade, sem a linha adicional de "≈".
3. A chamada desnecessária ao endpoint `/swap/quote` para gerar `fiatValues` no frontend deve ser eliminada do fluxo de carregamento da página do dashboard para evitar consumo excessivo da API.
