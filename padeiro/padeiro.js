const container = document.getElementById("fornadas");
const btnNova = document.getElementById("btn-nova-fornada");

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

      const img = document.createElement("img");
      img.src = "/imagens/paes.png";
      img.alt = "Fornada";
      img.classList.add("card-img");

      card.innerHTML = `
        ${img.outerHTML}
        <div class="card-content"> 
          <h2>Fornada #${fornada.idFornada}</h2>
          <button class="btn-excluir" data-id="${fornada.idFornada}">
              <span class="material-icons icon">delete</span>
          </button>
        </div>
        <p>Data: ${fornada.dataHora}</p>
      `;

      // clique no card -> redireciona
      card.onclick = () => {
        window.location.href = `detalhes/cadastrarAlterarFornada.html?id=${fornada.idFornada}`;
      };

      // pega o botão dentro do card
      const btnExcluir = card.querySelector(".btn-excluir");
      btnExcluir.addEventListener("click", (event) => {
        event.stopPropagation(); // 🔥 impede que o clique suba pro card
        excluirFornada(fornada.idFornada);
      });

      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}

function excluirFornada(idFornada) {
  if (!confirm("Tem certeza que deseja excluir esta fornada?")) return;

  fetch(`http://localhost:8080/fornada/excluir/${idFornada}`, {
    method: "DELETE"
  })
    .then(response => {
      if (response.ok) {
        alert("Fornada excluída com sucesso!");
        carregarFornadas();
      } else {
        alert("Erro ao excluir a fornada.");
      }
    })
    .catch(err => console.error("Erro ao excluir fornada:", err));
}

// criar nova fornada
btnNova.onclick = async () => {
  try {
    const response = await fetch("http://localhost:8080/fornada/criar", {
      method: "POST"
    });
    if (!response.ok) throw new Error("Erro ao criar nova fornada");

    const novaFornada = await response.json(); 
    window.location.href = `cadastrarAlterarFornada.html?id=${novaFornada.idFornada}`;
  } catch (error) {
    alert(error.message);
  }
};

// inicializa
carregarFornadas();
