# NXS-120: Tech Spec

## Contexto
O CI do GitHub estava estritamente bloqueando PRs que não alteravam `docs/guidelines/progress-tracker.md` devido à Action contida em `pr-guidelines.yml`.

## Alterações Cirúrgicas Propostas
1. Remover (deletar) o arquivo `.github/workflows/pr-guidelines.yml`.
2. Alterar `CLAUDE.md`:
   - Substituir a seção referente a "Máquina de Estados" e "Portão de Verificação" para descrever explicitamente o Fluxo 10/10.
   - Texto base: `Issue → Spec (branch) → Implementação → Testes Locais → Commit c/ Tracker → PR → CI → Merge → CD`.
3. Atualizar `progress-tracker.md` para incluir a conclusão desta tarefa (NXS-120).

## Rastreabilidade das Modificações
Todas as mudanças ocorrem nos domínios de diretrizes (`CLAUDE.md`) e DevOps (`.github/workflows/`). Nenhum código da aplicação Node/React é afetado, e o fluxo entra em vigor instantaneamente no próximo PR.

## Passos para Validação (Testes)
- Git tracking confirmará a exclusão da action.
- Uma vez mergeado, futuros PRs não apresentarão mais o passo "Enforce progress-tracker.md Update" nas checagens automáticas do GitHub.
