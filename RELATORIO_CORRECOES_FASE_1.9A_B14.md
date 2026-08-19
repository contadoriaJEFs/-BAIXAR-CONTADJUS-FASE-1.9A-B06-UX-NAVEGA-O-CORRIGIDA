# CONTADJUS — Fase 1.9A B14

## Correção da fração da primeira parcela vincenda

Correção do caso de DIB e ajuizamento na mesma competência, com tratamento proporcional.

Para ajuizamento em 25/08, a parcela vincenda de agosto deve representar os dias 25 a 30 da competência comercial: 6/30 da base.

A função `guia6ObterFracaoVincendaMesDibAjuizamento()` foi alterada para calcular diretamente `(30 - diaAjuizamento) / 30`.

A função da parcela vencida permanece separada, pois utiliza a fração dos dias efetivamente devidos desde a DIB até a véspera do ajuizamento.

Teste-alvo:
- DIB: 20/08/2024
- Ajuizamento: 25/08/2024
- R$ 1.412,00
- Vencida agosto: R$ 235,33
- Vincenda agosto: R$ 282,40
- Vincendas totais com 13º: R$ 9.437,07
