// =====================================================================
// DIFERENÇAS – GUIA 4 (FASE 1.7D2 – ABONO ANUAL + ANO FINAL + INDIVIDUAL)
// =====================================================================

var dadosDiferencas = {
    modoCompensacao: 'limite',
    celulasEditadas: {},
    justificativas: {}
};

// =====================================================================
// FUNÇÃO AUXILIAR PARA CONVERTER COMPETÊNCIA
// =====================================================================
function converterCompetenciaParaNumero(str) {
    if (!str) return NaN;
    const partes = str.split('/');
    let mes, ano;
    if (partes.length === 3) {
        mes = parseInt(partes[1], 10);
        ano = parseInt(partes[2], 10);
    } else if (partes.length === 2) {
        mes = parseInt(partes[0], 10);
        ano = parseInt(partes[1], 10);
    } else {
        return NaN;
    }
    if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12 || ano < 1900) return NaN;
    return ano * 100 + mes;
}

// =====================================================================
// FUNÇÕES DE PROPORCIONALIDADE – MÊS COMERCIAL DE 30 DIAS
// =====================================================================

function parseDataProporcional30(str) {
    if (!str) return null;
    const limpo = str.trim();
    const partes = limpo.split('/');
    let dia, mes, ano;
    if (partes.length === 3) {
        dia = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10);
        ano = parseInt(partes[2], 10);
    } else if (partes.length === 2) {
        dia = 1;
        mes = parseInt(partes[0], 10);
        ano = parseInt(partes[1], 10);
    } else {
        return null;
    }
    if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12 || ano < 1900) return null;
    if (!isNaN(dia) && dia > 31) return null;
    if (dia > 30) dia = 30;
    return { dia, mes, ano };
}

function normalizarDia30(dia) {
    return dia > 30 ? 30 : dia;
}

function compararDataProporcional30(a, b) {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    if (a.ano !== b.ano) return a.ano - b.ano;
    if (a.mes !== b.mes) return a.mes - b.mes;
    return a.dia - b.dia;
}

function maxDataProporcional30(a, b) {
    return compararDataProporcional30(a, b) >= 0 ? a : b;
}

function minDataProporcional30(a, b) {
    return compararDataProporcional30(a, b) <= 0 ? a : b;
}

function calcularDiasAtivos30(mes, ano, dataInicio, dataFim) {
    const inicioDia = dataInicio ? normalizarDia30(dataInicio.dia) : 1;
    const fimDia = dataFim ? normalizarDia30(dataFim.dia) : 30;

    if (dataInicio) {
        const numInicio = dataInicio.ano * 100 + dataInicio.mes;
        const numAtual = ano * 100 + mes;
        if (numAtual < numInicio) return 0;
    }
    if (dataFim) {
        const numFim = dataFim.ano * 100 + dataFim.mes;
        const numAtual = ano * 100 + mes;
        if (numAtual > numFim) return 0;
    }

    let diaInicio = 1;
    let diaFim = 30;
    if (dataInicio && dataInicio.mes === mes && dataInicio.ano === ano) {
        diaInicio = inicioDia;
    }
    if (dataFim && dataFim.mes === mes && dataFim.ano === ano) {
        diaFim = fimDia;
    }

    if (dataInicio) {
        const numInicio = dataInicio.ano * 100 + dataInicio.mes;
        const numAtual = ano * 100 + mes;
        if (numAtual < numInicio) return 0;
        if (numAtual === numInicio && diaInicio > 30) return 0;
    }
    if (dataFim) {
        const numFim = dataFim.ano * 100 + dataFim.mes;
        const numAtual = ano * 100 + mes;
        if (numAtual > numFim) return 0;
        if (numAtual === numFim && diaFim < 1) return 0;
    }

    let inicio = Math.max(1, diaInicio);
    let fim = Math.min(30, diaFim);
    if (inicio > fim) return 0;
    return fim - inicio + 1;
}

function calcularFracaoAtiva(mes, ano, dataInicio, dataFim) {
    const dias = calcularDiasAtivos30(mes, ano, dataInicio, dataFim);
    if (dias === 0) return 0;
    return dias / 30;
}

function obterDataInicioAnalise() {
    const termo = document.getElementById('termoInicialDiferencas').value;
    return parseDataProporcional30(termo);
}

function obterDataFimAnalise() {
    const dataFinal = document.getElementById('dataFinal').value;
    const parsed = parseDataProporcional30(dataFinal);
    if (parsed) {
        parsed.dia = 30;
    }
    return parsed;
}

// =====================================================================
// FUNÇÕES DA DIP DO BENEFÍCIO DEVIDO (Fase 1.6)
// =====================================================================

function calcularDiaAnteriorDIP(dipStr) {
    if (!dipStr || dipStr.trim() === '') return null;
    const parsed = parseDataProporcional30(dipStr);
    if (!parsed) return null;

    let { dia, mes, ano } = parsed;
    if (dia > 1) {
        dia = dia - 1;
    } else {
        mes = mes - 1;
        if (mes === 0) {
            mes = 12;
            ano = ano - 1;
        }
        dia = 30;
    }
    return { dia, mes, ano };
}

function obterFimEfetivoDevido() {
    const dataFinalStr = document.getElementById('dataFinal').value;
    const dataFinalObj = parseDataProporcional30(dataFinalStr);
    if (!dataFinalObj) return null;

    const dipVal = document.getElementById('dipDevido').value.trim();
    if (dipVal === '') {
        return { dia: 30, mes: dataFinalObj.mes, ano: dataFinalObj.ano };
    }

    const diaAnterior = calcularDiaAnteriorDIP(dipVal);
    if (!diaAnterior) {
        console.warn('[DIP Devido] DIP inválida – ignorada.');
        return { dia: 30, mes: dataFinalObj.mes, ano: dataFinalObj.ano };
    }

    const dataFinalComDia = { dia: 30, mes: dataFinalObj.mes, ano: dataFinalObj.ano };
    if (compararDataProporcional30(dataFinalComDia, diaAnterior) <= 0) {
        return dataFinalComDia;
    } else {
        return diaAnterior;
    }
}

// =====================================================================
// FRAÇÃO DO DEVIDO (usa DIP)
// =====================================================================

function obterFracaoDevida(mes, ano) {
    const dib = document.getElementById('dib').value;
    const dataDib = parseDataProporcional30(dib);
    const dataInicioAnalise = obterDataInicioAnalise();
    const dataFimEfetivo = obterFimEfetivoDevido();

    if (!dataDib || !dataInicioAnalise || !dataFimEfetivo) {
        console.warn('[FracaoDevida] Data inválida, fração 0');
        return 0;
    }

    const inicio = maxDataProporcional30(dataDib, dataInicioAnalise);
    const fim = dataFimEfetivo;

    if (compararDataProporcional30(fim, inicio) < 0) {
        return 0;
    }

    return calcularFracaoAtiva(mes, ano, inicio, fim);
}

// =====================================================================
// FRAÇÃO DOS RECEBIDOS – MODO PADRÃO (considera DIP)
// =====================================================================

function obterFracaoRecebida(mes, ano, ben) {
    const dip = ben.dip || ben.dib;
    const dataDib = parseDataProporcional30(ben.dib);
    const dataDip = parseDataProporcional30(dip);
    const dataDcb = ben.dcb ? parseDataProporcional30(ben.dcb) : null;
    const dataInicioAnalise = obterDataInicioAnalise();
    const dataFimAnalise = obterDataFimAnalise();

    if (!dataDib || !dataInicioAnalise || !dataFimAnalise) {
        console.warn('[FracaoRecebida] Data inválida, fração 0');
        return 0;
    }

    const inicioDia = dataDip || dataDib;
    const inicio = maxDataProporcional30(inicioDia, dataInicioAnalise);
    let fim = dataFimAnalise;
    if (dataDcb) {
        fim = minDataProporcional30(dataFimAnalise, dataDcb);
    }

    return calcularFracaoAtiva(mes, ano, inicio, fim);
}

// =====================================================================
// FRAÇÃO DOS RECEBIDOS – DESDE A DIB (ignora DIP, respeita DCB)
// =====================================================================

function obterFracaoRecebidaDesdeDib(mes, ano, ben) {
    const dataDib = parseDataProporcional30(ben.dib);
    const dataInicioAnalise = obterDataInicioAnalise();
    const dataFimAnalise = obterDataFimAnalise();
    const dataDcb = ben.dcb ? parseDataProporcional30(ben.dcb) : null;

    if (!dataDib || !dataInicioAnalise || !dataFimAnalise) {
        console.warn('[FracaoRecebidaDesdeDib] Data inválida, fração 0');
        return 0;
    }

    const inicio = maxDataProporcional30(dataDib, dataInicioAnalise);
    let fim = dataFimAnalise;
    if (dataDcb) {
        fim = minDataProporcional30(dataFimAnalise, dataDcb);
    }

    return calcularFracaoAtiva(mes, ano, inicio, fim);
}

// =====================================================================
// OBTER VALOR INTEGRAL (CARRY-OVER) – CORRIGIDO COM FALLBACK DE PISO/TETO
// =====================================================================

function obterValorIntegral(memoria, competencia, rmi, rmaFinal) {
    // A ausência de memória não significa ausência de valor. Em especial,
    // quando a evolução não atravessou nenhum reajuste, ainda precisamos
    // aplicar os limitadores vigentes na competência consultada.
    let valor = Number(rmaFinal) || Number(rmi) || 0;
    const numComp = converterCompetenciaParaNumero(competencia);
    let encontrou = false;

    if (Array.isArray(memoria) && memoria.length) {
        for (let item of memoria) {
            const numItem = converterCompetenciaParaNumero(item.competencia);
            if (!isNaN(numItem) && numItem <= numComp) {
                valor = Number(item.valorFinal) || 0;
                encontrou = true;
            } else {
                break;
            }
        }
    }

    // Se não encontramos um marco aplicável — inclusive quando a memória
    // está vazia — aplica-se o piso/teto da própria competência.
    if (!encontrou || !Array.isArray(memoria) || memoria.length === 0) {
        const limitadores = obterLimitadores(competencia);
        if (limitadores) {
            const { salarioMinimo, teto } = limitadores;
            if (valor < salarioMinimo) {
                valor = salarioMinimo;
            } else if (valor > teto) {
                valor = teto;
            }
        }
    }

    return Number(valor) || 0;
}

// =====================================================================
// COLETAR BENEFÍCIOS RECEBIDOS (SIMPLIFICADO PARA REUSO)
// =====================================================================

function coletarBeneficiosRecebidosSimplificado() {
    const beneficios = [];
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
    blocos.forEach(bloco => {
        const nb = bloco.querySelector('[data-campo="nb"]')?.value || 'Benefício';
        const id = bloco.dataset.id || `ben-${beneficios.length+1}`;
        const dib = bloco.querySelector('[data-campo="dib"]')?.value || '';
        const dip = bloco.querySelector('[data-campo="dip"]')?.value || '';
        const dcb = bloco.querySelector('[data-campo="dcb"]')?.value || '';
        const rmiStr = bloco.querySelector('[data-campo="rmi"]')?.value || '0';
        const rmi = parseFloat(rmiStr.replace(/\./g, '').replace(',', '.')) || 0;
        const possuiAbono = bloco.querySelector('[data-campo="possuiAbono"]')?.checked || false;
        const tratamentoDip = bloco.querySelector('[data-campo="tratamentoDip"]')?.value || 'inicio_dip';

        const resultadoStr = bloco.dataset.resultado;
        let memoria = [];
        let rmaFinal = rmi;
        if (resultadoStr) {
            try {
                const resultado = JSON.parse(resultadoStr);
                memoria = resultado.memoria || [];
                rmaFinal = resultado.rmaFinal || rmi;
            } catch(e) {}
        }
        beneficios.push({ id, nb, dib, dip, dcb, rmi, rmaFinal, memoria, possuiAbono, tratamentoDip });
    });
    return beneficios;
}

// =====================================================================
// FUNÇÃO PRINCIPAL: MONTAR TABELA DE DIFERENÇAS
// =====================================================================

function montarTabelaDiferencas() {
    const tbody = document.getElementById('corpoDiferencas');
    const resumoDiv = document.getElementById('resumoDiferencas');

    const termoInicial = document.getElementById('termoInicialDiferencas').value;
    const dataFinal = document.getElementById('dataFinal').value;

    if (!termoInicial || !dataFinal) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">Defina o Termo Inicial das Diferenças e a Data Final de Evolução na guia Entradas.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    const parsedTermo = parseDataProporcional30(termoInicial);
    const parsedDataFinal = parseDataProporcional30(dataFinal);
    if (!parsedTermo || !parsedDataFinal) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-amber-600">Termo Inicial ou Data Final inválidos. Use MM/AAAA ou DD/MM/AAAA.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    const dib = document.getElementById('dib').value;
    const dataDib = parseDataProporcional30(dib);
    const dataInicioAnalise = obterDataInicioAnalise();
    if (!dataDib || !dataInicioAnalise) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">DIB ou Termo Inicial inválido.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }
    const inicioEfetivo = maxDataProporcional30(dataDib, dataInicioAnalise);

    const fimEfetivo = obterFimEfetivoDevido();
    if (!fimEfetivo) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">Data Final inválida.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    if (compararDataProporcional30(fimEfetivo, inicioEfetivo) < 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-amber-600 font-semibold">Não há período de diferenças. A DIP do benefício devido é anterior ou igual ao início efetivo das diferenças.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    const inicioStr = String(inicioEfetivo.mes).padStart(2, '0') + '/' + inicioEfetivo.ano;
    const fimStr = String(fimEfetivo.mes).padStart(2, '0') + '/' + fimEfetivo.ano;
    const listaCompetenciasMensais = gerarCompetencias(inicioStr, fimStr);
    if (listaCompetenciasMensais.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">O Termo Inicial não pode ser posterior à Data Final efetiva.</td></tr>`;
        resumoDiv.classList.add('hidden');
        return;
    }

    const memoriaDevida = window.memoriaEvolucaoDevida || [];
    const rmiDevida = parseFloat(document.getElementById('rmi').value.replace(/\./g, '').replace(',', '.')) || 0;
    const possuiAbonoDevido = document.getElementById('possuiAbonoDevido').checked;
    const dcbDevido = document.getElementById('dcb')?.value || '';

    const beneficiosRecebidos = [];
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');

    blocos.forEach(bloco => {
        const nb = bloco.querySelector('[data-campo="nb"]')?.value || 'Benefício';
        const especie = bloco.querySelector('[data-campo="especie"]')?.value || '';
        const id = bloco.dataset.id || `ben-${beneficiosRecebidos.length+1}`;
        const dib = bloco.querySelector('[data-campo="dib"]')?.value || '';
        const dip = bloco.querySelector('[data-campo="dip"]')?.value || '';
        const dcb = bloco.querySelector('[data-campo="dcb"]')?.value || '';
        const rmiStr = bloco.querySelector('[data-campo="rmi"]')?.value || '0';
        const rmi = parseFloat(rmiStr.replace(/\./g, '').replace(',', '.')) || 0;
        const possuiAbono = bloco.querySelector('[data-campo="possuiAbono"]')?.checked || false;
        const tratamentoDip = bloco.querySelector('[data-campo="tratamentoDip"]')?.value || 'inicio_dip';

        const resultadoStr = bloco.dataset.resultado;
        let memoria = [];
        let rmaFinal = rmi;

        if (resultadoStr) {
            try {
                const resultado = JSON.parse(resultadoStr);
                memoria = resultado.memoria || [];
                rmaFinal = resultado.rmaFinal || rmi;
            } catch(e) {
                console.warn('[Guia 4] Erro ao parsear resultado do bloco', id, e);
            }
        }

        beneficiosRecebidos.push({
            id,
            nb,
            especie,
            memoria: memoria,
            label: `NB ${nb} ${especie ? 'ESPÉCIE ' + especie : ''}`.trim(),
            dib,
            dip,
            dcb,
            rmi,
            rmaFinal: rmaFinal,
            possuiAbono: possuiAbono,
            tratamentoDip: tratamentoDip
        });
    });

    // Validação DIP < DIB
    for (let ben of beneficiosRecebidos) {
        if (ben.dib && ben.dip) {
            const dibParsed = parseDataProporcional30(ben.dib);
            const dipParsed = parseDataProporcional30(ben.dip);
            if (dibParsed && dipParsed) {
                const dibNum = converterCompetenciaParaNumero(dibParsed.mes + '/' + dibParsed.ano);
                const dipNum = converterCompetenciaParaNumero(dipParsed.mes + '/' + dipParsed.ano);
                if (dipNum < dibNum) {
                    alert(`A DIP (${ben.dip}) não pode ser anterior à DIB (${ben.dib}) para o benefício ${ben.label || ben.id}.`);
                    tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-red-600">Erro: DIP anterior à DIB em benefício recebido.</td></tr>`;
                    resumoDiv.classList.add('hidden');
                    return;
                }
            }
        }
    }

    // Monta cabeçalho dinâmico
    const thead = document.querySelector('#tabelaDiferencas thead tr');
    while (thead.children.length > 2) {
        thead.removeChild(thead.lastChild);
    }

    beneficiosRecebidos.forEach((ben, idx) => {
        const th = document.createElement('th');
        th.className = 'p-3 min-w-[110px]';
        th.textContent = ben.label || `Benefício Recebido ${idx+1}`;
        th.dataset.beneficioId = ben.id;
        thead.appendChild(th);
    });

    const thTotal = document.createElement('th');
    thTotal.className = 'p-3 min-w-[110px]';
    thTotal.textContent = 'Total Recebido';
    thead.appendChild(thTotal);

    const thDiff = document.createElement('th');
    thDiff.className = 'p-3 min-w-[110px]';
    thDiff.textContent = 'Diferença Devida';
    thead.appendChild(thDiff);

    const thObs = document.createElement('th');
    thObs.className = 'p-3 min-w-[100px]';
    thObs.textContent = 'Observações';
    thead.appendChild(thObs);

    tbody.innerHTML = '';
    let rowIndex = 0;

    const acumuladores = {};
    beneficiosRecebidos.forEach(ben => {
        acumuladores[ben.id] = 0;
    });

    // Função auxiliar para obter o valor do 13º para um benefício e ano
    function obterValor13ParaBeneficio(ben, ano, memoria) {
        if (!ben.possuiAbono) return null;
        const resultado13 = calcular13ParaAno({
            dib: ben.dib,
            dcb: ben.dcb || null,
            possuiAbono: ben.possuiAbono,
            rmi: ben.rmi,
            rmaFinal: ben.rmaFinal,
            memoria: memoria
        }, ano, memoria);
        return resultado13;
    }

    // ============================================================
    // NOVA LÓGICA: Decisão para o ano final (geração da linha)
    // ============================================================
    const ultimaCompetencia = listaCompetenciasMensais[listaCompetenciasMensais.length - 1];
    const anoFinal = parseInt(ultimaCompetencia.split('/')[1], 10);
    const mesFinal = parseInt(ultimaCompetencia.split('/')[0], 10);
    const incluir13FinalAberto = document.getElementById('incluir13FinalAberto')?.checked || false;

    // Verifica se existe benefício recebido com DCB real no ano final (e com abono)
    const existeDcbRecebidoNoAnoFinal = beneficiosRecebidos.some(ben => {
        if (!ben.possuiAbono) return false;
        if (!ben.dcb) return false;
        const dcbParsed = parseDataProporcional30(ben.dcb);
        if (!dcbParsed) return false;
        return (dcbParsed.ano === anoFinal && dcbParsed.mes <= mesFinal);
    });

    const deveInserir13AnoFinal = (mesFinal === 12) || incluir13FinalAberto || existeDcbRecebidoNoAnoFinal;

    // ============================================================
    // Montagem da grade intercalando mensais e 13º
    // ============================================================
    const todasCompetencias = [];
    const listaMensais = [...listaCompetenciasMensais];

    for (let i = 0; i < listaMensais.length; i++) {
        const comp = listaMensais[i];
        todasCompetencias.push(comp);
        const ano = parseInt(comp.split('/')[1], 10);
        const proximo = listaMensais[i + 1];
        const isUltimoAno = (!proximo || parseInt(proximo.split('/')[1], 10) !== ano);

        if (isUltimoAno) {
            const isAnoFinal = (ano === anoFinal);
            let deveInserir13 = true; // padrão para anos intermediários

            if (isAnoFinal) {
                deveInserir13 = deveInserir13AnoFinal;
            }

            if (deveInserir13) {
                todasCompetencias.push('13º/' + ano);
            }
        }
    }

    // ============================================================
    // Processamento da grade (com lógica individual para cada coluna)
    // ============================================================
    todasCompetencias.forEach(comp => {
        let mes, ano;
        let is13 = false;

        // Trata a competência 13º/AAAA antes da validação numérica
        if (comp.startsWith('13º/')) {
            is13 = true;
            ano = parseInt(comp.split('/')[1], 10);
            mes = 13; // valor especial para ordenação (não usado diretamente)
        } else {
            // Validação apenas para competências mensais
            const compNum = converterCompetenciaParaNumero(comp);
            if (isNaN(compNum)) return; // descarta mensais inválidas

            mes = parseInt(comp.split('/')[0], 10);
            ano = parseInt(comp.split('/')[1], 10);
        }

        // ----- Valor devido (mensal ou 13º) -----
        let valorDevido = 0;
        if (is13) {
            // Só calcula o 13º do devido se:
            // - não for o ano final, ou
            // - for o ano final e (mesFinal===12 ou incluir13FinalAberto)
            // (pois o devido não tem DCB)
            const isAnoFinal = (ano === anoFinal);
            const calcularDevido = !isAnoFinal || mesFinal === 12 || incluir13FinalAberto;

            if (calcularDevido) {
                const beneficioDevido = {
                    dib: dib,
                    dcb: dcbDevido || null,
                    possuiAbono: possuiAbonoDevido,
                    rmi: rmiDevida,
                    rmaFinal: rmiDevida,
                    memoria: memoriaDevida
                };
                const resultado13 = calcular13ParaAno(beneficioDevido, ano, memoriaDevida);
                if (resultado13) {
                    valorDevido = resultado13.valor;
                }
            }
            // Se não calcular, permanece 0
        } else {
            const fracaoDevida = obterFracaoDevida(mes, ano);
            const valorIntegralDevido = obterValorIntegral(memoriaDevida, comp, rmiDevida);
            valorDevido = Math.round(valorIntegralDevido * fracaoDevida * 100) / 100;
        }

        const chaveDevido = is13 ? `13|${ano}` : `devido|${comp}`;
        if (dadosDiferencas.celulasEditadas[chaveDevido] !== undefined) {
            valorDevido = dadosDiferencas.celulasEditadas[chaveDevido];
        }

        const tr = document.createElement('tr');
        tr.dataset.competencia = comp;
        tr.className = (rowIndex % 2 === 0) ? 'bg-gray-100 hover:bg-blue-100' : 'bg-white hover:bg-blue-100';
        if (is13) tr.classList.add('linha-13');
        rowIndex++;

        const tdComp = document.createElement('td');
        tdComp.className = 'p-3 font-semibold';
        tdComp.textContent = comp;
        tr.appendChild(tdComp);

        // ----- Benefício Devido (editável) -----
        const tdDevido = document.createElement('td');
        tdDevido.className = 'p-3';
        tdDevido.dataset.competencia = comp;

        const inputDevido = document.createElement('input');
        inputDevido.type = 'text';
        inputDevido.value = formatarNumero(valorDevido);
        inputDevido.className = 'w-full bg-transparent';

        if (dadosDiferencas.celulasEditadas[chaveDevido] !== undefined) {
            tdDevido.classList.add('celula-editada');
        }

        inputDevido.addEventListener('focus', function() {
            this.select();
        });

        inputDevido.addEventListener('blur', function() {
            let novoValor = parseFloat(this.value.replace(/\./g, '').replace(',', '.'));
            if (isNaN(novoValor)) novoValor = 0;
            novoValor = Math.round(novoValor * 100) / 100;

            const original = is13 ? valorDevido : Math.round(valorDevido * 100) / 100;
            if (novoValor !== original) {
                dadosDiferencas.celulasEditadas[chaveDevido] = novoValor;
                tdDevido.classList.add('celula-editada');
            } else {
                delete dadosDiferencas.celulasEditadas[chaveDevido];
                tdDevido.classList.remove('celula-editada');
            }
            recalcularLinha(tr, beneficiosRecebidos);
            atualizarResumo();
        });

        tdDevido.appendChild(inputDevido);
        tr.appendChild(tdDevido);

        // ----- Benefícios Recebidos (com lógica individual) -----
        let somaRecebido = 0;

        beneficiosRecebidos.forEach(ben => {
            const td = document.createElement('td');
            td.className = 'p-3';
            td.dataset.beneficioId = ben.id;

            let valorFinal = 0;
            if (is13) {
                // Só calcula o 13º do recebido se:
                // - não for o ano final, ou
                // - for o ano final e (mesFinal===12 ou incluir13FinalAberto)
                // - ou se o próprio benefício tiver DCB no ano final
                const isAnoFinal = (ano === anoFinal);
                let calcularRecebido = true;
                if (isAnoFinal && mesFinal !== 12) {
                    // Ano final aberto: só calcula se tiver DCB no ano ou opção marcada
                    const temDcbNoAno = ben.dcb ? (() => {
                        const dcbParsed = parseDataProporcional30(ben.dcb);
                        return dcbParsed && dcbParsed.ano === anoFinal && dcbParsed.mes <= mesFinal;
                    })() : false;
                    calcularRecebido = incluir13FinalAberto || temDcbNoAno;
                }
                if (calcularRecebido) {
                    const resultado13 = obterValor13ParaBeneficio(ben, ano, ben.memoria);
                    if (resultado13) {
                        valorFinal = resultado13.valor;
                    }
                }
                // Se não calcular, permanece 0
            } else {
                const valorIntegralRecebido = obterValorIntegral(ben.memoria, comp, ben.rmi, ben.rmaFinal);
                const fracaoPadrao = obterFracaoRecebida(mes, ano, ben);
                const valorNormal = Math.round(valorIntegralRecebido * fracaoPadrao * 100) / 100;
                const tratamento = ben.tratamentoDip || 'inicio_dip';
                if (tratamento === 'desde_dib') {
                    const fracaoDesdeDib = obterFracaoRecebidaDesdeDib(mes, ano, ben);
                    valorFinal = Math.round(valorIntegralRecebido * fracaoDesdeDib * 100) / 100;
                } else if (tratamento === 'acumular_atrasados') {
                    const dipParsed = ben.dip ? parseDataProporcional30(ben.dip) : null;
                    if (!dipParsed) {
                        const fracaoDesdeDib = obterFracaoRecebidaDesdeDib(mes, ano, ben);
                        valorFinal = Math.round(valorIntegralRecebido * fracaoDesdeDib * 100) / 100;
                    } else {
                        const dipNum = converterCompetenciaParaNumero(dipParsed.mes + '/' + dipParsed.ano);
                        if (compNum < dipNum) {
                            valorFinal = 0;
                            const fracaoDesdeDib = obterFracaoRecebidaDesdeDib(mes, ano, ben);
                            const valorDesdeDib = Math.round(valorIntegralRecebido * fracaoDesdeDib * 100) / 100;
                            acumuladores[ben.id] += valorDesdeDib;
                        } else if (compNum === dipNum) {
                            acumuladores[ben.id] += valorIntegralRecebido;
                            valorFinal = Math.round(acumuladores[ben.id] * 100) / 100;
                        } else {
                            valorFinal = Math.round(valorIntegralRecebido * fracaoPadrao * 100) / 100;
                        }
                    }
                } else {
                    valorFinal = valorNormal;
                }
            }

            const chaveCelula = is13 ? `13|${ano}|${ben.id}` : `${comp}|${ben.id}`;
            if (dadosDiferencas.celulasEditadas[chaveCelula] !== undefined) {
                valorFinal = dadosDiferencas.celulasEditadas[chaveCelula];
                td.classList.add('celula-editada');
            }

            const input = document.createElement('input');
            input.type = 'text';
            input.value = formatarNumero(valorFinal);
            input.className = 'w-full bg-transparent';
            input.addEventListener('focus', function() {
                this.select();
            });
            input.addEventListener('blur', function() {
                let novoValor = parseFloat(this.value.replace(/\./g, '').replace(',', '.'));
                if (isNaN(novoValor)) novoValor = 0;
                novoValor = Math.round(novoValor * 100) / 100;
                const chave = is13 ? `13|${ano}|${ben.id}` : `${comp}|${ben.id}`;
                const original = is13 ? (valorFinal) : Math.round(valorIntegralRecebido * fracaoPadrao * 100) / 100;
                if (novoValor !== original) {
                    dadosDiferencas.celulasEditadas[chave] = novoValor;
                    td.classList.add('celula-editada');
                } else {
                    delete dadosDiferencas.celulasEditadas[chave];
                    td.classList.remove('celula-editada');
                }
                recalcularLinha(tr, beneficiosRecebidos);
                atualizarResumo();
            });
            td.appendChild(input);
            tr.appendChild(td);

            somaRecebido += valorFinal;
        });

        // Total Recebido
        const tdTotal = document.createElement('td');
        tdTotal.className = 'p-3 font-semibold total-recebido';
        tdTotal.textContent = formatarNumero(somaRecebido);
        tr.appendChild(tdTotal);

        // Diferença
        let diferenca = 0;
        if (dadosDiferencas.modoCompensacao === 'limite') {
            diferenca = Math.max(0, valorDevido - somaRecebido);
        } else {
            diferenca = valorDevido - somaRecebido;
        }
        const tdDiff = document.createElement('td');
        tdDiff.className = 'p-3 font-bold diferenca-devida';
        tdDiff.textContent = formatarNumero(diferenca);
        if (diferenca < 0) tdDiff.style.color = '#dc2626';
        else if (diferenca > 0) tdDiff.style.color = '#16a34a';
        tr.appendChild(tdDiff);

        const tdObs = document.createElement('td');
        tdObs.className = 'p-3 text-slate-400 text-xs';
        tdObs.textContent = '-';
        tr.appendChild(tdObs);

        tbody.appendChild(tr);
    });

    atualizarResumo();
    document.getElementById('qtdCompetencias').textContent = todasCompetencias.length;
    resumoDiv.classList.remove('hidden');
}

// =====================================================================
// RECALCULAR LINHA
// =====================================================================

function recalcularLinha(tr, beneficiosRecebidos) {
    const tds = tr.querySelectorAll('td');
    const comp = tr.dataset.competencia;

    const inputDevido = tds[1]?.querySelector('input');
    const devido = inputDevido ? parseFloat(inputDevido.value.replace(/\./g, '').replace(',', '.')) || 0 : 0;

    let somaRecebido = 0;
    const numBeneficios = beneficiosRecebidos.length;
    for (let i = 0; i < numBeneficios; i++) {
        const td = tds[2 + i];
        const input = td.querySelector('input');
        if (input) {
            const val = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
            somaRecebido += val;
        }
    }

    const tdTotal = tr.querySelector('.total-recebido');
    if (tdTotal) tdTotal.textContent = formatarNumero(somaRecebido);

    const tdDiff = tr.querySelector('.diferenca-devida');
    if (tdDiff) {
        let diferenca = 0;
        if (dadosDiferencas.modoCompensacao === 'limite') {
            diferenca = Math.max(0, devido - somaRecebido);
        } else {
            diferenca = devido - somaRecebido;
        }
        tdDiff.textContent = formatarNumero(diferenca);
        if (diferenca < 0) tdDiff.style.color = '#dc2626';
        else if (diferenca > 0) tdDiff.style.color = '#16a34a';
        else tdDiff.style.color = 'inherit';
    }
}

// =====================================================================
// OBTER COMPETÊNCIAS MODIFICADAS (ÚNICAS E ORDENADAS)
// =====================================================================

function obterCompetenciasModificadas() {
    const competencias = new Set();
    for (const chave of Object.keys(dadosDiferencas.celulasEditadas)) {
        let comp;
        if (chave.startsWith('13|')) {
            const partes = chave.split('|');
            const ano = partes[1];
            comp = '13º/' + ano;
        } else if (chave.startsWith('devido|')) {
            comp = chave.split('|')[1];
        } else {
            comp = chave.split('|')[0];
        }
        if (comp) competencias.add(comp);
    }
    return Array.from(competencias).sort((a, b) => {
        const [mesA, anoA] = a.split('/').map(Number);
        const [mesB, anoB] = b.split('/').map(Number);
        return (anoA * 100 + mesA) - (anoB * 100 + mesB);
    });
}

// =====================================================================
// ATUALIZAR LISTA DE COMPETÊNCIAS MODIFICADAS (CENTRAL DE ALTERAÇÕES)
// =====================================================================

function atualizarListaCompetenciasModificadas() {
    const competencias = obterCompetenciasModificadas();
    const bloco = document.getElementById('blocoCompetenciasModificadas');
    const lista = document.getElementById('listaCompModificadas');
    const qtd = document.getElementById('qtdCompModificadas');

    if (!bloco || !lista) return;

    if (competencias.length === 0) {
        bloco.classList.add('hidden');
        return;
    }

    bloco.classList.remove('hidden');
    qtd.textContent = competencias.length;

    lista.innerHTML = '';
    competencias.forEach(comp => {
        const item = document.createElement('span');
        item.className = 'item-comp';
        const just = dadosDiferencas.justificativas[comp];
        let temJustificativa = false;
        let paraRelatorio = false;
        if (just) {
            if (typeof just === 'object') {
                temJustificativa = !!just.texto;
                paraRelatorio = just.incluirNoRelatorio || false;
            } else if (typeof just === 'string') {
                temJustificativa = !!just;
                paraRelatorio = false;
            }
        }
        let classeMotivo = 'btn-motivo';
        if (temJustificativa) {
            classeMotivo += ' tem-justificativa';
        }
        if (paraRelatorio) {
            classeMotivo += ' tem-justificativa-relatorio';
        }
        item.innerHTML = `
            ${comp}
            <button class="btn-editar" data-comp="${comp}" title="Editar">Editar</button>
            <button class="${classeMotivo}" data-comp="${comp}" title="Motivo">Motivo</button>
            <button class="btn-restaurar" data-comp="${comp}" title="Restaurar">Restaurar</button>
        `;
        lista.appendChild(item);
    });

    lista.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
            editarCompetencia(this.dataset.comp);
        });
    });
    lista.querySelectorAll('.btn-motivo').forEach(btn => {
        btn.addEventListener('click', function() {
            abrirModalJustificativa(this.dataset.comp);
        });
    });
    lista.querySelectorAll('.btn-restaurar').forEach(btn => {
        btn.addEventListener('click', function() {
            restaurarCompetencia(this.dataset.comp);
        });
    });

    const btnRestaurarTodas = document.getElementById('btnRestaurarTodas');
    if (btnRestaurarTodas) {
        btnRestaurarTodas.removeEventListener('click', restaurarTodasCompetencias);
        btnRestaurarTodas.addEventListener('click', restaurarTodasCompetencias);
    }
}

// =====================================================================
// EDITAR COMPETÊNCIA (SCROLL + DESTAQUE)
// =====================================================================

function editarCompetencia(comp) {
    const tr = document.querySelector('tr[data-competencia="' + comp + '"]');
    if (!tr) return;

    tr.scrollIntoView({ behavior: 'smooth', block: 'center' });

    tr.classList.add('linha-destaque');
    setTimeout(() => {
        tr.classList.remove('linha-destaque');
    }, 2000);

    const inputDevido = tr.querySelector('td:nth-child(2) input');
    if (inputDevido) {
        setTimeout(() => inputDevido.focus(), 300);
    }
}

// =====================================================================
// RESTAURAR COMPETÊNCIA (INDIVIDUAL)
// =====================================================================

function restaurarCompetencia(comp) {
    delete dadosDiferencas.justificativas[comp];

    const chaves = Object.keys(dadosDiferencas.celulasEditadas);
    chaves.forEach(chave => {
        if (chave === 'devido|' + comp) delete dadosDiferencas.celulasEditadas[chave];
        else if (chave.startsWith(comp + '|')) delete dadosDiferencas.celulasEditadas[chave];
        else if (chave.startsWith('13|')) {
            const ano = parseInt(chave.split('|')[1], 10);
            if (comp === '13º/' + ano) delete dadosDiferencas.celulasEditadas[chave];
        }
    });

    const tr = document.querySelector('tr[data-competencia="' + comp + '"]');
    if (!tr) {
        atualizarResumo();
        return;
    }

    const tds = tr.querySelectorAll('td');
    const mes = parseInt(comp.split('/')[0], 10);
    const ano = parseInt(comp.split('/')[1], 10);
    const is13 = comp.startsWith('13º/');

    // Devido
    let valorOriginal = 0;
    if (is13) {
        const beneficioDevido = {
            dib: document.getElementById('dib').value,
            dcb: document.getElementById('dcb')?.value || '',
            possuiAbono: document.getElementById('possuiAbonoDevido').checked,
            rmi: rmiDevida,
            rmaFinal: rmiDevida,
            memoria: window.memoriaEvolucaoDevida || []
        };
        const resultado13 = calcular13ParaAno(beneficioDevido, ano, window.memoriaEvolucaoDevida || []);
        if (resultado13) valorOriginal = resultado13.valor;
    } else {
        const fracaoDevida = obterFracaoDevida(mes, ano);
        const memoriaDevida = window.memoriaEvolucaoDevida || [];
        const rmiDevida = parseFloat(document.getElementById('rmi').value.replace(/\./g, '').replace(',', '.')) || 0;
        const valorIntegralDevido = obterValorIntegral(memoriaDevida, comp, rmiDevida);
        valorOriginal = Math.round(valorIntegralDevido * fracaoDevida * 100) / 100;
    }

    const inputDevido = tds[1]?.querySelector('input');
    if (inputDevido) {
        inputDevido.value = formatarNumero(valorOriginal);
        const tdDevido = tds[1];
        if (tdDevido) tdDevido.classList.remove('celula-editada');
    }

    // Benefícios recebidos
    const beneficiosRecebidos = coletarBeneficiosRecebidosSimplificado();
    let idx = 0;
    beneficiosRecebidos.forEach(ben => {
        const td = tds[2 + idx];
        if (!td) return;
        const input = td.querySelector('input');
        if (input) {
            let valorOriginalRec = 0;
            if (is13) {
                const resultado13 = calcular13ParaAno(ben, ano, ben.memoria);
                if (resultado13) valorOriginalRec = resultado13.valor;
            } else {
                const valorIntegralRecebido = obterValorIntegral(ben.memoria, comp, ben.rmi, ben.rmaFinal);
                const fracaoPadrao = obterFracaoRecebida(mes, ano, ben);
                valorOriginalRec = Math.round(valorIntegralRecebido * fracaoPadrao * 100) / 100;
            }
            input.value = formatarNumero(valorOriginalRec);
            td.classList.remove('celula-editada');
        }
        idx++;
    });

    recalcularLinha(tr, beneficiosRecebidos);
    atualizarResumo();
}

// =====================================================================
// RESTAURAR TODAS AS COMPETÊNCIAS
// =====================================================================

function restaurarTodasCompetencias() {
    if (!confirm('Deseja restaurar todas as alterações manuais da Guia 4? Esta ação não pode ser desfeita.')) {
        return;
    }

    dadosDiferencas.celulasEditadas = {};
    dadosDiferencas.justificativas = {};

    const rows = document.querySelectorAll('#corpoDiferencas tr');
    const beneficiosRecebidos = coletarBeneficiosRecebidosSimplificado();

    rows.forEach(tr => {
        const comp = tr.dataset.competencia;
        if (!comp) return;
        const tds = tr.querySelectorAll('td');
        const mes = parseInt(comp.split('/')[0], 10);
        const ano = parseInt(comp.split('/')[1], 10);
        const is13 = comp.startsWith('13º/');

        // Devido
        let valorOriginal = 0;
        if (is13) {
            const beneficioDevido = {
                dib: document.getElementById('dib').value,
                dcb: document.getElementById('dcb')?.value || '',
                possuiAbono: document.getElementById('possuiAbonoDevido').checked,
                rmi: rmiDevida,
                rmaFinal: rmiDevida,
                memoria: window.memoriaEvolucaoDevida || []
            };
            const resultado13 = calcular13ParaAno(beneficioDevido, ano, window.memoriaEvolucaoDevida || []);
            if (resultado13) valorOriginal = resultado13.valor;
        } else {
            const fracaoDevida = obterFracaoDevida(mes, ano);
            const memoriaDevida = window.memoriaEvolucaoDevida || [];
            const rmiDevida = parseFloat(document.getElementById('rmi').value.replace(/\./g, '').replace(',', '.')) || 0;
            const valorIntegralDevido = obterValorIntegral(memoriaDevida, comp, rmiDevida);
            valorOriginal = Math.round(valorIntegralDevido * fracaoDevida * 100) / 100;
        }

        const inputDevido = tds[1]?.querySelector('input');
        if (inputDevido) {
            inputDevido.value = formatarNumero(valorOriginal);
            const tdDevido = tds[1];
            if (tdDevido) tdDevido.classList.remove('celula-editada');
        }

        // Recebidos
        let idx = 0;
        beneficiosRecebidos.forEach(ben => {
            const td = tds[2 + idx];
            if (!td) return;
            const input = td.querySelector('input');
            if (input) {
                let valorOriginalRec = 0;
                if (is13) {
                    const resultado13 = calcular13ParaAno(ben, ano, ben.memoria);
                    if (resultado13) valorOriginalRec = resultado13.valor;
                } else {
                    const valorIntegralRecebido = obterValorIntegral(ben.memoria, comp, ben.rmi, ben.rmaFinal);
                    const fracaoPadrao = obterFracaoRecebida(mes, ano, ben);
                    valorOriginalRec = Math.round(valorIntegralRecebido * fracaoPadrao * 100) / 100;
                }
                input.value = formatarNumero(valorOriginalRec);
                td.classList.remove('celula-editada');
            }
            idx++;
        });

        recalcularLinha(tr, beneficiosRecebidos);
    });

    atualizarResumo();
    document.getElementById('blocoCompetenciasModificadas').classList.add('hidden');
}

// =====================================================================
// JUSTIFICATIVAS – MODAL
// =====================================================================

var competenciaModalAtual = null;

function abrirModalJustificativa(comp) {
    competenciaModalAtual = comp;
    document.getElementById('modalCompetencia').textContent = comp;
    const textarea = document.getElementById('modalJustificativaText');
    const checkbox = document.getElementById('modalIncluirRelatorio');
    const just = dadosDiferencas.justificativas[comp];
    if (just && typeof just === 'object') {
        textarea.value = just.texto || '';
        checkbox.checked = just.incluirNoRelatorio || false;
    } else if (typeof just === 'string') {
        textarea.value = just;
        checkbox.checked = false;
    } else {
        textarea.value = '';
        checkbox.checked = false;
    }
    document.getElementById('modalJustificativa').classList.remove('hidden');
    setTimeout(() => textarea.focus(), 100);
}

function fecharModalJustificativa() {
    document.getElementById('modalJustificativa').classList.add('hidden');
    competenciaModalAtual = null;
}

function salvarJustificativa() {
    if (!competenciaModalAtual) return;
    const texto = document.getElementById('modalJustificativaText').value.trim();
    const incluir = document.getElementById('modalIncluirRelatorio').checked;
    if (texto === '') {
        delete dadosDiferencas.justificativas[competenciaModalAtual];
    } else {
        dadosDiferencas.justificativas[competenciaModalAtual] = {
            texto: texto,
            incluirNoRelatorio: incluir
        };
    }
    fecharModalJustificativa();
    atualizarListaCompetenciasModificadas();
}

function limparJustificativa() {
    if (!competenciaModalAtual) return;
    delete dadosDiferencas.justificativas[competenciaModalAtual];
    fecharModalJustificativa();
    atualizarListaCompetenciasModificadas();
}

// =====================================================================
// ATUALIZAR RESUMO
// =====================================================================

function atualizarResumo() {
    let totalDevido = 0, totalRecebido = 0, diferencaTotal = 0, qtdEditadas = 0;
    
    document.querySelectorAll('#corpoDiferencas tr').forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) return;

        const inputDevido = tds[1]?.querySelector('input');
        const devido = inputDevido ? parseFloat(inputDevido.value.replace(/\./g, '').replace(',', '.')) || 0 : 0;

        const totalEl = tr.querySelector('.total-recebido');
        const total = totalEl ? parseFloat(totalEl.textContent.replace(/\./g, '').replace(',', '.')) || 0 : 0;
        
        totalDevido += devido;
        totalRecebido += total;
        
        if (dadosDiferencas.modoCompensacao === 'limite') {
            diferencaTotal += Math.max(0, devido - total);
        } else {
            diferencaTotal += (devido - total);
        }
        
        tds.forEach(td => {
            if (td.classList.contains('celula-editada')) qtdEditadas++;
        });
    });
    
    document.getElementById('totalDevido').textContent = formatarMoeda(totalDevido);
    document.getElementById('totalRecebido').textContent = formatarMoeda(totalRecebido);
    document.getElementById('diferencaTotal').textContent = formatarMoeda(diferencaTotal);
    document.getElementById('qtdEditadas').textContent = qtdEditadas;

    atualizarListaCompetenciasModificadas();
}

// =====================================================================
// EXPORTAR E IMPORTAR DADOS DA GUIA 4
// =====================================================================

function coletarDadosDiferencas() {
    return {
        modoCompensacao: dadosDiferencas.modoCompensacao,
        celulasEditadas: dadosDiferencas.celulasEditadas,
        justificativas: dadosDiferencas.justificativas
    };
}

function restaurarDadosDiferencas(dados) {
    if (dados) {
        dadosDiferencas.modoCompensacao = dados.modoCompensacao || 'limite';
        dadosDiferencas.celulasEditadas = dados.celulasEditadas || {};
        if (dados.justificativas) {
            const just = dados.justificativas;
            for (const comp in just) {
                if (typeof just[comp] === 'string') {
                    just[comp] = { texto: just[comp], incluirNoRelatorio: false };
                }
            }
            dadosDiferencas.justificativas = just;
        } else {
            dadosDiferencas.justificativas = {};
        }
        const radio = document.querySelector(`input[name="modoCompensacao"][value="${dadosDiferencas.modoCompensacao}"]`);
        if (radio) radio.checked = true;
        montarTabelaDiferencas();
    }
}

// =====================================================================
// INICIALIZAR EVENTOS DA GUIA 4
// =====================================================================

function initGuiaDiferencas() {
    document.querySelectorAll('input[name="modoCompensacao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            dadosDiferencas.modoCompensacao = this.value;
            montarTabelaDiferencas();
        });
    });

    const btnTema = document.getElementById('btnTemaSTJ');
    const modal = document.getElementById('modalTemaSTJ');
    const fechar = document.getElementById('fecharModalSTJ');
    if (btnTema && modal && fechar) {
        btnTema.addEventListener('click', () => modal.classList.remove('hidden'));
        fechar.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    const btnSalvar = document.getElementById('btnSalvarJustificativa');
    const btnLimpar = document.getElementById('btnLimparJustificativa');
    const btnCancelar = document.getElementById('btnCancelarJustificativa');
    const modalJust = document.getElementById('modalJustificativa');
    if (btnSalvar) btnSalvar.addEventListener('click', salvarJustificativa);
    if (btnLimpar) btnLimpar.addEventListener('click', limparJustificativa);
    if (btnCancelar) btnCancelar.addEventListener('click', fecharModalJustificativa);
    if (modalJust) {
        modalJust.addEventListener('click', function(e) {
            if (e.target === this) fecharModalJustificativa();
        });
    }
}

// =====================================================================
// GERAR COMPETÊNCIAS
// =====================================================================

function gerarCompetencias(inicio, fim) {
    if (!inicio || !fim) return [];
    
    const extrairMesAno = (str) => {
        const partes = str.split('/');
        let mes, ano;
        if (partes.length === 3) {
            mes = parseInt(partes[1], 10);
            ano = parseInt(partes[2], 10);
        } else if (partes.length === 2) {
            mes = parseInt(partes[0], 10);
            ano = parseInt(partes[1], 10);
        } else {
            return null;
        }
        if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12 || ano < 1900) return null;
        return { mes, ano };
    };
    
    const start = extrairMesAno(inicio);
    const end = extrairMesAno(fim);
    if (!start || !end) return [];
    
    if (start.ano > end.ano || (start.ano === end.ano && start.mes > end.mes)) return [];

    const lista = [];
    let currentMes = start.mes;
    let currentAno = start.ano;
    const endMonths = end.ano * 12 + end.mes;

    while (currentAno * 12 + currentMes <= endMonths) {
        lista.push(String(currentMes).padStart(2, '0') + '/' + currentAno);
        if (currentMes === 12) {
            currentMes = 1;
            currentAno++;
        } else {
            currentMes++;
        }
    }
    return lista;
}
