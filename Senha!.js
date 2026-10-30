
const MAX_TENTATIVAS = 6;
const TAMANHO_SENHA = 5;

let nomeJogador = "";
let senhaSecreta = "";
let tentativas = 0;


// ELEMENTOS

const telaLogin = document.getElementById("tela-login");
const telaJogo = document.getElementById("tela-jogo");
const telaResultado = document.getElementById("tela-resultado");

const inputNome = document.getElementById("nome-player");
const inputSenha = document.getElementById("input-senha");

const historico = document.getElementById("historico");

const contador = document.getElementById("contador");
const mensagem = document.getElementById("mensagem");


// TROCAR TELAS

function mostrarTela(tela) {

    telaLogin.classList.add("escondido");
    telaJogo.classList.add("escondido");
    telaResultado.classList.add("escondido");

    tela.classList.remove("escondido");

}


// LOGIN

document.getElementById("btn-entrar").addEventListener("click", entrarNoJogo);

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

    document.getElementById("nome-exibido").textContent = nomeJogador;

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

    mostrarTela(telaJogo);

    inputSenha.focus();

}


// COMPARAR SENHA

function compararSenha(palpite) {

    const resultado = Array(TAMANHO_SENHA).fill("cinza");

    const restante = {};

    // VERIFICAR NÚMEROS NA POSIÇÃO CERTA

    for (let i = 0; i < TAMANHO_SENHA; i++) {

        if (palpite[i] === senhaSecreta[i]) {

            resultado[i] = "verde";

        } else {

            restante[senhaSecreta[i]] =
                (restante[senhaSecreta[i]] || 0) + 1;

        }

    }

    // VERIFICAR NÚMEROS NA POSIÇÃO ERRADA

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

document.getElementById("btn-enviar").addEventListener("click", enviarTentativa);

inputSenha.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        enviarTentativa();
    }

});

function enviarTentativa() {

    const palpite = inputSenha.value.trim();

    if (!/^\d{5}$/.test(palpite)) {

        mensagem.textContent = "Digite exatamente 5 números!";

        return;

    }

    tentativas++;

    const cores = compararSenha(palpite);

    mostrarTentativa(palpite, cores);

    contador.textContent = `${tentativas} / ${MAX_TENTATIVAS}`;

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

    mensagem.textContent = "Senha incorreta! Tente novamente.";

    inputSenha.focus();

}


// MOSTRAR TENTATIVA NA TELA

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


// FINALIZAR JOGO

function finalizarJogo(venceu) {

    mostrarTela(telaResultado);

    if (venceu) {

        document.getElementById("icone-resultado").textContent = "🏆";

        document.getElementById("titulo-resultado").textContent =
            `Parabéns, ${nomeJogador}!`;

        document.getElementById("texto-resultado").textContent =
            `Você descobriu a senha em ${tentativas} tentativa(s)!`;

    } else {

        document.getElementById("icone-resultado").textContent = "😢";

        document.getElementById("titulo-resultado").textContent =
            "Fim de jogo!";

        document.getElementById("texto-resultado").textContent =
            "Suas tentativas acabaram. Tente novamente!";

    }

    document.getElementById("senha-final").textContent = senhaSecreta;

}


// REINICIAR

document.getElementById("btn-reiniciar").addEventListener("click", () => {

    iniciarPartida();

});


// TROCAR JOGADOR

document.getElementById("btn-voltar").addEventListener("click", () => {

    inputNome.value = "";

    nomeJogador = "";

    mostrarTela(telaLogin);

});


// SAIR DO JOGO

document.getElementById("btn-sair").addEventListener("click", () => {

    if (confirm("Deseja realmente sair da partida?")) {

        inputNome.value = "";

        nomeJogador = "";

        mostrarTela(telaLogin);

    }

});
