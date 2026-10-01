// src/api/documentos.js
import { apiRequest } from "./api";

export async function buscarTodosDocumentos() {
  return await apiRequest('/documentos');
}
