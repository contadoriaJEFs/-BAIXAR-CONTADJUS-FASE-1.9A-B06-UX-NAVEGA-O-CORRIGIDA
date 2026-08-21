# B32 — Comportamento diante de índice indisponível + INPC 07/2026

- Removido da seção Datas Processuais o seletor que parecia definir o termo final.
- Adicionado em Fonte dos Índices o parâmetro **Quando faltar índice para a competência final**:
  - Usar a última competência disponível (padrão);
  - Informar indisponibilidade e não calcular.
- A data de atualização permanece como a data final solicitada pelo usuário.
- Mantida compatibilidade de importação com o parâmetro legado `criterioCompetenciaFinal`.
- Atualizado `INPC 07/2026` em `data/indexadores.js` para `0.9999`.
