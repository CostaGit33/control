import { apiRequest, showFeedback } from "./globais.js";

/* ======================================================
   ENDPOINTS
====================================================== */
const ENDPOINTS = {
  jogadores: "/jogadores",
  goleiros: "/goleiros"
};

/* ======================================================
   ELEMENTOS
====================================================== */
const form = document.getElementById("playerForm");
const list = document.getElementById("playerList");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelEdit");
const formTitle = document.getElementById("formTitle");
const idField = document.getElementById("playerId");
const tipoField = document.getElementById("tipo");
const nome = document.getElementById("nome");
const foto = document.getElementById("foto");
const gols = document.getElementById("gols");
const vitorias = document.getElementById("vitorias");
const empate = document.getElementById("empate");
const defesa = document.getElementById("defesa");
const infracoes = document.getElementById("infracoes");

/* ======================================================
   INIT
====================================================== */
loadPlayers();

/* ======================================================
   LISTAR JOGADORES + GOLEIROS
====================================================== */
async function loadPlayers() {
  list.innerHTML = "";

  const [jogadores, goleiros] = await Promise.all([
    apiRequest(ENDPOINTS.jogadores),
    apiRequest(ENDPOINTS.goleiros)
  ]);

  jogadores.forEach(j => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${j.nome}</strong>
      <span>${j.pontos ?? 0} pts</span>
      <small>⚽ Jogador</small>
      <div class="actions">
        <button onclick="editPlayer('${j.id}', 'jogadores')">✏️</button>
        <button onclick="deletePlayer('${j.id}', 'jogadores')">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });

  goleiros.forEach(j => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${j.nome}</strong>
      <span>${j.pontos ?? 0} pts</span>
      <small>🧤 Goleiro</small>
      <div class="actions">
        <button onclick="editPlayer('${j.id}', 'goleiros')">✏️</button>
        <button onclick="deletePlayer('${j.id}', 'goleiros')">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });
}

/* ======================================================
   SUBMIT (CRIAR / EDITAR)
====================================================== */
form.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = buildPayload();
  const endpoint = ENDPOINTS[tipoField.value];
  const id = idField.value;

  try {
    if (id) {
      await apiRequest(`${endpoint}/${id}`, {
        method: "PUT",
        body: payload
      });
      showFeedback("Registro atualizado!", "success");
    } else {
      await apiRequest(endpoint, {
        method: "POST",
        body: payload
      });
      showFeedback("Registro cadastrado!", "success");
    }

    resetForm();
    loadPlayers();
  } catch (err) {
    console.error(err);
    showFeedback("Erro ao salvar", "error");
  }
});

/* ======================================================
   EDITAR
====================================================== */
window.editPlayer = async (id, tipo) => {
  const endpoint = ENDPOINTS[tipo];
  const j = await apiRequest(`${endpoint}/${id}`);

  idField.value = j.id;
  tipoField.value = tipo;
  nome.value = j.nome;
  foto.value = j.foto || "";
  gols.value = j.gols;
  vitorias.value = j.vitorias;
  empate.value = j.empate;
  defesa.value = j.defesa;
  infracoes.value = j.infracoes;

  submitBtn.textContent = "Atualizar";
  cancelBtn.classList.remove("hidden");
  formTitle.textContent = "✏️ Editar Registro";
};

/* ======================================================
   EXCLUIR
====================================================== */
window.deletePlayer = async (id, tipo) => {
  if (!confirm("Excluir registro?")) return;

  await apiRequest(`${ENDPOINTS[tipo]}/${id}`, {
    method: "DELETE"
  });

  showFeedback("Removido com sucesso", "success");
  loadPlayers();
};

/* ======================================================
   RESET
====================================================== */
cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  idField.value = "";
  tipoField.value = "jogadores";
  submitBtn.textContent = "Salvar";
  cancelBtn.classList.add("hidden");
  formTitle.textContent = "➕ Novo Registro";
}

/* ======================================================
   PAYLOAD
====================================================== */
function buildPayload() {
  return {
    nome: nome.value.trim(),
    foto: foto.value || null,
    gols: +gols.value || 0,
    vitorias: +vitorias.value || 0,
    empate: +empate.value || 0,
    defesa: +defesa.value || 0,
    infracoes: +infracoes.value || 0
  };
}

console.info(
  "%cFutPontos | Gerenciamento com Tipo (Jogador / Goleiro)",
  "color:#D62828;font-weight:bold"
);
