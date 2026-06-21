# NXS-107: Tech Spec

## Contexto
O componente `apps/web/src/components/WithdrawDrawer.tsx` (caminho inferido pela estrutura típica, a confirmar) precisa exibir o saldo de um token e atualizar assim que o token selecionado mudar no input (assistido com `watch('token')`).

## Alterações Cirúrgicas Propostas
1. **Adição de Estado Local**:
   - Importar o tipo `Balance` ou equivalente.
   - Adicionar `const [balances, setBalances] = useState<Balance[]>([]);`
2. **Fetch do Saldo**:
   - Implementar um `useEffect` que seja executado apenas quando `isOpen === true`.
   - Chamar `WalletService.getBalances()` (ou endpoint equivalente já usado em outros Drawers como o `SwapDrawer`).
   - Salvar o resultado no state `balances`.
3. **Renderização Opcional Segura**:
   - No JSX correspondente ao cabeçalho (ou acima do `Input` principal), encontrar a respectiva `Balance` usando o `token` observado do form.
   - Adicionar texto de "Disponível: X" formatado, utilizando os utilitários de formatação `formatCurrency` ou `formatToken` que já existem no projeto.

## Rastreabilidade das Modificações
- O efeito deve carregar e limpar saldos baseando-se no `isOpen` para não deixar dados antigos e evitar vazamentos de memória.
- Qualquer importação adicionada que não seja mais necessária (como utilitários anteriores ou mocks) será limpa (Guidelines: *Surgical Changes*).

## Passos para Validação (Testes)
1. Rodar `pnpm lint`, `pnpm typecheck` e `pnpm test` para assegurar a corretude do novo código inserido e das eventuais dependências em `WithdrawDrawer.tsx`.
2. Validar manualmente a transição de um token como BRL para BTC na mesma janela, assegurando que o formatador correspondente processou o valor do saldo obtido na API corretamente.
