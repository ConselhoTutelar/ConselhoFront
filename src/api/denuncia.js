// src/api/denuncia.js
import { apiRequest } from "./api";

export async function enviarDenuncia(dados) {
  return await apiRequest('/denuncias', {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function buscarDenuncias() {
  return await apiRequest('/denuncias');
}
