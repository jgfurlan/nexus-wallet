# Technical Spec: Botão de Autopreenchimento de Dados no Drawer de Saque

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH83

---

## 1. Contexto
- O Drawer de Saque está localizado em [`WithdrawDrawer.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/drawers/WithdrawDrawer.tsx).
- Ele utiliza `react-hook-form` com validação de Zod (`withdrawalSchema`).
- O endereço de destino do PIX ou Criptomoeda passa por expressões regulares estritas de validação no frontend e backend.

---

## 2. Mudanças Propostas

### Mudanças nos Módulos

| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`apps/web/src/components/drawers/WithdrawDrawer.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/drawers/WithdrawDrawer.tsx) | Modificado | Adicionar botão "Autopreencher" que executa o método `setValue` do formulário com base no token atual. |

### Detalhes da Implementação de Autopreenchimento
Extrairemos o método `setValue` da chamada `useForm`:
```typescript
const { register, watch, handleSubmit, formState: { errors }, reset, setValue } = useForm<WithdrawalForm>({
  resolver: zodResolver(withdrawalSchema),
  defaultValues: {
    token: 'BRL',
  }
});
```

Criaremos uma função interna para lidar com o preenchimento automático:
```typescript
const handleAutofill = () => {
  const currentToken = watch('token');
  
  if (currentToken === 'BRL') {
    setValue('amount', '150.00', { shouldValidate: true });
    setValue('address', 'faucet@nexuswallet.com', { shouldValidate: true });
  } else if (currentToken === 'BTC') {
    setValue('amount', '0.005', { shouldValidate: true });
    setValue('address', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', { shouldValidate: true });
  } else if (currentToken === 'ETH') {
    setValue('amount', '0.05', { shouldValidate: true });
    setValue('address', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', { shouldValidate: true });
  }
};
```
*Nota: A opção `{ shouldValidate: true }` é crucial para forçar o formulário a re-executar as regras de validação do Zod, limpando mensagens de erro vermelhas exibidas caso os campos estivessem anteriormente vazios ou inválidos.*

### Interface Visual
Adicionaremos um botão secundário estilizado com a paleta do Rose Pine (ex: usando `lucide-react` com o ícone `Sparkles` ou `Wand2`) acima ou abaixo dos inputs de valor e endereço. O estilo seguirá o padrão:
```tsx
<Button
  type="button"
  variant="secondary"
  onClick={handleAutofill}
  className="w-full flex items-center justify-center gap-2 mb-4 border-dashed border-pine/30 hover:border-pine/60"
>
  <Sparkles className="w-4 h-4 text-pine" />
  Preencher Dados de Teste (Sandbox)
</Button>
```

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Obter `setValue` do `useForm` em [`WithdrawDrawer.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/drawers/WithdrawDrawer.tsx).
- [ ] Implementar a lógica da função `handleAutofill` com dados mocks válidos para cada moeda.
- [ ] Renderizar o botão estilizado no JSX de formulário.
- [ ] Executar localmente e validar o preenchimento automático para BRL, BTC e ETH.
- [ ] Rodar linters e typecheckers.

---

## 4. Testes e Validação

### Testes Manuais de Fumaça:
1. Abra o Drawer de Saque.
2. Com "BRL" selecionado, clique em "Preencher Dados de Teste".
3. Verifique que o valor muda para `150.00` e o endereço para `faucet@nexuswallet.com`.
4. Mude para "BTC", clique em preencher de novo. O valor deve virar `0.005` e o endereço o endereço Genesis do Bitcoin.
5. Remova um número de qualquer endereço e certifique-se de que a validação de erro funciona; ao clicar em preencher novamente, o erro deve sumir.
