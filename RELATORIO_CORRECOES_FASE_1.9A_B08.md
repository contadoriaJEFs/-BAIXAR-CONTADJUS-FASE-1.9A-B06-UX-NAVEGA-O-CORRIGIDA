# ContadJus — Fase 1.9A-B08

## Correções desta rodada

### 1. Método "1 Parcela anual"

Corrigido o cálculo do valor retornado pelo motor.

Antes, a fórmula utilizada era:

`parcela proporcional × 12`

Agora é:

`1ª parcela proporcional/integral + 11 parcelas integrais`

Exemplo com base de R$ 1.412,00 e ajuizamento em 15/08/2024:

- 1ª parcela: R$ 706,00
- 11 parcelas integrais: R$ 15.532,00
- total correto: R$ 16.238,00

A quantidade permanece 12 parcelas projetadas.

### 2. DIB durante a digitação

O recálculo automático continua silencioso enquanto o usuário digita uma data incompleta, evitando mensagens de erro transitórias e deslocamento da tela.

Ao sair do campo DIB (`blur`):

- a entrada é validada;
- o erro pode ser exibido sem `scrollIntoView`;
- a guia atual é preservada;
- o campo permanece na região visual do usuário.

### 3. Erros de recálculo automático

`executarCalculo({silencioso:true})` não exibe erro global nem navega para a Guia de Entradas. Isso evita que valores parciais durante edição interrompam o fluxo de preenchimento.

### Testes prioritários desta versão

1. 1 Parcela anual + proporcional, DIB 16/05/2024, ajuizamento 15/08/2024: vincendas devem totalizar R$ 16.238,00.
2. Alterar DIB para valor parcial, como `15`, durante a digitação: não deve ocorrer scroll para a mensagem de erro.
3. Sair do campo com DIB inválida: mensagem deve aparecer sem retirar o campo da área visível.
4. Completar a DIB válida: cálculo automático deve ocorrer sem troca de guia.
