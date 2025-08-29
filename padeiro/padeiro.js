const container = document.getElementById("fornadas");
const btnNova = document.getElementById("btn-nova-fornada");

// carregar todas as fornadas
async function carregarFornadas() {
  container.innerHTML = "<p>Carregando fornadas...</p>";

  try {
    const response = await fetch("http://localhost:8080/fornada/listar-fornadas");
    if (!response.ok) throw new Error("Erro ao carregar fornadas");

    const fornadas = await response.json();
    container.innerHTML = "";

    fornadas.forEach(fornada => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h2>Fornada #${fornada.idFornada}</h2>
        <p>Data: ${fornada.dataHora}</p>
        <p>Pães: ${fornada.paes.map(p => `${p.tipo} (${p.quantidade})`).join(", ")}</p>
      `;

      // clique no card abre tela de edição/cadastro da fornada
      card.onclick = () => {
        window.location.href = `editarFornada.html?id=${fornada.idFornada}`;
      };

      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}

// criar nova fornada
btnNova.onclick = async () => {
  try {
    const response = await fetch("http://localhost:8080/fornada/criar", {
      method: "POST"
    });
    if (!response.ok) throw new Error("Erro ao criar nova fornada");

    const novaFornada = await response.json(); // supõe que o endpoint retorna o objeto criado
    // redireciona para edição/cadastro dessa fornada
    window.location.href = `editarFornada.html?id=${novaFornada.idFornada}`;
  } catch (error) {
    alert(error.message);
  }
};

// inicializa
carregarFornadas();
