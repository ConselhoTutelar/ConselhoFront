// src/api/termosMedidas.js
import { apiRequest } from "./api";

export async function enviarTermoMedidasMenor(dados) {
  return await apiRequest('/termos-medidas-menor', {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function enviarTermoMedidasResponsavel(dados) {
  return await apiRequest('/termos-medidas-responsavel', {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function buscarTermosMedidasMenor() {
  return await apiRequest('/termos-medidas-menor');
}

export async function buscarTermosMedidasResponsavel() {
  return await apiRequest('/termos-medidas-responsavel');
}
