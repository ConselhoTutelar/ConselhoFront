// src/api/marcadores.js
import { API_URL } from "./api";

export async function buscarMarcadores() {
  const response = await fetch(`${API_URL}/marcadores-mapa`);

  if (!response.ok) {
    throw new Error("Erro ao buscar marcadores");
  }

  return response.json();
}

export async function criarMarcador(dados) {
  const response = await fetch(`${API_URL}/marcadores-mapa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar marcador");
  }

  return response.json();
}

