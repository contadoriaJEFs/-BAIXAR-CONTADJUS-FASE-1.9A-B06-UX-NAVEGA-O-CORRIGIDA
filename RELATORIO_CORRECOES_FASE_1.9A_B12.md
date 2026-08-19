# ContadJus — Fase 1.9A — B12

## Correções desta rodada

### 1. DIB e ajuizamento na mesma competência — vincenda proporcional

Corrigida a primeira competência das vincendas quando DIB e ajuizamento pertencem ao mesmo mês/ano e o tratamento é proporcional.

A evolução já fornece somente a parcela efetivamente devida desde a DIB. A fração posterior ao ajuizamento é aplicada sobre essa própria competência ativa, evitando calcular a fração sobre a mensalidade integral.

Exemplo:
- DIB: 20/08/2024
- Ajuizamento: 25/08/2024
- base mensal: R$ 1.412,00
- competência ativa: 11/30
- vencida: 5/30 = R$ 235,33
- vincenda: 6/30 = R$ 282,40

No cenário Até 12 + proporcional + 13º Sim + final 02/2025:
- vincendas esperadas: R$ 9.437,07.

A mesma lógica foi aplicada ao método 1 Parcela anual quando o cenário é equivalente.

### 2. UX — Formação da Demanda

Ajustada a hierarquia tipográfica de "Demanda no ajuizamento" para coincidir com o total das parcelas vincendas, preservando as cores existentes.

### 3. UX — tabelas

Padronizada a escala de corpo das tabelas da Guia 6 com as tabelas das Guias 4 e 5, mantendo cabeçalhos menores e as cores atuais.

### 4. UX — ações do caso

Exportar, Importar e Novo caso/Limpar foram movidos para uma barra comum imediatamente abaixo da navegação das guias, tornando as ações acessíveis a partir de todas as guias e ocupando menos espaço.

### 5. UX — Guia 1

Reduzidos espaçamentos e preenchimentos verticais dos blocos da Entrada, preservando a área de clique e a legibilidade.
