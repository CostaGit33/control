/* ======================================================
   CONFIGURAÇÃO DA API
====================================================== */

export const API_BASE_URL = "https://api.semdominio.online";

/**
 * Cliente padrão para comunicação com a API
 */
export async function apiRequest(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(options.headers || {})
    }
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}${normalizedEndpoint}`,
      config
    );

    let data;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(
        data.error || data.message || "Erro na comunicação com a API"
      );
    }

    return data;
  } catch (error) {
    console.error(`Erro na requisição [${normalizedEndpoint}]:`, error.message);
    throw error;
  }
}

/* ======================================================
   REGRAS DE NEGÓCIO
====================================================== */

/**
 * Regra oficial de pontuação do FutPontos
 * Campos SQL: vitorias, empate, defesa, gols, infracoes
 */
export function calculatePoints(
  vitorias = 0,
  empate = 0,
  defesa = 0,
  gols = 0,
  infracoes = 0
) {
  return (
    Number(vitorias) * 3 +
    Number(empate) +
    Number(defesa) +
    Number(gols) * 2 -
    Number(infracoes) * 2
  );
}

/* ======================================================
   UI GLOBAL
====================================================== */

export function showFeedback(message, type = "success") {
  let container = document.getElementById("feedback");

  if (!container) {
    container = document.createElement("div");
    container.id = "feedback";
    document.body.appendChild(container);
  }

  const div = document.createElement("div");
  div.className = `feedback ${type}`;
  div.textContent = message;

  container.appendChild(div);

  setTimeout(() => {
    div.style.transition = "opacity 0.3s ease";
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 300);
  }, 3000);
}

/* ======================================================
   INICIALIZAÇÃO GLOBAL
====================================================== */

function initGlobalUI() {
  // Menu Mobile
  const menuToggle = document.querySelector(".menu-toggle");
  const appNav = document.querySelector(".app-nav");

  if (menuToggle && appNav) {
    menuToggle.addEventListener("click", () => {
      appNav.classList.toggle("active");
    });
  }

  // Link ativo na navegação
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".app-nav a").forEach(link => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === currentPage);
  });

  // Footer dinâmico
  const footerContent = document.querySelector(".footer-content span");
  if (footerContent) {
    footerContent.textContent =
      `© ${new Date().getFullYear()} • Sem Domínio - Todos os direitos reservados.`;
  }
}

document.addEventListener("DOMContentLoaded", initGlobalUI);
