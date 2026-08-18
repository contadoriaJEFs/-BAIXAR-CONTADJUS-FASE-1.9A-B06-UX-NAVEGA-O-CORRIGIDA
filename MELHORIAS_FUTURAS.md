# MELHORIAS FUTURAS / BACKLOG

> Itens identificados durante homologação e desenvolvimento das Fases 1.7D1, 1.7D1A e 1.7D1B.

---

# Validação e Consistência de Dados

## Datas

- [ ] Validar DCB >= DIB.
- [ ] Validar DCB >= DIP quando ambas existirem.
- [ ] Validar ano mínimo aceitável para benefícios (ex.: >= 1988).
- [ ] Validar ano máximo aceitável (ex.: ano atual + 5).
- [ ] Impedir datas sintaticamente válidas, porém incompatíveis com o RGPS (ex.: 02/05/0545).
- [ ] Criar função única de validação cronológica para DIB, DIP e DCB.
- [ ] Exibir mensagens de erro padronizadas para inconsistências temporais.

## Benefícios Recebidos

- [ ] Validar coerência entre DIB, DIP e DCB antes de salvar o benefício.
- [ ] Destacar visualmente benefícios com dados inconsistentes.
- [ ] Impedir cálculo em lote quando houver benefícios inválidos.

---

# Guia 4 - Diferenças

## Compensação

- [ ] Permitir ocultar automaticamente colunas de benefícios recebidos sem impacto nas diferenças.
- [ ] Adicionar resumo individual por benefício recebido.
- [ ] Exibir total compensado por benefício recebido.
- [ ] Exibir total compensado por competência.
- [ ] Permitir filtro para exibir apenas competências com diferença.
- [ ] Permitir filtro para exibir apenas competências compensadas.
- [ ] Criar modo de auditoria da compensação.

## Edição Manual

- [ ] Exibir histórico de alterações por competência.
- [ ] Permitir restaurar uma célula específica.
- [ ] Permitir exportar relatório de alterações em PDF.
- [ ] Registrar data/hora das alterações manuais.

---

# Guia 3 - Benefícios Recebidos

## Experiência do Usuário

- [ ] Duplicar benefício recebido.
- [ ] Reordenar benefícios recebidos.
- [ ] Ordenação automática por DIB.
- [ ] Exibir resumo consolidado dos benefícios cadastrados.
- [ ] Exibir quantidade total de benefícios cadastrados.
- [ ] Destacar visualmente benefícios cessados.

## Evolução

- [ ] Exibir indicador do modo de evolução (RGPS ou SM).
- [ ] Exibir indicador do tratamento da DIP selecionado.
- [ ] Exibir resumo da memória sem necessidade de expandi-la.

---

# Abono Anual (13º) - Futura Fase 1.7D2

## Estrutura

- [ ] Implementar cálculo do Abono Anual devido.
- [ ] Implementar cálculo do Abono Anual recebido.
- [ ] Implementar compensação do Abono Anual.
- [ ] Implementar competências específicas de 13º.
- [ ] Permitir visualizar memória do Abono Anual.

## Regras

- [ ] Considerar proporcionalidade por DIB.
- [ ] Avaliar impacto da DIP no recebimento do 13º.
- [ ] Considerar DCB para encerramento do direito ao 13º.
- [ ] Respeitar benefícios sem direito a abono.
- [ ] Aplicar compensação entre 13º devido e recebido.

---

# Guia 4 - Apresentação

## Layout

- [ ] Ocultar automaticamente a coluna "Total Recebido" quando não houver benefício recebido.
- [ ] Permitir congelamento de colunas.
- [ ] Permitir exportação para Excel.
- [ ] Permitir exportação para CSV.
- [ ] Melhorar visualização em telas pequenas.

## Performance

- [ ] Virtualização da tabela para grandes períodos.
- [ ] Recalcular apenas competências alteradas.
- [ ] Reduzir recriação completa da tabela em pequenas alterações.

---

# Relatórios

## Relatório Técnico

- [ ] Relatório resumido.
- [ ] Relatório analítico completo.
- [ ] Relatório de compensações.
- [ ] Relatório de alterações manuais.
- [ ] Relatório de benefícios recebidos.

## Exportação

- [ ] Exportação PDF nativa.
- [ ] Exportação DOCX.
- [ ] Assinatura digital do relatório.
- [ ] Cabeçalho personalizável por unidade.

---

# Atualização Monetária

## Correção

- [ ] Implementar INPC.
- [ ] Implementar IPCA-E.
- [ ] Implementar SELIC.
- [ ] Implementar TR (quando aplicável).

## Juros

- [ ] Juros previdenciários históricos.
- [ ] Juros pela SELIC.
- [ ] Juros por período configurável.
- [ ] Memória detalhada dos juros.
      
## Pendências de UX da Guia 5

- [ ] Exibir indexador antes do período nos encadeamentos.
- [ ] Exibir nomes amigáveis dos indexadores.
- [ ] Exibir resumo textual do encadeamento semelhante à Fábrica de Cálculos.
- [ ] Revisar layout do painel de parâmetros carregados.
- [ ] Consolidar informações de períodos e índices em formato mais legível ao usuário.

---

# Acordo e Renúncia

- [ ] Aplicação efetiva do percentual de acordo.
- [ ] Aplicação efetiva da renúncia.
- [ ] Limitação automática por teto definido.
- [ ] Simulação de múltiplos cenários de acordo.

---

# Auditoria e Diagnóstico

- [ ] Modo auditoria.
- [ ] Log interno de cálculos.
- [ ] Relatório de inconsistências.
- [ ] Diagnóstico automático de dados inválidos.
- [ ] Ferramenta de comparação entre versões do cálculo.

---

# Melhorias Arquiteturais

- [ ] Centralizar todas as validações em módulo único.
- [ ] Padronizar uso de parseMoeda().
- [ ] Padronizar tratamento de datas.
- [ ] Criar suíte de testes automatizados.
- [ ] Criar cenários oficiais de homologação.
- [ ] Criar controle formal de versões e migrações JSON.

---

# Cenários Oficiais de Homologação

- [ ] Benefício previdenciário comum.
- [ ] Benefício assistencial.
- [ ] Benefício baseado em salário mínimo.
- [ ] Benefício cessado.
- [ ] Benefício transformado.
- [ ] DIP posterior à DIB.
- [ ] DIP vazia.
- [ ] DCB preenchida.
- [ ] Múltiplos benefícios recebidos.
- [ ] Compensação com acumulação de atrasados.
- [ ] Abono Anual.

