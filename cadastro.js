

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
        listaContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted p-5">Nenhum medicamento registrado.</p></div>';
        return;
    }

    medicamentos.forEach((medicamento, index) => {
        const [ano, mes, dia] = medicamento.data.split('-');
        const formatada = `${dia}/${mes}/${ano}`;

        listaContainer.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4 mb-3 animate-fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="card rounded-4 shadow-sm h-100" data-bs-toggle="modal" data-bs-target="#modalDetalhesMedicamento" onclick="prepararModal(${index})">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title fw-bold text-primary mb-0">${medicamento.nome}</h5>
                            <button class="btn btn-link text-danger p-0" onclick="event.stopPropagation(); apagarMedicamento(${index})">
                                <small>Remover</small>
                            </button>
                        </div>
                        <div class="mt-auto">
                            <p class="card-text mb-0">
                                <span class="text-muted small">Vencimento:</span><br>
                                <span class="fw-bold text-dark">${formatada}</span>
                            </p>
                        </div>
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


// --- 3. LÓGICA DE IMAGEM COM COMPRESSÃO ---
let imagemGuardada = null;

function compressImage(base64Str, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Comprime para JPEG com 70% de qualidade
        };
    });
}

const handleFile = async (event) => {
    const ficheiro = event.target.files[0];
    if (!ficheiro) return;

    // Feedback visual de carregamento
    const preview = document.getElementById('previewImagem');
    const loadingText = document.createElement('p');
    loadingText.id = 'loadingPhoto';
    loadingText.className = 'text-primary small';
    loadingText.textContent = 'Processando foto...';
    preview.parentNode.insertBefore(loadingText, preview);

    const leitor = new FileReader();

    leitor.addEventListener('load', async () => {
        try {
            // Comprime a imagem antes de guardar
            imagemGuardada = await compressImage(leitor.result);
            console.log('Imagem comprimida e pronta.');

            preview.src = imagemGuardada;
            preview.style.display = 'block';
            if (document.getElementById('loadingPhoto')) {
                document.getElementById('loadingPhoto').remove();
            }
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            alert('Erro ao processar a foto. Tente novamente.');
        }
    });

    leitor.readAsDataURL(ficheiro);
};

tirarFotoInput.addEventListener('change', handleFile);
escolherFicheiroInput.addEventListener('change', handleFile);

// Função auxiliar para preencher o modal (chamada pelo onclick do card)
function prepararModal(index) {
    const medicamento = medicamentos[index];
    const modalTitulo = document.getElementById('modalTitulo');
    const modalNome = document.getElementById('modalNome');
    const modalData = document.getElementById('modalData');
    const modalImagem = document.getElementById('modalImagem');

    modalTitulo.textContent = 'Detalhes do Medicamento';
    modalNome.textContent = medicamento.nome;
    // Converte a data string (YYYY-MM-DD) para formato legível pt-BR
    const [ano, mes, dia] = medicamento.data.split('-');
    modalData.textContent = `${dia}/${mes}/${ano}`;

    if (medicamento.imagem) {
        modalImagem.src = medicamento.imagem;
        modalImagem.style.display = 'block';
    } else {
        modalImagem.style.display = 'none';
    }
}

// O preenchimento do modal agora é feito pela função prepararModal chamada no clique do card.


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