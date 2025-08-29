let intervalId;

async function carregarFornadas() {
    const container = document.getElementById("fornadas");
    container.innerHTML = "<p>Carregando fornadas...</p>";

    try {
        const response = await fetch("http://localhost:8080/fornada/listar-fornadas-dia");
        if (!response.ok) {
            throw new Error("Erro ao carregar fornadas");
        }

        const fornadas = await response.json();
        container.innerHTML = "";

        fornadas.forEach(fornada => {
            let horaSaidaMaisTardia = fornada.paes
                .map(p => p.horaSaida)
                .reduce((max, atual) => (atual > max ? atual : max), "00:00:00");

            const card = document.createElement("div");
            card.classList.add("card");

            card.onclick = () => {
                window.location.href = `detalhes/detalheFornada.html?id=${fornada.idFornada}`;
            };

            const img = document.createElement("img");
            img.src = "/imagens/paes.png";
            img.alt = "Fornada";
            img.classList.add("card-img");

            const titulo = document.createElement("h2");
            titulo.textContent = `Fornada #${fornada.idFornada}`;

            const tempoEl = document.createElement("p");
            tempoEl.classList.add("tempo-restante");

            // monta a estrutura
            card.appendChild(img);
            card.appendChild(titulo);
            card.appendChild(tempoEl);

            container.appendChild(card);

            // Atualiza contador dinâmico
            atualizarTempo(tempoEl, horaSaidaMaisTardia);
            setInterval(() => atualizarTempo(tempoEl, horaSaidaMaisTardia), 1000);
        });
    } catch (error) {
        container.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

function atualizarTempo(elemento, horaSaida) {
    const agora = new Date();
    const [h, m, s] = horaSaida.split(":").map(Number);

    const fim = new Date();
    fim.setHours(h, m, s, 0);

    const diffMs = fim - agora;

    if (diffMs <= 0) {
        elemento.textContent = "✅ Pronta!";
        elemento.style.color = "green";
        return;
    }

    const segundos = Math.floor(diffMs / 1000) % 60;
    const minutos = Math.floor(diffMs / 1000 / 60) % 60;
    const horas = Math.floor(diffMs / 1000 / 60 / 60);

    elemento.textContent = ` ${horas}h ${minutos}m ${segundos}s`;
}

// Carrega assim que abrir a tela
carregarFornadas();
