// =====================================================================
// MOTOR DE EVOLUÇÃO PREVIDENCIÁRIA (Fase 1.7D1A – Salário Mínimo)
// =====================================================================

// Estado global do motor
var indicesAtivos = BASE_INTERNA;
var fonteIndices = 'interna';
var dataFinalAlteradaManualmente = false;
var termoInicialManual = false;
var estadoTermoInicial = {
    valor: '',
    manual: false,
    origem: 'automatico'
};

// ---------------------------------------------------------------------
// FUNÇÃO CENTRAL DE CÁLCULO (reutilizável) – CORRIGIDA
// ---------------------------------------------------------------------
function calcularEvolucao(parametros) {
    // Parâmetros esperados:
    // {
    //   dib: "DD/MM/AAAA" ou "MM/AAAA",
    //   rmi: number,
    //   dataFinal: "MM/AAAA",
    //   transformado: boolean,
    //   dibAntecedente: "DD/MM/AAAA" ou "MM/AAAA" (opcional),
    //   tipoBeneficio: "previdenciario" | "assistencial",
    //   percentualDesdobramento: number (ex: 100),
    //   adicionalTipo: "0" | "25" | "outro",
    //   adicionalPercentual: number (se adicionalTipo === "outro"),
    //   baseadoSalarioMinimo: boolean (opcional, default false)
    // }
    console.log('[MOTOR] baseadoSalarioMinimo =', parametros.baseadoSalarioMinimo);
    const {
        dib: strDib,
        rmi,
        dataFinal: strDataFinal,
        transformado,
        dibAntecedente: strDibAnt,
        tipoBeneficio,
        percentualDesdobramento = 100,
        adicionalTipo = "0",
        adicionalPercentual = 0,
        baseadoSalarioMinimo = false
    } = parametros;

    // 1) Validar e parsear DIB
    const dibObj = parseDataFlexivel(strDib, true);
    if (!dibObj) {
        throw new Error("DIB inválida. Use DD/MM/AAAA ou MM/AAAA.");
    }

    // 2) Validar e parsear Data Final
    const finalObj = parseDataFlexivel(strDataFinal, false);
    if (!finalObj) {
        throw new Error("Data Final inválida. Use MM/AAAA.");
    }

    const chaveDib = getChaveCronologica(dibObj.mes, dibObj.ano);
    const chaveFinal = getChaveCronologica(finalObj.mes, finalObj.ano);
    if (chaveFinal < chaveDib) {
        throw new Error("Data Final não pode ser anterior à DIB.");
    }

    // 3) DIB de referência (transformação)
    let dibReferencia = dibObj;
    if (transformado) {
        if (!strDibAnt) {
            throw new Error("DIB antecedente não informada para benefício transformado.");
        }
        const dibAntObj = parseDataFlexivel(strDibAnt, true);
        if (!dibAntObj) {
            throw new Error("DIB antecedente inválida.");
        }
        dibReferencia = dibAntObj;
    }

    const chaveDibRef = getChaveCronologica(dibReferencia.mes, dibReferencia.ano);

    // ============================================================
    // NOVA LÓGICA: Se baseadoSalarioMinimo = true, evoluir por SM
    // ============================================================
    if (baseadoSalarioMinimo) {
        // Percorrer as competências de DIB até DataFinal, pegando o SM de cada competência
        const memoria = [];
        let currentMes = dibObj.mes;
        let currentAno = dibObj.ano;
        const finalMes = finalObj.mes;
        const finalAno = finalObj.ano;

        while (currentAno < finalAno || (currentAno === finalAno && currentMes <= finalMes)) {
            const competencia = String(currentMes).padStart(2, '0') + '/' + currentAno;
            // Usa a função global obterSalarioMinimoPorCompetencia (definida em app.js)
            const sm = obterSalarioMinimoPorCompetencia(competencia);
            if (sm === null) {
                throw new Error(`Salário mínimo não encontrado para ${competencia}`);
            }
            // Aplicar adicional, se houver
            let valorFinal = sm;
            if (adicionalTipo === '25') {
                valorFinal = sm * 1.25;
            } else if (adicionalTipo === 'outro' && adicionalPercentual > 0) {
                valorFinal = sm * (1 + adicionalPercentual / 100);
            }
            valorFinal = Math.round(valorFinal * 100) / 100;

            memoria.push({
                competencia: competencia,
                tipo: 'SM',                 // Tipo específico para salário mínimo
                indice: null,               // Não aplicável
                salarioMinimo: sm,
                teto: null,                 // Não aplicável
                indiceTeto: null,           // Não aplicável
                status: 'SALARIO_MINIMO',   // Status específico
                valorTeorico: valorFinal,
                valorFinal: valorFinal,
                valorEvoluido: valorFinal
            });

            // Avançar mês
            if (currentMes === 12) {
                currentMes = 1;
                currentAno++;
            } else {
                currentMes++;
            }
        }

        const rmaFinal = memoria.length ? memoria[memoria.length - 1].valorFinal : rmi;
        return {
            memoria,
            rmaFinal,
            statusFinal: 'SALARIO_MINIMO',
            qtdReajustes: 0,
            ultimoReajuste: '-',
            ultimoIndice: null
        };
    }

    // ============================================================
    // LÓGICA TRADICIONAL (índices previdenciários)
    // ============================================================

    // 4) Ordenar tabelas de índices
    let tabelasOrdenadas = Object.keys(indicesAtivos).map(anoKey => {
        let item = indicesAtivos[anoKey];
        let [mesComp, anoComp] = item.competencia.split('/').map(Number);
        return {
            anoKey,
            competencia: item.competencia,
            integral: item.integral,
            pro_rata: item.pro_rata,
            chaveCronologica: getChaveCronologica(mesComp, anoComp)
        };
    }).sort((a, b) => a.chaveCronologica - b.chaveCronologica);

    // 5) Verificar se existe pelo menos uma tabela posterior à DIB de referência
    const tabelasPosteriores = tabelasOrdenadas.filter(tab => tab.chaveCronologica > chaveDibRef);
    if (tabelasPosteriores.length === 0) {
        // Nenhum reajuste aplicável: retorna valores padrão
        return {
            memoria: [],
            rmaFinal: rmi,
            statusFinal: "NORMAL",
            qtdReajustes: 0,
            ultimoReajuste: "-",
            ultimoIndice: null
        };
    }

    // 6) Filtrar tabelas que estão dentro do intervalo (DIBRef < competencia <= DataFinal)
    const tabelasIntervalo = tabelasOrdenadas.filter(tab => 
        tab.chaveCronologica > chaveDibRef && tab.chaveCronologica <= chaveFinal
    );

    // 7) Executar evolução
    let valorAtual = rmi;
    let statusAtual = "NORMAL";
    let indiceTetoGuardado = null;
    let valorEvoluido = rmi;
    let memoria = [];
    let qtdReajustes = 0;
    let primeiroReajusteFeito = false;
    let ultimoReajusteCompetencia = '';
    let ultimoIndiceAplicado = null;

    for (let tab of tabelasIntervalo) {
        const limitadores = obterLimitadores(tab.competencia);
        if (!limitadores) {
            throw new Error(`Sem vigência para ${tab.competencia}.`);
        }
        const { salarioMinimo, teto } = limitadores;

        let indiceEvolucao = 0;
        if (!primeiroReajusteFeito) {
            let chaveMesAnoDib = dibReferencia.strCompetencia;
            if (tab.pro_rata && tab.pro_rata[chaveMesAnoDib]) {
                indiceEvolucao = tab.pro_rata[chaveMesAnoDib];
            } else {
                let [mesTab, anoTab] = tab.competencia.split('/').map(Number);
                if (dibReferencia.mes === mesTab) {
                    indiceEvolucao = tab.integral;
                } else {
                    indiceEvolucao = tab.integral;
                }
            }
        } else {
            indiceEvolucao = tab.integral;
        }
        valorEvoluido = Math.floor(valorEvoluido * indiceEvolucao * 100) / 100;

        if (statusAtual === "PISO") {
            memoria.push({
                competencia: tab.competencia,
                tipo: "PISO",
                indice: indiceEvolucao,
                salarioMinimo,
                teto,
                indiceTeto: null,
                status: "PISO",
                valorTeorico: salarioMinimo,
                valorFinal: salarioMinimo,
                valorEvoluido: valorEvoluido
            });
            valorAtual = salarioMinimo;
            qtdReajustes++;
            ultimoReajusteCompetencia = tab.competencia;
            ultimoIndiceAplicado = indiceEvolucao;
            continue;
        }

        let tipoIndice = "";
        let indiceAplicado = 0;
        if (!primeiroReajusteFeito) {
            tipoIndice = "PRO RATA";
            let chaveMesAnoDib = dibReferencia.strCompetencia;
            if (tab.pro_rata && tab.pro_rata[chaveMesAnoDib]) {
                indiceAplicado = tab.pro_rata[chaveMesAnoDib];
            } else {
                let [mesTab, anoTab] = tab.competencia.split('/').map(Number);
                if (dibReferencia.mes === mesTab) {
                    indiceAplicado = tab.integral;
                    tipoIndice = "PRO RATA/FALLBACK";
                } else {
                    throw new Error(`Índice Pro Rata para DIB ${chaveMesAnoDib} não encontrado.`);
                }
            }
            primeiroReajusteFeito = true;
        } else {
            tipoIndice = "INTEGRAL";
            indiceAplicado = tab.integral;
        }

        let valorTeorico;
        if (statusAtual === "LIMITADO_TETO" && indiceTetoGuardado !== null) {
            valorTeorico = valorAtual * indiceAplicado * indiceTetoGuardado;
        } else {
            valorTeorico = valorAtual * indiceAplicado;
        }
        valorTeorico = Math.floor(valorTeorico * 100) / 100;

        let valorFinal = valorTeorico;
        let statusAtualizado = statusAtual;
        let indiceTetoCalculado = null;

        if (valorTeorico < salarioMinimo) {
            valorFinal = salarioMinimo;
            statusAtualizado = "PISO";
            indiceTetoGuardado = null;
        } else if (valorTeorico > teto) {
            if (statusAtual !== "LIMITADO_TETO") {
                indiceTetoCalculado = valorTeorico / teto;
                indiceTetoGuardado = indiceTetoCalculado;
            } else {
                indiceTetoCalculado = indiceTetoGuardado;
            }
            valorFinal = teto;
            statusAtualizado = "LIMITADO_TETO";
        } else {
            statusAtualizado = "NORMAL";
            indiceTetoGuardado = null;
        }

        valorAtual = valorFinal;
        statusAtual = statusAtualizado;

        memoria.push({
            competencia: tab.competencia,
            tipo: tipoIndice,
            indice: indiceAplicado,
            salarioMinimo,
            teto,
            indiceTeto: indiceTetoCalculado,
            status: statusAtualizado,
            valorTeorico,
            valorFinal,
            valorEvoluido: valorEvoluido
        });

        qtdReajustes++;
        ultimoReajusteCompetencia = tab.competencia;
        ultimoIndiceAplicado = indiceAplicado;
    }

    // 8) Resultado
    const rmaFinal = memoria.length ? memoria[memoria.length - 1].valorFinal : rmi;
    const statusFinal = memoria.length ? memoria[memoria.length - 1].status : "NORMAL";
    const ultimoReajuste = ultimoReajusteCompetencia || "-";
    const ultimoIndice = ultimoIndiceAplicado || null;

    return {
        memoria,
        rmaFinal,
        statusFinal,
        qtdReajustes,
        ultimoReajuste,
        ultimoIndice
    };
}

// ---------------------------------------------------------------------
// FUNÇÃO DE SEGURANÇA PARA A GUI "ENTRADAS"
// ---------------------------------------------------------------------
function executarCalculo() {
    if (document.getElementById('tipoAcao').value !== 'previdenciaria') {
        mostrarErro('O cálculo de evolução está disponível apenas para "Ações Previdenciárias".');
        return;
    }

    const painelErro = document.getElementById('painelErro');
    if (painelErro) painelErro.classList.add('hidden');

    if (fonteIndices === 'externa' && indicesAtivos === BASE_INTERNA) {
        mostrarErro("Você selecionou 'Arquivo Externo', mas nenhum arquivo foi carregado.");
        return;
    }

    try {
        const parametros = {
            dib: document.getElementById('dib').value,
            rmi: parseMoeda(document.getElementById('rmi').value),
            dataFinal: document.getElementById('dataFinal').value,
            transformado: document.querySelector('input[name="transformado"]:checked').value === 'sim',
            dibAntecedente: document.getElementById('dibAnterior').value,
            tipoBeneficio: document.getElementById('tipoBeneficio').value,
            percentualDesdobramento: parseFloat(document.getElementById('percentualDesdobramento').value.replace(',', '.')) || 100,
            adicionalTipo: document.getElementById('adicionalRenda').value,
            adicionalPercentual: parseFloat(document.getElementById('adicionalPercentual').value.replace(',', '.')) || 0,
            baseadoSalarioMinimo: document.getElementById('baseadoSalarioMinimoDevido').checked
        };

        const resultado = calcularEvolucao(parametros);
        exibirResultado(resultado, parametros);

    } catch (erro) {
        mostrarErro('Erro: ' + erro.message);
        ativarGuia('entradas');
    }
}

// ---------------------------------------------------------------------
// FUNÇÃO PARA EXIBIR O RESULTADO NA GUIA "EVOLUÇÃO DEVIDA"
// ---------------------------------------------------------------------
function exibirResultado(resultado, parametros) {
    const { memoria, rmaFinal, statusFinal, qtdReajustes, ultimoReajuste, ultimoIndice } = resultado;

    window.memoriaEvolucaoDevida = memoria;

    const divIdent = document.getElementById('identificacaoCalculo');
    if (divIdent) {
        divIdent.innerHTML = '';
        let temCampo = false;
        const camposIdent = [
            { id: 'processo', label: 'Processo' },
            { id: 'autor', label: 'Autor' },
            { id: 'reu', label: 'Réu' },
            { id: 'nb', label: 'NB' },
            { id: 'especie', label: 'Espécie' },
            { id: 'cpf', label: 'CPF' },
            { id: 'dataCalculo', label: 'Data do Cálculo' },
            { id: 'observacoes', label: 'Observações' }
        ];
        for (let campo of camposIdent) {
            const el = document.getElementById(campo.id);
            if (el && el.value.trim() !== '') {
                temCampo = true;
                const item = document.createElement('div');
                item.className = 'item';
                const rotulo = document.createElement('span');
                rotulo.className = 'rotulo';
                rotulo.innerText = campo.label;
                const valor = document.createElement('span');
                valor.className = 'valor';
                valor.innerText = el.value.trim();
                item.appendChild(rotulo);
                item.appendChild(valor);
                divIdent.appendChild(item);
            }
        }
        divIdent.classList.toggle('hidden', !temCampo);
    }

    const dibObj = parseDataFlexivel(parametros.dib, true);
    const finalObj = parseDataFlexivel(parametros.dataFinal, false);
    document.getElementById('resDIB').innerText = formatarDataExibicao(dibObj);
    document.getElementById('resRMI').innerText = formatarMoeda(parametros.rmi);
    document.getElementById('resDataFinal').innerText = formatarDataExibicao(finalObj);
    document.getElementById('resQtdReajustes').innerText = qtdReajustes;
    document.getElementById('resRMA').innerText = formatarMoeda(rmaFinal);

    const resumoExecutivo = document.getElementById('resumoExecutivo');
    if (memoria.length > 0) {
        const ultimoRegistro = memoria[memoria.length - 1];
        const statusExibicao = ultimoRegistro.status === 'LIMITADO_TETO' ? 'TETO' : ultimoRegistro.status === 'SALARIO_MINIMO' ? 'SM' : ultimoRegistro.status;
        document.getElementById('resumoStatus').innerText = statusExibicao;
        document.getElementById('resumoSalarioMinimo').innerText = formatarNumero(ultimoRegistro.salarioMinimo);
        document.getElementById('resumoTeto').innerText = formatarNumero(ultimoRegistro.teto);
        document.getElementById('resumoValorEvoluido').innerText = formatarNumero(ultimoRegistro.valorEvoluido);
        document.getElementById('resumoUltimoIndice').innerText = ultimoIndice !== null ? ultimoIndice.toFixed(4) : '-';
        document.getElementById('resumoCompetencia').innerText = ultimoReajuste;
        resumoExecutivo.classList.remove('hidden');
    } else {
        resumoExecutivo.classList.add('hidden');
    }

    const avisoRma = document.getElementById('avisoRmaMantida');
    const ultimoReajusteEl = document.getElementById('ultimoReajusteData');
    if (ultimoReajuste && memoria.length > 0 && ultimoReajuste !== formatarDataExibicao(finalObj)) {
        avisoRma.classList.remove('hidden');
        ultimoReajusteEl.innerText = ultimoReajuste;
    } else {
        avisoRma.classList.add('hidden');
    }

    const tbody = document.getElementById('tabelaMemoria');
    if (tbody) {
        tbody.innerHTML = '';
        if (memoria.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-500">Nenhum reajuste aplicável.</td></tr>`;
        } else {
            memoria.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 transition";
                let statusExibicao = item.status === 'LIMITADO_TETO' ? 'TETO' : item.status === 'SALARIO_MINIMO' ? 'SM' : item.status;
                let rowClass = '';
                if (item.status === 'PISO') rowClass = 'row-piso';
                else if (item.status === 'LIMITADO_TETO') rowClass = 'row-teto';
                if (rowClass) tr.classList.add(rowClass);
                let statusBadgeClass = 'status-normal';
                if (item.status === 'PISO') statusBadgeClass = 'status-piso';
                else if (item.status === 'LIMITADO_TETO') statusBadgeClass = 'status-teto';
                else if (item.status === 'SALARIO_MINIMO') statusBadgeClass = 'status-sm';
                tr.innerHTML = `
                    <td class="p-3 font-semibold text-slate-800">${item.competencia}</td>
                    <td class="p-3">${item.tipo ? `<span class="px-2 py-0.5 rounded text-xs font-bold ${item.tipo === 'PRO RATA' ? 'bg-amber-100 text-amber-800 border border-amber-200' : item.tipo === 'INTEGRAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : item.tipo === 'PRO RATA/FALLBACK' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}">${item.tipo}</span>` : '-'}</td>
                    <td class="p-3 text-slate-600">${item.indice !== null ? item.indice.toFixed(4) : '-'}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.salarioMinimo)}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.teto)}</td>
                    <td class="p-3 text-slate-600">${item.indiceTeto !== null ? item.indiceTeto.toFixed(5) : '-'}</td>
                    <td class="p-3"><span class="status-badge ${statusBadgeClass}">${statusExibicao}</span></td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.valorTeorico)}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.valorEvoluido)}</td>
                    <td class="p-3 valor-final">${formatarNumero(item.valorFinal)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    const painelResultado = document.getElementById('painelResultado');
    const msgSemCalculo = document.getElementById('msgSemCalculo');
    if (painelResultado) painelResultado.classList.remove('hidden');
    if (msgSemCalculo) {
        msgSemCalculo.classList.add('hidden');
        msgSemCalculo.style.display = 'none';
    }
    ativarGuia('evolucao-devida');
    if (painelResultado) {
        painelResultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// =====================================================================
// ALIAS PARA USO EM BENEFÍCIOS RECEBIDOS E FUTURAS EXTENSÕES
// =====================================================================
var evoluirBeneficio = calcularEvolucao;

// =====================================================================
// FUNÇÕES DE PRESCRIÇÃO E TERMO INICIAL
// =====================================================================

function definirTermoInicial(valor, origem) {
    estadoTermoInicial.valor = valor;
    estadoTermoInicial.origem = origem;
    estadoTermoInicial.manual = (origem === 'manual');

    const campo1 = document.getElementById('termoInicialDiferencas');
    const campo2 = document.getElementById('termoInicialDiferencas2');
    if (campo1) campo1.value = valor;
    if (campo2) campo2.value = valor;

    const status1 = document.getElementById('statusTermoPrincipal');
    const status2 = document.getElementById('statusTermoBeneficio');
    if (origem === 'manual') {
        if (status1) status1.textContent = 'Termo informado manualmente.';
        if (status2) status2.textContent = 'Termo informado manualmente.';
    } else {
        if (status1) status1.textContent = 'Termo calculado automaticamente.';
        if (status2) status2.textContent = 'Termo calculado automaticamente.';
    }
}

function alternarModoTermoInicial(cadeadoClicado) {
    const cadeados = document.querySelectorAll('.cadeado');
    const campos = document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2');
    const estaAberto = cadeadoClicado.classList.contains('aberto');

    if (estaAberto) {
        cadeados.forEach(el => {
            el.classList.remove('aberto');
            el.classList.add('fechado');
            el.textContent = '🔒';
        });
        campos.forEach(el => {
            if (el) {
                el.readOnly = true;
                el.classList.remove('bg-white');
                el.classList.add('bg-slate-50');
            }
        });
        termoInicialManual = false;
        calcularTermoInicial();
    } else {
        cadeados.forEach(el => {
            el.classList.remove('fechado');
            el.classList.add('aberto');
            el.textContent = '🔓';
        });
        campos.forEach(el => {
            if (el) {
                el.readOnly = false;
                el.classList.remove('bg-slate-50');
                el.classList.add('bg-white');
            }
        });
        termoInicialManual = true;
        const valorAtual = document.getElementById('termoInicialDiferencas').value;
        definirTermoInicial(valorAtual, 'manual');
    }
}

function sincronizarTermoInicial(campoOrigem) {
    if (!termoInicialManual) return;
    const valor = campoOrigem.value;
    const valido = /^\d{2}\/\d{4}$/.test(valor);
    if (valido) {
        const partes = valor.split('/');
        const mes = parseInt(partes[0], 10);
        const ano = parseInt(partes[1], 10);
        if (mes >= 1 && mes <= 12 && ano >= 1900 && ano <= 2100) {
            const outro = campoOrigem.id === 'termoInicialDiferencas' ?
                document.getElementById('termoInicialDiferencas2') :
                document.getElementById('termoInicialDiferencas');
            if (outro && outro.value !== valor) {
                outro.value = valor;
            }
            estadoTermoInicial.valor = valor;
            estadoTermoInicial.manual = true;
            estadoTermoInicial.origem = 'manual';
            return;
        }
    }
}

function calcularTermoInicial() {
    if (termoInicialManual) return;

    const aplicarPrescricao = document.getElementById('aplicarPrescricao').value === 'sim';
    const prazo = parseInt(document.getElementById('prazoPrescricional').value) || 5;
    const strDib = document.getElementById('dib').value;
    const dibObj = parseDataFlexivel(strDib, true);
    if (!dibObj) return;

    let termoMes = dibObj.mes;
    let termoAno = dibObj.ano;

    if (aplicarPrescricao) {
        const strAjuizamento = document.getElementById('dataAjuizamento').value;
        const ajuizamentoObj = parseDataFlexivel(strAjuizamento, true);
        if (ajuizamentoObj) {
            let anoMarco = ajuizamentoObj.ano - prazo;
            let mesMarco = ajuizamentoObj.mes;
            while (mesMarco < 1) { mesMarco += 12; anoMarco--; }
            const chaveDib = getChaveCronologica(dibObj.mes, dibObj.ano);
            const chaveMarco = getChaveCronologica(mesMarco, anoMarco);
            if (chaveMarco > chaveDib) {
                termoMes = mesMarco;
                termoAno = anoMarco;
            }
        }
    }

    const valor = `${String(termoMes).padStart(2,'0')}/${termoAno}`;
    definirTermoInicial(valor, 'automatico');
}

// =====================================================================
// FUNÇÕES DE GERENCIAMENTO DE ÍNDICES
// =====================================================================

function toggleFonteIndices() {
    const opcao = document.querySelector('input[name="fonteIndices"]:checked').value;
    const grupoUpload = document.getElementById('grupoUpload');
    const fonteAtiva = document.getElementById('fonteAtiva');
    if (opcao === 'interna') {
        grupoUpload.classList.add('hidden');
        fonteAtiva.innerText = 'Interna';
        indicesAtivos = BASE_INTERNA;
        fonteIndices = 'interna';
        document.getElementById('statusIndices').innerText = '(usando base interna)';
    } else {
        grupoUpload.classList.remove('hidden');
        fonteAtiva.innerText = 'Externa (arquivo)';
        fonteIndices = 'externa';
        if (indicesAtivos === BASE_INTERNA) {
            document.getElementById('statusIndices').innerText = '(nenhum arquivo carregado)';
        }
    }
}

function carregarIndicesExternos() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Selecione um arquivo JSON primeiro.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            const anos = Object.keys(dados);
            if (anos.length === 0 || !dados[anos[0]].competencia) {
                throw new Error('Estrutura JSON inválida. Verifique o formato.');
            }
            indicesAtivos = dados;
            fonteIndices = 'externa';
            document.getElementById('statusIndices').innerText = `✅ ${anos.length} anos carregados (${Object.keys(dados[anos[0]].pro_rata).length} pro-rata)`;
            document.getElementById('fonteAtiva').innerText = 'Externa (arquivo)';
            alert('Índices carregados com sucesso!');
        } catch (error) {
            alert('Erro ao carregar o arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function restaurarBaseInterna() {
    indicesAtivos = BASE_INTERNA;
    fonteIndices = 'interna';
    document.querySelector('input[name="fonteIndices"][value="interna"]').checked = true;
    toggleFonteIndices();
    document.getElementById('statusIndices').innerText = '(base interna restaurada)';
    document.getElementById('fileInput').value = '';
    alert('Base interna restaurada com sucesso.');
}

// =====================================================================
// FUNÇÕES DE TIPO DE AÇÃO E SINCRONIZAÇÃO
// =====================================================================

function onTipoAcaoChange() {
    const tipo = document.getElementById('tipoAcao').value;
    const blocoBeneficio = document.getElementById('blocoBeneficio');
    const msgOutros = document.getElementById('msgOutrosTipos');
    if (tipo === 'previdenciaria') {
        blocoBeneficio.style.display = 'block';
        msgOutros.classList.add('hidden');
    } else {
        blocoBeneficio.style.display = 'none';
        msgOutros.classList.remove('hidden');
    }
}

function sincronizarDataFinal() {
    if (dataFinalAlteradaManualmente) return;
    const dataAtualizacao = document.getElementById('dataAtualizacao').value;
    if (dataAtualizacao.length === 7) {
        document.getElementById('dataFinal').value = dataAtualizacao;
    }
}

// =====================================================================
// FUNÇÃO DE SEGURANÇA PARA CHAMADA EXTERNA
// =====================================================================

function iniciarCalculoComSeguranca() {
    try {
        console.log('[CALCULO] Botão acionado');
        executarCalculo();
        console.log('[CALCULO] Cálculo concluído com sucesso.');
    } catch (erro) {
        console.error('[CALCULO] Erro inesperado:', erro);
        mostrarErro('Erro interno ao executar o cálculo: ' + erro.message);
        ativarGuia('entradas');
    }
}
