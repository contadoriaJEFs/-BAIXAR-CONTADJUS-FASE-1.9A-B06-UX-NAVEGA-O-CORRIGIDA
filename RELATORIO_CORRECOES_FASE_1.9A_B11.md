# ContadJus — Fase 1.9A — B11

## Correção desta rodada

Corrigida a partição da competência quando **DIB e Data do Ajuizamento estão no mesmo mês/ano** e o tratamento do mês do ajuizamento é **Proporcional**.

### Regra

A competência já contém apenas a parcela devida desde a DIB. Por isso, não se deve aplicar novamente a fração geral do ajuizamento sobre toda a competência.

Para mês comercial de 30 dias:

- dias vencidos: DIB até o dia anterior ao ajuizamento;
- dias vincendos: ajuizamento até o fim da competência comercial;
- a soma das duas partes corresponde exatamente à parcela devida desde a DIB.

### Exemplo de teste

DIB 20/08/2024, ajuizamento 25/08/2024:

- competência de agosto devida desde a DIB: 11/30;
- vencida: 5/30;
- vincenda: 6/30;
- base mensal: R$ 1.412,00;
- vencida: R$ 235,33;
- vincenda: R$ 282,40.

A alteração foi feita no motor da Guia 6, sem alterar a lógica já validada dos demais cenários.
