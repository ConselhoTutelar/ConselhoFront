// src/api/api.js
function normalizeApiBaseUrl(rawUrl) {
  const trimmed = String(rawUrl || "http://localhost:3000").trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")) {
    return `http://${trimmed}`;
  }
  return `https://${trimmed}`;
}

export const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

/**
 * Recupera o token JWT armazenado no cliente
 */
export function getAuthToken() {
  return localStorage.getItem('conselho:token');
}

/**
 * Cliente HTTP seguro para comunicação com o Back-End (Zero-Trust)
 * Injeta o cabeçalho Authorization Bearer automaticamente
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Anexa o token de autenticação caso o usuário esteja autenticado
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Se houver corpo em JSON e Content-Type não tiver sido especificado
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Se o backend retornar 401 (token expirado ou não autorizado)
    if (response.status === 401) {
      console.warn('[ZERO-TRUST] Sessão inválida ou expirada. Limpando credenciais locais.');
      localStorage.removeItem('conselho:token');
      localStorage.removeItem('conselho:user');
      
      // Se não for a própria rota de login, podemos avisar o usuário
      if (!endpoint.includes('/auth/login')) {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text };
      }
    }

    if (!response.ok) {
      const errorMsg = responseData?.message || responseData?.error || `Erro ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (err) {
    if (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error(`Não foi possível conectar ao servidor backend (${API_URL}). Verifique se o backend está em execução.`);
    }
    throw err;
  }
}
