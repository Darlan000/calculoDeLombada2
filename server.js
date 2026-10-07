// importa o express
import express from "express";
// importa o meus dados json
import dados from "./src/papeisgramaturas.json" with { type: "json" };
// inicia o express
const app = express();
// porta do servidor
const port = process.env.PORT || 3000;

// middlewares interceptam as requisições e respostas do servidor
app.use(express.json());

app.use(express.static("public"));

// rota para retornar os nomes dos papéis do arquivo json
app.get("/dados", (req, res) => {
    res.json(dados.map((papel) => papel.papel));
});

// rota para retornar as gramaturas de um papel específico
app.get("/dados/:papel", (req, res) => {
    const papel = req.params.papel;
    const papelEncontrado = dados.find((p) => p.papel === papel);
    if (!papelEncontrado) {
        return res.status(404).json({ error: "Papel não encontrado" });
    }

    res.json(papelEncontrado.gramaturas.map((gramaturas) => gramaturas.gramatura));
});

app.post("/calcular", (req, res) => {
    // 1. Recebemos os dados do utilizador
    const papelEscolhido = req.body.papel;
    const gramaturaEscolhida = req.body.gramatura;
    const paginas = req.body.paginas;

    // Recebemos também os tipos de acabamento (virão como true ou false do front-end)
    const Cartonado = req.body.Cartonado;
    const Costurado = req.body.Costurado;

    // 2. Validamos o papel
    const papelEncontrado = dados.find((p) => p.papel === papelEscolhido);
    if (!papelEncontrado) {
        return res.status(404).json({ error: "Papel não encontrado" });
    }

    // 3. Validamos a gramatura
    const gramaturaEncontrada = papelEncontrado.gramaturas.find((g) => g.gramatura === gramaturaEscolhida);
    if (!gramaturaEncontrada) {
        return res.status(404).json({ error: "Gramatura não encontrada" });
    }

    // 4. O CÁLCULO BASE (Divisão das páginas pelo fator do JSON)
    const fator = gramaturaEncontrada.fator;
    let lombadaCalculada = paginas / fator;

    // 5. ACRÉSCIMOS DE ACABAMENTO
    // Se for cartonado, soma 4mm. Se for costurado, soma 1mm. Se for fresado, soma 0mm.
    if (Cartonado) {
        lombadaCalculada += 4;
    } else if (Costurado) {
        lombadaCalculada += 1;
    }

    // 6. Arredondamos o valor final para ter apenas 1 casa decimal (ex: 15.5)
    const resultadoFinal = lombadaCalculada.toFixed(1);

    // Devolvemos o resultado pronto ao ecrã do utilizador
    res.json({ resultado: resultadoFinal });
});

// liga o servidor na porta definida
app.listen(port, () => {
    console.log(`Server em http://localhost:${port}`);
});
