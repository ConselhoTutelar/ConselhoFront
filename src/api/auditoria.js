// src/api/auditoria.js
import { apiRequest } from "./api";

/**
 * Busca os logs de auditoria com suporte a filtros e paginação
 */
export async function buscarLogsAuditoria(filtros = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'todos') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const endpoint = `/auditoria${queryString ? `?${queryString}` : ''}`;

  return await apiRequest(endpoint);
}

/**
 * Valida a integridade criptográfica da cadeia de logs (SHA-256)
 */
export async function verificarIntegridadeAuditoria() {
  return await apiRequest('/auditoria/integridade');
}

/**
 * Obtém estatísticas gerais e distribuição por mandatos
 */
export async function buscarEstatisticasAuditoria() {
  return await apiRequest('/auditoria/estatisticas');
}
