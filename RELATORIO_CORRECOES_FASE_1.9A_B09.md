# CONTADJUS — Fase 1.9A-B09

## Correção UX — validação da DIB durante digitação

### Problema observado
Ao digitar parcialmente a DIB (por exemplo, `15`), o sistema podia interpretar a entrada incompleta como inválida, exibir `DIB inválida` e deslocar a página até o painel de validação, deixando o campo DIB fora da área visual embora permanecesse com foco.

### Correção
- Recalculo automático não é executado enquanto a DIB não estiver em formato completo `DD/MM/AAAA` ou `MM/AAAA`.
- O `blur` da DIB também não dispara validação enquanto a entrada estiver incompleta.
- Mensagens de validação associadas a campo em edição não executam `scrollIntoView`.
- O campo em edição permanece visualmente acessível.
- A correção não altera a regra de cálculo da DIB; atua somente no momento e na forma de validação.

### Critérios de teste
1. Digitar `1`, `15`, `15/`, `15/0`, `15/05`, etc.: nenhuma mensagem global e nenhum scroll automático.
2. Sair do campo com valor incompleto: nenhuma validação de DIB inválida deve ser exibida.
3. Sair do campo com data completa válida: cálculo/validação normal, sem deslocamento indevido da tela.
4. Sair do campo com data completa inválida: mensagem de erro sem rolar a página para o painel.
5. Cálculo manual explícito continua podendo exibir validações normalmente.
