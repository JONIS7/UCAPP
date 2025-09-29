// --- cadastro.js ATUALIZADO COM MEMÓRIA E CRIAÇÃO DE EVENTO ---

// 1. CARREGAR DADOS: Tenta carregar os medicamentos guardados assim que a página abre.
let medicamentos = [];
const medicamentosGuardados = localStorage.getItem('listaDeMedicamentos');
if (medicamentosGuardados) {
  // Se encontrou algo guardado, converte o texto de volta para uma lista.
  medicamentos = JSON.parse(medicamentosGuardados);
}
console.log('Lista de medicamentos carregada:', medicamentos);


const form = document.getElementById('medicamentoForm');
const sincronizarBtn = document.getElementById('sincronizarBtn');
const mensagemAlertas = document.getElementById('mensagemAlertas');

// --- 2. LÓGICA DE VERIFICAÇÃO DE ALERTAS (EXECUTADA AO CARREGAR A PÁGINA) ---
function verificarAlertas() {
    const hoje = new Date();
    lembretesPendentes = []; // Limpa a lista de pendentes antes de verificar novamente

    medicamentos.forEach(medicamento => {
        const dataVencimento = new Date(medicamento.data);
        const diferencaEmMilissegundos = dataVencimento - hoje;
        const diasRestantes = Math.ceil(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));

        // Verificação para 30 dias
        if (diasRestantes <= 30 && diasRestantes > 15 && !medicamento.alerta30diasEnviado) {
            lembretesPendentes.push({ ...medicamento, tipoAlerta: 30 });
        }

        // Verificação para 15 dias
        if (diasRestantes <= 15 && diasRestantes > 0 && !medicamento.alerta15diasEnviado) {
            lembretesPendentes.push({ ...medicamento, tipoAlerta: 15 });
        }
    });

    // Atualiza a interface do utilizador com base nos lembretes pendentes
    if (lembretesPendentes.length > 0) {
        mensagemAlertas.textContent = `Você tem ${lembretesPendentes.length} lembretes para sincronizar com a sua agenda!`;
        sincronizarBtn.disabled = false; // Ativa o botão
    } else {
        mensagemAlertas.textContent = 'Nenhum lembrete para sincronizar.';
        sincronizarBtn.disabled = true; // Desativa o botão
    }
}

// cards html
function renderizarMedicamentos() {
  const listaContainer = document.getElementById('listaMedicamentos');
  
  // Limpa o conteúdo antigo para não duplicar
  listaContainer.innerHTML = ''; 

  // Se não houver medicamentos, mostra uma mensagem
  if (medicamentos.length === 0) {
    listaContainer.innerHTML = '<p>Nenhum medicamento registado.</p>';
    return; // Para a função aqui
  }

  // Cria um card para cada medicamento
  medicamentos.forEach(medicamento => {
    // Usamos += para adicionar o HTML de cada card à nossa string
    listaContainer.innerHTML += `
      <div class="col-3 mt-4"><div class="card mb-2">
        <div class="card-body">
          <h5 class="card-title text-center">${medicamento.nome}</h5>
          <p class="card-text text-center">Vence em: ${medicamento.data}</p>
          <button class="btn btn-danger btn-sm" onclick="apagarMedicamento(${index})">Apagar</button></div>
        </div>
      </div>
      </div>
    `;
  });
}


// QUANDO O FORMULÁRIO É ENVIADO (CLIQUE EM "SALVAR")
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const nomeDoMedicamento = document.getElementById('nomeMedicamento').value;
  const dataDeVencimento = document.getElementById('dataVencimento').value;

  // Validação para garantir que os campos não estão vazios
  if (nomeDoMedicamento === '' || dataDeVencimento === '') {
    alert('Por favor, preencha todos os campos.');
    return; 
  }

  const novoMedicamento = {
    nome: nomeDoMedicamento,
    data: dataDeVencimento,
    alerta30diasEnviado: false,
    alerta15diasEnviado: false
  };

  medicamentos.push(novoMedicamento);

  // Guarda a lista atualizada no localStorage
  localStorage.setItem('listaDeMedicamentos', JSON.stringify(medicamentos));
  
  alert('Medicamento guardado com sucesso!');
    form.reset();
    verificarAlertas(); // Re-verifica os alertas para atualizar a mensagem
});

// Listener para o botão de SINCRONIZAR COM A AGENDA (VERSÃO CORRIGIDA)
sincronizarBtn.addEventListener('click', () => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '91249466385-m87mafvbgn4f12d81t9qshj3ior2phvu.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                
                // Cria uma lista de "promessas" de criação de eventos
                const promessasDeEventos = lembretesPendentes.map(lembrete => {
                    return criarEvento(tokenResponse.access_token, lembrete);
                });

                // Promise.all espera que TODAS as promessas terminem
                Promise.all(promessasDeEventos)
                .then(() => {
                    // SÓ DEPOIS de todos os eventos serem criados...
                    // ...é que guardamos a lista atualizada e mostramos o alerta.
                    localStorage.setItem('listaDeMedicamentos', JSON.stringify(medicamentos));
                    alert('Lembretes sincronizados com a sua agenda!');
                    verificarAlertas(); // Re-verifica para limpar a mensagem e desativar o botão
                });
            }
        },
    });
    tokenClient.requestAccessToken();
});


// --- 4. FUNÇÃO DE CRIAÇÃO DE EVENTO NO GOOGLE AGENDA ---
function criarEvento(accessToken, lembrete) {
    const { nome, data, tipoAlerta } = lembrete;

    const event = {
        'summary': `ALERTA DE VENCIMENTO (${tipoAlerta} dias): ${nome}`,
        'description': `Lembrete automático: o medicamento ${nome} vence em ${tipoAlerta} dias.`,
        'start': { 'date': data }, // Evento para o dia todo
        'end': { 'date': data },   // Evento para o dia todo
    };

    return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Evento criado:', data);
        // Atualiza o estado do alerta no objeto original
        const medicamentoOriginal = medicamentos.find(m => m.nome === nome && m.data === lembrete.data);
        if (medicamentoOriginal) {
            if (tipoAlerta === 30) medicamentoOriginal.alerta30diasEnviado = true;
            if (tipoAlerta === 15) medicamentoOriginal.alerta15diasEnviado = true;
        }
    })
    .catch(error => console.error('Erro ao criar evento:', error));
}

// --- 5. EXECUÇÃO INICIAL ---
// A primeira coisa que acontece quando a página carrega é verificar os alertas.
verificarAlertas();
renderizarMedicamentos();