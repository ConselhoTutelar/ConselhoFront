// src/api/marcadores.js
import { apiRequest } from "./api";

export async function buscarMarcadores() {
  return await apiRequest('/marcadores-mapa');
}

export async function criarMarcador(dados) {
  return await apiRequest('/marcadores-mapa', {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function geocodificarEnderecoAPI(endereco) {
  return await apiRequest('/marcadores-mapa/geocodificar', {
    method: "POST",
    body: JSON.stringify({ endereco }),
  });
}
