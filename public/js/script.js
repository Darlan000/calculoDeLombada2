// Constantes: Pegando os elementos do HTML pelo ID
const tipoPapelSelect = document.getElementById("TipoPapel");
const tipoGramaturaSelect = document.getElementById("TipoGramatura");
const quantidadePaginasInput = document.getElementById("QuantidadePáginas");
const tipoEncadernacaoCheckbox = document.getElementById("tipoEncadernacao"); // Cartonado
const tipoCapaFresadoCheckbox = document.getElementById("tipoCapaFresado"); // Fresado
const tipoCapaCosturadoCheckbox = document.getElementById("tipoCapaCosturado"); // Costurado
const formulario = document.getElementById("calculadoraLombadaForm");
const resultadoLombadaDiv = document.getElementById("resultadoLombada");

// Elementos do pop-up
const popupResultado = document.getElementById("popupResultado");
const popupMensagem = document.getElementById("popupMensagem");
const closeButton = document.querySelector(".close-button");

// --- 1. Carregar os nomes dos papéis da API (GET /dados) ---
async function carregarDadosPapeis() {
    try {
        const response = await fetch("http://localhost:3000/dados");
        if (!response.ok) throw new Error("Falha ao carregar papéis");

        const nomesDosPapeis = await response.json();

        tipoPapelSelect.innerHTML = '<option value="" disabled selected>Selecione o tipo de papel</option>';
        nomesDosPapeis.forEach((nome) => {
            const option = document.createElement("option");
            option.value = nome;
            option.textContent = nome;
            tipoPapelSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro na ligação:", error);
        popupMensagem.textContent = "Erro ao ligar ao servidor. Verifica se o Node está a correr.";
        popupMensagem.className = "error";
        popupResultado.style.display = "flex";
    }
}

// --- 2. Buscar as gramaturas de um papel específico (GET /dados/:papel) ---
async function carregarGramaturas(papelSelecionado) {
    tipoGramaturaSelect.innerHTML = '<option value="" disabled selected>A carregar...</option>';
    tipoGramaturaSelect.disabled = true;

    if (!papelSelecionado) return;

    try {
        const response = await fetch(`http://localhost:3000/dados/${papelSelecionado}`);
        if (!response.ok) throw new Error("Falha ao carregar gramaturas");

        const gramaturas = await response.json();

        tipoGramaturaSelect.innerHTML = '<option value="" disabled selected>Selecione o tipo de Gramatura</option>';

        if (gramaturas.length > 0) {
            tipoGramaturaSelect.disabled = false;
            gramaturas.forEach((gramatura) => {
                const option = document.createElement("option");
                option.value = gramatura;
                option.textContent = `${gramatura}`;
                tipoGramaturaSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erro ao buscar gramaturas:", error);
    }
}

// --- 3. Enviar dados para o servidor calcular (POST /calcular) ---
async function calcularLombada(event) {
    event.preventDefault();

    const papelSelecionado = tipoPapelSelect.value;
    const gramaturaSelecionadaValor = tipoGramaturaSelect.value;
    const quantidadePaginas = parseInt(quantidadePaginasInput.value);

    const isCartonado = tipoEncadernacaoCheckbox.checked;
    const isCapaFresado = tipoCapaFresadoCheckbox.checked;
    const isCapaCosturado = tipoCapaCosturadoCheckbox.checked;

    // Validações básicas no front-end
    if (!isCartonado && !isCapaFresado && !isCapaCosturado) {
        popupMensagem.textContent = "Por favor, selecione pelo menos um tipo de encadernação.";
        popupMensagem.className = "error";
        popupResultado.style.display = "flex";
        return;
    }

    if (!papelSelecionado || !gramaturaSelecionadaValor || isNaN(quantidadePaginas) || quantidadePaginas <= 0) {
        popupMensagem.textContent = "Por favor, preencha todos os campos corretamente.";
        popupMensagem.className = "error";
        popupResultado.style.display = "flex";
        return;
    }

    try {
        // Envia o pacote de dados para o teu back-end
        const response = await fetch("http://localhost:3000/calcular", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                papel: papelSelecionado,
                gramatura: gramaturaSelecionadaValor,
                paginas: quantidadePaginas,
                isCartonado: isCartonado,
                isCosturado: isCapaCosturado,
            }),
        });

        if (!response.ok) throw new Error("Erro no cálculo do servidor");

        const dadosResposta = await response.json();

        // Formata o texto final para exibir ao utilizador
        let tipoEncadernacaoTexto = "";
        if (isCartonado) {
            tipoEncadernacaoTexto = "Cartonado";
            if (isCapaFresado) tipoEncadernacaoTexto += " e Fresado";
            if (isCapaCosturado) tipoEncadernacaoTexto += " e Costurado";
        } else if (isCapaCosturado) {
            tipoEncadernacaoTexto = "Costurado";
        } else {
            tipoEncadernacaoTexto = "Fresado";
        }

        // Mostra o resultado que veio do servidor
        popupMensagem.textContent = `A lombada (${tipoEncadernacaoTexto}) é: ${dadosResposta.resultado} mm`;
        popupMensagem.className = "success";
        popupResultado.style.display = "flex";
    } catch (error) {
        console.error("Erro no cálculo:", error);
        popupMensagem.textContent = "Ocorreu um erro ao comunicar com o servidor de cálculo.";
        popupMensagem.className = "error";
        popupResultado.style.display = "flex";
    }
}

// --- 4. Event Listeners ---

// Arranca a listagem de papéis ao abrir a página
document.addEventListener("DOMContentLoaded", carregarDadosPapeis);

// Quando o papel muda, vai buscar as gramaturas
tipoPapelSelect.addEventListener("change", () => {
    carregarGramaturas(tipoPapelSelect.value);
    popupResultado.style.display = "none";
});

// Botão de calcular
formulario.addEventListener("submit", calcularLombada);

// Lógicas de interface (fechar popup, desmarcar checkboxes mutuamente exclusivos)
closeButton.addEventListener("click", () => (popupResultado.style.display = "none"));
window.addEventListener("click", (event) => {
    if (event.target === popupResultado) popupResultado.style.display = "none";
});
tipoGramaturaSelect.addEventListener("change", () => (popupResultado.style.display = "none"));
quantidadePaginasInput.addEventListener("input", () => (popupResultado.style.display = "none"));
tipoEncadernacaoCheckbox.addEventListener("change", () => (popupResultado.style.display = "none"));

tipoCapaCosturadoCheckbox.addEventListener("change", () => {
    if (tipoCapaCosturadoCheckbox.checked && tipoCapaFresadoCheckbox.checked) {
        tipoCapaFresadoCheckbox.checked = false;
    }
    popupResultado.style.display = "none";
});

tipoCapaFresadoCheckbox.addEventListener("change", () => {
    if (tipoCapaFresadoCheckbox.checked && tipoCapaCosturadoCheckbox.checked) {
        tipoCapaCosturadoCheckbox.checked = false;
    }
    popupResultado.style.display = "none";
});
