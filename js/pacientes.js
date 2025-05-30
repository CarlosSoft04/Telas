// Inicialização dos arrays no localStorage
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let medicamentos = JSON.parse(localStorage.getItem('medicamentos')) || [];
let aplicacoes = JSON.parse(localStorage.getItem('aplicacoes')) || [];

// Função para salvar pacientes no localStorage
function salvarPacientes() {
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

// Função para formatar CPF
function formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar telefone
function formatarTelefone(telefone) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função para adicionar novo paciente
function adicionarPaciente(event) {
    event.preventDefault();
    
    const form = event.target;
    const medicamentosEmUso = [];
    
    // Coleta os medicamentos selecionados
    const medicamentosContainer = document.getElementById('medicamentos-container');
    const medicamentosInputs = medicamentosContainer.querySelectorAll('.medicamento-item');
    
    medicamentosInputs.forEach(item => {
        const medicamentoId = item.querySelector('select').value;
        const frequencia = item.querySelector('input[name="frequencia"]').value;
        const horario = item.querySelector('input[name="horario"]').value;
        
        if (medicamentoId) {
            medicamentosEmUso.push({
                medicamentoId: parseInt(medicamentoId),
                frequencia,
                horario
            });
        }
    });

    const novoPaciente = {
        id: Date.now(),
        nome: form.nome.value,
        dataNascimento: form.dataNascimento.value,
        cpf: form.cpf.value.replace(/\D/g, ''),
        telefone: form.telefone.value.replace(/\D/g, ''),
        email: form.email.value,
        endereco: form.endereco.value,
        medicamentosEmUso,
        observacoes: form.observacoes.value
    };

    pacientes.push(novoPaciente);
    salvarPacientes();
    
    // Cria aplicações futuras para os medicamentos
    medicamentosEmUso.forEach(med => {
        const medicamento = medicamentos.find(m => m.id === med.medicamentoId);
        if (medicamento) {
            const dataHoje = new Date();
            const [horas, minutos] = med.horario.split(':');
            const dataAplicacao = new Date(dataHoje.setHours(parseInt(horas), parseInt(minutos), 0, 0));
            
            const novaAplicacao = {
                id: Date.now() + Math.random(),
                pacienteId: novoPaciente.id,
                medicamento: med.medicamentoId,
                dosagem: medicamento.dosagem,
                unidade: medicamento.unidade,
                data: dataAplicacao.toISOString().split('T')[0],
                hora: med.horario,
                status: 'Pendente',
                responsavel: '',
                observacoes: `Aplicação agendada - Frequência: ${med.frequencia}`
            };
            
            aplicacoes.push(novaAplicacao);
        }
    });
    
    localStorage.setItem('aplicacoes', JSON.stringify(aplicacoes));
    window.location.href = 'pacientes.html';
}

// Função para excluir paciente
function excluirPaciente(id) {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
        pacientes = pacientes.filter(pac => pac.id !== id);
        aplicacoes = aplicacoes.filter(apl => apl.pacienteId !== id);
        salvarPacientes();
        localStorage.setItem('aplicacoes', JSON.stringify(aplicacoes));
        renderizarTabela();
    }
}

// Função para editar paciente
function editarPaciente(id) {
    const paciente = pacientes.find(pac => pac.id === id);
    if (paciente) {
        localStorage.setItem('editando', JSON.stringify(paciente));
        window.location.href = 'novo-paciente.html';
    }
}

// Função para renderizar a tabela de pacientes
function renderizarTabela() {
    const tbody = document.querySelector('#tabela-pacientes tbody');
    if (!tbody) return;

    tbody.innerHTML = pacientes.map(pac => {
        const medicamentosAtuais = pac.medicamentosEmUso.map(med => {
            const medicamento = medicamentos.find(m => m.id === med.medicamentoId);
            return medicamento ? medicamento.nome : 'Medicamento não encontrado';
        }).join(', ');

        const proximaAplicacao = aplicacoes
            .filter(apl => apl.pacienteId === pac.id && apl.status === 'Pendente')
            .sort((a, b) => new Date(a.data + 'T' + a.hora) - new Date(b.data + 'T' + b.hora))[0];

        return `
        <tr>
            <td>${pac.nome}</td>
            <td>${new Date(pac.dataNascimento).toLocaleDateString('pt-BR')}</td>
            <td>${formatarCPF(pac.cpf)}</td>
            <td>${formatarTelefone(pac.telefone)}</td>
            <td>${medicamentosAtuais || 'Nenhum medicamento'}</td>
            <td>${proximaAplicacao ? 
                new Date(proximaAplicacao.data + 'T' + proximaAplicacao.hora).toLocaleString('pt-BR') : 
                'Sem aplicações pendentes'}</td>
            <td class="actions">
                <button onclick="editarPaciente(${pac.id})" class="action-btn edit" aria-label="Editar">
                    <svg viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button onclick="excluirPaciente(${pac.id})" class="action-btn delete" aria-label="Remover">
                    <svg viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </td>
        </tr>
    `}).join('');
}

// Função para adicionar campo de medicamento
function adicionarMedicamento() {
    const container = document.getElementById('medicamentos-container');
    const medicamentoItem = document.createElement('div');
    medicamentoItem.className = 'medicamento-item';
    
    medicamentoItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Medicamento</label>
                <select required>
                    <option value="">Selecione um medicamento</option>
                    ${medicamentos.map(med => `
                        <option value="${med.id}">${med.nome} - ${med.dosagem}${med.unidade}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Frequência</label>
                <input type="text" name="frequencia" required placeholder="Ex: 8 em 8 horas">
            </div>
            <div class="form-group">
                <label>Horário Inicial</label>
                <input type="time" name="horario" required>
            </div>
            <button type="button" class="btn delete" onclick="this.parentElement.parentElement.remove()">
                <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
    `;
    
    container.appendChild(medicamentoItem);
}

// Função para carregar dados para edição
function carregarDadosEdicao() {
    const editando = localStorage.getItem('editando');
    if (editando) {
        const paciente = JSON.parse(editando);
        const form = document.querySelector('form');
        if (form) {
            form.nome.value = paciente.nome;
            form.dataNascimento.value = paciente.dataNascimento;
            form.cpf.value = formatarCPF(paciente.cpf);
            form.telefone.value = formatarTelefone(paciente.telefone);
            form.email.value = paciente.email || '';
            form.endereco.value = paciente.endereco;
            form.observacoes.value = paciente.observacoes || '';
            
            // Carrega medicamentos em uso
            paciente.medicamentosEmUso.forEach(med => {
                adicionarMedicamento();
                const ultimoItem = document.querySelector('.medicamento-item:last-child');
                ultimoItem.querySelector('select').value = med.medicamentoId;
                ultimoItem.querySelector('input[name="frequencia"]').value = med.frequencia;
                ultimoItem.querySelector('input[name="horario"]').value = med.horario;
            });
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Atualizar Paciente';
            }
            
            form.onsubmit = (event) => {
                event.preventDefault();
                atualizarPaciente(paciente.id, event);
            };
        }
    }
}

// Função para atualizar paciente
function atualizarPaciente(id, event) {
    const form = event.target;
    const medicamentosEmUso = [];
    
    const medicamentosContainer = document.getElementById('medicamentos-container');
    const medicamentosInputs = medicamentosContainer.querySelectorAll('.medicamento-item');
    
    medicamentosInputs.forEach(item => {
        const medicamentoId = item.querySelector('select').value;
        const frequencia = item.querySelector('input[name="frequencia"]').value;
        const horario = item.querySelector('input[name="horario"]').value;
        
        if (medicamentoId) {
            medicamentosEmUso.push({
                medicamentoId: parseInt(medicamentoId),
                frequencia,
                horario
            });
        }
    });

    const pacienteAtualizado = {
        id,
        nome: form.nome.value,
        dataNascimento: form.dataNascimento.value,
        cpf: form.cpf.value.replace(/\D/g, ''),
        telefone: form.telefone.value.replace(/\D/g, ''),
        email: form.email.value,
        endereco: form.endereco.value,
        medicamentosEmUso,
        observacoes: form.observacoes.value
    };

    const index = pacientes.findIndex(pac => pac.id === id);
    pacientes[index] = pacienteAtualizado;
    
    // Atualiza aplicações
    aplicacoes = aplicacoes.filter(apl => apl.pacienteId !== id);
    medicamentosEmUso.forEach(med => {
        const medicamento = medicamentos.find(m => m.id === med.medicamentoId);
        if (medicamento) {
            const dataHoje = new Date();
            const [horas, minutos] = med.horario.split(':');
            const dataAplicacao = new Date(dataHoje.setHours(parseInt(horas), parseInt(minutos), 0, 0));
            
            const novaAplicacao = {
                id: Date.now() + Math.random(),
                pacienteId: id,
                medicamento: med.medicamentoId,
                dosagem: medicamento.dosagem,
                unidade: medicamento.unidade,
                data: dataAplicacao.toISOString().split('T')[0],
                hora: med.horario,
                status: 'Pendente',
                responsavel: '',
                observacoes: `Aplicação agendada - Frequência: ${med.frequencia}`
            };
            
            aplicacoes.push(novaAplicacao);
        }
    });
    
    salvarPacientes();
    localStorage.setItem('aplicacoes', JSON.stringify(aplicacoes));
    localStorage.removeItem('editando');
    window.location.href = 'pacientes.html';
}

// Inicialização das páginas
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        carregarDadosEdicao();
        if (!localStorage.getItem('editando')) {
            form.onsubmit = adicionarPaciente;
        }
    }
    
    renderizarTabela();
}); 