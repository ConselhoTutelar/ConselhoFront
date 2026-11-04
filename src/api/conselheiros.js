// src/api/conselheiros.js
import { apiRequest } from "./api";

export async function buscarConselheiros() {
  return await apiRequest('/conselheiros');
}

export async function buscarConselheiroPorId(id) {
  return await apiRequest(`/conselheiros/${id}`);
}

export async function criarConselheiro(dados) {
  return await apiRequest('/conselheiros', {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarConselheiro(id, dados) {
  return await apiRequest(`/conselheiros/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function resetarSenhaConselheiro(id) {
  return await apiRequest(`/conselheiros/${id}/resetar-senha`, {
    method: "POST"
  });
}

export async function deletarConselheiro(id) {
  return await apiRequest(`/conselheiros/${id}`, {
    method: "DELETE",
  });
}
