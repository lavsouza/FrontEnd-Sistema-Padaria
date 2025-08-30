const urlParams = new URLSearchParams(window.location.search);
const idFornada = urlParams.get("id");

const containerFornada = document.getElementById("fornada-detalhes");
const containerListaPao = document.getElementById("paos-disponiveis");

const inputQuantidade = document.getElementById("quantidade");
const btnAdicionar = document.getElementById("btn-adicionar");

async function carregarFornada() {
    try {
        const response = await fetch(`http://localhost:8080/fornada/detalhar-fornada/${idFornada}`);
        if (!response.ok) throw new Error("Erro ao carregar fornada");
        const fornada = await response.json();

        renderizarPaesFornada(fornada.paes || []);
        carregarPaesDisponiveis(fornada.paes || []);
    } catch (err) {
        console.error(err);
    }
}

function renderizarPaesFornada(paesFornada) {
    containerFornada.innerHTML = "";

    paesFornada.forEach(pf => {
        const card = document.createElement("div");
        card.classList.add("card");

        const img = document.createElement("img");
        img.src = `/imagens/${pf.tipo.toLowerCase()}.jpg`;
        img.alt = pf.tipo;
        img.classList.add("card-img");

        const divInterna = document.createElement("div");
        divInterna.classList.add("card-content");

        // Cria h2
        const titulo = document.createElement("h2");
        titulo.textContent = pf.tipo;

        // Cria botões
        const btnExcluir = document.createElement("button");
        btnExcluir.classList.add("btn-excluir");
        btnExcluir.dataset.id = pf.id;
        btnExcluir.innerHTML = `<span class="material-icons icon">delete</span>`;

        const btnEdt = document.createElement("button");
        btnEdt.classList.add("btn-edt");
        btnEdt.dataset.id = pf.id;
        btnEdt.innerHTML = `<span class="material-icons icon">edit</span>`;

        divInterna.appendChild(titulo);

        // Verifica se o pão ainda não está pronto
        const agora = new Date();
        const [h, m, s] = pf.horaSaida.split(":").map(Number);
        const horaFim = new Date();
        horaFim.setHours(h, m, s, 0);

        if (horaFim > agora) {
            // só adiciona os botões se ainda não estiver pronto
            divInterna.appendChild(btnExcluir);
            divInterna.appendChild(btnEdt);

            // evento excluir
            btnExcluir.onclick = async (e) => {
                e.stopPropagation();
                if (!confirm("Deseja remover este pão da fornada?")) return;

                try {
                    await fetch(`http://localhost:8080/pao/excluir-pao-fornada/${pf.id}/${idFornada}`, {
                        method: "DELETE"
                    });
                    alert("Pão removido!");
                    carregarFornada();
                } catch (err) {
                    console.error(err);
                    alert("Erro ao remover pão!");
                }
            };

            // evento editar quantidade
            btnEdt.onclick = async (e) => {
                e.stopPropagation();
                const novaQtd = prompt("Informe a nova quantidade:", pf.quantidade);
                if (!novaQtd || isNaN(novaQtd) || novaQtd < 1) return;

                try {
                    await fetch("http://localhost:8080/fornada/alterar-quantidade", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            idPao: pf.id,
                            idFornada,
                            quantidade: parseInt(novaQtd)
                        })
                    });
                    alert("Quantidade atualizada!");
                    carregarFornada();
                } catch (err) {
                    console.error(err);
                    alert("Erro ao atualizar quantidade!");
                }
            };
        }

        const tempoEl = document.createElement("p");
        tempoEl.classList.add("tempo-restante");

        const qts = document.createElement("p");
        qts.textContent = `${pf.quantidade}`;
        qts.classList.add("quantidade-pao");

        card.appendChild(img);
        card.appendChild(divInterna);
        card.appendChild(tempoEl);
        card.appendChild(qts);
        containerFornada.appendChild(card);

        atualizarTempo(tempoEl, pf.horaSaida);
        setInterval(() => atualizarTempo(tempoEl, pf.horaSaida), 1000);
    });
}

async function carregarPaesDisponiveis(paesFornada) {
    const response = await fetch("http://localhost:8080/pao/listar");
    const paesSistema = await response.json();

    // Remove os pães que já estão na fornada
    const idsNaFornada = paesFornada.map(pf => pf.id);
    const paesDisponiveis = paesSistema.filter(p => !idsNaFornada.includes(p.id));

    // Seleciona o container onde os cards serão adicionados
    const containerListaPao = document.getElementById("pao-lista");
    containerListaPao.innerHTML = "";

    paesDisponiveis.forEach(pao => {
        // cria card
        const card = document.createElement("div");
        card.classList.add("card-linear");

        // título do pão
        const tipoPao = document.createElement("span");
        tipoPao.textContent = pao.tipo;

        // div com input e botão
        const divAcao = document.createElement("div");
        divAcao.style.display = "flex";
        divAcao.style.gap = "8px";
        divAcao.style.alignItems = "center";

        const inputQtd = document.createElement("input");
        inputQtd.type = "number";
        inputQtd.min = "1";
        inputQtd.value = "1";

        const btnAdicionar = document.createElement("button");
        btnAdicionar.textContent = "Adicionar";
        btnAdicionar.classList.add("btn", "btn-add");

        btnAdicionar.onclick = async () => {
            const quantidade = parseInt(inputQtd.value);
            if (!quantidade || quantidade < 1) {
                alert("Informe uma quantidade válida!");
                return;
            }

            await fetch("http://localhost:8080/fornada/adicionar-pao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idPao: pao.id,
                    idFornada,
                    quantidade
                })
            });

            alert("Pão adicionado!");
            carregarFornada();
        };

        divAcao.appendChild(inputQtd);
        divAcao.appendChild(btnAdicionar);

        card.appendChild(tipoPao);
        card.appendChild(divAcao);

        containerListaPao.appendChild(card);
    });
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

// inicia
carregarFornada();
