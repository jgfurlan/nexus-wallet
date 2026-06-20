# ADR 0013: Arquitetura de Temas (Claro/Escuro) com Variáveis CSS em RGB

## Status
Aprovada

## Contexto
O layout original do NexusWallet suportava exclusivamente um tema escuro com cores hexadecimais estáticas no arquivo de configuração do Tailwind CSS. Para otimizar a experiência do usuário, a acessibilidade e a consistência visual com a marca Nexus, foi solicitado o desenvolvimento de uma alternância completa de temas (Light/Dark) baseada na paleta Carmim (#b91c1c).

## Decisão
Optei por reestruturar a configuração de cores do Tailwind CSS utilizando variáveis CSS dinâmicas baseadas no formato de canais RGB separados por espaços (`rgb(var(--color-...) / <alpha-value>)`). Defini as variáveis no escopo `:root` para o tema escuro padrão e `:root[data-theme='light']` para o tema claro no arquivo `index.css`, gerenciando o estado ativo através de um `ThemeContext` no React que persiste a escolha do usuário no `localStorage`.

## Consequências
- **Positivas:** Permite alternar dinamicamente os temas apenas alterando o atributo `data-theme` da tag `html`, sem a necessidade de duplicar classes utilitárias no código JSX (como `dark:bg-slate-900`). O formato de canais separados por espaço permite que as classes de opacidade nativas do Tailwind (ex: `bg-pine/10`) continuem operando perfeitamente.
- **Negativas:** Requer uma definição mais complexa e verbosa no arquivo de configuração do Tailwind CSS para mapear as variáveis de ambiente CSS.
