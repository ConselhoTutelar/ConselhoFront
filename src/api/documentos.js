// src/api/documentos.js
import { API_URL } from "./api";

export async function buscarTodosDocumentos() {
  const response = await fetch(`${API_URL}/documentos`);
  if (!response.ok) {
    throw new Error("Erro ao buscar documentos");
  }
  return response.json();
}

