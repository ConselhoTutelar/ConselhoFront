// src/api/denuncia.js
import { API_URL } from "./api";

export async function enviarDenuncia(dados) {
  const response = await fetch(`${API_URL}/denuncias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar denúncia");
  }

  return response.json();
}

export async function buscarDenuncias() {
  const response = await fetch(`${API_URL}/denuncias`);
  if (!response.ok) {
    throw new Error("Erro ao buscar denúncias");
  }
  return response.json();
}

