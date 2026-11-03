
// ============================================
// CONFIGURAÇÕES
// ============================================

const API_URL = "http://10.139.146.57:5032";

const MAX_TENTATIVAS = 6;
const TAMANHO_SENHA = 5;

let idJogador = null;
let nomeJogador = "";
let senhaSecreta = "";
let tentativas = 0;

let tempoInicio = 0;
let intervaloCronometro = null;
let tempoFinal = 0;


// ============================================
// ELEMENTOS HTML
// ============================================

const telaLogin = document.getElementById("tela-login");
const telaJogo = document.getElementById("tela-jogo");
const telaResultado = document.getElementById("tela-resultado");

const inputNome = document.getElementById("nome-player");
const inputSenha = document.getElementById("input-senha");

const historico = document.getElementById("historico");
const contador = document.getElementById("contador");
const mensagem = document.getElementById("mensagem");

const cronometro = document.getElementById("cronometro");

const areaRanking = document.getElementById("area-ranking");
const btnRanking = document.getElementById("btn-ranking");
const btnFecharRanking = document.getElementById("btn-fechar-ranking");

const listaRanking = document.getElementById("lista-ranking");


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

    cronometro.textContent = formatarTempo(tempoAtual);
}


function pararCronometro() {

    clearInterval(intervaloCronometro);

    intervaloCronometro = null;

    tempoFinal = Math.floor(
        (Date.now() - tempoInicio) / 1000
    );

    cronometro.textContent = formatarTempo(tempoFinal);
}


// ============================================
// TROCAR TELAS
// ============================================

function mostrarTela(tela) {

    telaLogin.classList.add("escondido");
    telaJogo.classList.add("escondido");
    telaResultado.classList.add("escondido");

    tela.classList.remove("escondido");
}


// ============================================
// LOGIN E CADASTRO DO JOGADOR
// ============================================

async function entrarNoJogo() {

    nomeJogador = inputNome.value.trim();

    if (!nomeJogador) {

        alert("Digite seu nome para continuar!");

        inputNome.focus();

        return;
    }

    if (nomeJogador.length > 20) {

        alert("O nome deve ter no máximo 20 caracteres.");

        inputNome.focus();

        return;
    }

    const btnEntrar = document.getElementById("btn-entrar");

    btnEntrar.disabled = true;

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

    alert("Erro ao cadastrar jogador: " + erro);

    return;
}

            const resultado = await cadastro.json();

            idJogador = resultado.idJogador;

        } else {

            idJogador = jogador.idJogador;
        }

        document.getElementById("nome-exibido").textContent =
            nomeJogador;

        iniciarPartida();

    } catch (erro) {

        console.error("Erro ao entrar:", erro);

        alert(
            "Não foi possível conectar com o servidor. " +
            "Verifique se a API está funcionando."
        );

    } finally {

        btnEntrar.disabled = false;
    }
}


// Botão de entrar
document.getElementById("btn-entrar")
    .addEventListener("click", entrarNoJogo);


// Permite entrar pressionando Enter
inputNome.addEventListener("keydown", (e) => {

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

    historico.innerHTML = "";

    inputSenha.value = "";

    contador.textContent = `0 / ${MAX_TENTATIVAS}`;

    mensagem.textContent = "";

    areaRanking.classList.add("escondido");

    mostrarTela(telaJogo);

    iniciarCronometro();

    inputSenha.focus();
}


// ============================================
// COMPARAR SENHA
// ============================================

function compararSenha(palpite) {

    const resultado = Array(TAMANHO_SENHA).fill("cinza");

    const restante = {};

    // PRIMEIRO: VERIFICAR POSIÇÕES CORRETAS

    for (let i = 0; i < TAMANHO_SENHA; i++) {

        if (palpite[i] === senhaSecreta[i]) {

            resultado[i] = "verde";

        } else {

            restante[senhaSecreta[i]] =
                (restante[senhaSecreta[i]] || 0) + 1;
        }
    }

    // SEGUNDO: VERIFICAR NÚMEROS NA POSIÇÃO ERRADA

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
// ENVIAR TENTATIVA
// ============================================

document.getElementById("btn-enviar")
    .addEventListener("click", enviarTentativa);


inputSenha.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        enviarTentativa();
    }
});


function enviarTentativa() {

    const palpite = inputSenha.value.trim();

    // Verifica se foram digitados exatamente 5 números
    if (!/^\d{5}$/.test(palpite)) {

        mensagem.textContent =
            "Digite exatamente 5 números!";

        inputSenha.focus();

        return;
    }

    tentativas++;

    const cores = compararSenha(palpite);

    mostrarTentativa(palpite, cores);

    contador.textContent =
        `${tentativas} / ${MAX_TENTATIVAS}`;

    inputSenha.value = "";

    // VITÓRIA
    if (palpite === senhaSecreta) {

        finalizarJogo(true);

        return;
    }

    // DERROTA
    if (tentativas >= MAX_TENTATIVAS) {

        finalizarJogo(false);

        return;
    }

    mensagem.textContent =
        "Senha incorreta! Tente novamente.";

    inputSenha.focus();
}


// ============================================
// MOSTRAR TENTATIVA NA TELA
// ============================================

function mostrarTentativa(palpite, cores) {

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

        console.error("Jogador não identificado.");

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

        alert(
            "Não foi possível salvar sua partida no banco de dados."
        );
    }
}


// ============================================
// CARREGAR RANKING DA API
// ============================================

async function atualizarRanking() {

    listaRanking.innerHTML = `
        <p class="ranking-vazio">
            Carregando ranking...
        </p>
    `;

    try {

        const resposta = await fetch(
            `${API_URL}/Jogador/ranking`
        );

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

btnRanking.addEventListener("click", async () => {

    telaLogin.classList.add("escondido");

    areaRanking.classList.remove("escondido");

    await atualizarRanking();
});


// ============================================
// FECHAR RANKING
// ============================================

btnFecharRanking.addEventListener("click", () => {

    areaRanking.classList.add("escondido");

    telaLogin.classList.remove("escondido");
});


// ============================================
// FINALIZAR JOGO
// ============================================

async function finalizarJogo(venceu) {

    pararCronometro();

    // Salva a partida no banco antes de mostrar o resultado
    await registrarResultado(venceu);

    mostrarTela(telaResultado);

    areaRanking.classList.remove("escondido");

    if (venceu) {

        document.getElementById("icone-resultado")
            .textContent = "🏆";

        document.getElementById("titulo-resultado")
            .textContent = `Parabéns, ${nomeJogador}!`;

        document.getElementById("texto-resultado")
            .textContent =
            `Você descobriu a senha em ${tentativas} tentativa(s), levando ${formatarTempo(tempoFinal)}!`;

    } else {

        document.getElementById("icone-resultado")
            .textContent = "😢";

        document.getElementById("titulo-resultado")
            .textContent = "Fim de jogo!";

        document.getElementById("texto-resultado")
            .textContent =
            `Suas tentativas acabaram. Você levou ${formatarTempo(tempoFinal)}. Tente novamente!`;
    }

    document.getElementById("senha-final")
        .textContent = senhaSecreta;
}


// ============================================
// REINICIAR PARTIDA
// ============================================

document.getElementById("btn-reiniciar")
    .addEventListener("click", () => {

        iniciarPartida();
    });


// ============================================
// TROCAR JOGADOR
// ============================================

document.getElementById("btn-voltar")
    .addEventListener("click", () => {

        inputNome.value = "";

        nomeJogador = "";

        idJogador = null;

        areaRanking.classList.remove("escondido");

        mostrarTela(telaLogin);
    });


// ============================================
// SAIR DO JOGO
// ============================================

document.getElementById("btn-sair")
    .addEventListener("click", () => {

        if (confirm("Deseja realmente sair da partida?")) {

            clearInterval(intervaloCronometro);

            intervaloCronometro = null;

            inputNome.value = "";

            nomeJogador = "";

            idJogador = null;

            areaRanking.classList.remove("escondido");

            mostrarTela(telaLogin);
        }
    });


// ============================================
// CARREGAR RANKING AO ABRIR O JOGO
// ============================================

atualizarRanking();
