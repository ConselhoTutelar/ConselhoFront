// src/api/atendimento.js
import { apiRequest } from "./api";

export async function enviarAtendimento(dados) {
  return await apiRequest('/atendimentos', {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function buscarAtendimentos() {
  return await apiRequest('/atendimentos');
}
