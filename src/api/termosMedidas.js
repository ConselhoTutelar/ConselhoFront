// src/api/termosMedidas.js
import { API_URL } from "./api";

export async function enviarTermoMedidasMenor(dados) {
  const response = await fetch(`${API_URL}/termos-medidas-menor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar termo de medidas");
  }

  return response.json();
}

export async function enviarTermoMedidasResponsavel(dados) {
  const response = await fetch(`${API_URL}/termos-medidas-responsavel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar termo de medidas");
  }

  return response.json();
}

export async function buscarTermosMedidasMenor() {
  const response = await fetch(`${API_URL}/termos-medidas-menor`);
  if (!response.ok) {
    throw new Error("Erro ao buscar termos de medidas");
  }
  return response.json();
}

export async function buscarTermosMedidasResponsavel() {
  const response = await fetch(`${API_URL}/termos-medidas-responsavel`);
  if (!response.ok) {
    throw new Error("Erro ao buscar termos de medidas");
  }
  return response.json();
}

