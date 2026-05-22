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

document.addEventListener("DOMContentLoaded", () => {
  loadPlayers();
});

/* ======================================================
   LISTAR REGISTROS
====================================================== */

async function loadPlayers() {

  try {

    list.innerHTML = `
      <li class="loading">
        Carregando registros...
      </li>
    `;

    const [jogadores, goleiros] = await Promise.all([
      apiRequest(ENDPOINTS.jogadores),
      apiRequest(ENDPOINTS.goleiros)
    ]);

    list.innerHTML = "";

    /* =========================
       JOGADORES
    ========================= */

    jogadores.forEach(j => {

      const li = document.createElement("li");

      li.className = "player-item";

      li.innerHTML = `
        <div class="player-info">

          <strong>
            ${escapeHtml(j.nome)}
          </strong>

          <span>
            ${Number(j.pontos) || 0} pts
          </span>

          <small>
            ⚽ Jogador
          </small>

        </div>

        <div class="actions">

          <button
            class="edit-btn"
            onclick="editPlayer('${j.id}', 'jogadores')"
            title="Editar"
          >
            ✏️
          </button>

          <button
            class="delete-btn"
            onclick="deletePlayer('${j.id}', 'jogadores')"
            title="Excluir"
          >
            🗑️
          </button>

        </div>
      `;

      list.appendChild(li);

    });

    /* =========================
       GOLEIROS
    ========================= */

    goleiros.forEach(g => {

      const li = document.createElement("li");

      li.className = "player-item";

      li.innerHTML = `
        <div class="player-info">

          <strong>
            ${escapeHtml(g.nome)}
          </strong>

          <span>
            ${Number(g.pontos) || 0} pts
          </span>

          <small>
            🧤 Goleiro
          </small>

        </div>

        <div class="actions">

          <button
            class="edit-btn"
            onclick="editPlayer('${g.id}', 'goleiros')"
            title="Editar"
          >
            ✏️
          </button>

          <button
            class="delete-btn"
            onclick="deletePlayer('${g.id}', 'goleiros')"
            title="Excluir"
          >
            🗑️
          </button>

        </div>
      `;

      list.appendChild(li);

    });

    if (
      jogadores.length === 0 &&
      goleiros.length === 0
    ) {
      list.innerHTML = `
        <li class="empty">
          Nenhum registro encontrado.
        </li>
      `;
    }

  } catch (err) {

    console.error("Erro ao carregar registros:", err);

    list.innerHTML = `
      <li class="error">
        Erro ao carregar registros.
      </li>
    `;

    showFeedback(
      "Erro ao carregar registros",
      "error"
    );

  }
}

/* ======================================================
   SUBMIT
====================================================== */

form.addEventListener("submit", async e => {

  e.preventDefault();

  const payload = buildPayload();

  if (!payload.nome) {

    showFeedback(
      "Digite um nome válido",
      "error"
    );

    nome.focus();

    return;
  }

  const tipo = tipoField.value;

  const endpoint = ENDPOINTS[tipo];

  const id = idField.value;

  try {

    submitBtn.disabled = true;

    submitBtn.textContent = id
      ? "Atualizando..."
      : "Salvando...";

    /* =========================
       EDITAR
    ========================= */

    if (id) {

      await apiRequest(`${endpoint}/${id}`, {
        method: "PUT",
        body: payload
      });

      showFeedback(
        "Registro atualizado com sucesso!",
        "success"
      );

    }

    /* =========================
       CRIAR
    ========================= */

    else {

      await apiRequest(endpoint, {
        method: "POST",
        body: payload
      });

      showFeedback(
        "Registro cadastrado com sucesso!",
        "success"
      );

    }

    resetForm();

    await loadPlayers();

  } catch (err) {

    console.error("Erro ao salvar:", err);

    showFeedback(
      "Erro ao salvar registro",
      "error"
    );

  } finally {

    submitBtn.disabled = false;

    submitBtn.textContent = id
      ? "Atualizar"
      : "Salvar";

  }
});

/* ======================================================
   EDITAR
====================================================== */

window.editPlayer = async (id, tipo) => {

  try {

    const endpoint = ENDPOINTS[tipo];

    const jogador = await apiRequest(
      `${endpoint}/${id}`
    );

    idField.value = jogador.id;

    tipoField.value = tipo;

    nome.value = jogador.nome || "";
    foto.value = jogador.foto || "";

    gols.value = jogador.gols || 0;
    vitorias.value = jogador.vitorias || 0;
    empate.value = jogador.empate || 0;
    defesa.value = jogador.defesa || 0;
    infracoes.value = jogador.infracoes || 0;

    submitBtn.textContent = "Atualizar";

    cancelBtn.classList.remove("hidden");

    formTitle.textContent = tipo === "goleiros"
      ? "🧤 Editar Goleiro"
      : "⚽ Editar Jogador";

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (err) {

    console.error("Erro ao editar:", err);

    showFeedback(
      "Erro ao carregar registro",
      "error"
    );

  }
};

/* ======================================================
   EXCLUIR
====================================================== */

window.deletePlayer = async (id, tipo) => {

  const confirmDelete = confirm(
    "Deseja realmente excluir este registro?"
  );

  if (!confirmDelete) {
    return;
  }

  try {

    await apiRequest(
      `${ENDPOINTS[tipo]}/${id}`,
      {
        method: "DELETE"
      }
    );

    showFeedback(
      "Registro removido com sucesso!",
      "success"
    );

    await loadPlayers();

  } catch (err) {

    console.error("Erro ao excluir:", err);

    showFeedback(
      "Erro ao excluir registro",
      "error"
    );

  }
};

/* ======================================================
   RESET FORM
====================================================== */

cancelBtn.addEventListener(
  "click",
  resetForm
);

function resetForm() {

  form.reset();

  idField.value = "";

  tipoField.value = "jogadores";

  submitBtn.textContent = "Salvar";

  cancelBtn.classList.add("hidden");

  formTitle.textContent =
    "➕ Novo Registro";
}

/* ======================================================
   BUILD PAYLOAD
====================================================== */

function buildPayload() {

  return {

    nome: nome.value.trim(),

    foto: foto.value.trim() || null,

    gols: Number(gols.value) || 0,

    vitorias: Number(vitorias.value) || 0,

    empate: Number(empate.value) || 0,

    defesa: Number(defesa.value) || 0,

    infracoes: Number(infracoes.value) || 0

  };
}

/* ======================================================
   SEGURANÇA HTML
====================================================== */

function escapeHtml(text = "") {

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ======================================================
   LOG
====================================================== */

console.info(
  "%cFutPontos | Painel de gerenciamento carregado",
  "color:#00ff88;font-weight:bold;font-size:14px;"
);
