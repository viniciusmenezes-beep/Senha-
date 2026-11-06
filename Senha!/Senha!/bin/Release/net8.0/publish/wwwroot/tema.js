const btnTema = document.getElementById("btn-tema");
const cssTema = document.getElementById("css-tema");

let temaClaro = localStorage.getItem("tema") === "claro";

if (btnTema && cssTema) {

    // Aplica o tema salvo ao abrir a página
    cssTema.disabled = !temaClaro;

    btnTema.innerHTML = temaClaro
        ? '<i data-lucide="moon"></i>'
        : '<i data-lucide="sun"></i>';

    lucide.createIcons();

    btnTema.addEventListener("click", () => {

        temaClaro = !temaClaro;

        cssTema.disabled = !temaClaro;

        // Salva a preferência
        localStorage.setItem("tema", temaClaro ? "claro" : "escuro");

        btnTema.innerHTML = temaClaro
            ? '<i data-lucide="moon"></i>'
            : '<i data-lucide="sun"></i>';

        lucide.createIcons();

    });

}