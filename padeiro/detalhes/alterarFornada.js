const urlParams = new URLSearchParams(window.location.search);
const idFornada = urlParams.get("id");

// elementos
const tabelaPaesFornada = document.querySelector("#tabela-paes-fornada tbody");
const selectPao = document.getElementById("select-pao");
const inputQuantidade = document.getElementById("quantidade");
const btnAdicionar = document.getElementById("btn-adicionar");

async function carregarFornada() {
    try {
        const response = await fetch(`http://localhost:8080/fornada/detalhar-fornada/${idFornada}`);
        if (!response.ok) throw new Error("Erro ao carregar fornada");
        const fornada = await response.json();

        document.getElementById("fornada-info").innerHTML = `
      <p><strong>ID:</strong> ${fornada.idFornada}</p>
      <p><strong>Data:</strong> ${fornada.dataHora}</p>
    `;

        renderizarPaesFornada(fornada.paes || []);
        carregarPaesDisponiveis(fornada.paes || []);
    } catch (err) {
        console.error(err);
    }
}

function renderizarPaesFornada(paesFornada) {
    tabelaPaesFornada.innerHTML = "";

    paesFornada.forEach(pf => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
      <td>${pf.pao.tipo}</td>
      <td>
        <input type="number" min="1" value="${pf.quantidade}" class="input-quantidade" data-id="${pf.pao.id}">
      </td>
      <td>
        <button class="btn-salvar" data-id="${pf.pao.id}">Salvar</button>
        <button class="btn-remover" data-id="${pf.pao.id}">Remover</button>
      </td>
    `;

        tabelaPaesFornada.appendChild(tr);
    });

    document.querySelectorAll(".btn-salvar").forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const idPao = btn.dataset.id;
            const quantidade = tr.querySelector(`.input-quantidade[data-id="${idPao}"]`).value;

            await fetch("http://localhost:8080/fornada/adicionar-pao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idPao, idFornada, quantidade })
            });

            alert("Quantidade atualizada!");
            carregarFornada();
        };
    });

    // eventos remover
    document.querySelectorAll(".btn-remover").forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const idPao = btn.dataset.id;

            if (!confirm("Deseja remover este pão da fornada?")) return;

            await fetch(`http://localhost:8080/fornada/remover-pao/${idFornada}/${idPao}`, {
                method: "DELETE"
            });

            alert("Pão removido!");
            carregarFornada();
        };
    });
}

async function carregarPaesDisponiveis(paesFornada) {
    const response = await fetch("http://localhost:8080/pao/listar");
    const paesSistema = await response.json();

    // tira os que já estão na fornada
    const idsNaFornada = paesFornada.map(pf => pf.pao.id);
    const paesDisponiveis = paesSistema.filter(p => !idsNaFornada.includes(p.id));

    selectPao.innerHTML = paesDisponiveis.map(p => `<option value="${p.id}">${p.tipo}</option>`).join("");
}

btnAdicionar.onclick = async () => {
    const idPao = selectPao.value;
    const quantidade = inputQuantidade.value;

    if (!idPao || !quantidade) {
        alert("Selecione um pão e informe a quantidade.");
        return;
    }

    await fetch("http://localhost:8080/fornada/adicionar-pao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPao, idFornada, quantidade })
    });

    alert("Pão adicionado!");
    carregarFornada();
};

// inicia
carregarFornada();
