// --- 1. SELEÇÃO DOS ELEMENTOS DO DOM ---
const form = document.querySelector('#form-gastos');
const descricaoInput = document.querySelector('#descricao');
const valorInput = document.querySelector('#valor');
const listaGastosUI = document.querySelector('#lista-gastos');
const btnHistorico = document.querySelector('#btn-historico');
const historicoContainer = document.querySelector('#historico-container');

// --- 2. "FONTE DA VERDADE" (State Management) ---
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];

// --- 3. FUNÇÕES ---

function salvarGastos() {
    localStorage.setItem('gastos', JSON.stringify(gastos));
}

// AJUSTADO: Agora adiciona um botão de excluir em cada item.
function renderizarGastos() {
    listaGastosUI.innerHTML = '';
    const hoje = new Date().toDateString();
    const gastosDeHoje = gastos.filter(gasto => new Date(gasto.id).toDateString() === hoje);

    const tituloHoje = document.createElement('h2');
    tituloHoje.textContent = 'Gastos de Hoje';
    listaGastosUI.appendChild(tituloHoje);

    if (gastosDeHoje.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Nenhum gasto adicionado hoje.';
        listaGastosUI.appendChild(p);
    } else {
        const ul = document.createElement('ul');
        for (const gasto of gastosDeHoje) {
            const li = document.createElement('li');
            // NOVO: Adiciona um data-id para sabermos qual item apagar.
            li.dataset.id = gasto.id;
            // NOVO: Usamos innerHTML para adicionar o texto e o botão.
            li.innerHTML = `
                <span>${gasto.descricao}: R$ ${gasto.valor.toFixed(2)}</span>
                <button class="btn-excluir">X</button>
            `;
            ul.appendChild(li);
        }
        listaGastosUI.appendChild(ul);
    }
}

function adicionarGasto(descricao, valor) {
    const novoGasto = {
        id: Date.now(),
        descricao: descricao,
        valor: parseFloat(valor)
    };
    gastos.push(novoGasto);
    salvarGastos();
    renderizarGastos();
}

// !! NOVA FUNÇÃO DE EXCLUSÃO !!
function excluirGasto(id) {
    // Filtra o array, mantendo apenas os gastos com id DIFERENTE do que queremos excluir.
    gastos = gastos.filter(gasto => gasto.id !== id);
    salvarGastos(); // Salva o novo array (sem o item excluído) no localStorage.
    renderizarGastos(); // Atualiza a lista de gastos de hoje na tela.
    renderizarHistorico(); // Atualiza também o histórico.
}


// AJUSTADO: Também adiciona o botão de excluir no histórico.
function renderizarHistorico() {
    historicoContainer.innerHTML = ''; 
    historicoContainer.style.display = 'block';

    if (gastos.length === 0) {
        historicoContainer.innerHTML = '<h2>Histórico</h2><p>Nenhum gasto registrado ainda.</p>';
        return;
    }

    const gastosAgrupados = {};
    for (const gasto of gastos) {
        const data = new Date(gasto.id);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        const chave = `${mes.toString().padStart(2, '0')}/${ano}`;

        if (!gastosAgrupados[chave]) {
            gastosAgrupados[chave] = [];
        }
        gastosAgrupados[chave].push(gasto);
    }

    const tituloHistorico = document.createElement('h2');
    tituloHistorico.textContent = 'Histórico de Gastos';
    historicoContainer.appendChild(tituloHistorico);

    for (const mesAno in gastosAgrupados) {
        const tituloMes = document.createElement('h3');
        tituloMes.textContent = `Mês: ${mesAno}`;
        historicoContainer.appendChild(tituloMes);

        const ul = document.createElement('ul');
        let totalMes = 0;

        for (const gasto of gastosAgrupados[mesAno]) {
            const li = document.createElement('li');
            // NOVO: Adiciona o data-id e o botão também no histórico.
            li.dataset.id = gasto.id;
            li.innerHTML = `
                <span>${new Date(gasto.id).toLocaleDateString('pt-BR')}: ${gasto.descricao} - R$ ${gasto.valor.toFixed(2)}</span>
                <button class="btn-excluir">X</button>
            `;
            ul.appendChild(li);
            totalMes += gasto.valor;
        }
        historicoContainer.appendChild(ul);

        const pTotal = document.createElement('p');
        pTotal.style.fontWeight = 'bold';
        pTotal.textContent = `Total do Mês: R$ ${totalMes.toFixed(2)}`;
        historicoContainer.appendChild(pTotal);
    }
}

// --- 4. EVENT LISTENERS ---

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const descricao = descricaoInput.value;
    const valor = valorInput.value;
    if (descricao.trim() === '' || valor.trim() === '') {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    adicionarGasto(descricao, valor);
    descricaoInput.value = '';
    valorInput.value = '';
    descricaoInput.focus();
});

btnHistorico.addEventListener('click', function() {
    renderizarHistorico();
});

// !! NOVO EVENT LISTENER PARA EXCLUSÃO !!
// Usamos "listaGastosUI" como pai para ouvir os cliques (event delegation).
listaGastosUI.addEventListener('click', function(event) {
    // Verifica se o elemento clicado foi um botão com a classe 'btn-excluir'.
    if (event.target.classList.contains('btn-excluir')) {
        // Pega o elemento <li> mais próximo do botão clicado.
        const li = event.target.closest('li');
        // Pega o ID que guardamos no 'data-id' e converte para número.
        const idParaExcluir = parseInt(li.dataset.id);
        
        // Pede confirmação ao usuário antes de apagar.
        if (confirm('Tem certeza que deseja excluir este gasto?')) {
            excluirGasto(idParaExcluir);
        }
    }
});


// --- 5. INICIALIZAÇÃO ---
renderizarGastos();
