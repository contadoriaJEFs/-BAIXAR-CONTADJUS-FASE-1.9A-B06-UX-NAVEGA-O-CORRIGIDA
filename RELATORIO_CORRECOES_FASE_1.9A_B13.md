# ContadJus — Fase 1.9A — B13

## Correção principal

Corrigida a primeira parcela das vincendas quando o tratamento do mês do ajuizamento é proporcional.

### Regra

Quando o ajuizamento ocorre no dia `D`, a parte vincenda do mês comercial é:

`(30 - D) / 30`

A DIB não altera esse denominador. Quando DIB e ajuizamento estão na mesma competência, a DIB já delimita a parte vencida; a vincenda corresponde aos dias posteriores ao ajuizamento até o fim do mês comercial.

### Exemplo de teste

DIB: 20/08/2024  
Ajuizamento: 25/08/2024  
Base mensal: R$ 1.412,00

- Vencida: 5/30 = R$ 235,33
- Vincenda de agosto: 6/30 = R$ 282,40
- Com 13º em dezembro: R$ 1.882,67
- Total das 7 vincendas até 02/2025: R$ 9.437,07

## UX preservada

- Barra de ações do caso permanece comum às guias.
- Hierarquia tipográfica da Formação da Demanda permanece equalizada.
- Tipografia das tabelas da Guia 6 permanece alinhada às Guias 4 e 5.

## Observação

A correção anterior utilizava a fração de dias posteriores ao ajuizamento sobre o período ativo desde a DIB (`6/11`), produzindo R$ 770,18. Isso estava incorreto. A fração correta é `6/30`.
