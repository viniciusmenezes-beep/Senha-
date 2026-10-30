
const MAX_TENTATIVAS = 6;
const TAMANHO_SENHA = 5;
const CHAVE_RANKING = "senhaSecretaRanking";

let nomeJogador = "";
let senhaSecreta = "";
let tentativas = 0;

let tempoInicio = 0;
let intervaloCronometro = null;
let tempoFinal = 0;


// ELEMENTOS

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


// LOCALSTORAGE

function obterRanking() {

    try {

        const dados = JSON.parse(
            localStorage.getItem(CHAVE_RANKING)
        );

        return Array.isArray(dados) ? dados : [];

    } catch {

        return [];

    }

}


// SALVAR RANKING

function salvarRanking(ranking) {

    localStorage.setItem(
        CHAVE_RANKING,
        JSON.stringify(ranking)
    );

}


// FORMATAR TEMPO

function formatarTempo(segundos) {

    const minutos = Math.floor(segundos / 60);

    const segundosRestantes = segundos % 60;

    return (
        String(minutos).padStart(2, "0") +
        ":" +
        String(segundosRestantes).padStart(2, "0")
    );

}


// CRONÔMETRO

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


// TROCAR TELAS

function mostrarTela(tela) {

    telaLogin.classList.add("escondido");
    telaJogo.classList.add("escondido");
    telaResultado.classList.add("escondido");

    tela.classList.remove("escondido");

}


// LOGIN

document.getElementById("btn-entrar")
    .addEventListener("click", entrarNoJogo);

inputNome.addEventListener("keydown", (e) => {

    if (e.key === "Enter") entrarNoJogo();

});


function entrarNoJogo() {

    nomeJogador = inputNome.value.trim();

    if (!nomeJogador) {

        alert("Digite seu nome para continuar!");

        inputNome.focus();

        return;

    }

    document.getElementById("nome-exibido").textContent =
        nomeJogador;

    iniciarPartida();

}


// GERAR SENHA

function gerarSenha() {

    let senha = "";

    for (let i = 0; i < TAMANHO_SENHA; i++) {

        senha += Math.floor(Math.random() * 10);

    }

    return senha;

}


// INICIAR PARTIDA

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


// COMPARAR SENHA

function compararSenha(palpite) {

    const resultado = Array(TAMANHO_SENHA).fill("cinza");

    const restante = {};

    // POSIÇÕES CORRETAS

    for (let i = 0; i < TAMANHO_SENHA; i++) {

        if (palpite[i] === senhaSecreta[i]) {

            resultado[i] = "verde";

        } else {

            restante[senhaSecreta[i]] =
                (restante[senhaSecreta[i]] || 0) + 1;

        }

    }

    // NÚMEROS NA POSIÇÃO ERRADA

    for (let i = 0; i < TAMANHO_SENHA; i++) {

        if (resultado[i] === "verde") continue;

        const numero = palpite[i];

        if (restante[numero] > 0) {

            resultado[i] = "amarelo";

            restante[numero]--;

        }

    }

    return resultado;

}


// ENVIAR TENTATIVA

document.getElementById("btn-enviar")
    .addEventListener("click", enviarTentativa);

inputSenha.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        enviarTentativa();

    }

});


function enviarTentativa() {

    const palpite = inputSenha.value.trim();

    if (!/^\d{5}$/.test(palpite)) {

        mensagem.textContent =
            "Digite exatamente 5 números!";

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


// MOSTRAR TENTATIVA

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


// SALVAR RESULTADO DO JOGADOR

function registrarResultado(venceu) {

    const ranking = obterRanking();

    // Procurar jogador pelo nome, ignorando maiúsculas
    // e espaços extras.

    let jogador = ranking.find(j =>
        j.nome.trim().toLowerCase() ===
        nomeJogador.trim().toLowerCase()
    );

    // Criar jogador caso ainda não exista.

    if (!jogador) {

        jogador = {

            nome: nomeJogador,

            partidas: 0,

            vitorias: 0,

            derrotas: 0,

            melhorTempo: null,

            melhorTentativas: null,

            ultimoTempo: 0

        };

        ranking.push(jogador);

    }

    jogador.partidas++;

    jogador.ultimoTempo = tempoFinal;

    if (venceu) {

        jogador.vitorias++;

        // Melhor tempo

        if (
            jogador.melhorTempo === null ||
            tempoFinal < jogador.melhorTempo
        ) {

            jogador.melhorTempo = tempoFinal;

        }

        // Menor quantidade de tentativas

        if (
            jogador.melhorTentativas === null ||
            tentativas < jogador.melhorTentativas
        ) {

            jogador.melhorTentativas = tentativas;

        }

    } else {

        jogador.derrotas++;

    }

    salvarRanking(ranking);

    atualizarRanking();

}


// ORGANIZAR E MOSTRAR RANKING

function atualizarRanking() {

    const lista = document.getElementById("lista-ranking");

    const ranking = obterRanking();

    // Primeiro: vitórias
    // Segundo: melhor tempo
    // Terceiro: menor número de tentativas

    ranking.sort((a, b) => {

        if (b.vitorias !== a.vitorias) {

            return b.vitorias - a.vitorias;

        }

        const tempoA = a.melhorTempo ?? Infinity;
        const tempoB = b.melhorTempo ?? Infinity;

        if (tempoA !== tempoB) {

            return tempoA - tempoB;

        }

        const tentativasA = a.melhorTentativas ?? Infinity;
        const tentativasB = b.melhorTentativas ?? Infinity;

        return tentativasA - tentativasB;

    });

    salvarRanking(ranking);

    lista.innerHTML = "";

    if (ranking.length === 0) {

        lista.innerHTML = `
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

        const posicao = indice + 1;

        const tempo = jogador.melhorTempo !== null
            ? formatarTempo(jogador.melhorTempo)
            : "--:--";

        const tentativasMelhores =
            jogador.melhorTentativas !== null
                ? jogador.melhorTentativas + "/6"
                : "--";

        item.innerHTML = `
            <div class="ranking-esquerda">

                <span class="ranking-posicao">
                    ${posicao}º
                </span>

                <div>

                    <div class="ranking-nome"></div>

                    <div class="ranking-detalhes">
                        ${jogador.partidas} partidas
                        • ${jogador.derrotas} derrotas
                    </div>

                    <div class="ranking-detalhes">
                        Melhor tempo: ${tempo}
                        • ${tentativasMelhores} tentativas
                    </div>

                </div>

            </div>

            <div class="ranking-vitorias">

                <strong>${jogador.vitorias}</strong>

                <span>VITÓRIAS</span>

            </div>
        `;

        // Inserir nome como texto para evitar interpretar
        // caracteres digitados como HTML.

        item.querySelector(".ranking-nome").textContent =
            jogador.nome;

        lista.appendChild(item);

    });

}


// FINALIZAR JOGO

function finalizarJogo(venceu) {

    pararCronometro();

    registrarResultado(venceu);

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


// REINICIAR

document.getElementById("btn-reiniciar")
    .addEventListener("click", () => {

        iniciarPartida();

    });


// TROCAR JOGADOR

document.getElementById("btn-voltar")
    .addEventListener("click", () => {

        inputNome.value = "";

        nomeJogador = "";

        areaRanking.classList.remove("escondido");

        mostrarTela(telaLogin);

    });


// SAIR DO JOGO

document.getElementById("btn-sair")
    .addEventListener("click", () => {

        if (confirm("Deseja realmente sair da partida?")) {

            clearInterval(intervaloCronometro);

            intervaloCronometro = null;

            inputNome.value = "";

            nomeJogador = "";

            areaRanking.classList.remove("escondido");

            mostrarTela(telaLogin);

        }

    });


// CARREGAR RANKING AO ABRIR O JOGO

atualizarRanking();
