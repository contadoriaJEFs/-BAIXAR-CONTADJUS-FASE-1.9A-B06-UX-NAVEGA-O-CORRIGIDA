# ContadJus — Fase 1.9A B06

## Correções desta rodada

- Recalculo automático não muda mais a guia ativa.
- Alterações na Entrada não devem enviar automaticamente para a Guia 2.
- Alterações de parâmetros da Guia 5 não devem enviar automaticamente para a Guia 6.
- Data do ajuizamento na Guia 6 é sincronizada bidirecionalmente com a Guia 1.
- A data é carregada na Guia 6 na inicialização.
- Guia 6: bloco **Parcelas Vincendas** foi movido para imediatamente após **Valores até o Ajuizamento (Vencidas)** e antes de **Formação da Demanda**.
- Vencidas e vincendas passaram a usar totalizadores visualmente unificados, acima das respectivas parcelas.
- Totalizador das vincendas agora mostra Original, Corrigido, Juros, SELIC e Total.
- Removido o totalizador inferior isolado das vincendas.
- Mantida a correção anterior de piso/teto quando a memória de evolução está vazia.

## Testes a executar após publicação

1. Alterar DIB/RMI/data final na Guia 1: permanecer na Guia 1.
2. Alterar parâmetros na Guia 5: permanecer na Guia 5.
3. Alterar ajuizamento na Guia 1: conferir sincronização imediata na Guia 6.
4. Alterar ajuizamento na Guia 6: conferir sincronização imediata na Guia 1, sem navegação.
5. Confirmar ordem dos blocos na Guia 6: Vencidas → Vincendas → Formação da Demanda.
6. Confirmar totalizadores acima das tabelas e visual unificado.
7. Depois disso, retomar os testes funcionais de Até 12, 13º, Parcela Anual e piso/teto.

- Botões de navegação e ações receberam `type="button"` para impedir submissões implícitas.
- Importação de caso também sincroniza a data do ajuizamento na Guia 6.
