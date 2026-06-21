# NXS-120: Implementar Fluxo Ideal de Desenvolvimento 10/10

## Declaração do Problema
O workflow "spec-driven" anterior causava gargalos no CI por obrigar a modificação de `progress-tracker.md` em etapas prematuras, além de não alinhar a sequência lógica de PRs. Foi estabelecido um "Fluxo Ideal 10/10" para substituir o atual.

## Fluxo 10/10:
`Issue → Spec (branch) → Implementação → Testes Locais → Commit c/ Tracker → PR → CI → Merge → CD`

## Invariantes Comportamentais Testáveis
1. **Regra de Workflow CI**: O arquivo `.github/workflows/pr-guidelines.yml` deve ser deletado.
2. **Atualização CLAUDE.md**: O arquivo `CLAUDE.md` deve refletir o novo fluxo. A etapa de transição e o tracker devem estar agrupados e claros antes de subir o PR.
3. **Registro de Alteração**: `progress-tracker.md` precisa ter essa issue marcada como concluída e listar NXS-120 no topo.
