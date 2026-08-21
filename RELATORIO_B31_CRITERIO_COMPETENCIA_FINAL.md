# B31 — Critério da competência final

## Objetivo
Transformar em parâmetro de entrada a decisão sobre a competência final da atualização, sem fixar datas no motor.

## Parâmetro
**Até qual competência calcular?**
- Última competência com índices disponíveis (padrão; preserva a B30).
- Até a data de atualização.

## Comportamento
- O critério padrão continua usando a disponibilidade real das séries mensais.
- A opção "Até a data de atualização" não aplica o corte automático da base.
- A data de atualização permanece dinâmica; nenhuma competência é codificada no motor.
- O JSON do caso passa a preservar o critério escolhido.
