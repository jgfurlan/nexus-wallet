# NXS-107: Exibição de Saldo no Saque

## Declaração do Problema
O modal de Saque (`WithdrawDrawer`) atualmente não exibe o saldo disponível para a moeda selecionada pelo usuário. Em contraste, o `SwapDrawer` faz isso corretamente. Essa ausência obriga o usuário a decorar ou voltar telas para saber o quanto possui disponível para saque.

## Invariantes Comportamentais Testáveis
1. **Exibição Padrão**: Ao abrir o modal "Sacar Fundos", o saldo disponível da moeda padrão (BRL) deve ser exibido visualmente acima do input de valor.
2. **Reatividade**: Ao trocar o token selecionado no formulário para outro (ex: BTC), a interface deve atualizar instantaneamente para exibir o saldo daquele token específico.
3. **Formatação Correta**: O saldo BRL deve ser formatado como moeda local (`R$ X,XX`), e as criptomoedas formatadas como token (`X.XXXXXXXX`).
4. **Resiliência**: Em caso de falha de carregamento ou saldo nulo, o componente deve exibir graciosamente o valor zero devidamente formatado, não gerando erro na interface.
