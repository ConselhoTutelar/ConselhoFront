// src/api/notificacao.js
import { apiRequest } from "./api";

export async function enviarNotificacao(dados) {
  return await apiRequest('/notificacoes', {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function buscarNotificacoes() {
  return await apiRequest('/notificacoes');
}
