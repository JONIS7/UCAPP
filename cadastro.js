

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
const tirarFotoBtn = document.getElementById('tirarFotoBtn');
const tirarFotoInput = document.getElementById('tirarFotoInput');
const escolherFicheiroBtn = document.getElementById('escolherFicheiroBtn');
const escolherFicheiroInput = document.getElementById('escolherFicheiroInput');
const preview = document.getElementById("previewImagem");

tirarFotoBtn.addEventListener('click', () => {
    tirarFotoInput.click();
});

escolherFicheiroBtn.addEventListener('click', () => {
    escolherFicheiroInput.click();
});

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
    listaContainer.innerHTML = '';

    if (medicamentos.length === 0) {
        listaContainer.innerHTML = '<p class="text-center">Nenhum medicamento registado.</p>';
        return;
    }

    medicamentos.forEach((medicamento, index) => {
        // 1. Começamos com o estilo vazio
        let estiloDoCard = '';

        // 2. Se o medicamento tiver uma imagem guardada.
        if (medicamento.imagem) {
            // 3. estilo do background
            estiloDoCard = `
                style="
                    background-image: url(${medicamento.imagem});
                    background-size: cover;
                    background-position: center;
                    color: white; 
                    text-shadow: 1px 1px 2px black;
                "
            `;
        }

        // 4. Inserimos a variável de estilo na div do card
        listaContainer.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4 mb-3" data-bs-toggle="modal" data-bs-target="#modalDetalhesMedicamento">
                <div class="card rounded-4" ${estiloDoCard}>
                    <div class="card-body d-flex justify-content-between align-items-center ">
                        <h5 class="card-title">${medicamento.nome}</h5>
                        <p class="card-text">Vence em: ${medicamento.data}</p>
                        <button class="btn btn-danger btn-sm" onclick="apagarMedicamento(${index})">Apagar</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function apagarMedicamento(index) {
  // 1. Mostra a pergunta de confirmação
  const querApagar = confirm('Tem a certeza que deseja apagar este medicamento?');

  // 2. Se o utilizador clicou em "OK" 
  if (querApagar) {
    // ...executa o código para apagar
    medicamentos.splice(index, 1);
    localStorage.setItem('listaDeMedicamentos', JSON.stringify(medicamentos));
    renderizarMedicamentos();
    
    // Re-verifica os alertas, pois um medicamento foi removido
    verificarAlertas(); 
  }
  // Se o utilizador clicou em "Cancelar", a função termina e não faz nada.
}


// --- 3. LÓGICA DE IMAGEM ---
let imagemGuardada = null; //  guardar a imagem escolhida

// Ouve os dois inputs de ficheiro. Quando uma imagem é escolhid
const handleFile = (event) => {
    const ficheiro = event.target.files[0];
    if (!ficheiro) return;

    const leitor = new FileReader();

    leitor.addEventListener('load', () => {
        imagemGuardada = leitor.result; // ...guarda o resultado 
        console.log('Imagem pronta para ser guardada.');
         // E mostra a pré-visualização
        const preview = document.getElementById('previewImagem');
        preview.src = imagemGuardada;
        preview.style.display = 'block';
    });

    leitor.readAsDataURL(ficheiro);
};

tirarFotoInput.addEventListener('change', handleFile);
escolherFicheiroInput.addEventListener('change', handleFile);

const modalDetalhes = document.getElementById('modalDetalhesMedicamento');

modalDetalhes.addEventListener('show.bs.modal', (event) => {
  // 1. Descobre qual card foi clicado
  const cardClicado = event.relatedTarget; 

  // 2. Pega no índice que guardámos no botão "Apagar" dentro desse card
  const botaoApagar = cardClicado.querySelector('button');
  const index = botaoApagar.getAttribute('onclick').match(/\d+/)[0];

  // 3. Com o índice, pega no objeto do medicamento
  const medicamento = medicamentos[index];

  // 4. Seleciona os elementos dentro do modal
  const modalTitulo = document.getElementById('modalTitulo');
  const modalNome = document.getElementById('modalNome');
  const modalData = document.getElementById('modalData');
  const modalImagem = document.getElementById('modalImagem');

  // 5. Preenche o modal com as informações do medicamento
  modalTitulo.textContent = medicamento.nome;
  modalNome.textContent = medicamento.nome;
  modalData.textContent = medicamento.data;

  if (medicamento.imagem) {
    modalImagem.src = medicamento.imagem;
    modalImagem.style.display = 'block'; // Mostra a imagem
  } else {
    modalImagem.style.display = 'none'; // Esconde a imagem se não houver
  }
});


// Listener do formulário
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nomeDoMedicamento = document.getElementById('nomeMedicamento').value;
    const dataDeVencimento = document.getElementById('dataVencimento').value;

    if (!nomeDoMedicamento || !dataDeVencimento) {
        alert('Por favor, preencha pelo menos o nome e a data de vencimento.');
        return;
    }

    const novoMedicamento = {
        nome: nomeDoMedicamento,
        data: dataDeVencimento,
        alerta30diasEnviado: false,
        alerta15diasEnviado: false
    };

    // Se uma imagem foi guardadal, adiciona-a ao objeto
    if (imagemGuardada) {
        novoMedicamento.imagem = imagemGuardada;
    }

    medicamentos.push(novoMedicamento);
    localStorage.setItem('listaDeMedicamentos', JSON.stringify(medicamentos));
    
    alert('Medicamento guardado com sucesso!');
    form.reset();
    imagemGuardada = null; // Limpa a imagem para o próximo registo
    const preview = document.getElementById('previewImagem');
    preview.style.display = 'none';
    renderizarMedicamentos();
    verificarAlertas();
});

// Listener para o botão de SINCRONIZAR COM A AGENDA
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
                    // Depois de todos os eventos serem criados, guarda o estado atualizado
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
// Ao carregar a página, verifica alertas e renderiza os medicamentos
verificarAlertas();
renderizarMedicamentos();