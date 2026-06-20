# Technical Spec: Inversão do Sentido do Drawer (Esquerda para Direita)

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH81

---

## 1. Contexto
O componente [Drawer.tsx](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/ui/Drawer.tsx) é o único local do sistema que implementa a estrutura visual e comportamental das gavetas de transação. Suas classes CSS (Tailwind) estão configuradas para o lado direito da tela.

---

## 2. Mudanças Propostas

### Mudanças nos Módulos

| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`apps/web/src/components/ui/Drawer.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/ui/Drawer.tsx) | Modificado | Alterar classes de posicionamento, arredondamento e transição de eixos. |

### Detalhes das Alterações de Classes no Drawer.tsx
Modificaremos a linha 39 no arquivo `Drawer.tsx` da seguinte forma:
- Subsituição do posicionamento horizontal: de `right-0` para `left-0`.
- Substituição das bordas arredondadas para desktop: de `md:rounded-l-2xl` para `md:rounded-r-2xl`.
- Substituição do estado inicial de tradução da transição: de `translate-x-full` para `-translate-x-full`.

**Código Antigo (Linhas 37 a 42):**
```tsx
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-[110] flex w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 ease-in-out md:rounded-l-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
```

**Código Novo (Linhas 37 a 42):**
```tsx
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-[110] flex w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 ease-in-out md:rounded-r-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
```

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Modificar o arquivo [`Drawer.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/ui/Drawer.tsx) com as novas classes Tailwind indicadas.
- [ ] Executar localmente e realizar testes visuais nas gavetas abertas a partir da Sidebar.
- [ ] Verificar compatibilidade de responsividade no Mobile.

---

## 4. Testes e Validação

### Testes Manuais de Fumaça:
1. Com a aplicação rodando localmente, clique em qualquer ação no menu lateral (ex: "Converter").
2. Certifique-se de que a gaveta desliza da esquerda para a direita.
3. Certifique-se de que os cantos arredondados aparecem do lado direito do painel da gaveta em telas de desktop.
4. Clique fora da gaveta (no backdrop) ou no botão `X` e verifique que ela desliza para a esquerda, ocultando-se totalmente fora da janela.
