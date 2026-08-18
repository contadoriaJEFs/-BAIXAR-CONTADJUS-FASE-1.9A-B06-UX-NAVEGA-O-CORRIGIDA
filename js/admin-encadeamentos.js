// =====================================================================
// ADMINISTRAÇÃO DE ENCADEAMENTOS – Fase 1.8F-F1 (AJUSTE DE POSICIONAMENTO)
// =====================================================================
// Inclui todas as funcionalidades da Fase 1.8F-E5B acrescidas de:
// - Coluna TOTAL na tabela (Valor Corrigido + Juros + SELIC)
// - Total Geral Atualizado no resumo
// - Remoção da coluna "Índice / Critério"
// - Exibição compacta dos status e encadeamentos em linha
// - Reorganização dos botões de modelos para o topo da guia
// - Encadeamentos posicionados acima da tabela (legenda)
// - Blocos de parâmetros recolhíveis (accordion)
// =====================================================================

// Inicialização segura das variáveis globais
if (window.parametrosCorrecaoAtual === undefined) {
    window.parametrosCorrecaoAtual = null;
}
if (window.parametrosJurosAtual === undefined) {
    window.parametrosJurosAtual = null;
}
if (window.parametrosSelicAtual === undefined) {
    window.parametrosSelicAtual = null;
}
if (window.diferencasAtualizacaoAtual === undefined) {
    window.diferencasAtualizacaoAtual = null;
}
if (window.resultadosAtualizacao === undefined) {
    window.resultadosAtualizacao = null;
}

// =====================================================================
// AUXILIARES
// =====================================================================

function adminCompetenciaParaNumero(str) {
    if (!str) return NaN;
    var partes = str.split('/');
    if (partes.length !== 2) return NaN;
    var mes = parseInt(partes[0], 10);
    var ano = parseInt(partes[1], 10);
    if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12 || ano < 1900) return NaN;
    return ano * 100 + mes;
}

function adminProximaCompetenciaNumero(num) {
    var ano = Math.floor(num / 100);
    var mes = num % 100;
    if (mes === 12) return (ano + 1) * 100 + 1;
    return ano * 100 + (mes + 1);
}

function adminParseValorBrasileiro(texto) {
    if (!texto) return 0;
    var limpo = texto
        .replace(/[^0-9,.-]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
    return parseFloat(limpo) || 0;
}

function adminSanitizarNomeArquivo(nome) {
    if (!nome || nome.trim() === '') return 'SEM-NOME';
    var semAcentos = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var comHifens = semAcentos.replace(/['’`´]/g, '-');
    var sanitizado = comHifens
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return sanitizado || 'SEM-NOME';
}

function adminGerarNomeArquivo(tipo, nome) {
    var nomeSanitizado = adminSanitizarNomeArquivo(nome);
    if (tipo === 'correcao_monetaria') {
        return 'CORRE-' + nomeSanitizado + '.corr';
    } else if (tipo === 'juros_selic') {
        return 'JUROS-' + nomeSanitizado + '.jur';
    }
    return 'parametros_' + tipo + '_' + nomeSanitizado + '.json';
}

function adminDataAtualFormatada() {
    var agora = new Date();
    var dia = String(agora.getDate()).padStart(2, '0');
    var mes = String(agora.getMonth() + 1).padStart(2, '0');
    var ano = agora.getFullYear();
    return dia + '/' + mes + '/' + ano;
}

// =====================================================================
// FUNÇÕES AUXILIARES PARA CATÁLOGO/BASE POR TIPO
// =====================================================================

function adminObterCatalogoPorTipo(tipo) {
    if (tipo === 'correcao_monetaria') {
        return window.CATALOGO_INDEXADORES_ATUALIZACAO || {};
    } else if (tipo === 'juros_mora' || tipo === 'selic') {
        return window.CATALOGO_INDEXADORES_JUROS || {};
    }
    return {};
}

function adminObterBasePorTipo(tipo) {
    if (tipo === 'correcao_monetaria') {
        return window.BASE_INDEXADORES_ATUALIZACAO || {};
    } else if (tipo === 'juros_mora' || tipo === 'selic') {
        return window.BASE_INDEXADORES_JUROS || {};
    }
    return {};
}

// =====================================================================
// FUNÇÕES AUXILIARES PARA VERIFICAÇÃO DE ÍNDICES
// =====================================================================

function adminIndiceExisteNaBase(codigo, tipo) {
    var catalogo = adminObterCatalogoPorTipo(tipo);
    return !!catalogo[codigo];
}

function adminIndiceCompativelComTipo(codigo, tipo) {
    var catalogo = adminObterCatalogoPorTipo(tipo);
    var item = catalogo[codigo];
    if (!item) return false;
    return item.tipo === tipo;
}

function adminObterIndicesDisponiveisPorTipo(tipo) {
    var catalogo = adminObterCatalogoPorTipo(tipo);
    var resultados = [];
    for (var chave in catalogo) {
        if (catalogo.hasOwnProperty(chave)) {
            var item = catalogo[chave];
            if (item.tipo === tipo) {
                resultados.push({
                    codigo: chave,
                    nome: item.nome || chave,
                    descricao: item.descricao || '',
                    termoInicialPadrao: item.termoInicialPadrao || null
                });
            }
        }
    }
    resultados.sort(function(a, b) {
        return a.nome.localeCompare(b.nome);
    });
    return resultados;
}

function adminVerificarBaseIndexadores() {
    if (!window.INDEXADORES_ATUALIZACAO) {
        adminExibirMensagem(
            'Aviso: base de indexadores não carregada. Verifique data/indexadores.js.',
            'warning'
        );
        return false;
    }
    return true;
}

// =====================================================================
// GERENCIAMENTO DO MODAL ADMINISTRATIVO
// =====================================================================

var adminModalCriado = false;
var adminEventosVinculados = false;
var adminTipoAtual = 'correcao_monetaria';

function criarModalAdmin() {
    if (document.getElementById('adminModal')) return;

    var overlay = document.createElement('div');
    overlay.id = 'adminModal';
    overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden modal-overlay';

    var modalContent = document.createElement('div');
    modalContent.className = 'bg-white p-6 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl';

    modalContent.innerHTML = `
        <h3 class="text-xl font-bold text-slate-800 mb-4">Administração de Parâmetros de Atualização</h3>

        <div id="adminMensagens" class="mb-4 p-3 rounded-md hidden"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo do parâmetro</label>
                <select id="adminTipoParametro" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="correcao_monetaria">Correção Monetária</option>
                    <option value="juros_selic">Juros e SELIC</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Nome do encadeamento *</label>
                <input type="text" id="adminNome" placeholder="Ex: CJF_PREVIDENCIARIO_2025" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            </div>
        </div>

        <div class="mb-4">
            <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Descrição (opcional)</label>
            <textarea id="adminDescricao" rows="2" placeholder="Breve descrição do encadeamento..." class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"></textarea>
        </div>

        <!-- SEÇÃO CORREÇÃO MONETÁRIA -->
        <div id="adminSeccaoCorrecao" class="mb-4">
            <div class="flex justify-between items-center mb-2">
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Encadeamento de Correção Monetária</h4>
                <button type="button" id="adminAdicionarLinhaCorrecao" class="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition">+ Adicionar Linha</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse">
                    <thead>
                        <tr class="bg-slate-100 text-slate-600 text-xs uppercase">
                            <th class="p-2 text-left">Índice</th>
                            <th class="p-2 text-left">Data Inicial</th>
                            <th class="p-2 text-left">Data Final</th>
                            <th class="p-2 text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody id="adminTabelaPeriodosCorrecao">
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SEÇÃO JUROS E SELIC -->
        <div id="adminSeccaoJurosSelic" class="mb-4" style="display:none;">
            <!-- Juros -->
            <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Encadeamento de Juros de Mora</h4>
                    <button type="button" id="adminAdicionarLinhaJuros" class="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition">+ Adicionar Linha de Juros</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm border-collapse">
                        <thead>
                            <tr class="bg-slate-100 text-slate-600 text-xs uppercase">
                                <th class="p-2 text-left">Índice</th>
                                <th class="p-2 text-left">Data Inicial</th>
                                <th class="p-2 text-left">Data Final</th>
                                <th class="p-2 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody id="adminTabelaPeriodosJuros">
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- SELIC -->
            <div>
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Encadeamento SELIC</h4>
                    <button type="button" id="adminAdicionarLinhaSelic" class="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition">+ Adicionar Linha SELIC</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm border-collapse">
                        <thead>
                            <tr class="bg-slate-100 text-slate-600 text-xs uppercase">
                                <th class="p-2 text-left">Índice</th>
                                <th class="p-2 text-left">Data Inicial</th>
                                <th class="p-2 text-left">Data Final</th>
                                <th class="p-2 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody id="adminTabelaPeriodosSelic">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="flex flex-wrap gap-3 mt-4 border-t border-slate-200 pt-4">
            <button type="button" id="adminValidar" class="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-semibold shadow transition">Validar Encadeamento</button>
            <button type="button" id="adminExportar" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold shadow transition">Exportar Arquivo</button>
            <button type="button" id="adminImportar" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-semibold shadow transition">Importar Arquivo</button>
            <button type="button" id="adminFechar" class="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-semibold transition">Fechar</button>
        </div>

        <input type="file" id="adminFileInput" accept=".corr,.jur,.json,application/json" class="hidden">
    `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    if (!window.INDEXADORES_ATUALIZACAO) {
        adminExibirMensagem(
            'Aviso: base de indexadores não carregada. Verifique data/indexadores.js.',
            'warning'
        );
    }

    adminAlternarSeccoes('correcao_monetaria');
    adminAdicionarLinhaPeriodo('correcao');

    if (!adminEventosVinculados) {
        vincularEventosModal();
        adminEventosVinculados = true;
    }

    adminModalCriado = true;
}

function adminAlternarSeccoes(tipo) {
    var seccaoCorrecao = document.getElementById('adminSeccaoCorrecao');
    var seccaoJurosSelic = document.getElementById('adminSeccaoJurosSelic');
    if (tipo === 'correcao_monetaria') {
        seccaoCorrecao.style.display = 'block';
        seccaoJurosSelic.style.display = 'none';
    } else if (tipo === 'juros_selic') {
        seccaoCorrecao.style.display = 'none';
        seccaoJurosSelic.style.display = 'block';
    }
}

// =====================================================================
// EVENTOS DO MODAL
// =====================================================================

function vincularEventosModal() {
    document.getElementById('adminFechar').addEventListener('click', function() {
        document.getElementById('adminModal').classList.add('hidden');
    });

    document.getElementById('adminModal').addEventListener('click', function(e) {
        if (e.target === this) this.classList.add('hidden');
    });

    document.getElementById('adminTipoParametro').addEventListener('change', function() {
        var novoTipo = this.value;
        adminTipoAtual = novoTipo;
        adminAlternarSeccoes(novoTipo);
    });

    document.getElementById('adminAdicionarLinhaCorrecao').addEventListener('click', function() {
        adminAdicionarLinhaPeriodo('correcao');
    });
    document.getElementById('adminAdicionarLinhaJuros').addEventListener('click', function() {
        adminAdicionarLinhaPeriodo('juros');
    });
    document.getElementById('adminAdicionarLinhaSelic').addEventListener('click', function() {
        adminAdicionarLinhaPeriodo('selic');
    });

    document.getElementById('adminValidar').addEventListener('click', function() {
        var dados = adminColetarDados();
        var resultado = adminValidarDados(dados);
        if (resultado.erros.length === 0) {
            var msg = '✅ Encadeamento válido!';
            if (resultado.avisos.length > 0) {
                msg += '\n⚠️ Avisos:\n' + resultado.avisos.join('\n');
            }
            adminExibirMensagem(msg, 'success');
        } else {
            var msg = '❌ Erros:\n' + resultado.erros.join('\n');
            if (resultado.avisos.length > 0) {
                msg += '\n⚠️ Avisos:\n' + resultado.avisos.join('\n');
            }
            adminExibirMensagem(msg, 'error');
        }
    });

    document.getElementById('adminExportar').addEventListener('click', function() {
        var dados = adminColetarDados();
        var resultado = adminValidarDados(dados);
        if (resultado.erros.length > 0) {
            var msg = '❌ Não é possível exportar:\n' + resultado.erros.join('\n');
            if (resultado.avisos.length > 0) {
                msg += '\n⚠️ Avisos:\n' + resultado.avisos.join('\n');
            }
            adminExibirMensagem(msg, 'error');
            return;
        }
        adminExportarJSON(dados);
    });

    document.getElementById('adminImportar').addEventListener('click', function() {
        document.getElementById('adminFileInput').click();
    });

    document.getElementById('adminFileInput').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            try {
                var json = JSON.parse(ev.target.result);
                adminImportarJSON(json);
            } catch (err) {
                adminExibirMensagem('❌ Erro ao ler o arquivo: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        this.value = '';
    });
}

// =====================================================================
// FUNÇÕES DE LINHAS DA TABELA DE PERÍODOS (GENERICAS)
// =====================================================================

function adminObterIndicesDisponiveisParaTabela(tipoTabela) {
    var tipoParametro = '';
    if (tipoTabela === 'correcao') tipoParametro = 'correcao_monetaria';
    else if (tipoTabela === 'juros') tipoParametro = 'juros_mora';
    else if (tipoTabela === 'selic') tipoParametro = 'selic';
    return adminObterIndicesDisponiveisPorTipo(tipoParametro);
}

function adminCriarSelectIndiceParaTabela(tipoTabela, valorAtual, preservarIncompativel) {
    preservarIncompativel = preservarIncompativel || false;
    var tipoParametro = '';
    if (tipoTabela === 'correcao') tipoParametro = 'correcao_monetaria';
    else if (tipoTabela === 'juros') tipoParametro = 'juros_mora';
    else if (tipoTabela === 'selic') tipoParametro = 'selic';

    var indices = adminObterIndicesDisponiveisPorTipo(tipoParametro);
    var html = '<select class="admin-select-indice w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" data-tipo-tabela="' + tipoTabela + '">';

    var existeNaBase = adminIndiceExisteNaBase(valorAtual, tipoParametro);
    var compativel = adminIndiceCompativelComTipo(valorAtual, tipoParametro);

    if (preservarIncompativel && valorAtual && existeNaBase && !compativel) {
        html += '<option value="' + valorAtual + '" selected>' + valorAtual + ' (incompatível com ' + tipoParametro + ')</option>';
    }

    if (valorAtual && !existeNaBase) {
        html += '<option value="' + valorAtual + '" selected>' + valorAtual + ' (não cadastrado na base)</option>';
    }

    if (indices.length === 0) {
        html += '<option value="">-- Nenhum índice disponível --</option>';
    } else {
        indices.forEach(function(item) {
            var selected = (item.codigo === valorAtual && compativel) ? 'selected' : '';
            var label = item.nome + ' (' + item.codigo + ')';
            html += '<option value="' + item.codigo + '" ' + selected + '>' + label + '</option>';
        });
    }

    html += '</select>';
    return html;
}

function adminAdicionarLinhaPeriodo(tipoTabela, indice, inicio, fim, preservarIncompativel) {
    preservarIncompativel = preservarIncompativel || false;
    var tbodyId = '';
    if (tipoTabela === 'correcao') tbodyId = 'adminTabelaPeriodosCorrecao';
    else if (tipoTabela === 'juros') tbodyId = 'adminTabelaPeriodosJuros';
    else if (tipoTabela === 'selic') tbodyId = 'adminTabelaPeriodosSelic';
    else return;

    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    var linhas = tbody.querySelectorAll('tr');
    var ultimoFim = null;
    if (linhas.length > 0) {
        var ultimaLinha = linhas[linhas.length - 1];
        var fimInput = ultimaLinha.querySelector('.admin-data-fim');
        if (fimInput && fimInput.value.trim() !== '') {
            var fimNum = adminCompetenciaParaNumero(fimInput.value.trim());
            if (!isNaN(fimNum)) {
                var proxNum = adminProximaCompetenciaNumero(fimNum);
                var ano = Math.floor(proxNum / 100);
                var mes = proxNum % 100;
                ultimoFim = String(mes).padStart(2, '0') + '/' + ano;
            }
        }
    }

    if (!inicio && ultimoFim) {
        inicio = ultimoFim;
    }

    var tr = document.createElement('tr');
    tr.className = 'border-b border-slate-200';

    var selectIndice = adminCriarSelectIndiceParaTabela(tipoTabela, indice || '', preservarIncompativel);

    tr.innerHTML = `
        <td class="p-2">${selectIndice}</td>
        <td class="p-2"><input type="text" class="admin-data-inicio w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MM/AAAA" value="${inicio || ''}"></td>
        <td class="p-2"><input type="text" class="admin-data-fim w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MM/AAAA ou vazio" value="${fim || ''}"></td>
        <td class="p-2 text-center"><button type="button" class="admin-remover-linha text-red-600 hover:text-red-800 text-xs font-bold">✕</button></td>
    `;

    tbody.appendChild(tr);

    tr.querySelector('.admin-remover-linha').addEventListener('click', function() {
        tr.remove();
    });

    tr.querySelectorAll('.admin-data-inicio, .admin-data-fim').forEach(function(input) {
        input.addEventListener('input', function() {
            var v = this.value.replace(/\D/g, '');
            if (v.length > 6) v = v.substring(0, 6);
            if (v.length >= 3) {
                this.value = v.substring(0, 2) + '/' + v.substring(2);
            } else {
                this.value = v;
            }
        });
    });

    var selectElement = tr.querySelector('.admin-select-indice');
    var inicioInput = tr.querySelector('.admin-data-inicio');
    if (selectElement && inicioInput) {
        selectElement.addEventListener('change', function() {
            var selectedOption = this.options[this.selectedIndex];
            var termoPadrao = selectedOption ? selectedOption.getAttribute('data-termo-padrao') : null;
            if (termoPadrao && !inicioInput.value.trim()) {
                inicioInput.value = termoPadrao;
            }
        });
        setTimeout(function() {
            var selectedOption = selectElement.options[selectElement.selectedIndex];
            var termoPadrao = selectedOption ? selectedOption.getAttribute('data-termo-padrao') : null;
            if (termoPadrao && !inicioInput.value.trim()) {
                inicioInput.value = termoPadrao;
            }
        }, 50);
    }
}

function adminAtualizarSelectsIndice() {
    // mantido para compatibilidade
}

// =====================================================================
// COLETA E VALIDAÇÃO DOS DADOS DO ADMIN
// =====================================================================

function adminColetarDados() {
    var tipo = document.getElementById('adminTipoParametro').value;
    var nome = document.getElementById('adminNome').value.trim();
    var descricao = document.getElementById('adminDescricao').value.trim();

    if (tipo === 'correcao_monetaria') {
        var periodosCorrecao = adminColetarPeriodosDaTabela('adminTabelaPeriodosCorrecao');
        return {
            tipo: tipo,
            nome: nome,
            descricao: descricao,
            periodos: periodosCorrecao,
            juros: null,
            selic: null
        };
    } else if (tipo === 'juros_selic') {
        var periodosJuros = adminColetarPeriodosDaTabela('adminTabelaPeriodosJuros');
        var periodosSelic = adminColetarPeriodosDaTabela('adminTabelaPeriodosSelic');
        return {
            tipo: tipo,
            nome: nome,
            descricao: descricao,
            periodos: [],
            juros: {
                tipoParametro: 'juros_mora',
                periodos: periodosJuros
            },
            selic: {
                tipoParametro: 'selic',
                periodos: periodosSelic
            }
        };
    }
    return null;
}

function adminColetarPeriodosDaTabela(tbodyId) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return [];
    var linhas = tbody.querySelectorAll('tr');
    var periodos = [];
    linhas.forEach(function(tr) {
        var indiceSelect = tr.querySelector('.admin-select-indice');
        var inicioInput = tr.querySelector('.admin-data-inicio');
        var fimInput = tr.querySelector('.admin-data-fim');
        if (!indiceSelect || !inicioInput) return;
        var indice = indiceSelect.value;
        var inicio = inicioInput.value.trim();
        var fim = fimInput.value.trim();
        periodos.push({ indice: indice, inicio: inicio, fim: fim });
    });
    return periodos;
}

function adminValidarDados(dados) {
    var erros = [];
    var avisos = [];

    if (!dados.nome) {
        erros.push('Nome do encadeamento é obrigatório.');
    }

    if (!dados.tipo) {
        erros.push('Tipo do parâmetro é obrigatório.');
    }

    if (dados.tipo === 'correcao_monetaria') {
        var resultCorrecao = adminValidarPeriodos(dados.periodos, 'correcao_monetaria');
        erros = erros.concat(resultCorrecao.erros);
        avisos = avisos.concat(resultCorrecao.avisos);
        if (dados.periodos.length === 0) {
            erros.push('Correção Monetária deve ter pelo menos um período.');
        }
    } else if (dados.tipo === 'juros_selic') {
        if (dados.juros && dados.juros.periodos && dados.juros.periodos.length > 0) {
            var resultJuros = adminValidarPeriodos(dados.juros.periodos, 'juros_mora');
            erros = erros.concat(resultJuros.erros);
            avisos = avisos.concat(resultJuros.avisos);
        }
        if (dados.selic && dados.selic.periodos && dados.selic.periodos.length > 0) {
            var resultSelic = adminValidarPeriodos(dados.selic.periodos, 'selic');
            erros = erros.concat(resultSelic.erros);
            avisos = avisos.concat(resultSelic.avisos);
        }

        var jurosVazio = !dados.juros || !dados.juros.periodos || dados.juros.periodos.length === 0;
        var selicVazio = !dados.selic || !dados.selic.periodos || dados.selic.periodos.length === 0;
        if (jurosVazio && selicVazio) {
            erros.push('Informe pelo menos um período de Juros de Mora ou SELIC.');
        }
    }

    return { erros: erros, avisos: avisos };
}

function adminValidarPeriodos(periodos, tipoParametro) {
    var erros = [];
    var avisos = [];
    if (!periodos || periodos.length === 0) {
        return { erros: erros, avisos: avisos };
    }

    var regexMMAAAA = /^\d{2}\/\d{4}$/;
    var periodosAbertos = 0;
    var periodoAnteriorFimNum = null;

    var periodosOrdenados = periodos.slice().sort(function(a, b) {
        return adminCompetenciaParaNumero(a.inicio) - adminCompetenciaParaNumero(b.inicio);
    });

    var catalogo = adminObterCatalogoPorTipo(tipoParametro);
    var baseDisponivel = Object.keys(catalogo).length > 0;

    for (var i = 0; i < periodosOrdenados.length; i++) {
        var p = periodosOrdenados[i];

        if (!p.indice) {
            erros.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Índice não selecionado.');
            continue;
        }

        if (baseDisponivel) {
            if (!adminIndiceExisteNaBase(p.indice, tipoParametro)) {
                avisos.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Índice "' + p.indice + '" não existe no catálogo do tipo "' + tipoParametro + '". Será mantido no JSON, mas pode não ser reconhecido futuramente.');
            } else {
                var tipoIndexador = catalogo[p.indice].tipo;
                if (tipoIndexador !== tipoParametro) {
                    avisos.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Índice "' + p.indice + '" pertence ao tipo "' + tipoIndexador + '", mas o encadeamento é do tipo "' + tipoParametro + '".');
                }
            }
        }

        if (!p.inicio || !regexMMAAAA.test(p.inicio)) {
            erros.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Data inicial "' + p.inicio + '" inválida. Use MM/AAAA.');
            continue;
        }
        var numInicio = adminCompetenciaParaNumero(p.inicio);
        if (isNaN(numInicio)) {
            erros.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Data inicial "' + p.inicio + '" inválida.');
            continue;
        }

        var numFim = null;
        if (p.fim) {
            if (!regexMMAAAA.test(p.fim)) {
                erros.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Data final "' + p.fim + '" inválida. Use MM/AAAA ou deixe vazio.');
                continue;
            }
            numFim = adminCompetenciaParaNumero(p.fim);
            if (isNaN(numFim)) {
                erros.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Data final "' + p.fim + '" inválida.');
                continue;
            }
            if (numFim < numInicio) {
                erros.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Data final anterior à data inicial.');
                continue;
            }
        } else {
            periodosAbertos++;
            if (periodosAbertos > 1) {
                erros.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Apenas um período pode estar aberto (sem data final).');
                continue;
            }
            numFim = Number.MAX_SAFE_INTEGER;
        }

        if (periodoAnteriorFimNum !== null && numInicio <= periodoAnteriorFimNum) {
            erros.push('Linha ' + (i+1) + ' (' + tipoParametro + '): Período se sobrepõe ao anterior.');
        }

        periodoAnteriorFimNum = numFim;
    }

    return { erros: erros, avisos: avisos };
}

function adminExibirMensagem(texto, tipo) {
    var div = document.getElementById('adminMensagens');
    if (!div) return;
    div.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700', 'bg-amber-100', 'text-amber-700');
    div.textContent = texto;
    div.style.whiteSpace = 'pre-wrap';

    if (tipo === 'success') {
        div.classList.add('bg-green-100', 'text-green-700');
    } else if (tipo === 'error') {
        div.classList.add('bg-red-100', 'text-red-700');
    } else if (tipo === 'warning') {
        div.classList.add('bg-amber-100', 'text-amber-700');
    }
}

// =====================================================================
// EXPORTAÇÃO DO JSON DE PARÂMETROS
// =====================================================================

function adminExportarJSON(dados) {
    if (dados.tipo === 'correcao_monetaria') {
        var periodosOrdenados = dados.periodos.slice().sort(function(a, b) {
            return adminCompetenciaParaNumero(a.inicio) - adminCompetenciaParaNumero(b.inicio);
        });
        var indices = [];
        periodosOrdenados.forEach(function(p) {
            if (p.indice && indices.indexOf(p.indice) === -1) {
                indices.push(p.indice);
            }
        });
        var jsonObj = {
            tipoArquivo: 'parametros_atualizacao',
            tipoParametro: 'correcao_monetaria',
            versao: '1.0',
            nome: dados.nome,
            descricao: dados.descricao || '',
            dataCriacao: adminDataAtualFormatada(),
            indicesUtilizados: indices,
            periodos: periodosOrdenados.map(function(p) {
                return { indice: p.indice, inicio: p.inicio, fim: p.fim || '' };
            })
        };
        var jsonStr = JSON.stringify(jsonObj, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        var nomeArquivo = adminGerarNomeArquivo('correcao_monetaria', dados.nome);
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        adminExibirMensagem('✅ Arquivo exportado com sucesso: ' + nomeArquivo, 'success');
    } else if (dados.tipo === 'juros_selic') {
        var jsonObj = {
            tipoArquivo: 'parametros_juros_selic',
            tipoParametro: 'juros_selic',
            versao: '1.0',
            nome: dados.nome,
            descricao: dados.descricao || '',
            dataCriacao: adminDataAtualFormatada(),
            juros: null,
            selic: null
        };

        if (dados.juros && dados.juros.periodos && dados.juros.periodos.length > 0) {
            var periodosJuros = dados.juros.periodos.slice().sort(function(a, b) {
                return adminCompetenciaParaNumero(a.inicio) - adminCompetenciaParaNumero(b.inicio);
            });
            var indicesJuros = [];
            periodosJuros.forEach(function(p) {
                if (p.indice && indicesJuros.indexOf(p.indice) === -1) {
                    indicesJuros.push(p.indice);
                }
            });
            jsonObj.juros = {
                tipoParametro: 'juros_mora',
                indicesUtilizados: indicesJuros,
                periodos: periodosJuros.map(function(p) {
                    return { indice: p.indice, inicio: p.inicio, fim: p.fim || '' };
                })
            };
        }

        if (dados.selic && dados.selic.periodos && dados.selic.periodos.length > 0) {
            var periodosSelic = dados.selic.periodos.slice().sort(function(a, b) {
                return adminCompetenciaParaNumero(a.inicio) - adminCompetenciaParaNumero(b.inicio);
            });
            var indicesSelic = [];
            periodosSelic.forEach(function(p) {
                if (p.indice && indicesSelic.indexOf(p.indice) === -1) {
                    indicesSelic.push(p.indice);
                }
            });
            jsonObj.selic = {
                tipoParametro: 'selic',
                indicesUtilizados: indicesSelic,
                periodos: periodosSelic.map(function(p) {
                    return { indice: p.indice, inicio: p.inicio, fim: p.fim || '' };
                })
            };
        }

        var jsonStr = JSON.stringify(jsonObj, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        var nomeArquivo = adminGerarNomeArquivo('juros_selic', dados.nome);
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        adminExibirMensagem('✅ Arquivo exportado com sucesso: ' + nomeArquivo, 'success');
    }
}

// =====================================================================
// IMPORTAÇÃO DE JSON NO MODAL ADMIN
// =====================================================================

function adminImportarJSON(json) {
    if (json.tipoArquivo === 'parametros_atualizacao') {
        if (!json.tipoParametro) {
            adminExibirMensagem('❌ JSON inválido: tipoParametro ausente.', 'error');
            return;
        }
        if (!json.nome) {
            adminExibirMensagem('❌ JSON inválido: nome ausente.', 'error');
            return;
        }
        if (!Array.isArray(json.periodos)) {
            adminExibirMensagem('❌ JSON inválido: períodos ausentes ou inválidos.', 'error');
            return;
        }

        if (json.tipoParametro === 'correcao_monetaria') {
            document.getElementById('adminTipoParametro').value = 'correcao_monetaria';
            adminTipoAtual = 'correcao_monetaria';
            adminAlternarSeccoes('correcao_monetaria');
            var tbodyCorrecao = document.getElementById('adminTabelaPeriodosCorrecao');
            tbodyCorrecao.innerHTML = '';
            json.periodos.forEach(function(p) {
                adminAdicionarLinhaPeriodo('correcao', p.indice, p.inicio, p.fim || '', true);
            });
            document.getElementById('adminNome').value = json.nome || '';
            document.getElementById('adminDescricao').value = json.descricao || '';
            adminExibirMensagem('✅ Arquivo de correção importado com sucesso.', 'success');
            limparResultadosAtualizacaoPreservandoDiferencas();
            atualizarEncadeamentosVisuais();
            return;
        } else if (json.tipoParametro === 'juros_mora') {
            document.getElementById('adminTipoParametro').value = 'juros_selic';
            adminTipoAtual = 'juros_selic';
            adminAlternarSeccoes('juros_selic');
            var tbodyJuros = document.getElementById('adminTabelaPeriodosJuros');
            tbodyJuros.innerHTML = '';
            var tbodySelic = document.getElementById('adminTabelaPeriodosSelic');
            tbodySelic.innerHTML = '';
            json.periodos.forEach(function(p) {
                adminAdicionarLinhaPeriodo('juros', p.indice, p.inicio, p.fim || '', true);
            });
            document.getElementById('adminNome').value = json.nome || '';
            document.getElementById('adminDescricao').value = json.descricao || '';
            adminExibirMensagem('✅ Arquivo de juros antigo importado com sucesso. (SELIC vazio)', 'success');
            limparResultadosAtualizacaoPreservandoDiferencas();
            atualizarEncadeamentosVisuais();
            return;
        } else if (json.tipoParametro === 'selic') {
            document.getElementById('adminTipoParametro').value = 'juros_selic';
            adminTipoAtual = 'juros_selic';
            adminAlternarSeccoes('juros_selic');
            var tbodyJuros = document.getElementById('adminTabelaPeriodosJuros');
            tbodyJuros.innerHTML = '';
            var tbodySelic = document.getElementById('adminTabelaPeriodosSelic');
            tbodySelic.innerHTML = '';
            json.periodos.forEach(function(p) {
                adminAdicionarLinhaPeriodo('selic', p.indice, p.inicio, p.fim || '', true);
            });
            document.getElementById('adminNome').value = json.nome || '';
            document.getElementById('adminDescricao').value = json.descricao || '';
            adminExibirMensagem('✅ Arquivo de SELIC antigo importado com sucesso. (Juros vazio)', 'success');
            limparResultadosAtualizacaoPreservandoDiferencas();
            atualizarEncadeamentosVisuais();
            return;
        } else {
            adminExibirMensagem('❌ Tipo de parâmetro não reconhecido.', 'error');
            return;
        }
    }

    if (json.tipoArquivo === 'parametros_juros_selic') {
        if (json.tipoParametro !== 'juros_selic') {
            adminExibirMensagem('❌ JSON inválido: tipo do pacote de Juros e SELIC incompatível.', 'error');
            return;
        }
        if (!json.nome) {
            adminExibirMensagem('❌ JSON inválido: nome ausente.', 'error');
            return;
        }

        if (json.juros !== null && json.juros !== undefined) {
            if (!Array.isArray(json.juros.periodos)) {
                adminExibirMensagem('❌ JSON inválido: períodos de juros ausentes ou inválidos.', 'error');
                return;
            }
        }
        if (json.selic !== null && json.selic !== undefined) {
            if (!Array.isArray(json.selic.periodos)) {
                adminExibirMensagem('❌ JSON inválido: períodos SELIC ausentes ou inválidos.', 'error');
                return;
            }
        }

        document.getElementById('adminTipoParametro').value = 'juros_selic';
        adminTipoAtual = 'juros_selic';
        adminAlternarSeccoes('juros_selic');

        var tbodyJuros = document.getElementById('adminTabelaPeriodosJuros');
        tbodyJuros.innerHTML = '';
        var tbodySelic = document.getElementById('adminTabelaPeriodosSelic');
        tbodySelic.innerHTML = '';

        if (json.juros && json.juros.periodos && json.juros.periodos.length > 0) {
            json.juros.periodos.forEach(function(p) {
                adminAdicionarLinhaPeriodo('juros', p.indice, p.inicio, p.fim || '', true);
            });
        }

        if (json.selic && json.selic.periodos && json.selic.periodos.length > 0) {
            json.selic.periodos.forEach(function(p) {
                adminAdicionarLinhaPeriodo('selic', p.indice, p.inicio, p.fim || '', true);
            });
        }

        document.getElementById('adminNome').value = json.nome || '';
        document.getElementById('adminDescricao').value = json.descricao || '';
        adminExibirMensagem('✅ Arquivo de Juros e SELIC importado com sucesso.', 'success');
        limparResultadosAtualizacaoPreservandoDiferencas();
        atualizarEncadeamentosVisuais();
        return;
    }

    adminExibirMensagem('❌ O arquivo não é um JSON de parâmetros reconhecido.', 'error');
}

// =====================================================================
// FUNÇÕES AUXILIARES PARA EXIBIÇÃO DOS PERÍODOS (Fase 1.8F-B4)
// =====================================================================

function adminObterNomeAmigavelIndice(codigo, tipoParametro) {
    if (!codigo) return codigo;
    var catalogo = adminObterCatalogoPorTipo(tipoParametro);
    if (catalogo && catalogo[codigo] && catalogo[codigo].nome) {
        return catalogo[codigo].nome;
    }
    return codigo;
}

function adminOrdenarPeriodosParaExibicao(periodos) {
    if (!periodos || !Array.isArray(periodos)) return [];
    var copia = periodos.slice();
    copia.sort(function(a, b) {
        return adminCompetenciaParaNumero(a.inicio) - adminCompetenciaParaNumero(b.inicio);
    });
    return copia;
}

function adminCriarBlocoPeriodosStatus(titulo, periodos, tipoParametro) {
    var container = document.createElement('div');
    container.className = 'mt-1 inline-flex flex-wrap gap-x-2 gap-y-1';

    if (!periodos || periodos.length === 0) {
        var nenhum = document.createElement('span');
        nenhum.className = 'text-xs text-slate-500';
        nenhum.textContent = 'Nenhum período definido.';
        container.appendChild(nenhum);
        return container;
    }

    var periodosOrdenados = adminOrdenarPeriodosParaExibicao(periodos);
    var wrapper = document.createElement('span');
    wrapper.className = 'inline-flex flex-wrap gap-x-2 gap-y-1';

    periodosOrdenados.forEach(function(p) {
        var item = document.createElement('span');
        item.className = 'inline-flex items-baseline whitespace-nowrap';

        var bullet = document.createElement('span');
        bullet.className = 'text-green-900 font-bold mr-1';
        bullet.textContent = '►';
        item.appendChild(bullet);

        var nome = document.createElement('span');
        nome.className = 'text-green-900 font-semibold';
        nome.textContent = adminObterNomeAmigavelIndice(p.indice, tipoParametro) + ':';
        item.appendChild(nome);

        var intervalo = document.createElement('span');
        intervalo.className = 'text-green-700 ml-1';
        if (p.fim && p.fim.trim() !== '') {
            intervalo.textContent = p.inicio + ' a ' + p.fim;
        } else {
            intervalo.textContent = p.inicio + ' em diante';
        }
        item.appendChild(intervalo);

        // Adiciona ponto e vírgula apenas se não for o último
        var ponto = document.createElement('span');
        ponto.textContent = ';';
        ponto.className = 'ml-1';
        item.appendChild(ponto);

        wrapper.appendChild(item);
    });

    container.appendChild(wrapper);
    return container;
}

// =====================================================================
// FUNÇÃO PARA GERAR OS ENCADEAMENTOS VISUAIS (LEGENDA ACIMA DA TABELA)
// =====================================================================
function atualizarEncadeamentosVisuais() {
    var container = document.getElementById('containerEncadeamentos');
    if (!container) return;

    // Limpa o container
    container.innerHTML = '';
    container.className = 'mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg';

    var temAlgum = false;
    var html = '';

    // Correção
    if (window.parametrosCorrecaoAtual && window.parametrosCorrecaoAtual.periodos && window.parametrosCorrecaoAtual.periodos.length > 0) {
        temAlgum = true;
        html += '<div class="text-sm font-semibold text-slate-700 mb-1">📈 Encadeamento Correção:</div>';
        html += '<div class="ml-4 text-xs flex flex-wrap gap-x-2 gap-y-1">';
        var periodosCorr = adminOrdenarPeriodosParaExibicao(window.parametrosCorrecaoAtual.periodos);
        periodosCorr.forEach(function(p, idx) {
            var nome = adminObterNomeAmigavelIndice(p.indice, 'correcao_monetaria');
            var intervalo = p.fim && p.fim.trim() !== '' ? p.inicio + ' a ' + p.fim : p.inicio + ' em diante';
            html += '<span class="inline-flex items-baseline whitespace-nowrap">';
            html += '<span class="text-green-900 font-bold mr-1">►</span>';
            html += '<span class="text-green-900 font-semibold">' + nome + ':</span>';
            html += '<span class="text-green-700 ml-1">' + intervalo + '</span>';
            if (idx < periodosCorr.length - 1) html += '<span class="ml-1">;</span>';
            html += '</span>';
        });
        html += '</div>';
    }

    // Juros
    if (window.parametrosJurosAtual && window.parametrosJurosAtual.periodos && window.parametrosJurosAtual.periodos.length > 0) {
        temAlgum = true;
        html += '<div class="text-sm font-semibold text-slate-700 mt-2 mb-1">📊 Encadeamento Juros:</div>';
        html += '<div class="ml-4 text-xs flex flex-wrap gap-x-2 gap-y-1">';
        var periodosJ = adminOrdenarPeriodosParaExibicao(window.parametrosJurosAtual.periodos);
        periodosJ.forEach(function(p, idx) {
            var nome = adminObterNomeAmigavelIndice(p.indice, 'juros_mora');
            var intervalo = p.fim && p.fim.trim() !== '' ? p.inicio + ' a ' + p.fim : p.inicio + ' em diante';
            html += '<span class="inline-flex items-baseline whitespace-nowrap">';
            html += '<span class="text-green-900 font-bold mr-1">►</span>';
            html += '<span class="text-green-900 font-semibold">' + nome + ':</span>';
            html += '<span class="text-green-700 ml-1">' + intervalo + '</span>';
            if (idx < periodosJ.length - 1) html += '<span class="ml-1">;</span>';
            html += '</span>';
        });
        html += '</div>';
    }

    // SELIC
    if (window.parametrosSelicAtual && window.parametrosSelicAtual.periodos && window.parametrosSelicAtual.periodos.length > 0) {
        temAlgum = true;
        html += '<div class="text-sm font-semibold text-slate-700 mt-2 mb-1">📉 Encadeamento SELIC:</div>';
        html += '<div class="ml-4 text-xs flex flex-wrap gap-x-2 gap-y-1">';
        var periodosS = adminOrdenarPeriodosParaExibicao(window.parametrosSelicAtual.periodos);
        periodosS.forEach(function(p, idx) {
            var nome = adminObterNomeAmigavelIndice(p.indice, 'selic');
            var intervalo = p.fim && p.fim.trim() !== '' ? p.inicio + ' a ' + p.fim : p.inicio + ' em diante';
            html += '<span class="inline-flex items-baseline whitespace-nowrap">';
            html += '<span class="text-green-900 font-bold mr-1">►</span>';
            html += '<span class="text-green-900 font-semibold">' + nome + ':</span>';
            html += '<span class="text-green-700 ml-1">' + intervalo + '</span>';
            if (idx < periodosS.length - 1) html += '<span class="ml-1">;</span>';
            html += '</span>';
        });
        html += '</div>';
    }

    // Alerta de vigência
    var limite = obterLimiteDoEncadeamento(
        window.parametrosCorrecaoAtual,
        window.parametrosJurosAtual,
        window.parametrosSelicAtual
    );
    if (limite) {
        temAlgum = true;
        html += '<div class="text-xs text-amber-600 mt-2">⚠️ Encadeamento oficial com vigência até ' + limite.ultimaCompetencia + ' (conforme Manual de Cálculos ' + limite.ultimaCompetencia.split('/')[1] + '). Datas posteriores podem não ser calculadas por inexistência de índices oficiais previstos no modelo.</div>';
    }

    if (temAlgum) {
        container.innerHTML = html;
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// =====================================================================
// FUNÇÃO adminAtualizarStatusDetalhado – versão compacta (sem encadeamentos)
// =====================================================================
function adminAtualizarStatusDetalhado(tipoEsperado, json, mensagemBase) {
    var statusId = (tipoEsperado === 'correcao_monetaria') ? 'statusCorrecao' : 'statusJurosSelic';
    var div = document.getElementById(statusId);
    if (!div) return;

    div.innerHTML = '';
    div.className = 'flex-1 min-w-0 text-sm p-2 rounded-md bg-green-100 text-green-700 flex flex-wrap items-center gap-x-2 gap-y-1';

    // Ícone e mensagem principal
    var msgEl = document.createElement('span');
    msgEl.className = 'font-semibold';
    msgEl.textContent = mensagemBase || '✅ Parâmetros carregados!';
    div.appendChild(msgEl);

    if (json && json.nome) {
        var nomeEl = document.createElement('span');
        nomeEl.textContent = ' | Nome: ' + json.nome;
        div.appendChild(nomeEl);
    }

    if (json && json.descricao) {
        var descEl = document.createElement('span');
        descEl.textContent = ' | Descrição: ' + json.descricao;
        div.appendChild(descEl);
    }

    if (tipoEsperado === 'correcao_monetaria') {
        var periodos = json.periodos || [];
        var indices = [];
        periodos.forEach(function(p) {
            if (p.indice && indices.indexOf(p.indice) === -1) {
                indices.push(p.indice);
            }
        });
        var indiceStr = indices.length > 0 ? indices.join(', ') : 'N/A';
        var infoEl = document.createElement('span');
        infoEl.textContent = ' | Índices: ' + indiceStr + ' | Períodos: ' + periodos.length;
        div.appendChild(infoEl);
    } else if (tipoEsperado === 'juros_selic') {
        var jurosPeriodos = (json.juros && json.juros.periodos) ? json.juros.periodos : [];
        var selicPeriodos = (json.selic && json.selic.periodos) ? json.selic.periodos : [];

        var jurosIndices = [];
        jurosPeriodos.forEach(function(p) {
            if (p.indice && jurosIndices.indexOf(p.indice) === -1) jurosIndices.push(p.indice);
        });
        var selicIndices = [];
        selicPeriodos.forEach(function(p) {
            if (p.indice && selicIndices.indexOf(p.indice) === -1) selicIndices.push(p.indice);
        });

        var infoEl = document.createElement('span');
        var parts = [];
        if (jurosPeriodos.length > 0) {
            parts.push('Juros: ' + jurosIndices.join(', ') + ' (' + jurosPeriodos.length + ' períodos)');
        }
        if (selicPeriodos.length > 0) {
            parts.push('SELIC: ' + selicIndices.join(', ') + ' (' + selicPeriodos.length + ' períodos)');
        }
        infoEl.textContent = ' | ' + parts.join(' | ');
        div.appendChild(infoEl);
    }
}

// =====================================================================
// FUNÇÃO PARA OBTER O LIMITE TEMPORAL DO ENCADEAMENTO (Fase 1.8F-E3)
// =====================================================================
function obterLimiteDoEncadeamento(parametrosCorrecao, parametrosJuros, parametrosSelic) {
    var ultimaCompetencia = null;
    var origem = null;
    var temPeriodoAberto = false;

    function examinarPeriodos(periodos, nomeOrigem) {
        if (!periodos || !Array.isArray(periodos) || periodos.length === 0) return;
        for (var i = 0; i < periodos.length; i++) {
            var p = periodos[i];
            if (!p.fim || p.fim.trim() === '') {
                temPeriodoAberto = true;
                return;
            }
            var numFim = adminCompetenciaParaNumero(p.fim);
            if (!isNaN(numFim)) {
                if (ultimaCompetencia === null || numFim > adminCompetenciaParaNumero(ultimaCompetencia)) {
                    ultimaCompetencia = p.fim;
                    origem = nomeOrigem;
                }
            }
        }
    }

    if (parametrosCorrecao && parametrosCorrecao.periodos) {
        examinarPeriodos(parametrosCorrecao.periodos, 'Correção Monetária');
    }
    if (parametrosJuros && parametrosJuros.periodos) {
        examinarPeriodos(parametrosJuros.periodos, 'Juros');
    }
    if (parametrosSelic && parametrosSelic.periodos) {
        examinarPeriodos(parametrosSelic.periodos, 'SELIC');
    }

    if (temPeriodoAberto) {
        return null;
    }

    if (ultimaCompetencia === null) {
        return null;
    }

    return {
        ultimaCompetencia: ultimaCompetencia,
        origem: origem
    };
}

// =====================================================================
// FUNÇÃO PARA CARREGAR PARÂMETROS NA GUIA 5
// =====================================================================

function adminCarregarParametroGuia5(file, tipoEsperado) {
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var json = JSON.parse(e.target.result);

            if (tipoEsperado === 'correcao_monetaria') {
                if (json.tipoArquivo !== 'parametros_atualizacao' ||
                    json.tipoParametro !== 'correcao_monetaria' ||
                    !json.nome ||
                    !Array.isArray(json.periodos)) {
                    adminExibirMensagemGuia5('O arquivo não é um JSON de correção monetária válido.', 'error', 'correcao_monetaria');
                    return;
                }
                window.parametrosCorrecaoAtual = json;
                adminAtualizarStatusDetalhado('correcao_monetaria', json, '✅ Parâmetros de correção carregados com sucesso!');
                atualizarBotoesAtualizacao();
                limparResultadosAtualizacaoPreservandoDiferencas();
                atualizarEncadeamentosVisuais();
                return;
            }

            if (json.tipoArquivo === 'parametros_juros_selic' && json.tipoParametro === 'juros_selic') {
                if (!json.nome) {
                    adminExibirMensagemGuia5('JSON inválido: nome ausente.', 'error', 'juros_selic');
                    return;
                }
                if (json.juros !== null && json.juros !== undefined && !Array.isArray(json.juros.periodos)) {
                    adminExibirMensagemGuia5('JSON inválido: períodos de juros ausentes ou inválidos.', 'error', 'juros_selic');
                    return;
                }
                if (json.selic !== null && json.selic !== undefined && !Array.isArray(json.selic.periodos)) {
                    adminExibirMensagemGuia5('JSON inválido: períodos SELIC ausentes ou inválidos.', 'error', 'juros_selic');
                    return;
                }

                var jurosObj = json.juros ? Object.assign({}, json.juros, {
                    nomePacote: json.nome || '',
                    descricaoPacote: json.descricao || '',
                    dataCriacaoPacote: json.dataCriacao || ''
                }) : null;

                var selicObj = json.selic ? Object.assign({}, json.selic, {
                    nomePacote: json.nome || '',
                    descricaoPacote: json.descricao || '',
                    dataCriacaoPacote: json.dataCriacao || ''
                }) : null;

                window.parametrosJurosAtual = jurosObj;
                window.parametrosSelicAtual = selicObj;

                var pacoteCompleto = {
                    nome: json.nome,
                    descricao: json.descricao || '',
                    juros: jurosObj,
                    selic: selicObj
                };
                adminAtualizarStatusDetalhado('juros_selic', pacoteCompleto, '✅ Parâmetros de Juros e SELIC carregados com sucesso!');
                limparResultadosAtualizacaoPreservandoDiferencas();
                atualizarEncadeamentosVisuais();
                return;
            }

            if (json.tipoArquivo === 'parametros_atualizacao') {
                if (json.tipoParametro === 'correcao_monetaria') {
                    adminExibirMensagemGuia5('Este arquivo é de correção monetária, não de juros/SELIC.', 'error', 'juros_selic');
                    return;
                } else if (json.tipoParametro === 'juros_mora') {
                    if (!json.nome || !Array.isArray(json.periodos)) {
                        adminExibirMensagemGuia5('JSON de juros inválido: períodos ausentes ou inválidos.', 'error', 'juros_selic');
                        return;
                    }
                    window.parametrosJurosAtual = json;
                    window.parametrosSelicAtual = null;
                    var pacoteAntigo = {
                        nome: json.nome,
                        descricao: json.descricao || '',
                        juros: json,
                        selic: null
                    };
                    adminAtualizarStatusDetalhado('juros_selic', pacoteAntigo, '✅ Parâmetros de juros (formato antigo) carregados.');
                    limparResultadosAtualizacaoPreservandoDiferencas();
                    atualizarEncadeamentosVisuais();
                    return;
                } else if (json.tipoParametro === 'selic') {
                    if (!json.nome || !Array.isArray(json.periodos)) {
                        adminExibirMensagemGuia5('JSON de SELIC inválido: períodos ausentes ou inválidos.', 'error', 'juros_selic');
                        return;
                    }
                    window.parametrosSelicAtual = json;
                    window.parametrosJurosAtual = null;
                    var pacoteAntigoSelic = {
                        nome: json.nome,
                        descricao: json.descricao || '',
                        juros: null,
                        selic: json
                    };
                    adminAtualizarStatusDetalhado('juros_selic', pacoteAntigoSelic, '✅ Parâmetros SELIC (formato antigo) carregados.');
                    limparResultadosAtualizacaoPreservandoDiferencas();
                    atualizarEncadeamentosVisuais();
                    return;
                }
            }

            adminExibirMensagemGuia5('Tipo de arquivo não reconhecido para Juros e SELIC.', 'error', 'juros_selic');

        } catch (err) {
            adminExibirMensagemGuia5('Erro ao ler o arquivo: ' + err.message, 'error', tipoEsperado);
        }
    };
    reader.readAsText(file);
}

function adminExibirMensagemGuia5(texto, tipo, tipoEsperado) {
    var statusId;
    if (tipoEsperado === 'correcao_monetaria') {
        statusId = 'statusCorrecao';
    } else {
        statusId = 'statusJurosSelic';
    }
    var div = document.getElementById(statusId);
    if (!div) return;

    div.innerHTML = '';
    div.className = 'flex-1 min-w-0 text-sm p-2 rounded-md';
    if (tipo === 'success') {
        div.className += ' bg-green-100 text-green-700';
    } else if (tipo === 'error') {
        div.className += ' bg-red-100 text-red-700';
    } else if (tipo === 'warning') {
        div.className += ' bg-amber-100 text-amber-700';
    } else {
        div.className += ' bg-slate-100 text-slate-600';
    }
    var p = document.createElement('p');
    p.textContent = texto;
    div.appendChild(p);
}

// =====================================================================
// LIMPAR DIFERENÇAS DA GUIA 5 (Fase 1.8F-A)
// =====================================================================

function limparDiferencasAtualizacao(mensagem) {
    window.diferencasAtualizacaoAtual = null;
    window.resultadosAtualizacao = null;

    var container = document.getElementById('containerTabelaDiferencas');
    var tbody = document.getElementById('corpoDiferencasAtualizacao');
    var resumo = document.getElementById('resumoAtualizacao');
    var totalOriginalEl = document.getElementById('totalOriginalAtualizacao');
    var totalCorrigidoEl = document.getElementById('totalCorrigidoAtualizacao');
    var totalJurosEl = document.getElementById('totalJurosAtualizacao');
    var totalSelicEl = document.getElementById('totalSelicAtualizacao');
    var totalGeralEl = document.getElementById('totalGeralAtualizacao');
    var status = document.getElementById('statusDiferencas');
    var statusAtualizacao = document.getElementById('statusAtualizacao');

    if (container) container.classList.add('hidden');
    if (resumo) resumo.classList.add('hidden');
    if (tbody) tbody.innerHTML = '';
    if (totalOriginalEl) totalOriginalEl.textContent = 'R$ 0,00';
    if (totalCorrigidoEl) totalCorrigidoEl.textContent = 'R$ 0,00';
    if (totalJurosEl) totalJurosEl.textContent = 'R$ 0,00';
    if (totalSelicEl) totalSelicEl.textContent = 'R$ 0,00';
    if (totalGeralEl) totalGeralEl.textContent = 'Total Geral Atualizado: R$ 0,00';

    if (status) {
        status.textContent = mensagem || 'Nenhuma diferença importada.';
        status.className = 'text-sm text-slate-500';
    }
    if (statusAtualizacao) {
        statusAtualizacao.textContent = 'Aguardando diferenças e parâmetros de correção.';
        statusAtualizacao.className = 'text-sm text-slate-500';
    }

    // Oculta encadeamentos
    var encContainer = document.getElementById('containerEncadeamentos');
    if (encContainer) encContainer.classList.add('hidden');

    atualizarBotoesAtualizacao();
}

// =====================================================================
// RESET AUTOMÁTICO DOS RESULTADOS (Fase 1.8F-E1)
// =====================================================================

function limparResultadosAtualizacaoPreservandoDiferencas() {
    window.resultadosAtualizacao = null;

    var container = document.getElementById('containerTabelaDiferencas');
    var tbody = document.getElementById('corpoDiferencasAtualizacao');
    var resumo = document.getElementById('resumoAtualizacao');
    var totalOriginalEl = document.getElementById('totalOriginalAtualizacao');
    var totalCorrigidoEl = document.getElementById('totalCorrigidoAtualizacao');
    var totalJurosEl = document.getElementById('totalJurosAtualizacao');
    var totalSelicEl = document.getElementById('totalSelicAtualizacao');
    var totalGeralEl = document.getElementById('totalGeralAtualizacao');
    var statusAtualizacao = document.getElementById('statusAtualizacao');

    if (container) container.classList.add('hidden');
    if (resumo) resumo.classList.add('hidden');
    if (tbody) tbody.innerHTML = '';
    if (totalOriginalEl) totalOriginalEl.textContent = 'R$ 0,00';
    if (totalCorrigidoEl) totalCorrigidoEl.textContent = 'R$ 0,00';
    if (totalJurosEl) totalJurosEl.textContent = 'R$ 0,00';
    if (totalSelicEl) totalSelicEl.textContent = 'R$ 0,00';
    if (totalGeralEl) totalGeralEl.textContent = 'Total Geral Atualizado: R$ 0,00';

    if (statusAtualizacao) {
        statusAtualizacao.textContent = 'Parâmetros alterados. Execute novamente o cálculo da atualização.';
        statusAtualizacao.className = 'text-sm text-amber-700';
    }
}

// =====================================================================
// COLETA DE DIFERENÇAS DA GUIA 4 (PREPARAÇÃO PARA FUTURO)
// =====================================================================

function coletarDiferencasParaAtualizacao() {
    var rows = document.querySelectorAll('#corpoDiferencas tr');
    var resultados = [];

    rows.forEach(function(tr) {
        var competencia = tr.dataset.competencia;
        if (!competencia) return;

        var diffEl = tr.querySelector('.diferenca-devida');
        if (!diffEl) return;

        var valorTexto = diffEl.textContent.trim();
        var valorNum = adminParseValorBrasileiro(valorTexto);
        if (isNaN(valorNum)) return;

        resultados.push({
            competencia: competencia,
            diferenca: valorNum
        });
    });

    return resultados;
}

// =====================================================================
// FUNÇÃO AUXILIAR PARA FORMATAÇÃO DE PERCENTUAIS (Fase 1.8F-B2)
// =====================================================================

function formatarPercentualAtualizacao(valor, casas) {
    if (casas === undefined || casas === null) {
        casas = 4;
    }

    if (
        valor === null ||
        valor === undefined ||
        !Number.isFinite(Number(valor))
    ) {
        return '-';
    }

    return Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    }) + '%';
}

// =====================================================================
// FASE 1.8D2 – CÁLCULO DE JUROS EM INTERVALO (CORRIGIDO + ESTACIONADO)
// =====================================================================

function guia5CalcularJurosIntervalo(item, inicioJurosISO, fimISO, parametrosJuros) {
    var competenciaISO = item.competenciaISO;
    var compNum = guia5ISOParaNumero(competenciaISO);
    var inicioNum = Math.max(compNum, guia5ISOParaNumero(inicioJurosISO));
    var inicioEfetivoISO = String(Math.floor(inicioNum / 100)) + '-' + String(inicioNum % 100).padStart(2, '0');
    var fimNum = guia5ISOParaNumero(fimISO);

    if (inicioNum > fimNum) {
        return {
            percentual: 0,
            valor: 0,
            criterios: [],
            meses: 0,
            detalhamento: []
        };
    }

    var cursor = inicioEfetivoISO;
    var criteriosJuros = [];
    var detalhamentoJuros = [];
    var totalTaxa = 0;
    var meses = 0;

    while (guia5ISOParaNumero(cursor) <= fimNum) {
        var periodo = guia5ObterPeriodoDoEncadeamento(parametrosJuros, cursor);
        if (!periodo) {
            break;
        }

        var taxa = guia5ObterTaxaJurosMensal(periodo.indice, cursor);

        // ===== CORREÇÃO: não incluir a taxa da competência igual a fimISO para índices legais =====
        if (cursor === fimISO && (periodo.indice === 'TAXA_LEGAL' || periodo.indice === 'TAXA_LEGAL_PREVIDENCIARIA')) {
            // Não soma esta taxa
        } else {
            totalTaxa += taxa;
            meses++;

            if (criteriosJuros.indexOf(periodo.indice) === -1) {
                criteriosJuros.push(periodo.indice);
            }

            detalhamentoJuros.push({
                competenciaISO: cursor,
                indice: periodo.indice,
                taxaPercentual: taxa
            });
        }

        cursor = guia5ProximaCompetenciaISO(cursor);
    }

    var valorJuros = item.valorCorrigido * totalTaxa / 100;

    return {
        percentual: totalTaxa,
        valor: valorJuros,
        criterios: criteriosJuros,
        meses: meses,
        detalhamento: detalhamentoJuros
    };
}

// =====================================================================
// FASE 1.8D – MOTOR SELIC (VERSÃO CORRIGIDA + ESTACIONADO)
// =====================================================================

function guia5ObterTaxaSelicMensal(competenciaISO) {
    if (!window.BASE_INDEXADORES_JUROS || !window.BASE_INDEXADORES_JUROS.SELIC) {
        throw new Error('Base SELIC não carregada.');
    }
    var taxa = window.BASE_INDEXADORES_JUROS.SELIC[competenciaISO];
    if (taxa === undefined || taxa === null) {
        throw new Error('Competência ' + competenciaISO + ' não encontrada na série SELIC.');
    }
    return taxa;
}

function guia5CalcularSelic(item, atualizacaoISO, parametrosSelic) {
    var competenciaISO = item.competenciaISO;
    var fimNum = guia5ISOParaNumero(atualizacaoISO);

    var periodos = parametrosSelic.periodos.slice().sort(function(a, b) {
        return adminCompetenciaParaNumero(a.inicio) - adminCompetenciaParaNumero(b.inicio);
    });
    if (periodos.length === 0) {
        throw new Error('Encadeamento SELIC vazio.');
    }

    var ultimoPeriodo = periodos[periodos.length - 1];
    var limiteFimNum = fimNum;
    if (ultimoPeriodo.fim && ultimoPeriodo.fim.trim() !== '') {
        var ultimoFimISO = guia5CompetenciaParaISO(ultimoPeriodo.fim);
        if (ultimoFimISO) {
            var ultimoFimNum = guia5ISOParaNumero(ultimoFimISO);
            if (ultimoFimNum < fimNum) {
                limiteFimNum = ultimoFimNum;
            }
        }
    }

    var inicioGlobalISO = guia5CompetenciaParaISO(periodos[0].inicio);
    if (!inicioGlobalISO) {
        throw new Error('Início do primeiro período SELIC inválido.');
    }
    var inicioGlobalNum = guia5ISOParaNumero(inicioGlobalISO);

    var inicioNum = Math.max(guia5ISOParaNumero(competenciaISO), inicioGlobalNum);
    var inicioEfetivoISO = String(Math.floor(inicioNum / 100)) + '-' + String(inicioNum % 100).padStart(2, '0');

    // CORREÇÃO FASE 1.8F-E4B: incluir o mês inicial
    var cursor = inicioEfetivoISO;
    var detalhamentoSelic = [];
    var totalTaxa = 0;
    var meses = 0;

    while (guia5ISOParaNumero(cursor) <= fimNum && guia5ISOParaNumero(cursor) <= limiteFimNum) {
        var periodo = guia5ObterPeriodoDoEncadeamento(parametrosSelic, cursor);
        if (!periodo) {
            break;
        }
        if (periodo.indice !== 'SELIC') {
            throw new Error('Índice SELIC esperado, mas encontrado: ' + periodo.indice);
        }
        var taxa = guia5ObterTaxaSelicMensal(cursor);
        totalTaxa += taxa;
        meses++;

        detalhamentoSelic.push({
            competenciaISO: cursor,
            indice: periodo.indice,
            taxaPercentual: taxa
        });

        cursor = guia5ProximaCompetenciaISO(cursor);
    }

    var valorSelic = item.valorCorrigido * totalTaxa / 100;

    return {
        inicioSelicEfetivoISO: inicioEfetivoISO,
        fimSelicISO: atualizacaoISO,
        quantidadeMesesSelic: meses,
        percentualSelic: totalTaxa,
        valorSelic: valorSelic,
        detalhamentoSelic: detalhamentoSelic
    };
}

// =====================================================================
// FASE 1.8F-B1 – MOTOR INTERNO DE JUROS DETERMINÍSTICOS (CORRIGIDO + ESTACIONADO)
// =====================================================================

function guia5ObterTaxaJurosMensal(indice, competenciaISO) {
    switch (indice) {
        case 'SEM_JUROS':
            return 0;
        case 'JUROS_05_AM':
            return 0.5;
        case 'JUROS_1_AM':
            return 1;
        case 'JUROS_2_AA_EC136':
            return 2 / 12;
        case 'JUROS_POUPANCA':
            if (!window.BASE_INDEXADORES_JUROS || !window.BASE_INDEXADORES_JUROS.JUROS_POUPANCA) {
                throw new Error('Base da Poupança não carregada.');
            }
            var taxa = window.BASE_INDEXADORES_JUROS.JUROS_POUPANCA[competenciaISO];
            if (taxa === undefined || taxa === null) {
                throw new Error('Competência ' + competenciaISO + ' não encontrada na série da Poupança.');
            }
            return taxa;
        case 'TAXA_LEGAL':
            if (!window.BASE_INDEXADORES_JUROS || !window.BASE_INDEXADORES_JUROS.TAXA_LEGAL) {
                throw new Error('Base da Taxa Legal não carregada.');
            }
            var taxaLegal = window.BASE_INDEXADORES_JUROS.TAXA_LEGAL[competenciaISO];
            if (taxaLegal === undefined || taxaLegal === null) {
                throw new Error('Competência ' + competenciaISO + ' não encontrada na série da Taxa Legal.');
            }
            return taxaLegal;
        case 'TAXA_LEGAL_PREVIDENCIARIA':
            if (!window.BASE_INDEXADORES_JUROS || !window.BASE_INDEXADORES_JUROS.TAXA_LEGAL_PREVIDENCIARIA) {
                throw new Error('Base da Taxa Legal Previdenciária não carregada.');
            }
            var taxaLegalPrev = window.BASE_INDEXADORES_JUROS.TAXA_LEGAL_PREVIDENCIARIA[competenciaISO];
            if (taxaLegalPrev === undefined || taxaLegalPrev === null) {
                throw new Error('Competência ' + competenciaISO + ' não encontrada na série da Taxa Legal Previdenciária.');
            }
            return taxaLegalPrev;
        default:
            throw new Error('Índice de juros ainda não implementado nesta fase: ' + indice);
    }
}

function guia5CalcularJurosDeterministicos(item, inicioJurosISO, atualizacaoISO, parametrosJuros) {
    var competenciaISO = item.competenciaISO;

    var inicioNum = Math.max(
        guia5ISOParaNumero(competenciaISO),
        guia5ISOParaNumero(inicioJurosISO)
    );
    var inicioEfetivoISO = String(Math.floor(inicioNum / 100)) + '-' + String(inicioNum % 100).padStart(2, '0');

    var fimNum = guia5ISOParaNumero(atualizacaoISO);
    if (inicioNum > fimNum) {
        return {
            inicioJurosEfetivoISO: inicioEfetivoISO,
            fimJurosISO: atualizacaoISO,
            criteriosJuros: [],
            quantidadeMesesJuros: 0,
            percentualJurosAntesSelic: 0,
            percentualTaxaLegal: 0,
            percentualJurosTotal: 0,
            valorJuros: 0,
            detalhamentoJuros: []
        };
    }

    var cursor = inicioEfetivoISO;
    var criteriosJuros = [];
    var detalhamentoJuros = [];
    var totalTaxa = 0;
    var meses = 0;

    while (guia5ISOParaNumero(cursor) <= fimNum) {
        var periodo = guia5ObterPeriodoDoEncadeamento(parametrosJuros, cursor);
        if (!periodo) {
            break;
        }

        var taxa = guia5ObterTaxaJurosMensal(periodo.indice, cursor);
        totalTaxa += taxa;
        meses++;

        if (criteriosJuros.indexOf(periodo.indice) === -1) {
            criteriosJuros.push(periodo.indice);
        }

        detalhamentoJuros.push({
            competenciaISO: cursor,
            indice: periodo.indice,
            taxaPercentual: taxa
        });

        cursor = guia5ProximaCompetenciaISO(cursor);
    }

    var valorJuros = item.valorCorrigido * totalTaxa / 100;

    return {
        inicioJurosEfetivoISO: inicioEfetivoISO,
        fimJurosISO: atualizacaoISO,
        criteriosJuros: criteriosJuros,
        quantidadeMesesJuros: meses,
        percentualJurosAntesSelic: totalTaxa,
        percentualTaxaLegal: 0,
        percentualJurosTotal: totalTaxa,
        valorJuros: valorJuros,
        detalhamentoJuros: detalhamentoJuros
    };
}

// =====================================================================
// FASE 1.8E – CÁLCULO DO COEFICIENTE DE CORREÇÃO (ESTACIONADO)
// =====================================================================

function guia5DeveUsarManualMC2026(parametros) {
    return !!(
        parametros &&
        parametros.usarCoeficienteManualMC2026 === true
    );
}

function guia5CalcularCoeficienteMensal(competenciaISO, atualizacaoISO, parametros) {
    var compNum = guia5ISOParaNumero(competenciaISO);
    var atualNum = guia5ISOParaNumero(atualizacaoISO);

    if (isNaN(compNum) || isNaN(atualNum)) {
        throw new Error('Competência ou data de atualização inválida.');
    }

    if (compNum >= atualNum) {
        return {
            coeficiente: 1.0000,
            criterio: 'Sem atualização até a data informada'
        };
    }

    if (
        guia5DeveUsarManualMC2026(parametros) &&
        window.BASE_INDICE_PREVID_MC2026 &&
        window.calcularCoeficientePrevidMC2026 &&
        window.BASE_INDICE_PREVID_MC2026[competenciaISO] !== undefined &&
        window.BASE_INDICE_PREVID_MC2026[atualizacaoISO] !== undefined
    ) {
        return {
            coeficiente: window.calcularCoeficientePrevidMC2026(competenciaISO, atualizacaoISO),
            criterio: 'Manual MC2026 acumulado'
        };
    }

    var acumulado = 1.0000;
    var cursor = competenciaISO;
    var indicesUsados = [];

    while (guia5ISOParaNumero(cursor) < atualNum) {
        var periodo = guia5ObterPeriodoDoEncadeamento(parametros, cursor);

        if (!periodo || !periodo.indice) {
            if (indicesUsados.indexOf('ESTACIONADO') === -1) {
                indicesUsados.push('ESTACIONADO');
            }
            break;
        }

        var fator = guia5ObterFatorMensal(periodo.indice, cursor);
        acumulado = acumulado * fator;

        if (indicesUsados.indexOf(periodo.indice) === -1) {
            indicesUsados.push(periodo.indice);
        }

        cursor = guia5ProximaCompetenciaISO(cursor);
    }

    return {
        coeficiente: acumulado,
        criterio: indicesUsados.join(' / ')
    };
}

// =====================================================================
// FUNÇÕES AUXILIARES DE CONVERSÃO DE COMPETÊNCIA
// =====================================================================

function guia5CompetenciaParaISO(competencia) {
    if (!competencia) return null;
    if (competencia.indexOf('13º') === 0) {
        var partes13 = competencia.split('/');
        if (partes13.length !== 2) return null;
        var ano13 = parseInt(partes13[1], 10);
        if (isNaN(ano13)) return null;
        return ano13 + '-12';
    }
    var partes = competencia.split('/');
    if (partes.length !== 2) return null;
    var mes = parseInt(partes[0], 10);
    var ano = parseInt(partes[1], 10);
    if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12) return null;
    return ano + '-' + String(mes).padStart(2, '0');
}

function guia5ISOParaNumero(iso) {
    if (!iso) return NaN;
    var partes = iso.split('-');
    if (partes.length !== 2) return NaN;
    var ano = parseInt(partes[0], 10);
    var mes = parseInt(partes[1], 10);
    if (isNaN(ano) || isNaN(mes)) return NaN;
    return ano * 100 + mes;
}

function guia5ProximaCompetenciaISO(iso) {
    var partes = iso.split('-');
    var ano = parseInt(partes[0], 10);
    var mes = parseInt(partes[1], 10);
    if (mes === 12) {
        ano++;
        mes = 1;
    } else {
        mes++;
    }
    return ano + '-' + String(mes).padStart(2, '0');
}

function guia5ISOParaBR(iso) {
    if (!iso) return '';
    var partes = iso.split('-');
    return partes[1] + '/' + partes[0];
}

function guia5ObterPeriodoDoEncadeamento(parametros, competenciaISO) {
    if (!parametros || !parametros.periodos || parametros.periodos.length === 0) {
        return null;
    }
    var compNum = guia5ISOParaNumero(competenciaISO);
    for (var i = 0; i < parametros.periodos.length; i++) {
        var p = parametros.periodos[i];
        var inicioISO = guia5CompetenciaParaISO(p.inicio);
        var fimISO = p.fim ? guia5CompetenciaParaISO(p.fim) : null;
        if (!inicioISO) continue;
        var inicioNum = guia5ISOParaNumero(inicioISO);
        var fimNum = fimISO ? guia5ISOParaNumero(fimISO) : Number.MAX_SAFE_INTEGER;
        if (compNum >= inicioNum && compNum <= fimNum) {
            return p;
        }
    }
    return null;
}

function guia5ObterFatorMensal(indexador, competenciaISO) {
    if (indexador === 'SEM_CORRECAO') {
        return 1.0000;
    }
    if (!window.BASE_INDEXADORES_ATUALIZACAO) {
        throw new Error('Base de indexadores de atualização não carregada.');
    }
    var base = window.BASE_INDEXADORES_ATUALIZACAO[indexador];
    if (!base) {
        throw new Error('Índice "' + indexador + '" não existe na base de atualização.');
    }
    if (base[competenciaISO] === undefined || base[competenciaISO] === null) {
        throw new Error(
            'Não há índice cadastrado para "' + indexador + '" na competência ' +
            guia5ISOParaBR(competenciaISO) + '.'
        );
    }
    return base[competenciaISO];
}

// =====================================================================
// FASE 1.8D – ESPELHO DAS DIFERENÇAS DA GUIA 4 NA GUIA 5 (MODIFICADO)
// =====================================================================

function formatarMoedaAtualizacao(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// =====================================================================
// FUNÇÃO RENDERIZAR TABELA CORRIGIDA (com TOTAL e sem Índice/Critério)
// =====================================================================
function renderizarTabelaCorrigida(dados) {
    var container = document.getElementById('containerTabelaDiferencas');
    var tbody = document.getElementById('corpoDiferencasAtualizacao');
    var status = document.getElementById('statusDiferencas');
    var resumo = document.getElementById('resumoAtualizacao');
    var totalOriginalEl = document.getElementById('totalOriginalAtualizacao');
    var totalCorrigidoEl = document.getElementById('totalCorrigidoAtualizacao');
    var totalJurosEl = document.getElementById('totalJurosAtualizacao');
    var totalSelicEl = document.getElementById('totalSelicAtualizacao');

    if (!container || !tbody) return;

    tbody.innerHTML = '';

    if (!dados || dados.length === 0) {
        container.classList.add('hidden');
        if (resumo) resumo.classList.add('hidden');
        if (status) {
            status.textContent = 'Nenhuma diferença importada.';
            status.className = 'text-sm text-slate-500';
        }
        return;
    }

    var dadosOrdenados = dados.slice().sort(function(a, b) {
        var aIs13 = a.competencia.indexOf('13º') === 0;
        var bIs13 = b.competencia.indexOf('13º') === 0;
        var aNum, bNum;
        if (aIs13) {
            var aAno = parseInt(a.competencia.split('/')[1], 10);
            aNum = aAno * 100 + 13;
        } else {
            var aPartes = a.competencia.split('/');
            aNum = parseInt(aPartes[1], 10) * 100 + parseInt(aPartes[0], 10);
        }
        if (bIs13) {
            var bAno = parseInt(b.competencia.split('/')[1], 10);
            bNum = bAno * 100 + 13;
        } else {
            var bPartes = b.competencia.split('/');
            bNum = parseInt(bPartes[1], 10) * 100 + parseInt(bPartes[0], 10);
        }
        return aNum - bNum;
    });

    var totalOrig = 0;
    var totalCorr = 0;
    var totalJuros = 0;
    var totalSelic = 0;

    dadosOrdenados.forEach(function(item) {
        var tr = document.createElement('tr');
        tr.className = 'border-b border-slate-200 hover:bg-slate-50';
        var is13 = item.competencia.indexOf('13º') === 0;
        if (is13) tr.classList.add('linha-13');

        var tdComp = document.createElement('td');
        tdComp.className = 'p-2 font-semibold text-slate-800';
        tdComp.textContent = item.competencia;
        tr.appendChild(tdComp);

        var tdOrig = document.createElement('td');
        tdOrig.className = 'p-2 text-right font-mono';
        tdOrig.textContent = formatarMoedaAtualizacao(item.diferenca);
        if (item.diferenca < 0) tdOrig.style.color = '#dc2626';
        else if (item.diferenca > 0) tdOrig.style.color = '#16a34a';
        tr.appendChild(tdOrig);

        // Coeficiente
        var tdCoef = document.createElement('td');
        tdCoef.className = 'p-2 text-right font-mono';
        if (item.coeficiente !== undefined && item.coeficiente !== null) {
            tdCoef.textContent = item.coeficiente.toFixed(10);
        } else {
            tdCoef.textContent = '-';
        }
        tr.appendChild(tdCoef);

        // Valor Corrigido
        var tdCorr = document.createElement('td');
        tdCorr.className = 'p-2 text-right font-mono font-semibold';
        if (item.valorCorrigido !== undefined && item.valorCorrigido !== null) {
            tdCorr.textContent = formatarMoedaAtualizacao(item.valorCorrigido);
            if (item.valorCorrigido < 0) tdCorr.style.color = '#dc2626';
            else if (item.valorCorrigido > 0) tdCorr.style.color = '#16a34a';
            totalOrig += item.diferenca;
            totalCorr += item.valorCorrigido;
        } else {
            tdCorr.textContent = '-';
        }
        tr.appendChild(tdCorr);

        // % Juros antes da SELIC
        var tdJurosAntes = document.createElement('td');
        tdJurosAntes.className = 'p-2 text-right font-mono';
        tdJurosAntes.textContent = formatarPercentualAtualizacao(item.percentualJurosAntesSelic);
        tr.appendChild(tdJurosAntes);

        // Taxa Legal (acumulada)
        var taxaLegalAcumulado = 0;
        if (item.detalhamentoJuros && Array.isArray(item.detalhamentoJuros)) {
            var compAtualNum = guia5ISOParaNumero(item.competenciaISO);
            var dataAtualizacaoISO =
                window.resultadosAtualizacao &&
                window.resultadosAtualizacao.dataAtualizacaoISO
                    ? window.resultadosAtualizacao.dataAtualizacaoISO
                    : null;
            for (var k = 0; k < item.detalhamentoJuros.length; k++) {
                var entry = item.detalhamentoJuros[k];
                if (
                    dataAtualizacaoISO &&
                    entry.competenciaISO === dataAtualizacaoISO
                ) {
                    continue;
                }
                var entryNum = guia5ISOParaNumero(entry.competenciaISO);
                if ((entry.indice === 'TAXA_LEGAL' || entry.indice === 'TAXA_LEGAL_PREVIDENCIARIA') &&
                    entryNum >= compAtualNum) {
                    taxaLegalAcumulado += entry.taxaPercentual;
                }
            }
        }
        var tdTaxaLegal = document.createElement('td');
        tdTaxaLegal.className = 'p-2 text-right font-mono';
        if (taxaLegalAcumulado !== 0) {
            tdTaxaLegal.textContent = formatarPercentualAtualizacao(taxaLegalAcumulado);
        } else {
            tdTaxaLegal.textContent = '-';
        }
        tr.appendChild(tdTaxaLegal);

        // % Juros total
        var tdJurosTotal = document.createElement('td');
        tdJurosTotal.className = 'p-2 text-right font-mono';
        tdJurosTotal.textContent = formatarPercentualAtualizacao(item.percentualJurosTotal);
        tr.appendChild(tdJurosTotal);

        // Juros de Mora (R$)
        var tdJurosValor = document.createElement('td');
        tdJurosValor.className = 'p-2 text-right font-mono font-semibold';
        if (item.valorJuros !== undefined && item.valorJuros !== null) {
            tdJurosValor.textContent = formatarMoedaAtualizacao(item.valorJuros);
            if (item.valorJuros < 0) tdJurosValor.style.color = '#dc2626';
            else if (item.valorJuros > 0) tdJurosValor.style.color = '#16a34a';
            else tdJurosValor.style.color = 'inherit';
            totalJuros += item.valorJuros;
        } else {
            tdJurosValor.textContent = 'R$ 0,00';
        }
        tr.appendChild(tdJurosValor);

        // % SELIC
        var tdSelicPercent = document.createElement('td');
        tdSelicPercent.className = 'p-2 text-right font-mono';
        tdSelicPercent.textContent = formatarPercentualAtualizacao(item.percentualSelic);
        tr.appendChild(tdSelicPercent);

        // SELIC (R$)
        var tdSelicValor = document.createElement('td');
        tdSelicValor.className = 'p-2 text-right font-mono font-semibold';
        if (item.valorSelic !== undefined && item.valorSelic !== null) {
            tdSelicValor.textContent = formatarMoedaAtualizacao(item.valorSelic);
            if (item.valorSelic < 0) tdSelicValor.style.color = '#dc2626';
            else if (item.valorSelic > 0) tdSelicValor.style.color = '#16a34a';
            else tdSelicValor.style.color = 'inherit';
            totalSelic += item.valorSelic;
        } else {
            tdSelicValor.textContent = 'R$ 0,00';
        }
        tr.appendChild(tdSelicValor);

        // TOTAL (Corrigido + Juros + SELIC)
        var tdTotal = document.createElement('td');
        tdTotal.className = 'p-2 text-right font-mono font-bold text-blue-800';
        var total = (item.valorCorrigido || 0) + (item.valorJuros || 0) + (item.valorSelic || 0);
        tdTotal.textContent = formatarMoedaAtualizacao(total);
        if (total < 0) tdTotal.style.color = '#dc2626';
        else if (total > 0) tdTotal.style.color = '#16a34a';
        tr.appendChild(tdTotal);

        tbody.appendChild(tr);
    });

    // Atualizar totais no resumo
    if (totalOriginalEl) totalOriginalEl.textContent = formatarMoedaAtualizacao(totalOrig);
    if (totalCorrigidoEl) totalCorrigidoEl.textContent = formatarMoedaAtualizacao(totalCorr);
    if (totalJurosEl) totalJurosEl.textContent = formatarMoedaAtualizacao(totalJuros);
    if (totalSelicEl) totalSelicEl.textContent = formatarMoedaAtualizacao(totalSelic);

    // Total Geral Atualizado
    var totalGeralEl = document.getElementById('totalGeralAtualizacao');
    if (!totalGeralEl) {
        totalGeralEl = document.createElement('div');
        totalGeralEl.id = 'totalGeralAtualizacao';
        totalGeralEl.className = 'font-bold text-purple-800 text-base mt-2';
        var resumoDiv = document.getElementById('resumoAtualizacao');
        if (resumoDiv) {
            resumoDiv.appendChild(totalGeralEl);
        }
    }
    var totalGeral = totalCorr + totalJuros + totalSelic;
    totalGeralEl.textContent = 'Total Geral Atualizado: ' + formatarMoedaAtualizacao(totalGeral);

    container.classList.remove('hidden');
    if (resumo) {
        if (totalCorr !== 0 || totalOrig !== 0 || totalJuros !== 0 || totalSelic !== 0) {
            resumo.classList.remove('hidden');
        } else {
            resumo.classList.add('hidden');
        }
    }

    if (status) {
        status.textContent = '✅ ' + dados.length + ' diferença(s) importada(s) da Guia 4.';
        status.className = 'text-sm text-green-700';
    }
    atualizarBotoesAtualizacao();
}

function importarDiferencasGuia4ParaAtualizacao() {
    var status = document.getElementById('statusDiferencas');

    var rows = document.querySelectorAll('#corpoDiferencas tr');
    if (rows.length === 0 || (rows.length === 1 && rows[0].textContent.indexOf('Nenhuma diferença') !== -1)) {
        limparDiferencasAtualizacao('⚠️ Nenhuma diferença encontrada. Calcule a Guia 4 antes de importar.');
        return;
    }

    var dados = coletarDiferencasParaAtualizacao();

    if (!dados || dados.length === 0) {
        limparDiferencasAtualizacao('⚠️ Nenhuma diferença com valor válido encontrada.');
        return;
    }

    window.diferencasAtualizacaoAtual = dados;
    var dadosTabela = dados.map(function(item) {
        return {
            competencia: item.competencia,
            diferenca: item.diferenca,
            criterio: null,
            coeficiente: null,
            valorCorrigido: null
        };
    });
    renderizarTabelaCorrigida(dadosTabela);
    if (status) {
        status.textContent = '✅ ' + dados.length + ' diferença(s) importada(s) da Guia 4.';
        status.className = 'text-sm text-green-700';
    }
    atualizarBotoesAtualizacao();
}

function atualizarBotoesAtualizacao() {
    var btnCalc = document.getElementById('btnCalcularAtualizacao');
    if (btnCalc) {
        var temDiferencas = window.diferencasAtualizacaoAtual && window.diferencasAtualizacaoAtual.length > 0;
        var temParametros = !!window.parametrosCorrecaoAtual;
        btnCalc.disabled = !(temDiferencas && temParametros);
    }
}

// =====================================================================
// ENCADEAMENTOS OFICIAIS (Fase 1.8F-E1) – 4 MODELOS COMPLETOS
// =====================================================================
const ENCADEAMENTOS_OFICIAIS = {
    'MC-PREVID-2026': {
        nome: 'MC-PREVID-2026',
        descricao: 'Manual de Cálculos Previdenciários 2026',
        correcao: {
            periodos: [
                { indice: 'IPC_R', inicio: '07/1994', fim: '06/1995' },
                { indice: 'INPC', inicio: '07/1995', fim: '04/1996' },
                { indice: 'IGPDI', inicio: '05/1996', fim: '07/1996' },
                { indice: 'SEM_CORRECAO', inicio: '08/1996', fim: '08/1996' },
                { indice: 'IGPDI', inicio: '09/1996', fim: '08/2006' },
                { indice: 'INPC', inicio: '09/2006', fim: '11/2021' },
                { indice: 'SEM_CORRECAO', inicio: '12/2021', fim: '08/2025' },
                { indice: 'INPC', inicio: '09/2025', fim: '06/2026' }
            ]
        },
        juros: {
            periodos: [
                { indice: 'JUROS_POUPANCA', inicio: '01/2020', fim: '12/2021' },
                { indice: 'SEM_JUROS', inicio: '01/2022', fim: '08/2025' },
                { indice: 'TAXA_LEGAL_PREVIDENCIARIA', inicio: '09/2025', fim: '06/2026' }
            ]
        },
        selic: {
            periodos: [
                { indice: 'SELIC', inicio: '12/2021', fim: '08/2025' }
            ]
        }
    },
    'MC-ACOES-GERAL-2026': {
        nome: 'MC-ACOES-GERAL-2026',
        descricao: 'Manual de Cálculos para Ações em Geral 2026',
        correcao: {
            periodos: [
                { indice: 'UFIR', inicio: '07/1994', fim: '11/2000' },
                { indice: 'IPCAE_CJF_2000', inicio: '12/2000', fim: '12/2000' },
                { indice: 'IPCAE', inicio: '01/2001', fim: '11/2021' },
                { indice: 'SEM_CORRECAO', inicio: '12/2021', fim: '08/2025' },
                { indice: 'IPCAE', inicio: '09/2025', fim: '06/2026' }
            ]
        },
        juros: {
            periodos: [
                { indice: 'JUROS_POUPANCA', inicio: '01/2020', fim: '12/2021' },
                { indice: 'SEM_JUROS', inicio: '01/2022', fim: '08/2025' },
                { indice: 'TAXA_LEGAL', inicio: '09/2025', fim: '06/2026' }
            ]
        },
        selic: {
            periodos: [
                { indice: 'SELIC', inicio: '12/2021', fim: '08/2025' }
            ]
        }
    },
    'MC-PREVID-2022': {
        nome: 'MC-PREVID-2022',
        descricao: 'Manual de Cálculos Previdenciários 2022',
        correcao: {
            periodos: [
                { indice: 'ORTN', inicio: '10/1964', fim: '02/1986' },
                { indice: 'OTN', inicio: '03/1986', fim: '01/1989' },
                { indice: 'IPC_IBGE_EXPURGOS', inicio: '01/1989', fim: '02/1989' },
                { indice: 'BTN', inicio: '03/1989', fim: '03/1990' },
                { indice: 'IPC_IBGE', inicio: '03/1990', fim: '02/1991' },
                { indice: 'INPC', inicio: '03/1991', fim: '12/1992' },
                { indice: 'IRSM', inicio: '01/1993', fim: '02/1994' },
                { indice: 'URV', inicio: '03/1994', fim: '06/1994' },
                { indice: 'IPC_R', inicio: '07/1994', fim: '06/1995' },
                { indice: 'INPC', inicio: '07/1995', fim: '04/1996' },
                { indice: 'IGPDI', inicio: '05/1996', fim: '08/2006' },
                { indice: 'INPC', inicio: '09/2006', fim: '11/2021' },
                { indice: 'SEM_CORRECAO', inicio: '12/2021', fim: '' }
            ]
        },
        juros: {
            periodos: [
                { indice: 'JUROS_1_AM', inicio: '01/1994', fim: '08/2001' },
                { indice: 'JUROS_05_AM', inicio: '09/2001', fim: '06/2009' },
                { indice: 'JUROS_POUPANCA', inicio: '07/2009', fim: '11/2021' }
            ]
        },
        selic: {
            periodos: [
                { indice: 'SELIC', inicio: '12/2021', fim: '' }
            ]
        }
    },
    'MC-ACOES-GERAL-2022': {
        nome: 'MC-ACOES-GERAL-2022',
        descricao: 'Manual de Cálculos para Ações em Geral 2022',
        correcao: {
            periodos: [
                { indice: 'ORTN', inicio: '10/1964', fim: '02/1986' },
                { indice: 'OTN', inicio: '03/1986', fim: '01/1989' },
                { indice: 'IPC_IBGE_EXPURGOS', inicio: '01/1989', fim: '02/1989' },
                { indice: 'BTN', inicio: '03/1989', fim: '03/1990' },
                { indice: 'IPC_IBGE', inicio: '03/1990', fim: '02/1991' },
                { indice: 'INPC', inicio: '03/1991', fim: '11/1991' },
                { indice: 'IPCAE', inicio: '12/1991', fim: '12/1991' },
                { indice: 'UFIR', inicio: '01/1992', fim: '12/2000' },
                { indice: 'IPCAE', inicio: '01/2001', fim: '12/2021' },
                { indice: 'SEM_CORRECAO', inicio: '01/2022', fim: '' }
            ]
        },
        juros: {
            periodos: [
                { indice: 'JUROS_1_AM', inicio: '01/1994', fim: '08/2001' },
                { indice: 'JUROS_05_AM', inicio: '09/2001', fim: '06/2009' },
                { indice: 'JUROS_POUPANCA', inicio: '07/2009', fim: '11/2021' }
            ]
        },
        selic: {
            periodos: [
                { indice: 'SELIC', inicio: '12/2021', fim: '' }
            ]
        }
    }
};

// =====================================================================
// AUXILIARES PARA ATALHOS OFICIAIS (Fase 1.8F-E1)
// =====================================================================

function obterCompetenciaInicialEfetiva() {
    var competencias = [];

    if (window.diferencasAtualizacaoAtual && window.diferencasAtualizacaoAtual.length > 0) {
        window.diferencasAtualizacaoAtual.forEach(function(item) {
            if (item && item.competencia) {
                competencias.push(item.competencia);
            }
        });
    }

    var termoInput = document.getElementById('termoInicialDiferencas');
    if (termoInput && termoInput.value) {
        competencias.push(termoInput.value.trim());
    }

    if (competencias.length === 0) {
        return null;
    }

    var competenciasNormalizadas = competencias.map(function(comp) {
        comp = comp.trim();
        var partes = comp.split('/');
        if (partes.length === 3) {
            return partes[1] + '/' + partes[2];
        } else if (partes.length === 2) {
            if (partes[1].length === 2) {
                return comp;
            }
            return comp;
        }
        return comp;
    });

    var validas = competenciasNormalizadas.filter(function(c) {
        return /^\d{2}\/\d{4}$/.test(c);
    });

    if (validas.length === 0) {
        return null;
    }

    var menor = validas.reduce(function(a, b) {
        var numA = adminCompetenciaParaNumero(a);
        var numB = adminCompetenciaParaNumero(b);
        return (numA <= numB) ? a : b;
    });

    return menor;
}

function filtrarEAjustarPeriodos(periodos, competenciaInicial) {
    if (!periodos || periodos.length === 0 || !competenciaInicial) {
        return periodos;
    }
    var numInicial = adminCompetenciaParaNumero(competenciaInicial);
    if (isNaN(numInicial)) {
        return periodos;
    }

    var copia = periodos.map(function(p) {
        return { indice: p.indice, inicio: p.inicio, fim: p.fim || '' };
    });

    var filtrados = copia.filter(function(p) {
        if (!p.fim || p.fim.trim() === '') return true;
        var numFim = adminCompetenciaParaNumero(p.fim);
        if (isNaN(numFim)) return true;
        return numFim >= numInicial;
    });

    if (filtrados.length === 0) {
        return [];
    }

    var primeiro = filtrados[0];
    var numInicio = adminCompetenciaParaNumero(primeiro.inicio);
    if (numInicio < numInicial) {
        primeiro.inicio = competenciaInicial;
    }

    return filtrados;
}

function carregarEncadeamentoOficial(nome) {
    var enc = ENCADEAMENTOS_OFICIAIS[nome];
    if (!enc) {
        adminExibirMensagemGuia5('Encadeamento oficial "' + nome + '" não encontrado.', 'error', 'correcao_monetaria');
        return;
    }

    var competenciaInicial = obterCompetenciaInicialEfetiva();

    var periodosCorrecao = enc.correcao.periodos;
    if (competenciaInicial) {
        periodosCorrecao = filtrarEAjustarPeriodos(periodosCorrecao, competenciaInicial);
    }
    var jsonCorrecao = {
        tipoArquivo: 'parametros_atualizacao',
        tipoParametro: 'correcao_monetaria',
        nome: enc.nome,
        descricao: enc.descricao,
        periodos: periodosCorrecao
    };
    window.parametrosCorrecaoAtual = jsonCorrecao;
    adminAtualizarStatusDetalhado('correcao_monetaria', jsonCorrecao, '✅ Correção carregada: ' + nome);

    var periodosJuros = enc.juros ? enc.juros.periodos : [];
    if (competenciaInicial && periodosJuros.length > 0) {
        periodosJuros = filtrarEAjustarPeriodos(periodosJuros, competenciaInicial);
    }
    var periodosSelic = enc.selic ? enc.selic.periodos : [];
    if (competenciaInicial && periodosSelic.length > 0) {
        periodosSelic = filtrarEAjustarPeriodos(periodosSelic, competenciaInicial);
    }

    var pacoteJurosSelic = {
        nome: enc.nome + ' (Juros/SELIC)',
        descricao: enc.descricao,
        juros: (periodosJuros.length > 0) ? { tipoParametro: 'juros_mora', periodos: periodosJuros } : null,
        selic: (periodosSelic.length > 0) ? { tipoParametro: 'selic', periodos: periodosSelic } : null
    };
    window.parametrosJurosAtual = pacoteJurosSelic.juros;
    window.parametrosSelicAtual = pacoteJurosSelic.selic;
    adminAtualizarStatusDetalhado('juros_selic', pacoteJurosSelic, '✅ Juros e SELIC carregados: ' + nome);

    limparResultadosAtualizacaoPreservandoDiferencas();
    atualizarBotoesAtualizacao();
    atualizarEncadeamentosVisuais();
}

// =====================================================================
// SINCRONIZAÇÃO DAS DATAS DA GUIA 1 PARA GUIA 5
// =====================================================================

function sincronizarParametrosAtualizacao() {
    var dataAtualizacao1 = document.getElementById('dataAtualizacao');
    var dataAtualizacao2 = document.getElementById('dataAtualizacao2');
    var inicioJuros1 = document.getElementById('inicioJuros');
    var inicioJuros2 = document.getElementById('inicioJuros2');

    if (dataAtualizacao1 && dataAtualizacao2 && !dataAtualizacao2.value) {
        dataAtualizacao2.value = dataAtualizacao1.value;
    }
    if (inicioJuros1 && inicioJuros2 && !inicioJuros2.value) {
        inicioJuros2.value = inicioJuros1.value;
    }
}

// =====================================================================
// FUNÇÃO PRINCIPAL DE CÁLCULO DA ATUALIZAÇÃO (Fase 1.8E)
// =====================================================================

function calcularAtualizacaoGuia5() {
    var status = document.getElementById('statusAtualizacao');
    var container = document.getElementById('containerTabelaDiferencas');
    var tbody = document.getElementById('corpoDiferencasAtualizacao');
    var totalOriginalEl = document.getElementById('totalOriginalAtualizacao');
    var totalCorrigidoEl = document.getElementById('totalCorrigidoAtualizacao');
    var totalJurosEl = document.getElementById('totalJurosAtualizacao');
    var totalSelicEl = document.getElementById('totalSelicAtualizacao');
    var resumo = document.getElementById('resumoAtualizacao');

    if (status) {
        status.textContent = 'Calculando atualização...';
        status.className = 'text-sm text-slate-500';
    }

    if (!window.diferencasAtualizacaoAtual || window.diferencasAtualizacaoAtual.length === 0) {
        if (status) {
            status.textContent = '⚠️ Importe as diferenças da Guia 4 antes de calcular.';
            status.className = 'text-sm text-amber-700';
        }
        return;
    }

    if (!window.parametrosCorrecaoAtual) {
        if (status) {
            status.textContent = '⚠️ Carregue um JSON de correção monetária antes de calcular.';
            status.className = 'text-sm text-amber-700';
        }
        return;
    }

    var dataAtualizacaoInput = document.getElementById('dataAtualizacao2');
    var dataAtualizacaoBR = dataAtualizacaoInput ? dataAtualizacaoInput.value.trim() : '';
    var atualizacaoISO = guia5CompetenciaParaISO(dataAtualizacaoBR);
    if (!atualizacaoISO) {
        if (status) {
            status.textContent = '⚠️ Informe uma data de atualização válida no formato MM/AAAA.';
            status.className = 'text-sm text-amber-700';
        }
        return;
    }
    var atualizacaoNum = guia5ISOParaNumero(atualizacaoISO);

    // Fase 1.8F-E3: Aviso de limite temporal (não bloqueia)
    var limite = obterLimiteDoEncadeamento(
        window.parametrosCorrecaoAtual,
        window.parametrosJurosAtual,
        window.parametrosSelicAtual
    );
    if (limite) {
        var numUltima = adminCompetenciaParaNumero(limite.ultimaCompetencia);
        if (!isNaN(numUltima) && !isNaN(atualizacaoNum) && atualizacaoNum > numUltima) {
            if (status) {
                status.textContent =
                    '⚠️ Atenção: o encadeamento oficial selecionado possui vigência até ' + limite.ultimaCompetencia + '.\n' +
                    'Data de Atualização informada: ' + dataAtualizacaoBR + '\n' +
                    'O cálculo prosseguirá com o coeficiente estacionado a partir de ' + limite.ultimaCompetencia + '.\n' +
                    'Resultados para competências posteriores a ' + limite.ultimaCompetencia + ' serão zerados.';
                status.className = 'text-sm text-amber-700';
            }
        }
    }

    var diferencasFiltradas = [];
    var excluidas = 0;
    for (var i = 0; i < window.diferencasAtualizacaoAtual.length; i++) {
        var item = window.diferencasAtualizacaoAtual[i];
        var competenciaISO = guia5CompetenciaParaISO(item.competencia);
        if (!competenciaISO) {
            window.resultadosAtualizacao = null;
            if (resumo) resumo.classList.add('hidden');
            if (container) container.classList.add('hidden');
            if (totalOriginalEl) totalOriginalEl.textContent = 'R$ 0,00';
            if (totalCorrigidoEl) totalCorrigidoEl.textContent = 'R$ 0,00';
            if (totalJurosEl) totalJurosEl.textContent = 'R$ 0,00';
            if (totalSelicEl) totalSelicEl.textContent = 'R$ 0,00';
            if (status) {
                status.textContent = '❌ Erro na atualização: Competência inválida: ' + item.competencia;
                status.className = 'text-sm text-red-700';
            }
            return;
        }
        if (guia5ISOParaNumero(competenciaISO) <= atualizacaoNum) {
            diferencasFiltradas.push(item);
        } else {
            excluidas++;
        }
    }

    if (diferencasFiltradas.length === 0) {
        window.resultadosAtualizacao = null;
        if (resumo) resumo.classList.add('hidden');
        if (container) container.classList.add('hidden');
        if (totalOriginalEl) totalOriginalEl.textContent = 'R$ 0,00';
        if (totalCorrigidoEl) totalCorrigidoEl.textContent = 'R$ 0,00';
        if (totalJurosEl) totalJurosEl.textContent = 'R$ 0,00';
        if (totalSelicEl) totalSelicEl.textContent = 'R$ 0,00';
        if (status) {
            status.textContent = '❌ Nenhuma parcela possui competência igual ou anterior à Data de Atualização.';
            status.className = 'text-sm text-red-700';
        }
        return;
    }

    var inicioJurosBR = '';
    var inicioJurosISO = null;
    if (window.parametrosJurosAtual) {
        var inicioJurosInput = document.getElementById('inicioJuros2');
        inicioJurosBR = inicioJurosInput ? inicioJurosInput.value.trim() : '';
        inicioJurosISO = guia5CompetenciaParaISO(inicioJurosBR);
        if (!inicioJurosISO) {
            if (status) {
                status.textContent = '⚠️ Informe um Início dos Juros válido no formato MM/AAAA.';
                status.className = 'text-sm text-amber-700';
            }
            return;
        }
    }

    try {
        var totalOriginal = 0;
        var totalCorrigido = 0;
        var totalJuros = 0;
        var totalSelic = 0;
        var resultados = [];

        for (var idx = 0; idx < diferencasFiltradas.length; idx++) {
            var item = diferencasFiltradas[idx];
            var competenciaISO = guia5CompetenciaParaISO(item.competencia);
            if (!competenciaISO) {
                throw new Error('Competência inválida: ' + item.competencia);
            }

            var resultadoCoef = guia5CalcularCoeficienteMensal(
                competenciaISO,
                atualizacaoISO,
                window.parametrosCorrecaoAtual
            );

            var diferencaOriginal = item.diferenca || 0;
            var valorCorrigido = diferencaOriginal * resultadoCoef.coeficiente;

            totalOriginal += diferencaOriginal;
            totalCorrigido += valorCorrigido;

            var obj = {
                competencia: item.competencia,
                competenciaISO: competenciaISO,
                diferenca: diferencaOriginal,
                criterio: resultadoCoef.criterio,
                coeficiente: resultadoCoef.coeficiente,
                valorCorrigido: valorCorrigido,
                detalhamentoJuros: []
            };

            var valorJurosAntesSelic = 0;
            var percentualJurosTotal = 0;
            var valorJurosTotal = 0;
            var criteriosJuros = [];
            var mesesJuros = 0;
            var detalhamentoJuros = [];

            if (window.parametrosSelicAtual) {
                var periodosSelic = window.parametrosSelicAtual.periodos;
                if (!periodosSelic || periodosSelic.length === 0) {
                    throw new Error('Encadeamento SELIC vazio.');
                }
                var primeiroPeriodo = periodosSelic[0];
                var inicioSelicISO = guia5CompetenciaParaISO(primeiroPeriodo.inicio);
                if (!inicioSelicISO) throw new Error('Início do primeiro período SELIC inválido.');
                var inicioSelicNum = guia5ISOParaNumero(inicioSelicISO);
                var compNum = guia5ISOParaNumero(obj.competenciaISO);
                var inicioEfetivoNum = Math.max(compNum, inicioSelicNum);
                var inicioEfetivoISO = String(Math.floor(inicioEfetivoNum / 100)) + '-' + String(inicioEfetivoNum % 100).padStart(2, '0');

                var mes = inicioEfetivoNum % 100;
                var ano = Math.floor(inicioEfetivoNum / 100);
                if (mes > 1) {
                    mes--;
                } else {
                    mes = 12;
                    ano--;
                }
                var fimPreSelicNum = ano * 100 + mes;
                var fimPreSelicISO = String(ano) + '-' + String(mes).padStart(2, '0');

                var inicioJurosNum = guia5ISOParaNumero(inicioJurosISO);
                var jurosPre = null;
                if (fimPreSelicNum >= Math.max(compNum, inicioJurosNum)) {
                    jurosPre = guia5CalcularJurosIntervalo(obj, inicioJurosISO, fimPreSelicISO, window.parametrosJurosAtual);
                    valorJurosAntesSelic = jurosPre.valor;
                    percentualJurosTotal += jurosPre.percentual;
                    valorJurosTotal += jurosPre.valor;
                    criteriosJuros = jurosPre.criterios.slice();
                    mesesJuros += jurosPre.meses;
                    detalhamentoJuros = detalhamentoJuros.concat(jurosPre.detalhamento);
                }

                var cursorSelic = guia5ProximaCompetenciaISO(inicioEfetivoISO);
                var selicObj = guia5CalcularSelic(obj, atualizacaoISO, window.parametrosSelicAtual);
                var percentualSelic = selicObj.percentualSelic;
                var detalhamentoSelic = selicObj.detalhamentoSelic;
                var baseSelic = obj.valorCorrigido + valorJurosAntesSelic;
                var valorSelic = baseSelic * percentualSelic / 100;

                var ultimoPeriodo = periodosSelic[periodosSelic.length - 1];
                var fimSelicISO = ultimoPeriodo.fim ? guia5CompetenciaParaISO(ultimoPeriodo.fim) : null;
                if (fimSelicISO) {
                    var proxSelic = guia5ProximaCompetenciaISO(fimSelicISO);
                    var proxNum = guia5ISOParaNumero(proxSelic);
                    var atualNum = guia5ISOParaNumero(atualizacaoISO);
                    if (proxNum <= atualNum) {
                        var jurosPos = guia5CalcularJurosIntervalo(obj, proxSelic, atualizacaoISO, window.parametrosJurosAtual);
                        percentualJurosTotal += jurosPos.percentual;
                        valorJurosTotal += jurosPos.valor;
                        jurosPos.criterios.forEach(function(c) {
                            if (criteriosJuros.indexOf(c) === -1) criteriosJuros.push(c);
                        });
                        mesesJuros += jurosPos.meses;
                        detalhamentoJuros = detalhamentoJuros.concat(jurosPos.detalhamento);
                    }
                }

                obj.percentualJurosAntesSelic = jurosPre ? jurosPre.percentual : 0;
                obj.valorJurosAntesSelic = valorJurosAntesSelic;
                obj.percentualJurosTotal = percentualJurosTotal;
                obj.valorJuros = valorJurosTotal;
                obj.criteriosJuros = criteriosJuros;
                obj.quantidadeMesesJuros = mesesJuros;
                obj.detalhamentoJuros = detalhamentoJuros;
                obj.percentualSelic = percentualSelic;
                obj.valorSelic = valorSelic;
                obj.detalhamentoSelic = detalhamentoSelic;

                totalJuros += valorJurosTotal;
                totalSelic += valorSelic;

            } else {
                var jurosTotal = guia5CalcularJurosDeterministicos(obj, inicioJurosISO, atualizacaoISO, window.parametrosJurosAtual);
                obj.percentualJurosAntesSelic = jurosTotal.percentualJurosAntesSelic;
                obj.percentualJurosTotal = jurosTotal.percentualJurosTotal;
                obj.valorJuros = jurosTotal.valorJuros;
                obj.criteriosJuros = jurosTotal.criteriosJuros;
                obj.quantidadeMesesJuros = jurosTotal.quantidadeMesesJuros;
                obj.detalhamentoJuros = jurosTotal.detalhamentoJuros;
                obj.percentualSelic = 0;
                obj.valorSelic = 0;
                obj.detalhamentoSelic = [];
                totalJuros += obj.valorJuros;
            }

            resultados.push(obj);
        }

        window.resultadosAtualizacao = {
            dataAtualizacao: dataAtualizacaoBR,
            dataAtualizacaoISO: atualizacaoISO,
            parametrosCorrecao: window.parametrosCorrecaoAtual,
            parametrosJuros: window.parametrosJurosAtual || null,
            parametrosSelic: window.parametrosSelicAtual || null,
            totalOriginal: totalOriginal,
            totalCorrigido: totalCorrigido,
            totalJuros: totalJuros,
            totalSelic: totalSelic,
            itens: resultados
        };

        renderizarTabelaCorrigida(resultados);

        if (totalOriginalEl) totalOriginalEl.textContent = formatarMoedaAtualizacao(totalOriginal);
        if (totalCorrigidoEl) totalCorrigidoEl.textContent = formatarMoedaAtualizacao(totalCorrigido);
        if (totalJurosEl) totalJurosEl.textContent = formatarMoedaAtualizacao(totalJuros);
        if (totalSelicEl) totalSelicEl.textContent = formatarMoedaAtualizacao(totalSelic);
        if (resumo) resumo.classList.remove('hidden');

        var msg = '✅ Atualização calculada com sucesso.';
        if (excluidas > 0) {
            msg += ' ' + excluidas + ' parcela(s) posterior(es) à data da conta foram desconsideradas.';
        }
        if (status) {
            status.textContent = msg;
            status.className = 'text-sm text-green-700';
        }

    } catch (erro) {
        window.resultadosAtualizacao = null;
        if (status) {
            status.textContent = '❌ Erro na atualização: ' + erro.message;
            status.className = 'text-sm text-red-700';
        }
        if (resumo) resumo.classList.add('hidden');
    }
}

window.calcularAtualizacaoGuia5 = calcularAtualizacaoGuia5;


// =====================================================================
// FASE 1.9A – GUIA 6 / RENÚNCIA – FORMAÇÃO DA DEMANDA
// =====================================================================

window.parametrosFormacaoDemanda = window.parametrosFormacaoDemanda || {
    dataAjuizamento: '',
    competenciaAjuizamento: '',
    metodoVincendas: '1_parcela_anual',
    tratamentoMesAjuizamento: 'integral',
    incluir13: false,
    limitarAoTeto: false,
    quantidadeSalariosMinimos: 60,
    acordoAtivo: false,
    percentualAcordo: 100
};

window.resultadosAjuizamentoAtualizacao = window.resultadosAjuizamentoAtualizacao || null;
window.resultadoAjuizamento = window.resultadoAjuizamento || null;

function guia6ObterCompetenciaAjuizamentoISO() {
    var campo = document.getElementById('dataAjuizamento');
    var valor = campo ? campo.value.trim() : '';
    if (!valor) return null;

    var partes = valor.split('/');
    if (partes.length !== 3) return null;

    var dia = parseInt(partes[0], 10);
    var mes = parseInt(partes[1], 10);
    var ano = parseInt(partes[2], 10);

    if (
        isNaN(dia) || isNaN(mes) || isNaN(ano) ||
        dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900
    ) {
        return null;
    }

    return String(ano) + '-' + String(mes).padStart(2, '0');
}

function obterCompetenciaAjuizamento() {
    var iso = guia6ObterCompetenciaAjuizamentoISO();
    if (!iso) return null;

    return iso.substring(5, 7) + '/' + iso.substring(0, 4);
}

function guia6ISOParaCompetencia(iso) {
    return iso.substring(5, 7) + '/' + iso.substring(0, 4);
}

function guia6NormalizarCompetenciaItem(competencia) {
    if (!competencia) return null;

    var valor = String(competencia).trim();

    // Mantém o formato normal da Guia 5.
    var iso = guia5CompetenciaParaISO(valor);
    if (iso) return iso;

    // Para competências de 13º, a atualização monetária é operacionalizada
    // na competência de dezembro do respectivo ano.
    var match13 = valor.match(/^13[º°]?\s*\/\s*(\d{4})$/i);
    if (match13) {
        return match13[1] + '-12';
    }

    return null;
}

function guia6CriarParametrosJurosSemJuros(competenciaISO) {
    return {
        versao: '1.9A',
        criterio: 'SEM_JUROS',
        periodos: [{
            inicio: guia6ISOParaCompetencia(competenciaISO),
            fim: '',
            indice: 'SEM_JUROS'
        }]
    };
}

function guia6ObterParametrosEvolucao(dataFinal) {
    var radioTransformado = document.querySelector('input[name="transformado"]:checked');

    return {
        dib: document.getElementById('dib') ? document.getElementById('dib').value : '',
        rmi: typeof parseMoeda === 'function'
            ? parseMoeda(document.getElementById('rmi').value)
            : 0,
        dataFinal: dataFinal,
        transformado: radioTransformado ? radioTransformado.value === 'sim' : false,
        dibAntecedente: document.getElementById('dibAnterior') ? document.getElementById('dibAnterior').value : '',
        tipoBeneficio: document.getElementById('tipoBeneficio') ? document.getElementById('tipoBeneficio').value : 'previdenciario',
        percentualDesdobramento: parseFloat(
            (document.getElementById('percentualDesdobramento') ? document.getElementById('percentualDesdobramento').value : '100')
                .replace(',', '.')
        ) || 100,
        adicionalTipo: document.getElementById('adicionalRenda') ? document.getElementById('adicionalRenda').value : '0',
        adicionalPercentual: parseFloat(
            (document.getElementById('adicionalPercentual') ? document.getElementById('adicionalPercentual').value : '0')
                .replace(',', '.')
        ) || 0,
        baseadoSalarioMinimo: !!(
            document.getElementById('baseadoSalarioMinimoDevido') &&
            document.getElementById('baseadoSalarioMinimoDevido').checked
        )
    };
}

function guia6CalcularFracaoRemanescente(dataAjuizamento) {
    var partes = String(dataAjuizamento).split('/');
    var dia = parseInt(partes[0], 10);
    if (isNaN(dia) || dia < 1 || dia > 31) return 0;

    // O projeto utiliza a convenção proporcional de 30 dias.
    var diasRemanescentes = Math.max(0, 30 - dia + 1);
    return diasRemanescentes / 30;
}

function guia6CalcularFracaoVencida(dataAjuizamento) {
    return Math.max(0, 1 - guia6CalcularFracaoRemanescente(dataAjuizamento));
}

function calcularAtualizacaoAteAjuizamento() {
    var status = document.getElementById('statusFormacaoDemanda');
    var competenciaFinalISO = guia6ObterCompetenciaAjuizamentoISO();

    if (!competenciaFinalISO) {
        throw new Error('Informe uma Data do Ajuizamento válida no formato DD/MM/AAAA.');
    }

    if (!window.diferencasAtualizacaoAtual || !window.diferencasAtualizacaoAtual.length) {
        throw new Error('Importe as diferenças da Guia 4 antes de calcular a Formação da Demanda.');
    }

    if (!window.parametrosCorrecaoAtual) {
        throw new Error('Carregue os parâmetros de correção monetária antes de calcular a Formação da Demanda.');
    }

    var competenciaFinalNum = guia5ISOParaNumero(competenciaFinalISO);
    var itens = [];
    var totalOriginal = 0;
    var totalCorrigido = 0;
    var totalJuros = 0;
    var totalSelic = 0;

    var parametrosJurosSemJuros = guia6CriarParametrosJurosSemJuros(competenciaFinalISO);

    window.diferencasAtualizacaoAtual.forEach(function(item) {
        var competenciaISO = guia6NormalizarCompetenciaItem(item.competencia);
        if (!competenciaISO) {
            return;
        }

        if (guia5ISOParaNumero(competenciaISO) > competenciaFinalNum) {
            return;
        }

        var coef = guia5CalcularCoeficienteMensal(
            competenciaISO,
            competenciaFinalISO,
            window.parametrosCorrecaoAtual
        );

        var diferenca = Number(item.diferenca) || 0;
        var valorCorrigido = diferenca * coef.coeficiente;

        var baseItem = {
            competencia: item.competencia,
            competenciaISO: competenciaISO,
            diferenca: diferenca,
            criterio: coef.criterio,
            coeficiente: coef.coeficiente,
            valorCorrigido: valorCorrigido
        };

        var juros = guia5CalcularJurosDeterministicos(
            baseItem,
            competenciaISO,
            competenciaFinalISO,
            parametrosJurosSemJuros
        );

        var valorJuros = 0;
        var percentualJuros = 0;
        var detalhamentoJuros = [];

        if (juros) {
            valorJuros = Number(juros.valorJuros) || 0;
            percentualJuros = Number(juros.percentualJurosTotal) || 0;
            detalhamentoJuros = juros.detalhamentoJuros || [];
        }

        var valorSelic = 0;
        var percentualSelic = 0;
        var detalhamentoSelic = [];

        if (window.parametrosSelicAtual) {
            var selic = guia5CalcularSelic(
                {
                    competenciaISO: competenciaISO,
                    valorCorrigido: valorCorrigido
                },
                competenciaFinalISO,
                window.parametrosSelicAtual
            );

            percentualSelic = Number(selic.percentualSelic) || 0;
            valorSelic = Number(selic.valorSelic) || 0;
            detalhamentoSelic = selic.detalhamentoSelic || [];
        }

        var total = valorCorrigido + valorJuros + valorSelic;

        var resultadoItem = {
            competencia: item.competencia,
            competenciaISO: competenciaISO,
            diferenca: diferenca,
            criterio: coef.criterio,
            coeficiente: coef.coeficiente,
            valorCorrigido: valorCorrigido,
            percentualJurosAntesSelic: 0,
            percentualJurosTotal: percentualJuros,
            valorJuros: 0,
            criteriosJuros: ['SEM_JUROS'],
            quantidadeMesesJuros: 0,
            detalhamentoJuros: detalhamentoJuros,
            percentualSelic: percentualSelic,
            valorSelic: valorSelic,
            detalhamentoSelic: detalhamentoSelic,
            total: total
        };

        totalOriginal += diferenca;
        totalCorrigido += valorCorrigido;
        totalJuros += 0;
        totalSelic += valorSelic;
        itens.push(resultadoItem);
    });

    if (!itens.length) {
        throw new Error('Nenhuma diferença possui competência igual ou anterior ao ajuizamento.');
    }

    window.resultadosAjuizamentoAtualizacao = {
        dataFinal: guia6ISOParaCompetencia(competenciaFinalISO),
        competenciaFinal: competenciaFinalISO,
        parametrosCorrecao: window.parametrosCorrecaoAtual,
        parametrosJuros: parametrosJurosSemJuros,
        parametrosSelic: window.parametrosSelicAtual || null,
        itens: itens,
        totalOriginal: totalOriginal,
        totalCorrigido: totalCorrigido,
        totalJuros: 0,
        totalSelic: totalSelic,
        totalAtualizado: totalCorrigido + totalSelic
    };

    renderizarMemoriaAjuizamento();

    if (status) {
        status.textContent = 'Memória até o ajuizamento calculada.';
        status.className = 'text-sm text-green-700';
    }

    return window.resultadosAjuizamentoAtualizacao;
}

function guia6ObterMemoriaEvolucaoReal() {
    if (Array.isArray(window.memoriaEvolucaoDevida) && window.memoriaEvolucaoDevida.length) {
        return window.memoriaEvolucaoDevida;
    }
    return null;
}

function guia6ObterItemMemoriaEvolucao(competenciaISO) {
    var memoria = guia6ObterMemoriaEvolucaoReal();
    if (!memoria) return null;

    var competencia = guia6ISOParaCompetencia(competenciaISO);
    for (var i = 0; i < memoria.length; i++) {
        if (String(memoria[i].competencia || '').trim() === competencia) {
            return memoria[i];
        }
    }
    return null;
}

function guia6ObterValorEvolucaoNaCompetencia(competenciaISO) {
    var competencia = guia6ISOParaCompetencia(competenciaISO);
    var itemMemoria = guia6ObterItemMemoriaEvolucao(competenciaISO);

    // A memória de evolução pode conter apenas os marcos de reajuste/piso.
    // Quando a competência solicitada estiver nela, ela continua sendo a
    // fonte preferencial e evita recalcular desnecessariamente.
    if (itemMemoria) {
        var valorMemoria = Number(itemMemoria.valorFinal);
        if (!isNaN(valorMemoria) && valorMemoria > 0) {
            return {
                valor: valorMemoria,
                resultado: {
                    memoria: guia6ObterMemoriaEvolucaoReal(),
                    rmaFinal: valorMemoria
                },
                origem: 'memoriaEvolucaoDevida'
            };
        }
    }

    // A ausência de uma competência na memória NÃO significa que ela seja
    // inexistente. A memória real é esparsa (marcos de evolução), enquanto
    // calcularEvolucao() consegue obter o valor mensal entre esses marcos.
    if (typeof calcularEvolucao !== 'function') {
        throw new Error('Motor de evolução não está disponível.');
    }

    var parametros = guia6ObterParametrosEvolucao(competencia);
    var resultado = calcularEvolucao(parametros);

    if (!resultado || resultado.rmaFinal === undefined || resultado.rmaFinal === null) {
        throw new Error('Não foi possível obter o valor da evolução em ' + competencia + '.');
    }

    var valorCalculado = Number(resultado.rmaFinal);
    if (isNaN(valorCalculado) || valorCalculado <= 0) {
        throw new Error('A evolução calculada em ' + competencia + ' não possui valor mensal válido.');
    }

    return {
        valor: valorCalculado,
        resultado: resultado,
        origem: 'calcularEvolucao'
    };
}

function guia6ObterFimRealEvolucaoISO() {
    // A Data Final da evolução é o marco temporal principal. A memória pode
    // ser esparsa e conter somente os meses em que houve reajuste/piso; ela
    // não deve encurtar artificialmente a evolução mensal.
    var dataFinal = document.getElementById('dataFinal');
    if (dataFinal && dataFinal.value) {
        var isoDataFinal = guia5CompetenciaParaISO(dataFinal.value.trim());
        if (isoDataFinal) return isoDataFinal;
    }

    // Fallback para memórias antigas que não possuam Data Final disponível.
    var memoria = guia6ObterMemoriaEvolucaoReal();
    if (memoria && memoria.length) {
        var maiorISO = null;
        var maiorNum = -Infinity;
        for (var i = 0; i < memoria.length; i++) {
            var isoMemoria = guia6NormalizarCompetenciaItem(memoria[i].competencia);
            var numMemoria = guia5ISOParaNumero(isoMemoria);
            if (isoMemoria && !isNaN(numMemoria) && numMemoria > maiorNum) {
                maiorNum = numMemoria;
                maiorISO = isoMemoria;
            }
        }
        if (maiorISO) return maiorISO;
    }

    return null;
}

function guia6ObterMarcoCompetenciaISO(id, tratarComoFimDoMes) {
    var el = document.getElementById(id);
    if (!el || !el.value) return null;

    var valor = el.value.trim();
    var iso = guia5CompetenciaParaISO(valor);
    if (!iso) {
        var partes = valor.split('/');
        if (partes.length === 3) {
            var mes = parseInt(partes[1], 10);
            var ano = parseInt(partes[2], 10);
            if (!isNaN(mes) && !isNaN(ano) && mes >= 1 && mes <= 12) {
                iso = String(ano) + '-' + String(mes).padStart(2, '0');
            }
        }
    }
    if (!iso) return null;

    return iso;
}

function guia6CompetenciaDentroDaEvolucao(competenciaISO) {
    var competenciaNum = guia5ISOParaNumero(competenciaISO);
    if (isNaN(competenciaNum)) return false;

    // DIP, quando informada, impede considerar como vincenda uma competência
    // anterior ao início efetivo do pagamento. Um eventual DCB específico do
    // benefício devido, se existir no DOM, também funciona como limitador final.
    var dipISO = guia6ObterMarcoCompetenciaISO('dipDevido', false);
    if (dipISO && competenciaNum < guia5ISOParaNumero(dipISO)) {
        return false;
    }

    var dcbISO = guia6ObterMarcoCompetenciaISO('dcbDevido', true);
    if (dcbISO && competenciaNum > guia5ISOParaNumero(dcbISO)) {
        return false;
    }

    var fimISO = guia6ObterFimRealEvolucaoISO();
    if (!fimISO) return false;

    // A competência precisa estar dentro do período efetivamente evoluído,
    // mas não precisa existir como linha explícita na memória de reajustes.
    // Competências intermediárias são obtidas pelo motor de evolução.
    return competenciaNum <= guia5ISOParaNumero(fimISO);
}

function guia6ObterBeneficioDevidoPara13() {
    var dibEl = document.getElementById('dib');
    var rmiEl = document.getElementById('rmi');
    var abonoEl = document.getElementById('possuiAbonoDevido');

    return {
        dib: dibEl ? dibEl.value : '',
        dcb: document.getElementById('dcbDevido')
            ? document.getElementById('dcbDevido').value
            : null,
        possuiAbono: !!(abonoEl && abonoEl.checked),
        rmi: typeof parseMoeda === 'function' && rmiEl
            ? parseMoeda(rmiEl.value)
            : 0,
        rmaFinal: Number(
            guia6ObterItemMemoriaEvolucao(guia6ISOParaCompetencia(
                guia6ObterFimRealEvolucaoISO() || ''
            ))?.valorFinal || 0
        ) || 0
    };
}

function guia6CalcularValor13NaCompetencia(ano, memoria) {
    if (typeof calcular13ParaAno !== 'function') {
        console.warn('[Guia 6] calcular13ParaAno() não está disponível; 13º não será presumido.');
        return 0;
    }

    var beneficio = guia6ObterBeneficioDevidoPara13();
    if (!beneficio.possuiAbono) return 0;

    var memoria13 = Array.isArray(memoria) && memoria.length
        ? memoria
        : guia6ObterMemoriaEvolucaoReal();

    if (!memoria13 || !memoria13.length) {
        console.warn('[Guia 6] Memória real da evolução não disponível; 13º não será presumido.');
        return 0;
    }

    var resultado13 = calcular13ParaAno(beneficio, ano, memoria13);
    if (!resultado13 || resultado13.valor === undefined || resultado13.valor === null) {
        console.warn('[Guia 6] Não foi possível obter o 13º real de ' + ano + '; nenhum valor presumido será aplicado.');
        return 0;
    }

    return Number(resultado13.valor) || 0;
}

function calcularParcelaAjuizamento() {
    var competenciaISO = guia6ObterCompetenciaAjuizamentoISO();
    if (!competenciaISO) {
        throw new Error('Data do Ajuizamento inválida.');
    }

    if (!guia6CompetenciaDentroDaEvolucao(competenciaISO)) {
        return 0;
    }

    // Na Formação da Demanda, a parcela do mês do ajuizamento é a própria
    // diferença devida naquela competência, após a atualização até o
    // ajuizamento. A evolução do benefício serve para projetar as
    // competências futuras, mas não substitui a diferença da Guia 4.
    var itemAtualizacao = guia6ObterItemAtualizacaoAjuizamento();
    if (itemAtualizacao) {
        return Number(itemAtualizacao.total) || 0;
    }

    console.warn('[Guia 6] Não foi localizada a diferença da competência do ajuizamento.');
    return 0;
}

function guia6ObterItemAtualizacaoAjuizamento() {
    var competenciaISO = guia6ObterCompetenciaAjuizamentoISO();
    if (!window.resultadosAjuizamentoAtualizacao || !competenciaISO) return null;

    var itens = window.resultadosAjuizamentoAtualizacao.itens || [];
    for (var i = 0; i < itens.length; i++) {
        if (itens[i].competenciaISO === competenciaISO) {
            return itens[i];
        }
    }

    return null;
}

function guia6CalcularVencidasAjustadas(valorTotalAtualizado, dataAjuizamento, tratamento) {
    if (tratamento !== 'proporcional') {
        return valorTotalAtualizado;
    }

    var item = guia6ObterItemAtualizacaoAjuizamento();
    if (!item) {
        return valorTotalAtualizado;
    }

    var fracaoVencida = guia6CalcularFracaoVencida(dataAjuizamento);
    return valorTotalAtualizado - (item.total * (1 - fracaoVencida));
}

function guia6ObterProximaCompetenciaISO(iso) {
    return guia5ProximaCompetenciaISO(iso);
}

function calcularVincendas(parcelaAjuizamento, parametros) {
    var metodo = parametros.metodoVincendas;
    var tratamento = parametros.tratamentoMesAjuizamento;
    var incluir13 = parametros.incluir13;
    var dataAjuizamento = parametros.dataAjuizamento;
    var competenciaAjuizamentoISO = parametros.competenciaAjuizamentoISO;

    if (metodo === 'nao_considerar') {
        return {
            valor: 0,
            parcelas: [],
            quantidadeParcelas: 0
        };
    }

    if (metodo === '1_parcela_anual') {
        var baseAnual = Number(parcelaAjuizamento) || 0;

        if (tratamento === 'proporcional') {
            baseAnual = baseAnual * guia6CalcularFracaoRemanescente(dataAjuizamento);
        }

        return {
            valor: baseAnual * 12,
            parcelas: [],
            quantidadeParcelas: 12,
            metodo: metodo
        };
    }

    if (metodo !== 'ate_12') {
        throw new Error('Método de vincendas inválido.');
    }

    var parcelas = [];
    var cursor = competenciaAjuizamentoISO;

    if (tratamento === 'integral') {
        cursor = guia6ObterProximaCompetenciaISO(cursor);
    }

    while (parcelas.length < 12) {
        if (!guia6CompetenciaDentroDaEvolucao(cursor)) {
            break;
        }

        var valorMensalIntegral;

        try {
            valorMensalIntegral = guia6ObterValorEvolucaoNaCompetencia(cursor).valor;
        } catch (e) {
            break;
        }

        var valorMensal = valorMensalIntegral;

        if (cursor === competenciaAjuizamentoISO && tratamento === 'proporcional') {
            // A primeira vincenda proporcional é a diferença do mês do
            // ajuizamento. As demais competências usam o valor integral da
            // evolução do benefício.
            valorMensal = (Number(parcelaAjuizamento) || 0) * guia6CalcularFracaoRemanescente(dataAjuizamento);
        }

        var competenciaBR = guia6ISOParaCompetencia(cursor);
        var mes = parseInt(competenciaBR.substring(0, 2), 10);

        // O 13º é agregado à competência de dezembro e não conta como
        // parcela adicional. O valor vem da função real do projeto,
        // considerando avos, DIB/DCB e a memória mensal quando aplicável.
        if (mes === 12 && incluir13) {
            var memoria13 = null;
            try {
                memoria13 = guia6ObterValorEvolucaoNaCompetencia(cursor).resultado.memoria || null;
            } catch (e13) {
                memoria13 = guia6ObterMemoriaEvolucaoReal();
            }
            valorMensal += guia6CalcularValor13NaCompetencia(
                parseInt(competenciaBR.substring(3, 7), 10),
                memoria13
            );
        }

        parcelas.push({
            competencia: competenciaBR,
            competenciaISO: cursor,
            valor: valorMensal,
            inclui13: mes === 12 && incluir13
        });

        cursor = guia6ObterProximaCompetenciaISO(cursor);
    }

    var total = parcelas.reduce(function(soma, parcela) {
        return soma + parcela.valor;
    }, 0);

    return {
        valor: total,
        parcelas: parcelas,
        quantidadeParcelas: parcelas.length,
        metodo: metodo
    };
}

function calcularLimiteJuizado(parametros) {
    if (!parametros.limitarAoTeto) {
        return {
            salarioMinimoAjuizamento: null,
            limiteJuizado: null
        };
    }

    if (typeof obterSalarioMinimoPorCompetencia !== 'function') {
        throw new Error('Função de salário mínimo não está disponível.');
    }

    var salario = obterSalarioMinimoPorCompetencia(parametros.competenciaAjuizamento);
    if (salario === null || salario === undefined || isNaN(salario)) {
        throw new Error('Não foi possível obter o salário mínimo da competência do ajuizamento.');
    }

    var quantidade = Number(parametros.quantidadeSalariosMinimos);
    if (isNaN(quantidade) || quantidade < 0) {
        throw new Error('Quantidade de salários mínimos inválida.');
    }

    return {
        salarioMinimoAjuizamento: Number(salario),
        limiteJuizado: Number(salario) * quantidade
    };
}

function calcularRenunciaAjuizamento(valorDemanda, limiteJuizado, limitarAoTeto) {
    if (!limitarAoTeto) {
        return 0;
    }

    return Math.max(0, (Number(valorDemanda) || 0) - (Number(limiteJuizado) || 0));
}

function calcularAcordo(valorAposRenuncia, parametros) {
    if (!parametros.acordoAtivo) {
        return {
            percentual: 100,
            valorAcordo: 0,
            valorFinal: Number(valorAposRenuncia) || 0
        };
    }

    var percentual = Number(parametros.percentualAcordo);
    if (isNaN(percentual)) percentual = 100;
    percentual = Math.max(0, Math.min(100, percentual));

    var valorFinal = (Number(valorAposRenuncia) || 0) * percentual / 100;

    return {
        percentual: percentual,
        valorAcordo: (Number(valorAposRenuncia) || 0) - valorFinal,
        valorFinal: valorFinal
    };
}

function guia6ColetarParametrosFormacaoDemanda() {
    var dataAjuizamentoEl = document.getElementById('dataAjuizamento');
    var metodoEl = document.getElementById('metodoVincendas');
    var tratamentoEl = document.getElementById('tratamentoMesAjuizamento');
    var incluir13El = document.getElementById('incluir13Vincendas');
    var limitarEl = document.getElementById('limitarAoTeto');
    var quantidadeEl = document.getElementById('quantidadeSalariosMinimos');
    var acordoEl = document.getElementById('acordoAtivo');
    var presetEl = document.getElementById('percentualAcordoPreset');
    var personalizadoEl = document.getElementById('percentualAcordo');

    var dataAjuizamento = dataAjuizamentoEl ? dataAjuizamentoEl.value.trim() : '';
    var competencia = obterCompetenciaAjuizamento();

    var acordoAtivo = acordoEl ? acordoEl.value === 'sim' : false;
    var percentual = 100;

    if (acordoAtivo) {
        if (presetEl && presetEl.value === 'personalizado') {
            percentual = Number(personalizadoEl ? personalizadoEl.value : 100);
        } else if (presetEl) {
            percentual = Number(presetEl.value);
        }
    }

    if (isNaN(percentual)) percentual = 100;
    percentual = Math.max(0, Math.min(100, percentual));

    var parametros = {
        dataAjuizamento: dataAjuizamento,
        competenciaAjuizamento: competencia || '',
        competenciaAjuizamentoISO: guia6ObterCompetenciaAjuizamentoISO() || '',
        metodoVincendas: metodoEl ? metodoEl.value : '1_parcela_anual',
        tratamentoMesAjuizamento: tratamentoEl ? tratamentoEl.value : 'integral',
        incluir13: incluir13El ? incluir13El.value === 'sim' : false,
        limitarAoTeto: limitarEl ? limitarEl.value === 'sim' : false,
        quantidadeSalariosMinimos: quantidadeEl ? Number(quantidadeEl.value) || 60 : 60,
        acordoAtivo: acordoAtivo,
        percentualAcordo: percentual
    };

    window.parametrosFormacaoDemanda = parametros;
    return parametros;
}

function calcularFormacaoDemanda() {
    var status = document.getElementById('statusFormacaoDemanda');

    try {
        var parametros = guia6ColetarParametrosFormacaoDemanda();

        if (!parametros.competenciaAjuizamentoISO) {
            throw new Error('Informe a Data do Ajuizamento.');
        }

        calcularAtualizacaoAteAjuizamento();

        var valorVencidas = Number(
            window.resultadosAjuizamentoAtualizacao.totalAtualizado
        ) || 0;

        // Na modalidade proporcional, o mês do ajuizamento é dividido.
        valorVencidas = guia6CalcularVencidasAjustadas(
            valorVencidas,
            parametros.dataAjuizamento,
            parametros.tratamentoMesAjuizamento
        );

        var parcelaAjuizamento = calcularParcelaAjuizamento();

        var vincendas = calcularVincendas(parcelaAjuizamento, parametros);
        var valorVincendas = Number(vincendas.valor) || 0;

        var valorDemanda = valorVencidas + valorVincendas;

        var limite = calcularLimiteJuizado(parametros);
        var renuncia = calcularRenunciaAjuizamento(
            valorDemanda,
            limite.limiteJuizado,
            parametros.limitarAoTeto
        );

        var valorAposRenuncia = valorDemanda - renuncia;
        var acordo = calcularAcordo(valorAposRenuncia, parametros);

        window.resultadoAjuizamento = {
            valorVencidasAjuizamento: valorVencidas,
            parcelaAjuizamento: parcelaAjuizamento,
            valorVincendas: valorVincendas,
            valorDemandaAjuizamento: valorDemanda,
            salarioMinimoAjuizamento: limite.salarioMinimoAjuizamento,
            quantidadeSalariosMinimos: parametros.limitarAoTeto
                ? parametros.quantidadeSalariosMinimos
                : null,
            limiteJuizado: limite.limiteJuizado,
            renunciaAjuizamento: renuncia,
            valorAposRenuncia: valorAposRenuncia,
            acordoAtivo: parametros.acordoAtivo,
            percentualAcordo: acordo.percentual,
            valorAcordo: acordo.valorAcordo,
            valorFinal: acordo.valorFinal,
            parcelasVincendas: vincendas.parcelas,
            quantidadeParcelasVincendas: vincendas.quantidadeParcelas,
            desatualizado: false
        };

        renderizarFormacaoDemanda();

        if (status) {
            status.textContent = '✅ Formação da demanda calculada com sucesso.';
            status.className = 'text-sm text-green-700';
        }

        return window.resultadoAjuizamento;

    } catch (erro) {
        if (status) {
            status.textContent = '❌ ' + erro.message;
            status.className = 'text-sm text-red-700';
        }
        return null;
    }
}

function renderizarMemoriaAjuizamento() {
    var resultado = window.resultadosAjuizamentoAtualizacao;
    var tbody = document.getElementById('corpoMemoriaAjuizamento');

    if (!resultado || !tbody) return;

    tbody.innerHTML = '';

    resultado.itens.forEach(function(item) {
        var tr = document.createElement('tr');
        tr.className = 'border-b border-slate-200 hover:bg-slate-50';

        var valores = [
            item.competencia,
            formatarMoedaAtualizacao(item.diferenca),
            item.coeficiente !== undefined ? Number(item.coeficiente).toFixed(10) : '-',
            formatarMoedaAtualizacao(item.valorCorrigido),
            formatarMoedaAtualizacao(0),
            formatarMoedaAtualizacao(item.valorSelic),
            formatarMoedaAtualizacao(item.total)
        ];

        valores.forEach(function(valor, index) {
            var td = document.createElement('td');
            td.className = 'p-2 ' + (index === 0 ? 'font-semibold' : 'text-right font-mono');
            td.textContent = valor;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    var originalEl = document.getElementById('totalOriginalAjuizamento');
    var corrigidoEl = document.getElementById('totalCorrigidoAjuizamento');
    var jurosEl = document.getElementById('totalJurosAjuizamento');
    var selicEl = document.getElementById('totalSelicAjuizamento');
    var totalEl = document.getElementById('totalAtualizadoAjuizamento');

    if (originalEl) originalEl.textContent = formatarMoedaAtualizacao(resultado.totalOriginal);
    if (corrigidoEl) corrigidoEl.textContent = formatarMoedaAtualizacao(resultado.totalCorrigido);
    if (jurosEl) jurosEl.textContent = formatarMoedaAtualizacao(0);
    if (selicEl) selicEl.textContent = formatarMoedaAtualizacao(resultado.totalSelic);
    if (totalEl) totalEl.textContent = formatarMoedaAtualizacao(resultado.totalAtualizado);
}

function renderizarFormacaoDemanda() {
    var resultado = window.resultadoAjuizamento;
    if (!resultado) return;

    var valores = {
        valorParcelaAjuizamento: resultado.parcelaAjuizamento,
        valorVencidasAjuizamento: resultado.valorVencidasAjuizamento,
        valorVincendasAjuizamento: resultado.valorVincendas,
        valorDemandaAjuizamento: resultado.valorDemandaAjuizamento,
        salarioMinimoAjuizamento: resultado.salarioMinimoAjuizamento,
        limiteJuizado: resultado.limiteJuizado,
        renunciaAjuizamento: resultado.renunciaAjuizamento,
        valorAposRenuncia: resultado.valorAposRenuncia,
        percentualAcordoAplicado: resultado.percentualAcordo,
        valorAcordo: resultado.valorAcordo,
        valorFinalAjuizamento: resultado.valorFinal
    };

    Object.keys(valores).forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;

        if (id === 'percentualAcordoAplicado') {
            el.textContent = Number(valores[id]).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + '%';
        } else if (id === 'salarioMinimoAjuizamento' || id === 'limiteJuizado') {
            el.textContent = valores[id] === null || valores[id] === undefined
                ? '—'
                : formatarMoedaAtualizacao(valores[id]);
        } else {
            el.textContent = formatarMoedaAtualizacao(valores[id]);
        }
    });
}

function guia6AtualizarEstadoAcordo() {
    var ativo = document.getElementById('acordoAtivo');
    var preset = document.getElementById('percentualAcordoPreset');
    var personalizado = document.getElementById('percentualAcordo');

    if (!ativo || !preset || !personalizado) return;

    var acordoAtivo = ativo.value === 'sim';
    preset.disabled = !acordoAtivo;
    personalizado.disabled = !acordoAtivo || preset.value !== 'personalizado';

    if (!acordoAtivo) {
        preset.value = '100';
        personalizado.value = '100';
    }
}

function guia6InvalidarResultado() {
    if (window.resultadoAjuizamento) {
        window.resultadoAjuizamento.desatualizado = true;
    }

    var status = document.getElementById('statusFormacaoDemanda');
    if (status) {
        status.textContent = '⚠️ Parâmetros alterados. Recalcule a Formação da Demanda.';
        status.className = 'text-sm text-amber-700';
    }
}

window.obterCompetenciaAjuizamento = obterCompetenciaAjuizamento;
window.calcularAtualizacaoAteAjuizamento = calcularAtualizacaoAteAjuizamento;
window.calcularParcelaAjuizamento = calcularParcelaAjuizamento;
window.calcularVincendas = calcularVincendas;
window.calcularLimiteJuizado = calcularLimiteJuizado;
window.calcularRenunciaAjuizamento = calcularRenunciaAjuizamento;
window.calcularAcordo = calcularAcordo;
window.calcularFormacaoDemanda = calcularFormacaoDemanda;
window.renderizarMemoriaAjuizamento = renderizarMemoriaAjuizamento;
window.renderizarFormacaoDemanda = renderizarFormacaoDemanda;

// =====================================================================
// INICIALIZAÇÃO – DOMContentLoaded
// =====================================================================
document.addEventListener('DOMContentLoaded', function() {
    criarModalAdmin();

    // Fase 1.9A – listeners da Guia 6
    var btnFormacao = document.getElementById('btnCalcularFormacaoDemanda');
    if (btnFormacao) {
        btnFormacao.addEventListener('click', function() {
            calcularFormacaoDemanda();
        });
    }

    var btnMemoria = document.getElementById('btnToggleMemoriaAjuizamento');
    if (btnMemoria) {
        btnMemoria.addEventListener('click', function() {
            var painel = document.getElementById('painelMemoriaAjuizamento');
            var statusMemoria = document.getElementById('statusMemoriaAjuizamento');
            var aberto = painel && !painel.classList.contains('hidden');

            if (painel) painel.classList.toggle('hidden', aberto);
            if (statusMemoria) statusMemoria.textContent = aberto ? 'Fechado' : 'Aberto';
        });
    }

    var camposGuia6 = [
        'metodoVincendas',
        'tratamentoMesAjuizamento',
        'incluir13Vincendas',
        'limitarAoTeto',
        'quantidadeSalariosMinimos',
        'acordoAtivo',
        'percentualAcordoPreset',
        'percentualAcordo',
        'dataAjuizamento'
    ];

    camposGuia6.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;

        function sincronizarGuia6() {
            // Alguns campos alteram outros controles da seção de acordo
            // (por exemplo, desativar o acordo força 100%). Atualizamos a UI
            // primeiro e, em seguida, coletamos o estado completo para que o
            // objeto global reflita exatamente o que está na tela.
            if (id === 'acordoAtivo' || id === 'percentualAcordoPreset') {
                guia6AtualizarEstadoAcordo();
            }

            guia6ColetarParametrosFormacaoDemanda();
            guia6InvalidarResultado();
        }

        el.addEventListener('input', sincronizarGuia6);
        el.addEventListener('change', sincronizarGuia6);
    });

    guia6AtualizarEstadoAcordo();

    document.addEventListener('keydown', function(e) {
        var tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            var modal = document.getElementById('adminModal');
            if (modal) {
                modal.classList.remove('hidden');
                var msgDiv = document.getElementById('adminMensagens');
                if (msgDiv) {
                    msgDiv.classList.add('hidden');
                    msgDiv.textContent = '';
                }
                if (!window.INDEXADORES_ATUALIZACAO) {
                    adminExibirMensagem(
                        'Aviso: base de indexadores não carregada. Verifique data/indexadores.js.',
                        'warning'
                    );
                }
            }
        }
    });

    // =====================================================================
    // ACCORDION – Blocos de parâmetros recolhíveis
    // =====================================================================
    document.querySelectorAll('.accordion-toggle').forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            var targetId = this.dataset.target;
            var content = document.getElementById(targetId);
            var icon = this.querySelector('.accordion-icon');
            if (content) {
                content.classList.toggle('hidden');
                if (icon) {
                    if (content.classList.contains('hidden')) {
                        icon.textContent = '[+]';
                    } else {
                        icon.textContent = '[-]';
                    }
                }
            }
        });
    });

    var btnCorrecao = document.getElementById('btnCarregarCorrecao');
    var fileCorrecao = document.getElementById('fileInputCorrecao');
    if (btnCorrecao && fileCorrecao) {
        btnCorrecao.addEventListener('click', function() {
            fileCorrecao.click();
        });
        fileCorrecao.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (file) {
                adminCarregarParametroGuia5(file, 'correcao_monetaria');
            }
            this.value = '';
        });
    }

    var btnJurosSelic = document.getElementById('btnCarregarJurosSelic');
    var fileJurosSelic = document.getElementById('fileInputJurosSelic');
    if (btnJurosSelic && fileJurosSelic) {
        btnJurosSelic.addEventListener('click', function() {
            fileJurosSelic.click();
        });
        fileJurosSelic.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (file) {
                adminCarregarParametroGuia5(file, 'juros_selic');
            }
            this.value = '';
        });
    }

    // Reatribuir eventos aos botões .atalho-oficial (já existentes)
    document.querySelectorAll('.atalho-oficial').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var nome = this.dataset.encadeamento;
            carregarEncadeamentoOficial(nome);
        });
    });

    var btnImportarDiferencas = document.getElementById('btnImportarDiferencas');
    if (btnImportarDiferencas) {
        btnImportarDiferencas.addEventListener('click', function() {
            importarDiferencasGuia4ParaAtualizacao();
        });
    }

    var btnCalcular = document.getElementById('btnCalcularAtualizacao');
    if (btnCalcular) {
        btnCalcular.addEventListener('click', function() {
            calcularAtualizacaoGuia5();
        });
    }

    function configurarListenerReset(containerId, eventos) {
        var container = document.getElementById(containerId);
        if (!container) return;
        eventos.forEach(function(evt) {
            container.addEventListener(evt, function(e) {
                if (containerId === 'guia-atualizacao') return;
                if (window.diferencasAtualizacaoAtual) {
                    limparDiferencasAtualizacao(
                        '⚠️ Diferenças não importadas após alteração dos dados. Reimporte a Guia 4. Parâmetros de correção e juros mantidos.'
                    );
                }
            }, true);
        });
    }

    configurarListenerReset('guia-entradas', ['input', 'change']);
    configurarListenerReset('guia-beneficios-recebidos', ['input', 'change']);
    configurarListenerReset('guia-diferencas', ['input', 'change']);

    document.querySelectorAll('.nav-guia button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (this.dataset.guia === 'atualizacao') {
                sincronizarParametrosAtualizacao();
            }
        });
    });

    var guiaAtiva = document.querySelector('.nav-guia button.ativo');
    if (guiaAtiva && guiaAtiva.dataset.guia === 'atualizacao') {
        sincronizarParametrosAtualizacao();
    }

    window.coletarDiferencasParaAtualizacao = coletarDiferencasParaAtualizacao;
    window.sincronizarParametrosAtualizacao = sincronizarParametrosAtualizacao;
    window.importarDiferencasGuia4ParaAtualizacao = importarDiferencasGuia4ParaAtualizacao;
    window.limparDiferencasAtualizacao = limparDiferencasAtualizacao;
});