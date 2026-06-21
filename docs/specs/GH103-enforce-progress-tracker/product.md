# Spec do Produto: GH103 - Enforce Progress Tracker Update

## 1. Visão Geral
Atualmente, a atualização do `progress-tracker.md` depende da disciplina humana ou do agente de IA seguindo o `CLAUDE.md`. Para evitar desvios no controle de estado do projeto (onde PRs são criados sem atualizar o rastreador), vamos implementar uma verificação obrigatória no CI.

## 2. Objetivos
- **Garantir Consistência:** Nenhuma Pull Request deve ser mesclada sem que o arquivo `docs/guidelines/progress-tracker.md` seja modificado (ex: alterando status para "Em Revisão").
- **Feedback Rápido:** Falhar o CI imediatamente se o arquivo não estiver nas alterações do PR, orientando o agente/desenvolvedor a seguir o fluxo arquitetural.

## 3. Comportamento Esperado
- Ao abrir ou atualizar um PR contra a branch `main`, um check no GitHub Actions (como parte do pipeline de CI) deve validar as alterações do commit.
- Se `docs/guidelines/progress-tracker.md` for alterado, o check passa (🟢).
- Se não for alterado, o check falha (🔴) com a mensagem: "Você deve atualizar o progress-tracker.md indicando o estado atual da sua tarefa antes de submeter o PR."
