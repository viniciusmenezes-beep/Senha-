
// ============================================
// CONFIGURAÇÕES
// ============================================

const API_URL = "";

const MAX_TENTATIVAS = 6;
const TAMANHO_SENHA = 5;

let idJogador = null;
let nomeJogador = "";
let senhaSecreta = "";
let tentativas = 0;

let tempoInicio = 0;
let intervaloCronometro = null;
let tempoFinal = 0;

let palpiteAtual = "";
let resolverModal = null;


// ============================================
// ELEMENTOS HTML
// ============================================

const telaLogin = document.getElementById("tela-login");
const telaJogo = document.getElementById("tela-jogo");
const telaResultado = document.getElementById("tela-resultado");

const inputNome = document.getElementById("nome-player");
const entradaSenha = document.getElementById("entrada-senha");

const celulasEntrada = entradaSenha
    ? entradaSenha.querySelectorAll(".celula-entrada")
    : [];

const tecladoVirtual = document.getElementById("teclado-virtual");

const historico = document.getElementById("historico");
const contador = document.getElementById("contador");
const mensagem = document.getElementById("mensagem");
const cronometro = document.getElementById("cronometro");

const areaRanking = document.getElementById("area-ranking");
const btnRanking = document.getElementById("btn-ranking");
const btnFecharRanking = document.getElementById("btn-fechar-ranking");
const listaRanking = document.getElementById("lista-ranking");

const btnEntrar = document.getElementById("btn-entrar");
const btnEnviar = document.getElementById("btn-enviar");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnVoltar = document.getElementById("btn-voltar");
const btnSair = document.getElementById("btn-sair");


// ============================================
// MODAL PERSONALIZADO
// ============================================

const modalAlerta = document.getElementById("modal-alerta");
const modalIcone = document.getElementById("modal-icone");
const modalTitulo = document.getElementById("modal-titulo");
const modalMensagem = document.getElementById("modal-mensagem");

const modalConfirmar = document.getElementById("modal-confirmar");
const modalCancelar = document.getElementById("modal-cancelar");


function alerta(titulo, mensagem, tipo = "warning") {

    return Swal.fire({
        title: titulo,
        text: mensagem,
        icon: tipo,

        background: "#222532",
        color: "#ffffff",

        customClass: {
            popup: "swal-senha-popup",
            title: "swal-senha-title",
            htmlContainer: "swal-senha-text",
            confirmButton: "swal-senha-confirmar",
            cancelButton: "swal-senha-cancelar"
        },

        buttonsStyling: false,
        confirmButtonText: "ENTENDI",
        allowOutsideClick: false
    });
}


function abrirModal(titulo, mensagem, tipo = "erro", confirmacao = false) {

    // Caso o HTML do modal não exista, utiliza o SweetAlert
    if (!modalAlerta || !modalTitulo || !modalMensagem || !modalIcone || !modalConfirmar) {

        if (confirmacao) {
            return Swal.fire({
                title: titulo,
                text: mensagem,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "SIM, SAIR",
                cancelButtonText: "CANCELAR"
            }).then(resultado => resultado.isConfirmed);
        }

        return alerta(titulo, mensagem, tipo);
    }

    return new Promise((resolve) => {

        resolverModal = resolve;

        const icones = {
            erro: "!",
            sucesso: "✓",
            aviso: "!",
            confirmacao: "?"
        };

        modalTitulo.textContent = titulo;
        modalMensagem.textContent = mensagem;
        modalIcone.textContent = icones[tipo] || "!";

        modalIcone.className = `modal-icone ${tipo}`;

        if (modalCancelar) {
            modalCancelar.classList.toggle("escondido", !confirmacao);
        }

        modalConfirmar.textContent = confirmacao
            ? "SIM, SAIR"
            : "ENTENDI";

        modalAlerta.classList.remove("escondido");
    });
}


function fecharModal(resultado) {

    if (modalAlerta) {
        modalAlerta.classList.add("escondido");
    }

    if (resolverModal) {
        resolverModal(resultado);
        resolverModal = null;
    }
}


function mostrarAlerta(mensagem, tipo = "erro", titulo = "Atenção!") {

    return abrirModal(titulo, mensagem, tipo, false);
}


function mostrarConfirmacao(mensagem, titulo = "Tem certeza?") {

    return abrirModal(titulo, mensagem, "confirmacao", true);
}


modalConfirmar?.addEventListener("click", () => {
    fecharModal(true);
});

modalCancelar?.addEventListener("click", () => {
    fecharModal(false);
});


// ============================================
// FORMATAR TEMPO
// ============================================

function formatarTempo(segundos) {

    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return (
        String(minutos).padStart(2, "0") +
        ":" +
        String(segundosRestantes).padStart(2, "0")
    );
}


// ============================================
// CRONÔMETRO
// ============================================

function iniciarCronometro() {

    clearInterval(intervaloCronometro);

    tempoInicio = Date.now();
    tempoFinal = 0;

    atualizarCronometro();

    intervaloCronometro = setInterval(() => {
        atualizarCronometro();
    }, 1000);
}


function atualizarCronometro() {

    const tempoAtual = Math.floor(
        (Date.now() - tempoInicio) / 1000
    );

    if (cronometro) {
        cronometro.textContent = formatarTempo(tempoAtual);
    }
}


function pararCronometro() {

    clearInterval(intervaloCronometro);

    intervaloCronometro = null;

    tempoFinal = Math.floor(
        (Date.now() - tempoInicio) / 1000
    );

    if (cronometro) {
        cronometro.textContent = formatarTempo(tempoFinal);
    }
}


// ============================================
// TROCAR TELAS
// ============================================

function mostrarTela(tela) {

    telaLogin?.classList.add("escondido");
    telaJogo?.classList.add("escondido");
    telaResultado?.classList.add("escondido");

    tela?.classList.remove("escondido");
}


// ============================================
// LOGIN E CADASTRO DO JOGADOR
// ============================================

async function entrarNoJogo() {

    nomeJogador = inputNome?.value.trim() || "";

    if (!nomeJogador) {

        alerta(
            "Digite seu nome!",
            "Você precisa informar seu nome para continuar.",
            "warning"
        );

        inputNome?.focus();
        return;
    }

    if (nomeJogador.length > 20) {

        alerta(
            "Nome muito grande!",
            "O nome deve ter no máximo 20 caracteres.",
            "warning"
        );

        inputNome?.focus();
        return;
    }

    if (btnEntrar) {
        btnEntrar.disabled = true;
    }

    try {

        // Busca os jogadores cadastrados
        const resposta = await fetch(`${API_URL}/Jogador`);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar os jogadores.");
        }

        const jogadores = await resposta.json();

        // Verifica se o jogador já existe
        const jogador = jogadores.find(j =>
            (j.nome ?? "").trim().toLowerCase() ===
            nomeJogador.toLowerCase()
        );

        // Se não existir, cadastra
        if (!jogador) {

            const cadastro = await fetch(
                `${API_URL}/Jogador/cadastrar`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        nome: nomeJogador
                    })
                }
            );

            if (!cadastro.ok) {

                const erro = await cadastro.text();

                console.error("Erro detalhado do cadastro:", erro);

                alerta(
                    "Erro no cadastro!",
                    "Não foi possível cadastrar o jogador.",
                    "error"
                );

                return;
            }

            const resultado = await cadastro.json();

            idJogador = resultado.idJogador;

        } else {

            idJogador = jogador.idJogador;
        }

        const nomeExibido = document.getElementById("nome-exibido");

        if (nomeExibido) {
            nomeExibido.textContent = nomeJogador;
        }

        iniciarPartida();

    } catch (erro) {

        console.error("Erro ao entrar:", erro);

        alerta(
            "Ops!",
            "Não foi possível conectar com o servidor.",
            "error"
        );

    } finally {

        if (btnEntrar) {
            btnEntrar.disabled = false;
        }
    }
}


// Botão de entrar
btnEntrar?.addEventListener("click", entrarNoJogo);


// Permite entrar pressionando Enter
inputNome?.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        entrarNoJogo();
    }
});


// ============================================
// GERAR SENHA ALEATÓRIA
// ============================================

function gerarSenha() {

    let senha = "";

    for (let i = 0; i < TAMANHO_SENHA; i++) {

        senha += Math.floor(Math.random() * 10);
    }

    return senha;
}


// ============================================
// INICIAR PARTIDA
// ============================================

function iniciarPartida() {

    senhaSecreta = gerarSenha();

    tentativas = 0;
    palpiteAtual = "";

    if (historico) {
        historico.innerHTML = "";
    }

    atualizarEntradaSenha();

    if (contador) {
        contador.textContent = `0 / ${MAX_TENTATIVAS}`;
    }

    if (mensagem) {
        mensagem.textContent = "";
    }

    areaRanking?.classList.add("escondido");

    mostrarTela(telaJogo);

    iniciarCronometro();
}


// ============================================
// COMPARAR SENHA
// ============================================

function compararSenha(palpite) {

    const resultado = Array(TAMANHO_SENHA).fill("cinza");

    const restante = {};

    // Primeiro: verificar posições corretas
    for (let i = 0; i < TAMANHO_SENHA; i++) {

        if (palpite[i] === senhaSecreta[i]) {

            resultado[i] = "verde";

        } else {

            restante[senhaSecreta[i]] =
                (restante[senhaSecreta[i]] || 0) + 1;
        }
    }

    // Segundo: verificar números na posição errada
    for (let i = 0; i < TAMANHO_SENHA; i++) {

        if (resultado[i] === "verde") {
            continue;
        }

        const numero = palpite[i];

        if (restante[numero] > 0) {

            resultado[i] = "amarelo";

            restante[numero]--;
        }
    }

    return resultado;
}


// ============================================
// ENTRADA DIRETA NOS QUADRADOS
// ============================================

function atualizarEntradaSenha() {

    celulasEntrada.forEach((celula, indice) => {

        celula.textContent = palpiteAtual[indice] || "";

        celula.classList.toggle(
            "preenchida",
            indice < palpiteAtual.length
        );

    });
}


function adicionarNumero(numero) {

    if (palpiteAtual.length >= TAMANHO_SENHA) {
        return;
    }

    palpiteAtual += numero;

    if (mensagem) {
        mensagem.textContent = "";
    }

    atualizarEntradaSenha();
}


function apagarNumero() {

    palpiteAtual = palpiteAtual.slice(0, -1);

    atualizarEntradaSenha();
}


// ============================================
// ENVIAR TENTATIVA
// ============================================

function enviarTentativa() {

    const palpite = palpiteAtual;

    if (!/^\d{5}$/.test(palpite)) {

        if (mensagem) {
            mensagem.textContent = "Digite exatamente 5 números!";
        }

        return;
    }

    tentativas++;

    const cores = compararSenha(palpite);

    mostrarTentativa(palpite, cores);

    if (contador) {
        contador.textContent = `${tentativas} / ${MAX_TENTATIVAS}`;
    }

    palpiteAtual = "";

    atualizarEntradaSenha();

    // Vitória
    if (palpite === senhaSecreta) {

        finalizarJogo(true);

        return;
    }

    // Derrota
    if (tentativas >= MAX_TENTATIVAS) {

        finalizarJogo(false);

        return;
    }

    if (mensagem) {
        mensagem.textContent = "Senha incorreta! Tente novamente.";
    }
}


// Botão confirmar do PC
btnEnviar?.addEventListener("click", enviarTentativa);


// ============================================
// TECLADO FÍSICO - PC
// ============================================

document.addEventListener("keydown", (e) => {

    if (!telaJogo || telaJogo.classList.contains("escondido")) {
        return;
    }

    // Não captura teclas se um modal estiver aberto
    if (modalAlerta && !modalAlerta.classList.contains("escondido")) {
        return;
    }

    if (e.key >= "0" && e.key <= "9") {

        e.preventDefault();

        adicionarNumero(e.key);
    }

    if (e.key === "Backspace") {

        e.preventDefault();

        apagarNumero();
    }

    if (e.key === "Enter") {

        e.preventDefault();

        enviarTentativa();
    }
});


// ============================================
// TECLADO VIRTUAL - CELULAR
// ============================================

tecladoVirtual?.addEventListener("click", (e) => {

    const botao = e.target.closest("button");

    if (!botao) {
        return;
    }

    if (botao.dataset.numero !== undefined) {

        adicionarNumero(botao.dataset.numero);
    }

    if (botao.dataset.acao === "apagar") {

        apagarNumero();
    }

    if (botao.dataset.acao === "enviar") {

        enviarTentativa();
    }
});


// ============================================
// MOSTRAR TENTATIVA NA TELA
// ============================================

function mostrarTentativa(palpite, cores) {

    if (!historico) {
        return;
    }

    const linha = document.createElement("div");

    linha.className = "linha";

    for (let i = 0; i < TAMANHO_SENHA; i++) {

        const celula = document.createElement("div");

        celula.className = `celula ${cores[i]}`;

        celula.textContent = palpite[i];

        linha.appendChild(celula);
    }

    historico.appendChild(linha);
}


// ============================================
// SALVAR RESULTADO NO BANCO DE DADOS
// ============================================

async function registrarResultado(venceu) {

    if (!idJogador) {

        alerta(
            "Erro ao salvar!",
            "Não foi possível salvar sua partida no banco de dados.",
            "error"
        );

        return;
    }

    try {

        const resposta = await fetch(
            `${API_URL}/Jogador/${idJogador}/partidas`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    tempoSegundos: tempoFinal,

                    tentativas: tentativas,

                    venceu: venceu

                })
            }
        );

        if (!resposta.ok) {

            throw new Error("Não foi possível salvar a partida.");
        }

        console.log("Partida salva com sucesso!");

        // Atualiza o ranking após salvar
        await atualizarRanking();

    } catch (erro) {

        console.error("Erro ao salvar partida:", erro);

        mostrarAlerta(
            "Não foi possível salvar sua partida no banco de dados.",
            "erro",
            "Erro ao salvar"
        );
    }
}


// ============================================
// CARREGAR RANKING DA API
// ============================================

async function atualizarRanking() {

    if (!listaRanking) {
        return;
    }

    listaRanking.innerHTML = `
        <p class="ranking-vazio">
            Carregando ranking...
        </p>
    `;

    try {

        const resposta = await fetch(`${API_URL}/Jogador/ranking`);

        if (!resposta.ok) {

            throw new Error("Erro ao carregar ranking.");
        }

        const ranking = await resposta.json();

        listaRanking.innerHTML = "";

        if (ranking.length === 0) {

            listaRanking.innerHTML = `
                <p class="ranking-vazio">
                    Nenhum jogador registrado ainda.
                    Seja o primeiro a jogar!
                </p>
            `;

            return;
        }

        ranking.forEach((jogador, indice) => {

            const item = document.createElement("div");

            item.className = "ranking-item";

            if (indice === 0) {
                item.classList.add("ranking-primeiro");
            }

            const melhorPartida = jogador.melhorPartida;

            const tempo = melhorPartida
                ? formatarTempo(melhorPartida.tempoSegundos)
                : "--:--";

            const melhoresTentativas = melhorPartida
                ? `${melhorPartida.tentativas}/6`
                : "--";

            item.innerHTML = `
                <div class="ranking-esquerda">

                    <span class="ranking-posicao">
                        ${indice + 1}º
                    </span>

                    <div>

                        <div class="ranking-nome"></div>

                        <div class="ranking-detalhes">
                            ${jogador.totalPartidas} partidas
                            • ${jogador.derrotas} derrotas
                        </div>

                        <div class="ranking-detalhes">
                            Melhor tempo: ${tempo}
                            • ${melhoresTentativas} tentativas
                        </div>

                    </div>

                </div>

                <div class="ranking-vitorias">

                    <strong>${jogador.vitorias}</strong>

                    <span>VITÓRIAS</span>

                </div>
            `;

            // Insere o nome como texto
            item.querySelector(".ranking-nome").textContent =
                jogador.nome;

            listaRanking.appendChild(item);
        });

    } catch (erro) {

        console.error("Erro ao carregar ranking:", erro);

        listaRanking.innerHTML = `
            <p class="ranking-vazio">
                Não foi possível carregar o ranking.
            </p>
        `;
    }
}


// ============================================
// ABRIR RANKING
// ============================================

btnRanking?.addEventListener("click", async () => {

    telaLogin?.classList.add("escondido");

    areaRanking?.classList.remove("escondido");

    await atualizarRanking();
});


// ============================================
// FECHAR RANKING
// ============================================

btnFecharRanking?.addEventListener("click", () => {

    areaRanking?.classList.add("escondido");

    telaLogin?.classList.remove("escondido");
});


// ============================================
// FINALIZAR JOGO
// ============================================

async function finalizarJogo(venceu) {

    pararCronometro();

    // Salva a partida antes de mostrar o resultado
    await registrarResultado(venceu);

    mostrarTela(telaResultado);

    areaRanking?.classList.remove("escondido");

    const iconeResultado = document.getElementById("icone-resultado");

    if (venceu) {

        iconeResultado.innerHTML = `
            <i data-lucide="trophy"></i>
        `;

        document.getElementById("titulo-resultado").textContent =
            `Parabéns, ${nomeJogador}!`;

        document.getElementById("texto-resultado").textContent =
            `Você descobriu a senha em ${tentativas} tentativa(s), levando ${formatarTempo(tempoFinal)}!`;

    } else {

        iconeResultado.innerHTML = `
            <i data-lucide="frown"></i>
        `;

        document.getElementById("titulo-resultado").textContent =
            "Fim de jogo!";

        document.getElementById("texto-resultado").textContent =
            `Suas tentativas acabaram. Você levou ${formatarTempo(tempoFinal)}. Tente novamente!`;
    }

    // Renderiza os ícones Lucide
    lucide.createIcons();

    document.getElementById("senha-final").textContent = senhaSecreta;
}



// ============================================
// REINICIAR PARTIDA
// ============================================

btnReiniciar?.addEventListener("click", () => {

    iniciarPartida();
});


// ============================================
// TROCAR JOGADOR
// ============================================

btnVoltar?.addEventListener("click", () => {

    if (inputNome) {
        inputNome.value = "";
    }

    nomeJogador = "";
    idJogador = null;
    palpiteAtual = "";

    pararCronometro();

    areaRanking?.classList.remove("escondido");

    mostrarTela(telaLogin);
});


// ============================================
// SAIR DO JOGO
// ============================================

async function confirmarSaida() {

    const resultado = await Swal.fire({
        title: "Sair da partida?",
        text: "Seu progresso nesta partida será perdido.",
        icon: "question",

        background: "#222532",
        color: "#ffffff",

        showCancelButton: true,

        confirmButtonText: "SIM, SAIR",
        cancelButtonText: "CONTINUAR JOGANDO",

        customClass: {
            popup: "swal-senha-popup",
            title: "swal-senha-title",
            htmlContainer: "swal-senha-text",
            confirmButton: "swal-senha-confirmar",
            cancelButton: "swal-senha-cancelar"
        },

        buttonsStyling: false,
        reverseButtons: true,
        allowOutsideClick: false
    });

    if (resultado.isConfirmed) {

        clearInterval(intervaloCronometro);
        intervaloCronometro = null;

        tempoFinal = 0;
        palpiteAtual = "";

        atualizarEntradaSenha();

        if (inputNome) {
            inputNome.value = "";
        }

        nomeJogador = "";
        idJogador = null;

        areaRanking?.classList.remove("escondido");

        mostrarTela(telaLogin);
    }
}


btnSair?.addEventListener("click", confirmarSaida);


// ============================================
// CARREGAR RANKING AO ABRIR O JOGO
// ============================================

atualizarRanking();
