# Tutorial – Tela Administrativa de Parâmetros de Atualização

## 1. Finalidade

A **Tela Administrativa de Parâmetros de Atualização** é uma área técnica/oculta do sistema destinada à criação, validação, importação e exportação de arquivos JSON de parâmetros de atualização.

Ela foi criada para preparar a futura **Guia 5 – Atualização**, permitindo definir os encadeamentos de:

- correção monetária;
- juros de mora;
- SELIC, em fase futura;
- taxa legal, em fase futura.

> **Importante:** esta tela administrativa **não realiza cálculo financeiro**. Ela apenas cria e valida arquivos JSON de parâmetros que serão usados posteriormente pelo motor de atualização.

---

## 2. Como acessar a tela administrativa

Para abrir a tela administrativa:

1. Abra o sistema normalmente no navegador.
2. Clique em uma área vazia da página, fora de campos de texto, caixas de seleção ou listas.
3. Pressione:

```text
CTRL + SHIFT + E


A tela administrativa será aberta em formato de modal com o título:

Text
Administração de Parâmetros de Atualização

Observação

O atalho pode não funcionar se o foco estiver dentro de:

input;
textarea;
select.

Nesse caso, clique em uma área vazia da página e tente novamente.

3. Arquivo responsável

A tela administrativa é controlada pelo arquivo:

Text
js/admin-encadeamentos.js


A partir da Fase 1.8C, os índices exibidos nos campos de seleção são carregados dinamicamente a partir de:

Javascript
window.INDEXADORES_ATUALIZACAO


Essa estrutura é criada pelo arquivo:

Text
data/indexadores.js

4. Relação com a base de indexadores

A base de indexadores da atualização fica em:

Text
data/indexadores.js


Ela expõe globalmente:

Javascript
window.BASE_INDEXADORES_ATUALIZACAO
window.CATALOGO_INDEXADORES_ATUALIZACAO
window.INDEXADORES_ATUALIZACAO


A tela administrativa consome window.INDEXADORES_ATUALIZACAO para preencher os índices disponíveis em cada tipo de parâmetro.

Separação importante

O arquivo:

Text
data/indices.js


continua reservado para:

reajustes previdenciários;
salário mínimo;
teto;
motor de evolução do benefício.

O arquivo:

Text
data/indexadores.js


fica reservado para:

correção monetária;
juros de mora;
SELIC;
taxa legal;
futura Guia 5.

As duas bases não devem ser misturadas.

5. Campos da tela administrativa
5.1. Tipo do parâmetro

Define a natureza do JSON que será criado.

Opções atuais:

Text
Correção Monetária
Juros de Mora


Opções reservadas para fases futuras:

Text
SELIC
Taxa Legal


O tipo é gravado no JSON como:

Json
"tipoParametro": "correcao_monetaria"


ou:

Json
"tipoParametro": "juros_mora"

5.2. Nome do encadeamento

Campo obrigatório.

Serve para identificar tecnicamente o critério criado.

Exemplos recomendados:

Text
MC2026-CONTJEF-CORRECAO-PREVID
MC2026-CONTJEF-JUROS-PREVID
TESTE-CORRECAO-18C
TESTE-JUROS-18C


O nome será gravado no JSON em:

Json
"nome": "MC2026-CONTJEF-CORRECAO-PREVID"

5.3. Descrição

Campo opcional, mas recomendado para fins de auditoria.

Exemplo:

Text
Manual/critério MC2026 - Contadoria JEF - Previdenciário. Correção monetária por IPCA-E até 12/2025 e INPC a partir de 01/2026.


A descrição será gravada no JSON em:

Json
"descricao": "Manual/critério MC2026 - Contadoria JEF - Previdenciário..."

5.4. Tabela de períodos

Cada linha da tabela representa um período de aplicação de determinado índice.

Campos da linha:

Text
Índice
Data Inicial
Data Final
Ação

Índice

O índice é selecionado a partir da base window.INDEXADORES_ATUALIZACAO.

O texto exibido pode aparecer em formato amigável:

Text
IPCA-E (IPCAE)
Juros de Mora 1% a.m. (JUROS_MORA_1_AM)


Mas o JSON exportado sempre grava o código técnico:

Json
"indice": "IPCAE"


ou:

Json
"indice": "JUROS_MORA_1_AM"

Data Inicial

Competência inicial do período, em formato:

Text
MM/AAAA


Exemplo:

Text
01/2020

Data Final

Competência final do período, em formato:

Text
MM/AAAA


Exemplo:

Text
12/2025


A data final pode ficar vazia em apenas um período, indicando período aberto.

Exemplo:

Text
01/2026 até aberto

6. Índices disponíveis por tipo

A partir da Fase 1.8C, os índices são filtrados conforme o tipo do parâmetro.

6.1. Correção Monetária

Quando o tipo selecionado for:

Text
Correção Monetária


são exibidos apenas indexadores com:

Javascript
tipo: "correcao_monetaria"


Exemplos:

Text
INPC (INPC)
IPCA-E (IPCAE)
IPCA (IPCA)
IGP-DI (IGPDI)
IGP-M (IGPM)
TR (TR)
IPC-R (IPC_R)
IRSM (IRSM)
URV (URV)
OTN (OTN)
ORTN (ORTN)
BTN (BTN)


Não devem aparecer índices de juros, como:

Text
JUROS_MORA_1_AM
JUROS_MORA_05_AM
POUPANCA

6.2. Juros de Mora

Quando o tipo selecionado for:

Text
Juros de Mora


são exibidos apenas indexadores com:

Javascript
tipo: "juros_mora"


Exemplos:

Text
Juros de Mora 1% a.m. (JUROS_MORA_1_AM)
Juros de Mora 0,5% a.m. (JUROS_MORA_05_AM)
Poupança (POUPANCA)


Não devem aparecer índices de correção monetária, como:

Text
INPC
IPCAE
IPCA
IGPDI

7. Como criar um JSON de correção monetária
Exemplo: IPCA-E até 12/2025 e INPC a partir de 01/2026
Abra a tela administrativa com:
Text
CTRL + SHIFT + E

Em Tipo do parâmetro, selecione:
Text
Correção Monetária

Em Nome do encadeamento, preencha:
Text
MC2026-CONTJEF-CORRECAO-PREVID

Em Descrição, preencha algo como:
Text
Manual/critério MC2026 - Contadoria JEF - Previdenciário. Correção monetária por IPCA-E até 12/2025 e INPC a partir de 01/2026.

Preencha os períodos:
Text
IPCAE | 01/2000 | 12/2025
INPC  | 01/2026 | vazio

Clique em:
Text
Validar Encadeamento

Se não houver erro, clique em:
Text
Exportar JSON

Exemplo de JSON exportado
Json
{
  "tipoArquivo": "parametros_atualizacao",
  "tipoParametro": "correcao_monetaria",
  "versao": "1.0",
  "nome": "MC2026-CONTJEF-CORRECAO-PREVID",
  "descricao": "Manual/critério MC2026 - Contadoria JEF - Previdenciário. Correção monetária por IPCA-E até 12/2025 e INPC a partir de 01/2026.",
  "dataCriacao": "30/07/2026",
  "indicesUtilizados": [
    "IPCAE",
    "INPC"
  ],
  "periodos": [
    {
      "indice": "IPCAE",
      "inicio": "01/2000",
      "fim": "12/2025"
    },
    {
      "indice": "INPC",
      "inicio": "01/2026",
      "fim": ""
    }
  ]
}

8. Como criar um JSON de juros de mora
Abra a tela administrativa com:
Text
CTRL + SHIFT + E

Em Tipo do parâmetro, selecione:
Text
Juros de Mora

Em Nome do encadeamento, preencha:
Text
MC2026-CONTJEF-JUROS-PREVID

Em Descrição, preencha algo como:
Text
Manual/critério MC2026 - Contadoria JEF - Previdenciário. Parâmetros de juros de mora.

Preencha os períodos, por exemplo:
Text
JUROS_MORA_1_AM | 01/2020 | 11/2025
JUROS_MORA_05_AM | 12/2025 | vazio

Clique em:
Text
Validar Encadeamento

Se não houver erro, clique em:
Text
Exportar JSON

Exemplo de JSON exportado
Json
{
  "tipoArquivo": "parametros_atualizacao",
  "tipoParametro": "juros_mora",
  "versao": "1.0",
  "nome": "MC2026-CONTJEF-JUROS-PREVID",
  "descricao": "Manual/critério MC2026 - Contadoria JEF - Previdenciário. Parâmetros de juros de mora.",
  "dataCriacao": "30/07/2026",
  "indicesUtilizados": [
    "JUROS_MORA_1_AM",
    "JUROS_MORA_05_AM"
  ],
  "periodos": [
    {
      "indice": "JUROS_MORA_1_AM",
      "inicio": "01/2020",
      "fim": "11/2025"
    },
    {
      "indice": "JUROS_MORA_05_AM",
      "inicio": "12/2025",
      "fim": ""
    }
  ]
}

9. Validações do modal

O modal valida os seguintes pontos:

nome do encadeamento obrigatório;
tipo do parâmetro obrigatório;
pelo menos um período informado;
índice obrigatório;
data inicial obrigatória;
data inicial em formato MM/AAAA;
data final em formato MM/AAAA, se preenchida;
data final não pode ser anterior à data inicial;
períodos não podem se sobrepor;
apenas um período pode ficar aberto, sem data final.
Exemplos de erro bloqueante
Text
Nome do encadeamento é obrigatório.

Text
Linha 1: Data inicial "13/2020" inválida.

Text
Linha 2: Período se sobrepõe ao anterior.

Text
Linha 2: Apenas um período pode estar aberto.


Erros bloqueantes impedem a exportação do JSON até que sejam corrigidos.

10. Avisos que não bloqueiam

Algumas situações geram aviso, mas não impedem a importação ou exportação.

10.1. Índice não cadastrado na base

Exemplo:

Text
XYZ (não cadastrado na base)


Isso ocorre quando um JSON contém um índice que não existe em:

Javascript
window.INDEXADORES_ATUALIZACAO


O sistema preserva o código original para fins de auditoria.

Exemplo exportado:

Json
"indice": "XYZ"

10.2. Índice incompatível com o tipo do parâmetro

Exemplo:

Text
INPC (incompatível com juros_mora)


Isso ocorre quando o índice existe na base, mas pertence a outro tipo.

Exemplo:

Text
Tipo do JSON: juros_mora
Índice informado: INPC
Tipo do INPC na base: correcao_monetaria


Nessa situação, o sistema preserva o índice importado para fins de auditoria.

Exemplo exportado:

Json
"indice": "INPC"

11. Diferença entre uso manual e importação

A Fase 1.8C diferencia dois fluxos.

11.1. Uso manual

Quando o usuário cria ou edita manualmente um encadeamento:

o select mostra apenas índices compatíveis com o tipo selecionado;
se o usuário mudar o tipo do parâmetro, índices incompatíveis que existem na base são substituídos pelo primeiro índice compatível.

Exemplo:

Text
Tipo original: Correção Monetária
Índice selecionado: INPC
Novo tipo: Juros de Mora
Resultado: INPC é substituído por um índice de juros, como JUROS_MORA_1_AM

11.2. Importação de JSON

Quando um JSON é importado:

índices inexistentes são preservados;
índices incompatíveis são preservados;
o sistema exibe aviso;
o JSON pode ser exportado novamente mantendo o código técnico original.

Exemplo:

Text
JSON importado:
tipoParametro = juros_mora
indice = INPC


Resultado no modal:

Text
INPC (incompatível com juros_mora)


Resultado se exportar sem alterar:

Json
"indice": "INPC"


Essa regra evita alteração silenciosa de arquivos antigos ou inconsistentes.

12. Como importar JSON existente
Abra o modal com:
Text
CTRL + SHIFT + E

Clique em:
Text
Importar JSON


Selecione o arquivo JSON.

O sistema preencherá:

tipo do parâmetro;
nome;
descrição;
períodos;
índices.

Se houver inconsistência, será exibido aviso.

Se desejar manter a auditoria, exporte novamente sem alterar os índices preservados.

13. Como carregar JSON na Guia 5

Depois de exportar um JSON de parâmetros, ele pode ser carregado na Guia 5 – Atualização.

13.1. JSON de correção monetária

Use o botão:

Text
Carregar JSON de Correção


O arquivo deve possuir:

Json
"tipoParametro": "correcao_monetaria"


Se carregar um JSON de juros nesse botão, o sistema exibirá:

Text
Este arquivo não é de correção monetária.

13.2. JSON de juros de mora

Use o botão:

Text
Carregar JSON de Juros


O arquivo deve possuir:

Json
"tipoParametro": "juros_mora"


Se carregar um JSON de correção nesse botão, o sistema exibirá:

Text
Este arquivo não é de juros de mora.

14. Mensagens esperadas na Guia 5

Ao carregar um JSON válido de correção:

Text
✅ Parâmetros de correção carregados com sucesso!
Nome: ...
Descrição: ...
Índices: ...
Períodos: ...


Ao carregar um JSON válido de juros:

Text
✅ Parâmetros de juros carregados com sucesso!
Nome: ...
Descrição: ...
Índices: ...
Períodos: ...


Se houver índice não cadastrado:

Text
⚠️ Atenção: índices não encontrados na base: XYZ


Se houver índice incompatível:

Text
⚠️ Atenção: índices incompatíveis com o tipo: INPC

15. O que esta tela não faz

A tela administrativa não calcula:

correção monetária;
juros de mora;
SELIC;
taxa legal;
fator acumulado;
valor corrigido;
valor atualizado final.

Ela apenas cria, valida, importa e exporta arquivos JSON de parâmetros.

O cálculo financeiro será implementado em fases futuras.

16. Regra técnica para os indexadores futuros

Para a futura fase de acumulação, a base data/indexadores.js deve guardar os valores como fatores mensais prontos para multiplicação.

Exemplos:

Text
0,62%  →  1.0062
0,89%  →  1.0089
0,44%  →  1.0044
0,00%  →  1.0000
-0,14% →  0.9986


Não lançar assim:

Javascript
"2026-05": 0.62


Nem assim:

Javascript
"2026-05": 0.0062


O correto é:

Javascript
"2026-05": 1.0062

Regra futura
Text
O motor de correção monetária não converterá percentuais.
O motor apenas multiplicará os fatores existentes em data/indexadores.js.

17. Boas práticas de uso
17.1. Sempre preencher descrição

Evite JSONs sem descrição. A descrição facilita auditoria e revisão futura.

17.2. Usar nomes técnicos padronizados

Exemplos:

Text
MC2026-CONTJEF-CORRECAO-PREVID
MC2026-CONTJEF-JUROS-PREVID

17.3. Validar antes de exportar

Sempre clique em:

Text
Validar Encadeamento


antes de clicar em:

Text
Exportar JSON

17.4. Não misturar tipos

Evite usar índice de correção em JSON de juros ou índice de juros em JSON de correção.

O sistema preserva incompatibilidades por auditoria, mas o ideal é manter os encadeamentos tecnicamente coerentes.

17.5. Conferir o JSON exportado

Após exportar, confira se os períodos e índices foram gravados corretamente.

Especialmente:

Json
"indice": "INPC"


ou:

Json
"indice": "JUROS_MORA_1_AM"

18. Roteiro de testes após alteração no modal

Sempre que o arquivo js/admin-encadeamentos.js for alterado, recomenda-se testar:

Abrir modal com CTRL + SHIFT + E.
Confirmar que Correção Monetária lista apenas índices de correção.
Confirmar que Juros de Mora lista apenas índices de juros.
Exportar JSON de correção com INPC.
Exportar JSON de juros com JUROS_MORA_1_AM.
Importar JSON de juros com índice INPC.
Confirmar que aparece INPC (incompatível com juros_mora).
Exportar sem alterar e confirmar que o JSON mantém "indice": "INPC".
Importar JSON com índice inexistente XYZ.
Confirmar que aparece XYZ (não cadastrado na base).
Exportar e confirmar que o JSON mantém "indice": "XYZ".
Testar carregamento de JSON na Guia 5.
Testar importação e exportação do JSON do caso.
Confirmar que a Guia 4 e o motor previdenciário continuam funcionando.
19. Critérios de homologação da Fase 1.8C

A Fase 1.8C pode ser considerada homologada quando:

o modal abrir normalmente por CTRL + SHIFT + E;
os índices forem carregados dinamicamente de window.INDEXADORES_ATUALIZACAO;
Correção Monetária listar apenas índices de correção;
Juros de Mora listar apenas índices de juros;
o JSON exportado mantiver códigos técnicos;
índices inexistentes forem preservados com aviso;
índices incompatíveis importados forem preservados com aviso;
a Guia 5 continuar carregando JSONs de correção e juros;
a exportação/importação do JSON do caso continuar funcionando;
a Guia 4 e o motor previdenciário não forem afetados;
nenhum cálculo financeiro tiver sido implementado nesta fase.
20. Estado atual da implementação

Até a Fase 1.8C, o fluxo esperado é:

Text
data/indexadores.js
        ↓
window.INDEXADORES_ATUALIZACAO
        ↓
Tela administrativa
        ↓
JSON de parâmetros
        ↓
Guia 5


A próxima etapa recomendada é:

Text
Fase 1.8D – Espelhar Competência e Diferença Devida da Guia 4 na Guia 5


Somente depois disso deverá ser implementado:

Text
Fase 1.8E – Motor de Correção Monetária e Acumulação dos Indexadores


''' path = Path('/mnt/data/TUTORIAL_ADMIN_PARAMETROS.md') path.write_text(content, encoding='utf-8') print(str(path))

Status: Success

Output: /mnt/data/TUTORIAL_ADMIN_PARAMETROS.md
