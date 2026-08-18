Perfeito, Patrick. Abaixo está um contexto completo e organizado do projeto, escrito justamente para você poder abrir outro chat, colar este texto e retomar o desenvolvimento sem perder arquitetura, decisões, fases, cuidados, escopo e pendências.

Contexto Completo do Projeto RGPS/INSS
1. Identidade geral do projeto

O projeto é um sistema web de cálculo de evolução de benefício RGPS/INSS, voltado à apuração de diferenças previdenciárias em contexto judicial ou administrativo.

O sistema atualmente é composto por uma página principal em index.html, folhas de estilo em css/styles.css, bases de dados em data/, e módulos JavaScript em js/.

A interface é organizada em guias:

1. Entradas
2. Evolução Devida
3. Benefícios Recebidos
4. Diferenças
5. Atualização
6. Acordo / Renúncia
7. Relatórios


A estrutura atual do index.html contém todas essas guias, com a Guia 5 já reordenada para exibir: Datas de Referência, Parâmetros de Correção Monetária, Parâmetros de Juros de Mora, Diferenças da Guia 4 e aviso de módulo em construção.

2. Objetivo macro do sistema

O sistema tem como objetivo:

Receber dados do processo e do benefício.
Evoluir a renda mensal devida.
Evoluir benefícios recebidos.
Apurar diferenças competência por competência.
Preparar a futura atualização monetária e juros sobre essas diferenças.
Gerar relatórios e preservar alterações manuais.

Até a fase atual, o sistema não calcula atualização monetária final, não calcula juros de mora, não calcula SELIC, não calcula taxa legal e não calcula valor atualizado final.

A Guia 5 está sendo preparada gradualmente para futuramente executar esse cálculo.

3. Arquitetura atual dos arquivos principais
3.1. index.html

Arquivo principal da interface.

Contém:

Estrutura das 7 guias.
Campos da Guia 1.
Tabelas da Guia 2, Guia 3 e Guia 4.
Estrutura da Guia 5.
Modais auxiliares.
Ordem de carregamento dos scripts.

A ordem de scripts ao final do arquivo está assim:

data/indices.jsscript>
data/indexadores.jsscript>
js/core.jsscript>
js/motor-evolucao.jsscript>
js/beneficios-recebidos.jsscript>
js/diferencas.jsscript>
js/json.jsscript>
js/relatorios.jsscript>
js/admin-encadeamentos.jsscript>
js/app.jsscript>


Essa ordem é importante porque data/indexadores.js precisa estar disponível antes de js/admin-encadeamentos.js.

3.2. css/styles.css

Arquivo de estilos gerais.

Contém:

Estilos de impressão.
Estilos das guias.
Estilos da memória de cálculo.
Estilos da Guia 4.
Zebra da tabela de diferenças.
Estilos do relatório.
Estilos da Guia 5 para tabela de diferenças importadas.
Correção visual do 13º/AAAA.

A regra atual do 13º é:

.linha-13 td:first-child {
    font-weight: 700;
    color: #1e40af;
}


Ou seja, somente o texto da competência fica azul/negrito. Não há mais fundo azul, borda azul, nem faixa inteira na linha.

A tabela da Guia 5 recebeu zebra discreta em:

#corpoDiferencasAtualizacao tr:nth-child(even) {
    background-color: #f8fafc;
}

#corpoDiferencasAtualizacao tr:nth-child(odd) {
    background-color: #ffffff;
}


Isso foi importante para evitar que a Guia 5 ficasse visualmente chapada.

3.3. js/admin-encadeamentos.js

Arquivo central das fases 1.8A a 1.8D.

Responsável por:

Modal administrativo oculto.
Criação de JSONs de parâmetros de atualização.
Importação de JSONs de parâmetros.
Exportação de JSONs de parâmetros.
Carregamento de JSONs de correção e juros na Guia 5.
Integração com window.INDEXADORES_ATUALIZACAO.
Coleta preparatória das diferenças da Guia 4.
Espelho das diferenças da Guia 4 na Guia 5.
Reset automático das diferenças importadas quando dados de origem são alterados.

O arquivo declara globais como:

window.parametrosCorrecaoAtual = null;
window.parametrosJurosAtual = null;
window.parametrosSelicAtual = null;
window.diferencasAtualizacaoAtual = null;


A função adminImportarJSON(json) está corrigida e não deve chamar adminAtualizarSelectsIndice() ao final, para não substituir índices incompatíveis preservados por auditoria.

3.4. data/indices.js

Base interna previdenciária.

Uso atual:

Reajustes previdenciários.
Salário mínimo.
Teto.
Motor de evolução do benefício.

Não deve ser misturada com a base de indexadores de atualização.

3.5. data/indexadores.js

Base criada na Fase 1.8B.

Uso esperado:

Correção monetária.
Juros de mora.
SELIC.
Taxa legal.
Futuro motor da Guia 5.

Expõe globalmente:

window.BASE_INDEXADORES_ATUALIZACAO
window.CATALOGO_INDEXADORES_ATUALIZACAO
window.INDEXADORES_ATUALIZACAO


A tela administrativa da 1.8C passou a usar window.INDEXADORES_ATUALIZACAO.

4. Histórico das fases relevantes
4.1. Fase 1.7D2

Implementou o cálculo do 13º salário na Guia 4.

Principais entregas:

Competências 13º/AAAA.
Cálculo de avos.
Opção de incluir 13º proporcional no ano final aberto.
Cálculo do 13º para benefício devido e benefícios recebidos.
Ajustes de restauração de competências.
Correção de recursão em relatorios.js.

Decisão visual importante:

O 13º deve ter apenas o texto da competência em azul/negrito.
Não deve haver destaque de linha inteira.


Essa decisão voltou a ser importante na Fase 1.8D, quando um destaque indevido foi reintroduzido e depois corrigido.

4.2. Fase 1.8A - Infraestrutura de Parâmetros de Atualização

Objetivo:

Criar a infraestrutura inicial da Guia 5 - Atualização.

Entregas:

Guia 5 criada.
Campos ocultos criterioCorrecao e criterioJuros preservados para compatibilidade com js/json.js.
Botões:
Carregar JSON de Correção
Carregar JSON de Juros
Modal administrativo oculto acessível por:
CTRL + SHIFT + E

Arquivo js/admin-encadeamentos.js.
Criação, validação, importação e exportação de JSONs independentes de parâmetros.
Suporte inicial a:
correcao_monetaria
juros_mora
selic, reservado
taxa_legal, reservado

Também foi criada a função preparatória:

coletarDiferencasParaAtualizacao()


Nesta fase, a Guia 5 ainda não calcula nada.

4.3. Fase 1.8B - Base de Indexadores de Atualização

Objetivo:

Criar uma base separada para indexadores de atualização, sem misturar com a base previdenciária.

Arquivo criado:

data/indexadores.js


Estruturas criadas:

BASE_INDEXADORES_ATUALIZACAO
CATALOGO_INDEXADORES_ATUALIZACAO
INDEXADORES_ATUALIZACAO


Exposição global:

window.BASE_INDEXADORES_ATUALIZACAO
window.CATALOGO_INDEXADORES_ATUALIZACAO
window.INDEXADORES_ATUALIZACAO


Incluídos dados iniciais ou estruturas vazias para:

INPC
IPCA-E
IPCA
IGP-DI
IGP-M
TR
IPC-R
IRSM
URV
OTN
ORTN
BTN
JUROS_MORA_1_AM
JUROS_MORA_05_AM
POUPANCA
TAXA_LEGAL
SELIC


Regra técnica fundamental para fase futura:

Os índices mensais em data/indexadores.js devem estar como fatores prontos para multiplicação.


Exemplo:

0,62%  →  1.0062
0,00%  →  1.0000
-0,14% →  0.9986


O motor futuro não deve converter percentuais.

4.4. Fase 1.8C - Integração da Tela Administrativa com a Base de Indexadores

Objetivo:

Fazer o modal administrativo consultar window.INDEXADORES_ATUALIZACAO em vez de usar listas fixas.

Arquivo principal alterado:

js/admin-encadeamentos.js


Criadas ou consolidadas funções:

adminObterIndicesDisponiveisPorTipo()
adminIndiceExisteNaBase()
adminIndiceCompativelComTipo()


Comportamento por tipo:

correcao_monetaria → mostra apenas índices de correção
juros_mora → mostra apenas índices de juros
selic → reservado
taxa_legal → reservado

Regra crítica de importação auditável

Na importação de JSON, índices incompatíveis ou inexistentes são preservados.

Exemplo:

{
  "tipoParametro": "juros_mora",
  "periodos": [
    {
      "indice": "INPC",
      "inicio": "01/2020",
      "fim": "12/2020"
    }
  ]
}


O modal deve mostrar:

INPC (incompatível com juros_mora)


E a exportação posterior deve manter:

"indice": "INPC"

Correção crítica na 1.8C

Foi removida a chamada indevida:

adminAtualizarSelectsIndice();


do final de:

adminImportarJSON(json)


Essa chamada não pode voltar.

Motivo:

No uso manual, índice incompatível pode ser substituído.
Na importação, índice incompatível deve ser preservado para auditoria.
4.5. Tutorial criado

Foi criado:

TUTORIAL_ADMIN_PARAMETROS.md


Conteúdo:

Finalidade do modal administrativo.
Acesso por CTRL + SHIFT + E.
Criação de JSON de correção.
Criação de JSON de juros.
Importação de JSON.
Diferença entre uso manual e importação.
Preservação de índices incompatíveis.
Preservação de índices inexistentes.
Regra dos fatores mensais em data/indexadores.js.
Roteiro de testes.
5. Fase 1.8D - Estado final homologado
Objetivo

Criar o espelho das diferenças da Guia 4 dentro da Guia 5.

A Guia 5 agora consegue importar da Guia 4:

Competência
Diferença Original


Sem calcular atualização monetária ainda.

5.1. Ordem final da Guia 5

A Guia 5 está organizada assim:

1. Datas de Referência
2. Parâmetros de Correção Monetária
3. Parâmetros de Juros de Mora
4. Diferenças da Guia 4
5. Aviso de módulo em construção


Essa ordem foi definida porque a tabela de diferenças pode ser grande e empurrava os parâmetros para baixo. Agora os parâmetros ficam antes da tabela.

5.2. Novos elementos da Guia 5

Foram adicionados:

btnImportarDiferencas
statusDiferencas
containerTabelaDiferencas
corpoDiferencasAtualizacao


Esses IDs permitem:

acionar a importação;
mostrar status;
exibir ou ocultar a tabela;
renderizar as linhas importadas.
5.3. Funções da Fase 1.8D

No admin-encadeamentos.js, foram adicionadas ou consolidadas:

formatarMoedaAtualizacao(valor)
renderizarDiferencasAtualizacao(dados)
importarDiferencasGuia4ParaAtualizacao()
limparDiferencasAtualizacao(mensagem)


Também foram expostas globalmente:

window.importarDiferencasGuia4ParaAtualizacao = importarDiferencasGuia4ParaAtualizacao;
window.limparDiferencasAtualizacao = limparDiferencasAtualizacao;


A função renderizarDiferencasAtualizacao(dados) renderiza a tabela da Guia 5 com competência e diferença original, preservando 13º/AAAA.

5.4. Reset automático das diferenças

Ao alterar dados nas Guias 1, 3 ou 4, a Guia 5 limpa automaticamente apenas as diferenças importadas.

Os listeners foram instalados em:

configurarListenerReset('guia-entradas', ['input', 'change']);
configurarListenerReset('guia-beneficios-recebidos', ['input', 'change']);
configurarListenerReset('guia-diferencas', ['input', 'change']);


Esse reset limpa:

window.diferencasAtualizacaoAtual = null;
#corpoDiferencasAtualizacao
#containerTabelaDiferencas
#statusDiferencas


Ele não limpa:

window.parametrosCorrecaoAtual
window.parametrosJurosAtual
window.parametrosSelicAtual
statusCorrecao
statusJuros


Mensagem exibida:

⚠️ Diferenças não importadas após alteração dos dados. Reimporte a Guia 4. Parâmetros de correção e juros mantidos.


Essa separação é muito importante para a próxima fase, porque o usuário pode manter os critérios de correção e juros carregados enquanto recalcula/reimporta diferenças.

5.5. Visual do 13º

A regra final é:

13º/AAAA deve ter apenas o texto da competência em azul/negrito.
Não deve ter fundo azul.
Não deve ter borda azul.
Não deve ter faixa na linha inteira.
Não deve quebrar a zebra.


CSS final:

.linha-13 td:first-child {
    font-weight: 700;
    color: #1e40af;
}


Na Guia 5, o 13º recebe a classe linha-13, mas a classe não aplica fundo ou borda.

6. Estado atual dos testes

Foram homologados:

Guia 5 aparece corretamente
Ordem da Guia 5 está correta
Parâmetros de correção e juros estão acima das diferenças
Importar Diferenças da Guia 4 funciona
Competências mensais importam corretamente
Competências 13º importam corretamente
Zebra visual da Guia 4 preservada
Zebra visual da Guia 5 aplicada
Reset automático limpa diferenças ao alterar dados
Reset automático preserva parâmetros de correção e juros
CTRL + SHIFT + E continua abrindo modal
JSON de correção continua carregando
JSON de juros continua carregando
Importar/exportar JSON do caso continua funcionando
Nenhum cálculo financeiro foi implementado

7. Decisões arquiteturais importantes
7.1. Guia 4 é fonte das diferenças

A Guia 4 calcula:

Competência
Benefício Devido
Benefícios Recebidos
Total Recebido
Diferença Devida


A Guia 5 não deve recalcular a Guia 4.

A Guia 5 apenas importa/espelha as diferenças já calculadas.

7.2. Guia 5 será a base da atualização

A Guia 5 deve usar:

Diferenças importadas da Guia 4
+
Parâmetros de correção monetária
+
Parâmetros de juros de mora
+
Data de atualização
+
Data de início dos juros


Mas por enquanto só importa e exibe diferenças.

7.3. Separação entre bases

Não misturar:

data/indices.js


com:

data/indexadores.js


Regra:

data/indices.js → previdenciário, salário mínimo, teto
data/indexadores.js → atualização monetária, juros, SELIC, taxa legal

7.4. JSON do caso não deve ser alterado ainda

A estrutura atual do JSON do caso permanece preservada.

Os JSONs de parâmetros de atualização são arquivos independentes.

7.5. Importação auditável

Nunca substituir silenciosamente índice importado incompatível.

Regra:

Uso manual → pode substituir incompatível
Importação JSON → preservar incompatível com aviso


Essa regra evita perda de auditoria.

8. Ideias registradas para fase futura de UX

Foi registrada para fase futura a ideia de um:

Módulo/Modal de Parâmetros de Exibição das Tabelas


Possíveis opções:

Aumentar fonte em 1 nível
Diminuir fonte em 1 nível
Aumentar contraste
Exibir linhas horizontais discretas
Exibir linhas verticais discretas em cinza médio-claro
Separadores anuais discretos
Separador abaixo do 13º/AAAA quando houver 13º
Separador abaixo de 12/AAAA quando não houver 13º
Configuração de cor do separador


Essa ideia não foi implementada ainda. Foi apenas registrada para fase futura.

9. Próxima fase definida

A próxima fase está definida como:

Fase 1.8E – Motor de Correção Monetária

Escopo recomendado da 1.8E

Começar somente com:

Correção monetária pura


Sem juros.

Sem SELIC.

Sem taxa legal.

Sem total final com juros.

Sem acordo/renúncia.

Sem honorários.

10. Escopo recomendado da Fase 1.8E

A 1.8E deve usar:

window.diferencasAtualizacaoAtual
window.parametrosCorrecaoAtual
window.INDEXADORES_ATUALIZACAO
dataAtualizacao2


E produzir, para cada competência:

Competência
Diferença Original
Índice de Correção Aplicado
Fator Acumulado
Diferença Corrigida


Tabela esperada na Guia 5, em fase futura:

Competência | Diferença Original | Índice | Fator Acumulado | Diferença Corrigida

11. Regra técnica da correção monetária

Os dados em data/indexadores.js devem ser fatores mensais.

Exemplos:

0,62%  →  1.0062
0,89%  →  1.0089
0,00%  →  1.0000
-0,14% →  0.9986


O motor deve multiplicar fatores.

Não converter percentual.

Não dividir por 100.

Não somar percentuais.

12. Cálculo conceitual da 1.8E

Para cada diferença importada:

1. Ler competência da diferença.
2. Identificar qual índice de correção monetária vale naquela competência conforme o JSON carregado.
3. Acumular os fatores mensais do índice entre a competência da diferença e a data de atualização.
4. Calcular:
   Diferença Corrigida = Diferença Original × Fator Acumulado
5. Exibir resultado.


A regra de inclusão/exclusão do mês inicial e mês final ainda precisa ser definida cuidadosamente antes de codificar.

Essa será uma das decisões mais sensíveis da 1.8E.

13. Arquivos que provavelmente serão alterados na 1.8E

Preferencialmente:

index.html
js/admin-encadeamentos.js
css/styles.css, se necessário


Evitar alterar:

js/diferencas.js
js/motor-evolucao.js
js/json.js
js/app.js
data/indices.js
data/indexadores.js


A base data/indexadores.js só deve ser alterada se for para adicionar dados reais de índices, não para mudar arquitetura.

14. Cuidados obrigatórios para a 1.8E

Não mexer em:

adminImportarJSON(json)


Não recolocar:

adminAtualizarSelectsIndice();


ao final da importação.

Não alterar a Guia 4.

Não alterar motor previdenciário.

Não recalcular diferenças na Guia 5.

Não alterar JSON do caso.

Não implementar juros junto com correção.

15. Mensagem curta para abrir outro chat

Se precisar abrir outro chat, você pode colar este resumo curto no começo:

Estou desenvolvendo um sistema web de cálculo de evolução de benefício RGPS/INSS. O projeto está na versão 3.4-alpha. Já concluí as fases 1.8A, 1.8B, 1.8C e 1.8D.

A Guia 5 foi criada para futura atualização monetária e juros. A base de indexadores fica em data/indexadores.js e expõe window.INDEXADORES_ATUALIZACAO. O modal administrativo fica em js/admin-encadeamentos.js e abre com CTRL + SHIFT + E. Ele cria/importa/exporta JSONs de parâmetros de correção e juros.

Na Fase 1.8C, o modal passou a usar window.INDEXADORES_ATUALIZACAO. Importante: adminImportarJSON(json) não pode chamar adminAtualizarSelectsIndice() ao final, porque índices incompatíveis importados devem ser preservados para auditoria.

Na Fase 1.8D, a Guia 5 passou a importar as diferenças da Guia 4 usando window.diferencasAtualizacaoAtual. Ela exibe Competência e Diferença Original. Se dados das Guias 1, 3 ou 4 mudarem, a Guia 5 limpa apenas as diferenças importadas, preservando parâmetros de correção e juros carregados.

A Guia 5 ainda não calcula correção monetária, juros, SELIC ou taxa legal. A próxima fase será a Fase 1.8E – Motor de Correção Monetária, começando apenas por correção monetária pura, sem juros.

16. Próximo passo recomendado

Agora que o backup será feito e a 1.8D está homologada, o próximo movimento seguro é:

1. Fazer commit/tag da 1.8D.
2. Abrir a Fase 1.8E.
3. Antes de pedir código, definir a regra de acumulação:
   - mês inicial entra?
   - mês da atualização entra?
   - como tratar 13º/AAAA?
   - como tratar índice ausente?
   - como tratar fator faltante?

Ponto mais sensível da próxima fase

A próxima fase não deve começar pelo código. Deve começar pela regra de acumulação. A decisão mais importante será definir exatamente o intervalo de fatores a multiplicar para cada competência, porque isso impacta diretamente o valor corrigido.
