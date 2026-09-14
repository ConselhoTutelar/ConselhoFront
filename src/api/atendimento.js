// src/api/atendimento.js
import { API_URL } from "./api";

export async function enviarAtendimento(dados) {
  const response = await fetch(`${API_URL}/atendimentos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar atendimento");
  }

  return response.json();
}

export async function buscarAtendimentos() {
  const response = await fetch(`${API_URL}/atendimentos`);
  if (!response.ok) {
    throw new Error("Erro ao buscar atendimentos");
  }
  return response.json();
}

