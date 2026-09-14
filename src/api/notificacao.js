// src/api/notificacao.js
import { API_URL } from "./api";

export async function enviarNotificacao(dados) {
  const response = await fetch(`${API_URL}/notificacoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.details || errorData.error || "Erro ao enviar notificação";
    console.error('Erro detalhado:', errorData);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function buscarNotificacoes() {
  const response = await fetch(`${API_URL}/notificacoes`);
  if (!response.ok) {
    throw new Error("Erro ao buscar notificações");
  }
  return response.json();
}
