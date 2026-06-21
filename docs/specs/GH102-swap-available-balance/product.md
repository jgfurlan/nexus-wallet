# Spec do Produto: GH102 - Exibir Saldo Disponível no SwapDrawer

## 1. Visão Geral
Conforme o issue #102 e o feedback de usuário real, o fluxo de conversão (Swap) acusa erro de saldo insuficiente apenas ao tentar confirmar a operação, mas não exibe o saldo atual da moeda de origem proativamente. A melhoria de UX exigida consiste em exibir o saldo disponível diretamente na interface do Drawer de Swap.

## 2. Objetivos
- Mostrar o saldo do token de origem (`fromToken`) no componente `SwapDrawer`.
- Atualizar o saldo exibido instantaneamente e dinamicamente quando o token selecionado for alterado.
- Permitir que os usuários saibam seu limite e poder de compra antes da simulação de swap, mitigando erros frustrantes.

## 3. Comportamento Esperado
- Ao abrir o `SwapDrawer`, o sistema deve solicitar e exibir o saldo disponível para o token que está selecionado no campo "Você envia" (BRL, BTC ou ETH).
- O saldo deve aparecer preferencialmente acima ou junto ao campo de input numérico, de maneira limpa (ex: `Disponível: 1.500,00 BRL` ou `Saldo: 0.025 BTC`).
- A formatação visual deve respeitar a precisão de cada tipo de moeda (fiat vs cripto).
