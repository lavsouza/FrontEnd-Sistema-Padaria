const params = new URLSearchParams(window.location.search);
const idFornada = params.get("id");

const container = document.getElementById("fornada-detalhes");

async function carregarDetalhes() {
    container.innerHTML = "<p>Carregando detalhes da fornada...</p>";

    try {
        const response = await fetch(`http://localhost:8080/fornada/detalhar-fornada/${idFornada}`);
        if (!response.ok) throw new Error("Erro ao carregar detalhes da fornada");

        const fornada = await response.json();
        container.innerHTML = "";

        fornada.paes.forEach(pao => {
            const card = document.createElement("div");
            card.classList.add("card");

            const img = document.createElement("img");
            img.src = `/imagens/${pao.tipo.toLowerCase()}.jpg`;
            img.alt = pao.tipo;
            img.classList.add("card-img");

            const titulo = document.createElement("h2");
            titulo.textContent = `${pao.tipo} (${pao.quantidade})`;

            const tempoEl = document.createElement("p");
            tempoEl.classList.add("tempo-restante");

            card.appendChild(img);
            card.appendChild(titulo);
            card.appendChild(tempoEl);
            container.appendChild(card);

            atualizarTempo(tempoEl, pao.horaSaida);
            setInterval(() => atualizarTempo(tempoEl, pao.horaSaida), 1000);
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
        elemento.textContent = "✅ Pronto!";
        elemento.style.color = "green";
        return;
    }

    const segundos = Math.floor(diffMs / 1000) % 60;
    const minutos = Math.floor(diffMs / 1000 / 60) % 60;
    const horas = Math.floor(diffMs / 1000 / 60 / 60);

    elemento.textContent = `⏳ ${horas}h ${minutos}m ${segundos}s`;
}

carregarDetalhes();
