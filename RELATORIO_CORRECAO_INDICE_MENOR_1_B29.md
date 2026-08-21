# B29 — Correção: índice acumulado inferior a 1,00

## Problema
Quando o coeficiente acumulado de uma competência ficava inferior a 1,00, o motor reduzia o valor da própria parcela. Exemplo: 07/2026 com coeficiente 0,999900 resultava em R$ 1.701,30 para uma diferença original de R$ 1.701,47.

## Regra implementada
- O coeficiente acumulado continua sendo calculado normalmente, inclusive quando inferior a 1,00.
- O índice inferior a 1,00 continua participando do acumulado e influenciando competências posteriores.
- O valor corrigido da própria competência não pode ficar abaixo do valor original da parcela.
- A mesma regra foi aplicada à memória da Guia 5 e ao cálculo mensal reutilizado pela Guia 6.
- Não foi criado nenhum piso ou ajuste sobre o coeficiente; somente sobre o valor monetário da parcela.

## Exemplo esperado
07/2026:
- coeficiente: 0,9999000000
- diferença original: R$ 1.701,47
- valor calculado pelo coeficiente: R$ 1.701,30
- valor corrigido exibido: **R$ 1.701,47**

O coeficiente 0,999900 permanece registrado e segue participando do acumulado.
