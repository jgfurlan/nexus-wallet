# Especificação de Funcionalidade: Pequenas Melhorias de UX

## Problema
1. DepositDrawer preenchia 1000 de forma padrão, o que podia confundir.
2. WithdrawDrawer sobreescrevia o valor digitado ao utilizar o botão Sandbox (Preencher).
3. Dashboard possuía um botão "Ver Tudo" para a Atividade Recente que era redundante ao botão de Histórico já existente no Drawer.

## Solução
1. Remover o `defaultValue` de 1000 no DepositDrawer.
2. Remover a alteração do field `amount` ao usar o Autofill no WithdrawDrawer.
3. Remover o botão "Ver Tudo" no DashboardPage.

## Critérios de Aceitação
- Usuário precisa digitar ativamente o valor ao simular um depósito.
- Usuário não perde o valor preenchido de saque ao buscar um endereço de teste via autofill.
- Painel não possui links duplicados que realizam a mesma ação (Visualizar Histórico).
