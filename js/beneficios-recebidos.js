// =====================================================================
// BENEFÍCIOS RECEBIDOS – GUIA 3 (FASE 1.7D2 – CORREÇÃO DE MEMÓRIA)
// =====================================================================

var contadorBeneficio = 0;

// =====================================================================
// FUNÇÕES AUXILIARES (usadas nos blocos)
// =====================================================================

function toggleTransformacaoRecebido(bloco) {
    const selectTransformado = bloco.querySelector('[data-campo="transformado"]');
    const campoDibAnt = bloco.querySelector('[data-campo="dibAntecedente"]');
    if (!selectTransformado || !campoDibAnt) return;

    const isTransformado = selectTransformado.value === 'sim';
    if (isTransformado) {
        campoDibAnt.removeAttribute('readonly');
        campoDibAnt.classList.remove('bg-slate-100');
        campoDibAnt.classList.add('bg-white');
    } else {
        campoDibAnt.value = '';
        campoDibAnt.setAttribute('readonly', 'readonly');
        campoDibAnt.classList.remove('bg-white');
        campoDibAnt.classList.add('bg-slate-100');
    }
}

function atualizarEstadoAbonoRecebido(bloco) {
    const selectTipo = bloco.querySelector('[data-campo="tipo"]');
    const checkboxAbono = bloco.querySelector('[data-campo="possuiAbono"]');
    const statusAbono = bloco.querySelector('.status-abono-recebido');
    if (!selectTipo || !checkboxAbono) return;
    const tipo = selectTipo.value;
    if (tipo === 'assistencial') {
        checkboxAbono.checked = false;
        checkboxAbono.disabled = true;
        if (statusAbono) statusAbono.textContent = 'Assistenciais não possuem 13º.';
    } else {
        checkboxAbono.disabled = false;
        if (statusAbono) statusAbono.textContent = '';
    }
}

function atualizarEstadoBaseadoSalarioMinimoRecebido(bloco) {
    const selectTipo = bloco.querySelector('[data-campo="tipo"]');
    const checkboxSM = bloco.querySelector('[data-campo="baseadoSalarioMinimo"]');
    const statusSM = bloco.querySelector('.status-baseado-sm-recebido');
    const checkboxAbono = bloco.querySelector('[data-campo="possuiAbono"]');
    const statusAbono = bloco.querySelector('.status-abono-recebido');
    const selectTransformado = bloco.querySelector('[data-campo="transformado"]');
    const dibAnt = bloco.querySelector('[data-campo="dibAntecedente"]');
    const rmiInput = bloco.querySelector('[data-campo="rmi"]');
    const dibInput = bloco.querySelector('[data-campo="dib"]');

    if (!selectTipo || !checkboxSM) return;
    const tipo = selectTipo.value;

    if (tipo === 'assistencial') {
        checkboxSM.checked = true;
        checkboxSM.disabled = true;
        if (statusSM) statusSM.textContent = 'Assistencial evolui por SM.';

        if (checkboxAbono) {
            checkboxAbono.checked = false;
            checkboxAbono.disabled = true;
            if (statusAbono) statusAbono.textContent = 'Assistenciais não têm 13º.';
        }

        if (selectTransformado) {
            selectTransformado.value = 'nao';
            selectTransformado.disabled = true;
        }

        if (dibAnt) {
            dibAnt.value = '';
            dibAnt.readOnly = true;
            dibAnt.classList.add('bg-slate-50');
            dibAnt.classList.remove('bg-white');
        }

        if (dibInput && dibInput.value && rmiInput) {
            const salario = obterSalarioMinimoPorCompetencia(dibInput.value);
            if (salario !== null) {
                rmiInput.value = formatarMoeda(salario);
                rmiInput.readOnly = true;
                rmiInput.classList.add('bg-slate-50');
                rmiInput.classList.remove('bg-white');
                rmiInput.dataset.originalManual = '';
                rmiInput.dataset.automatico = 'true';
            }
        }
    } else {
        checkboxSM.disabled = false;
        if (statusSM) statusSM.textContent = '';

        if (checkboxAbono) {
            checkboxAbono.disabled = false;
            if (statusAbono) statusAbono.textContent = '';
        }

        if (selectTransformado) {
            selectTransformado.disabled = false;
        }

        if (dibAnt) {
            dibAnt.readOnly = false;
            dibAnt.classList.remove('bg-slate-50');
            dibAnt.classList.add('bg-white');
        }

        if (checkboxSM.checked) {
            if (dibInput && dibInput.value && rmiInput) {
                const salario = obterSalarioMinimoPorCompetencia(dibInput.value);
                if (salario !== null) {
                    if (!rmiInput.dataset.originalManual) {
                        rmiInput.dataset.originalManual = rmiInput.value;
                    }
                    rmiInput.value = formatarMoeda(salario);
                    rmiInput.readOnly = true;
                    rmiInput.classList.add('bg-slate-50');
                    rmiInput.classList.remove('bg-white');
                    rmiInput.dataset.automatico = 'true';
                }
            }
        } else {
            if (rmiInput && rmiInput.dataset.originalManual) {
                rmiInput.value = rmiInput.dataset.originalManual;
                rmiInput.dataset.originalManual = '';
            }
            if (rmiInput) {
                rmiInput.readOnly = false;
                rmiInput.classList.remove('bg-slate-50');
                rmiInput.classList.add('bg-white');
                rmiInput.dataset.automatico = 'false';
            }
        }
    }
}

function toggleBaseadoSalarioMinimoRecebido(bloco) {
    const checkboxSM = bloco.querySelector('[data-campo="baseadoSalarioMinimo"]');
    const rmiInput = bloco.querySelector('[data-campo="rmi"]');
    const dibInput = bloco.querySelector('[data-campo="dib"]');

    if (!checkboxSM || !rmiInput) return;

    if (checkboxSM.checked) {
        if (dibInput && dibInput.value) {
            const salario = obterSalarioMinimoPorCompetencia(dibInput.value);
            if (salario !== null) {
                if (!rmiInput.dataset.originalManual) {
                    rmiInput.dataset.originalManual = rmiInput.value;
                }
                rmiInput.value = formatarMoeda(salario);
                rmiInput.readOnly = true;
                rmiInput.classList.add('bg-slate-50');
                rmiInput.classList.remove('bg-white');
                rmiInput.dataset.automatico = 'true';
            }
        }
    } else {
        if (rmiInput.dataset.originalManual) {
            rmiInput.value = rmiInput.dataset.originalManual;
            rmiInput.dataset.originalManual = '';
        }
        rmiInput.readOnly = false;
        rmiInput.classList.remove('bg-slate-50');
        rmiInput.classList.add('bg-white');
        rmiInput.dataset.automatico = 'false';
    }
}

// =====================================================================
// FUNÇÃO DE RENDERIZAÇÃO DA MEMÓRIA (Guia 3 – SEM 13º)
// =====================================================================

function renderizarMemoriaBeneficio(bloco, resultado, dados) {
    const tbody = bloco.querySelector('.memoria-tbody');
    if (!tbody) return;

    const memoriaMensal = resultado && resultado.memoria ? resultado.memoria : [];
    if (memoriaMensal.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-2 text-center text-slate-400">Nenhuma competência gerada.</td></tr>`;
        return;
    }

    // Ordena a memória por competência
    const ordenada = [...memoriaMensal].sort((a, b) => {
        const [mesA, anoA] = a.competencia.split('/').map(Number);
        const [mesB, anoB] = b.competencia.split('/').map(Number);
        return (anoA * 100 + mesA) - (anoB * 100 + mesB);
    });

    // Gera as linhas (apenas mensais, sem 13º)
    const linhas = ordenada.map(item => {
        const statusBadgeClass = item.status === 'PISO' ? 'status-piso' : item.status === 'LIMITADO_TETO' ? 'status-teto' : item.status === 'SALARIO_MINIMO' ? 'status-sm' : 'status-normal';
        const statusExibicao = item.status === 'LIMITADO_TETO' ? 'TETO' : item.status === 'SALARIO_MINIMO' ? 'SM' : item.status;
        return `
        <tr class="${item.status === 'PISO' ? 'row-piso' : item.status === 'LIMITADO_TETO' ? 'row-teto' : ''}">
            <td class="p-2 font-semibold">${item.competencia}</td>
            <td class="p-2">${item.tipo ? `<span class="px-1 py-0.5 rounded text-xs font-bold ${item.tipo === 'PRO RATA' ? 'bg-amber-100 text-amber-800 border border-amber-200' : item.tipo === 'INTEGRAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : item.tipo === 'PRO RATA/FALLBACK' ? 'bg-purple-100 text-purple-800 border border-purple-200' : item.tipo === 'SM' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}">${item.tipo}</span>` : '-'}</td>
            <td class="p-2">${item.indice !== null ? item.indice.toFixed(4) : '-'}</td>
            <td class="p-2">${formatarNumero(item.salarioMinimo)}</td>
            <td class="p-2">${formatarNumero(item.teto)}</td>
            <td class="p-2">${item.indiceTeto !== null ? item.indiceTeto.toFixed(5) : '-'}</td>
            <td class="p-2"><span class="status-badge ${statusBadgeClass}">${statusExibicao}</span></td>
            <td class="p-2">${formatarNumero(item.valorTeorico)}</td>
            <td class="p-2">${formatarNumero(item.valorEvoluido)}</td>
            <td class="p-2 font-bold">${formatarNumero(item.valorFinal)}</td>
        </tr>
    `}).join('');

    tbody.innerHTML = linhas;

    // Atualiza também o resumo (RMA e status) – para manter sincronia
    const rmaEl = bloco.querySelector('.rma-final');
    const statusEl = bloco.querySelector('.status-final');
    const qtdEl = bloco.querySelector('.qtd-reajustes');
    const ultimoReajusteEl = bloco.querySelector('.ultimo-reajuste');
    const ultimoIndiceEl = bloco.querySelector('.ultimo-indice');

    if (rmaEl) rmaEl.textContent = formatarMoeda(resultado.rmaFinal);
    if (statusEl) {
        const statusExibicao = resultado.statusFinal === 'LIMITADO_TETO' ? 'TETO' : resultado.statusFinal === 'SALARIO_MINIMO' ? 'SM' : resultado.statusFinal;
        statusEl.textContent = statusExibicao;
        const statusClass = resultado.statusFinal === 'LIMITADO_TETO' ? 'status-teto' : resultado.statusFinal === 'PISO' ? 'status-piso' : resultado.statusFinal === 'SALARIO_MINIMO' ? 'status-sm' : 'status-normal';
        statusEl.className = `status-badge ${statusClass} status-final`;
    }
    if (qtdEl) qtdEl.textContent = resultado.qtdReajustes;
    if (ultimoReajusteEl) ultimoReajusteEl.textContent = resultado.ultimoReajuste || '-';
    if (ultimoIndiceEl) ultimoIndiceEl.textContent = resultado.ultimoIndice !== null ? resultado.ultimoIndice.toFixed(4) : '-';

    // Exibe a área de resultado (se estava oculta)
    const divResultado = bloco.querySelector('.resultado-beneficio-recebido');
    if (divResultado) divResultado.classList.remove('hidden');

    // Expande a memória automaticamente
    const memoriaDiv = bloco.querySelector('.memoria-beneficio-recebido');
    const btnToggle = bloco.querySelector('.btn-toggle-memoria');
    if (memoriaDiv) {
        memoriaDiv.classList.remove('hidden');
        if (btnToggle) btnToggle.textContent = 'Ocultar Memória';
    }
    bloco.dataset.memoriaExpandida = 'true';
}

// =====================================================================
// ADICIONAR BENEFÍCIO RECEBIDO
// =====================================================================

function adicionarBeneficioRecebido(dados) {
    dados = dados || {};
    const resultado = dados.resultado || null;
    const memoriaExpandida = dados.memoriaExpandida || false;

    contadorBeneficio++;
    const container = document.getElementById('containerBeneficiosRecebidos');
    if (!container) return null;

    const bloco = document.createElement('div');
    bloco.className = 'beneficio-recebido-bloco';
    bloco.dataset.id = contadorBeneficio;

    const transformadoInicial = dados.transformado || 'nao';
    const dibAntecedenteValor = (transformadoInicial === 'sim') ? (dados.dibAntecedente || '') : '';
    const readonlyDibAnt = (transformadoInicial === 'sim') ? '' : 'readonly';
    const bgDibAnt = (transformadoInicial === 'sim') ? 'bg-white' : 'bg-slate-100';

    const tipoInicial = dados.tipo || 'previdenciario';
    const possuiAbonoInicial = (dados.possuiAbono !== undefined) ? dados.possuiAbono : (tipoInicial === 'previdenciario');
    const baseadoSMInicial = (dados.baseadoSalarioMinimo !== undefined) ? dados.baseadoSalarioMinimo : (tipoInicial === 'assistencial');
    const tratamentoDipInicial = dados.tratamentoDip || 'inicio_dip';

    let html = `
        <button type="button" class="btn-remover" onclick="removerBeneficioRecebido(this)">Remover</button>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Identificador</label>
                <input type="text" data-campo="identificador" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: BEN-001" value="${dados.identificador || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">NB</label>
                <input type="text" data-campo="nb" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 1234567890" value="${dados.nb || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Espécie</label>
                <input type="text" data-campo="especie" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 42" value="${dados.especie || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo</label>
                <select data-campo="tipo" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" onchange="atualizarEstadoAbonoRecebido(this.closest('.beneficio-recebido-bloco')); atualizarEstadoBaseadoSalarioMinimoRecebido(this.closest('.beneficio-recebido-bloco'));">
                    <option value="previdenciario" ${tipoInicial === 'previdenciario' ? 'selected' : ''}>Previdenciário</option>
                    <option value="assistencial" ${tipoInicial === 'assistencial' ? 'selected' : ''}>Assistencial</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Benefício Baseado em Salário Mínimo</label>
                <div class="mt-1 flex items-center">
                    <input type="checkbox" data-campo="baseadoSalarioMinimo" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" ${baseadoSMInicial ? 'checked' : ''}>
                    <span class="ml-2 text-sm text-slate-700">Evolução atrelada ao SM</span>
                </div>
                <span class="text-xs text-slate-400 status-baseado-sm-recebido"></span>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Tratamento da DIP</label>
                <select data-campo="tratamentoDip" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="inicio_dip" ${tratamentoDipInicial === 'inicio_dip' ? 'selected' : ''}>Iniciar compensação na DIP</option>
                    <option value="acumular_atrasados" ${tratamentoDipInicial === 'acumular_atrasados' ? 'selected' : ''}>Acumular atrasados na competência da DIP</option>
                    <option value="desde_dib" ${tratamentoDipInicial === 'desde_dib' ? 'selected' : ''}>Compensar desde a DIB</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DIB</label>
                <input type="text" data-campo="dib" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA ou MM/AAAA" oninput="aplicarMascaraData(this, false)" value="${dados.dib || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DIP</label>
                <input type="text" data-campo="dip" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA ou MM/AAAA" oninput="aplicarMascaraData(this, false)" onblur="aplicarMascaraData(this, false)" value="${dados.dip || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DCB</label>
                <input type="text" data-campo="dcb" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="DD/MM/AAAA" oninput="aplicarMascaraDataSimples(this)" value="${dados.dcb || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">RMI</label>
                <input type="text" data-campo="rmi" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="R$ 0,00" oninput="aplicarMascaraMoeda(this)" value="${dados.rmi || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Possui Abono Anual (13º)</label>
                <div class="mt-1 flex items-center">
                    <input type="checkbox" data-campo="possuiAbono" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" ${possuiAbonoInicial ? 'checked' : ''}>
                    <span class="ml-2 text-sm text-slate-700">Benefício com direito a 13º</span>
                </div>
                <span class="text-xs text-slate-400 status-abono-recebido"></span>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Benefício transformado?</label>
                <select data-campo="transformado" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" onchange="toggleTransformacaoRecebido(this.closest('.beneficio-recebido-bloco'))">
                    <option value="nao" ${transformadoInicial === 'nao' ? 'selected' : ''}>Não</option>
                    <option value="sim" ${transformadoInicial === 'sim' ? 'selected' : ''}>Sim</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">DIB antecedente</label>
                <input type="text" data-campo="dibAntecedente" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${bgDibAnt}" placeholder="DD/MM/AAAA ou MM/AAAA" oninput="aplicarMascaraData(this, false)" value="${dibAntecedenteValor}" ${readonlyDibAnt}>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Percentual de desdobramento/cota</label>
                <input type="text" data-campo="percentualDesdobramento" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="100%" value="${dados.percentualDesdobramento || '100,00'}">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Adicional</label>
                <select data-campo="adicional" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="0" ${dados.adicional === '0' ? 'selected' : ''}>0%</option>
                    <option value="25" ${dados.adicional === '25' ? 'selected' : ''}>25%</option>
                    <option value="outro" ${dados.adicional === 'outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Percentual do adicional</label>
                <input type="text" data-campo="adicionalPercentual" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: 15" value="${dados.adicionalPercentual || ''}">
            </div>
            <div class="md:col-span-3">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Observações</label>
                <textarea data-campo="observacoes" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Observações sobre este benefício recebido...">${dados.observacoes || ''}</textarea>
            </div>
        </div>

        <!-- BOTÕES (sempre visíveis) -->
        <div class="flex flex-wrap items-center gap-2 mt-3 border-t border-slate-200 pt-3">
            <button class="btn-calcular-evolucao px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">Calcular Evolução</button>
            <button class="btn-toggle-memoria px-3 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700 transition">${memoriaExpandida ? 'Ocultar' : 'Exibir'} Memória</button>
        </div>
    `;

    // ÁREA DE RESULTADO (inicialmente oculta)
    html += `
        <div class="resultado-beneficio-recebido mt-3 ${resultado ? '' : 'hidden'}">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span class="text-xs font-bold text-slate-500">RMA Final:</span>
                    <span class="text-sm font-bold text-blue-700 rma-final">${resultado ? formatarMoeda(resultado.rmaFinal) : 'R$ 0,00'}</span>
                    <span class="text-xs font-bold text-slate-500 ml-3">Status:</span>
                    <span class="status-badge ${resultado ? (resultado.statusFinal === 'LIMITADO_TETO' ? 'status-teto' : resultado.statusFinal === 'PISO' ? 'status-piso' : resultado.statusFinal === 'SALARIO_MINIMO' ? 'status-sm' : 'status-normal') : 'status-normal'} status-final">${resultado ? (resultado.statusFinal === 'LIMITADO_TETO' ? 'TETO' : resultado.statusFinal === 'SALARIO_MINIMO' ? 'SM' : resultado.statusFinal) : 'NORMAL'}</span>
                </div>
            </div>
            <div class="resumo-beneficio-recebido mt-2 text-xs text-slate-600 flex flex-wrap gap-4">
                <span>Reajustes: <strong class="qtd-reajustes">${resultado ? resultado.qtdReajustes : 0}</strong></span>
                <span>Último reajuste: <strong class="ultimo-reajuste">${resultado ? resultado.ultimoReajuste : '-'}</strong></span>
                <span>Último índice: <strong class="ultimo-indice">${resultado && resultado.ultimoIndice !== null ? resultado.ultimoIndice.toFixed(4) : '-'}</strong></span>
            </div>
            <div class="memoria-beneficio-recebido mt-3 overflow-x-auto ${memoriaExpandida ? '' : 'hidden'}">
                <table class="w-full text-left border-collapse text-xs memoria-tabela">
                    <thead>
                        <tr class="bg-slate-100 text-slate-700 border-b border-slate-200 text-xs uppercase">
                            <th class="p-2">Competência</th>
                            <th class="p-2">Tipo</th>
                            <th class="p-2">Índice</th>
                            <th class="p-2">Sal. Min.</th>
                            <th class="p-2">Teto</th>
                            <th class="p-2">Índ. Teto</th>
                            <th class="p-2">Status</th>
                            <th class="p-2">Vlr. Teórico</th>
                            <th class="p-2">Vlr. Evoluído</th>
                            <th class="p-2">Vlr. Final</th>
                        </tr>
                    </thead>
                    <tbody class="memoria-tbody">
                        <!-- Será preenchido pela função renderizarMemoriaBeneficio -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    bloco.innerHTML = html;
    container.appendChild(bloco);

    // Aplica estados iniciais
    toggleTransformacaoRecebido(bloco);
    atualizarEstadoAbonoRecebido(bloco);
    atualizarEstadoBaseadoSalarioMinimoRecebido(bloco);

    // Renderiza a memória se houver resultado
    if (resultado) {
        renderizarMemoriaBeneficio(bloco, resultado, dados);
    }

    // ===== EVENT LISTENERS =====
    const btnCalcular = bloco.querySelector('.btn-calcular-evolucao');
    if (btnCalcular) {
        btnCalcular.addEventListener('click', function() {
            calcularBeneficioRecebido(bloco);
        });
    }

    const btnToggle = bloco.querySelector('.btn-toggle-memoria');
    const divResultado = bloco.querySelector('.resultado-beneficio-recebido');
    const memoriaDiv = bloco.querySelector('.memoria-beneficio-recebido');
    if (btnToggle) {
        btnToggle.addEventListener('click', function() {
            const isHidden = memoriaDiv ? memoriaDiv.classList.contains('hidden') : true;
            if (memoriaDiv) {
                memoriaDiv.classList.toggle('hidden');
                this.textContent = isHidden ? 'Ocultar Memória' : 'Exibir Memória';
                bloco.dataset.memoriaExpandida = isHidden ? 'true' : 'false';
            }
        });
    }

    const checkboxSM = bloco.querySelector('[data-campo="baseadoSalarioMinimo"]');
    if (checkboxSM) {
        checkboxSM.addEventListener('change', function() {
            toggleBaseadoSalarioMinimoRecebido(bloco);
        });
    }

    const dibInput = bloco.querySelector('[data-campo="dib"]');
    if (dibInput) {
        dibInput.addEventListener('change', function() {
            const checkboxSM = bloco.querySelector('[data-campo="baseadoSalarioMinimo"]');
            if (checkboxSM && checkboxSM.checked) {
                const rmiInput = bloco.querySelector('[data-campo="rmi"]');
                const salario = obterSalarioMinimoPorCompetencia(this.value);
                if (salario !== null && rmiInput) {
                    if (!rmiInput.dataset.originalManual) {
                        rmiInput.dataset.originalManual = rmiInput.value;
                    }
                    rmiInput.value = formatarMoeda(salario);
                }
            }
        });
    }

    // Se já havia resultado, restaura o estado de memória expandida
    if (resultado && divResultado) {
        divResultado.classList.remove('hidden');
        if (memoriaExpandida && memoriaDiv) {
            memoriaDiv.classList.remove('hidden');
            btnToggle.textContent = 'Ocultar Memória';
        } else if (memoriaDiv) {
            memoriaDiv.classList.add('hidden');
            btnToggle.textContent = 'Exibir Memória';
        }
        bloco.dataset.memoriaExpandida = memoriaExpandida ? 'true' : 'false';
    } else if (divResultado) {
        divResultado.classList.add('hidden');
        if (memoriaDiv) {
            memoriaDiv.classList.add('hidden');
            btnToggle.textContent = 'Exibir Memória';
        }
        bloco.dataset.memoriaExpandida = 'false';
    }

    return bloco;
}

// =====================================================================
// CALCULAR BENEFÍCIO RECEBIDO (INDIVIDUAL)
// =====================================================================

function calcularBeneficioRecebido(bloco) {
    try {
        const getVal = (campo) => bloco.querySelector(`[data-campo="${campo}"]`).value;
        const getCheck = (campo) => bloco.querySelector(`[data-campo="${campo}"]`).checked;
        const getSelect = (campo) => bloco.querySelector(`[data-campo="${campo}"]`).value;

        const dib = getVal('dib');
        const dip = getVal('dip');
        const rmiStr = getVal('rmi');
        const dcb = getVal('dcb');
        const possuiAbono = getCheck('possuiAbono');
        const baseadoSalarioMinimo = getCheck('baseadoSalarioMinimo');

        // Validação DIP < DIB
        if (dib && dip) {
            const dibParsed = parseDataProporcional30(dib);
            const dipParsed = parseDataProporcional30(dip);
            if (dibParsed && dipParsed) {
                const dibNum = converterCompetenciaParaNumero(dibParsed.mes + '/' + dibParsed.ano);
                const dipNum = converterCompetenciaParaNumero(dipParsed.mes + '/' + dipParsed.ano);
                if (dipNum < dibNum) {
                    alert('A DIP não pode ser anterior à DIB.');
                    return;
                }
            }
        }

        const dataFinalBeneficio = document.getElementById('dataFinal').value;
        if (!dataFinalBeneficio || dataFinalBeneficio.length < 7) {
            alert('Preencha a Data Final de Evolução na guia Entradas.');
            return;
        }

        const transformado = getSelect('transformado') === 'sim';
        const dibAntecedente = getVal('dibAntecedente');
        const tipoBeneficio = getSelect('tipo');
        const percentualDesdobramento = parseFloat(getVal('percentualDesdobramento').replace(',', '.')) || 100;
        const adicionalTipo = getSelect('adicional');
        const adicionalPercentual = parseFloat(getVal('adicionalPercentual').replace(',', '.')) || 0;

        const rmi = parseMoeda(rmiStr);
        if (isNaN(rmi) || rmi <= 0) {
            alert('RMI inválida.');
            return;
        }

        const parametros = {
            dib: dib,
            rmi: rmi,
            dataFinal: dataFinalBeneficio,
            transformado: transformado,
            dibAntecedente: dibAntecedente,
            tipoBeneficio: tipoBeneficio,
            percentualDesdobramento: percentualDesdobramento,
            adicionalTipo: adicionalTipo,
            adicionalPercentual: adicionalPercentual,
            possuiAbono: possuiAbono,
            baseadoSalarioMinimo: baseadoSalarioMinimo
        };

        const resultado = evoluirBeneficio(parametros);

        // Atualiza o dataset com o novo resultado
        // Evitar re-serialização durante importação (caso seja chamado de fora)
        // Mas aqui sempre é um novo cálculo, então serializamos.
        bloco.dataset.resultado = JSON.stringify(resultado);

        // Re-renderiza a memória com os novos dados
        const dados = {
            dib: dib,
            dcb: dcb,
            possuiAbono: possuiAbono,
            rmi: rmi
        };
        renderizarMemoriaBeneficio(bloco, resultado, dados);

        // Expande a memória automaticamente (já feito na renderização, mas garantimos)
        const memoriaDiv = bloco.querySelector('.memoria-beneficio-recebido');
        const btnToggle = bloco.querySelector('.btn-toggle-memoria');
        if (memoriaDiv) {
            memoriaDiv.classList.remove('hidden');
            if (btnToggle) btnToggle.textContent = 'Ocultar Memória';
        }
        bloco.dataset.memoriaExpandida = 'true';

    } catch (erro) {
        alert('Erro ao calcular benefício recebido: ' + erro.message);
    }
}

// =====================================================================
// COLETA E RESTAURAÇÃO
// =====================================================================

function coletarBeneficiosRecebidos() {
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
    const resultados = [];
    blocos.forEach(bloco => {
        const campos = bloco.querySelectorAll('[data-campo]');
        const dados = {};
        campos.forEach(el => {
            const nome = el.getAttribute('data-campo');
            if (el.type === 'checkbox') {
                dados[nome] = el.checked;
            } else {
                dados[nome] = el.value;
            }
        });
        const resultadoStr = bloco.dataset.resultado;
        if (resultadoStr) {
            dados.resultado = JSON.parse(resultadoStr);
        }
        dados.memoriaExpandida = bloco.dataset.memoriaExpandida === 'true';
        resultados.push(dados);
    });
    return resultados;
}

function restaurarBeneficiosRecebidos(dados) {
    const container = document.getElementById('containerBeneficiosRecebidos');
    if (!container) return;
    container.innerHTML = '';
    if (!dados || !Array.isArray(dados) || dados.length === 0) {
        adicionarBeneficioRecebido({});
        return;
    }
    dados.forEach(item => {
        if (!item.tratamentoDip) item.tratamentoDip = 'inicio_dip';
        adicionarBeneficioRecebido(item);
    });
}

// =====================================================================
// REMOVER BENEFÍCIO RECEBIDO
// =====================================================================

function removerBeneficioRecebido(botao) {
    if (confirm('Remover este benefício recebido?')) {
        const bloco = botao.closest('.beneficio-recebido-bloco');
        if (bloco) bloco.remove();
    }
}

// =====================================================================
// CALCULAR TODOS OS BENEFÍCIOS RECEBIDOS
// =====================================================================

function calcularTodosBeneficiosRecebidos() {
    const blocos = document.querySelectorAll('.beneficio-recebido-bloco');
    
    if (blocos.length === 0) {
        alert('Nenhum benefício recebido cadastrado para calcular.');
        return;
    }

    let calculados = 0;
    
    blocos.forEach(bloco => {
        try {
            calcularBeneficioRecebido(bloco);
            calculados++;
        } catch (erro) {
            console.error('[Guia 3] Erro ao calcular benefício em lote:', erro);
        }
    });

    if (calculados > 0) {
        alert(`${calculados} benefício(s) recebido(s) calculado(s) com sucesso!`);
    }
}
