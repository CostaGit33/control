import { apiRequest, showFeedback } from "../globais.js";

/* ======================================================
   CONFIGURAÇÃO
====================================================== */

const JOGADORES_ENDPOINT = "/jogadores";
const form = document.getElementById("playerForm");

/* ======================================================
   SUBMIT DO FORMULÁRIO
====================================================== */

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = buildPayload();

    if (!validatePayload(payload)) return;

    try {
      await apiRequest(JOGADORES_ENDPOINT, {
        method: "POST",
        body: payload
      });
      
      showFeedback("Jogador cadastrado com sucesso!", "success");
      form.reset();
    } catch (error) {
      console.error("Erro ao cadastrar jogador:", error);
      showFeedback(error.message || "Erro ao cadastrar jogador.", "error");
    }
  });
}

/* ======================================================
   CONSTRUÇÃO DO PAYLOAD
====================================================== */

function buildPayload() {
  return {
    nome: form.nome.value.trim(),
    foto: form.foto.value.trim() || null,
    gols: Number(form.gols.value) || 0,
    vitorias: Number(form.vitorias.value) || 0,
    empate: Number(form.empate.value) || 0,
    defesa: Number(form.defesa.value) || 0,
    infracoes: Number(form.infracoes.value) || 0
  };
}

/* ======================================================
   VALIDAÇÕES
====================================================== */

function validatePayload(data) {
  if (!data.nome) {
    showFeedback("Nome do jogador é obrigatório.", "error");
    return false;
  }

  const numericFields = ["gols", "vitorias", "empate", "defesa", "infracoes"];
  for (const field of numericFields) {
    if (data[field] < 0) {
      showFeedback(`O campo "${field}" não pode ser negativo.`, "error");
      return false;
    }
  }

  return true;
}

console.info("%cFutPontos | Cadastro ativo", "color:#D62828;font-weight:bold;font-size:13px");
