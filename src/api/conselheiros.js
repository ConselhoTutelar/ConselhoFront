// src/api/conselheiros.js
import { API_URL } from "./api";

export async function buscarConselheiros() {
  try {
    const response = await fetch(`${API_URL}/conselheiros`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Verificar o content-type antes de ler a resposta
    const contentType = response.headers.get("content-type") || "";
    
    // Verificar se a resposta é JSON
    if (!contentType.includes("application/json")) {
      // Se não for JSON, tentar ler como texto para debug
      const text = await response.text();
      console.error("Resposta não é JSON. Status:", response.status);
      console.error("Primeiros 200 caracteres:", text.substring(0, 200));
      
      if (response.status === 404) {
        throw new Error("Endpoint não encontrado. Verifique se a rota /conselheiros existe no backend.");
      }
      throw new Error(`Servidor retornou HTML em vez de JSON (Status: ${response.status}). Verifique se o backend está rodando na porta 3000.`);
    }

    // Se não for ok, tentar obter a mensagem de erro em JSON
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || `Erro ${response.status}: ${response.statusText}`);
    }

    // Ler a resposta JSON
    return await response.json();
  } catch (error) {
    // Se já é um Error, relançá-lo
    if (error instanceof Error) {
      // Verificar se é erro de rede
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.");
      }
      throw error;
    }
    throw new Error(error.message || "Erro ao buscar conselheiros");
  }
}

export async function buscarConselheiroPorId(id) {
  try {
    const response = await fetch(`${API_URL}/conselheiros/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Conselheiro não encontrado");
      }
      const error = await response.json().catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
      throw new Error(error.error || `Erro ao buscar conselheiro: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || "Erro ao buscar conselheiro");
  }
}

export async function atualizarConselheiro(id, dados) {
  try {
    const response = await fetch(`${API_URL}/conselheiros/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const contentType = response.headers.get("content-type") || "";
    
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Resposta não é JSON. Status:", response.status);
      console.error("Primeiros 200 caracteres:", text.substring(0, 200));
      throw new Error(`Servidor retornou HTML em vez de JSON (Status: ${response.status}). Verifique se o backend está rodando na porta 3000.`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || `Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.");
      }
      throw error;
    }
    throw new Error(error.message || "Erro ao atualizar conselheiro");
  }
}

export async function deletarConselheiro(id) {
  try {
    const response = await fetch(`${API_URL}/conselheiros/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Resposta não é JSON. Status:", response.status);
      console.error("Primeiros 200 caracteres:", text.substring(0, 200));
      throw new Error(`Servidor retornou HTML em vez de JSON (Status: ${response.status}). Verifique se o backend está rodando na porta 3000.`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || `Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.");
      }
      throw error;
    }
    throw new Error(error.message || "Erro ao deletar conselheiro");
  }
}

export async function criarConselheiro(dados) {
  try {
    const response = await fetch(`${API_URL}/conselheiros`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    // Verificar o content-type antes de ler a resposta
    const contentType = response.headers.get("content-type") || "";
    
    // Verificar se a resposta é JSON
    if (!contentType.includes("application/json")) {
      // Se não for JSON, tentar ler como texto para debug
      const text = await response.text();
      console.error("Resposta não é JSON. Status:", response.status);
      console.error("Primeiros 200 caracteres:", text.substring(0, 200));
      
      if (response.status === 404) {
        throw new Error("Endpoint não encontrado. Verifique se a rota POST /conselheiros existe no backend.");
      }
      if (response.status === 500) {
        throw new Error("Erro interno do servidor. Verifique os logs do backend.");
      }
      throw new Error(`Servidor retornou HTML em vez de JSON (Status: ${response.status}). Verifique se o backend está rodando na porta 3000.`);
    }

    // Se não for ok, tentar obter a mensagem de erro em JSON
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || `Erro ${response.status}: ${response.statusText}`);
    }

    // Ler a resposta JSON
    return await response.json();
  } catch (error) {
    // Se já é um Error, relançá-lo
    if (error instanceof Error) {
      // Verificar se é erro de rede
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.");
      }
      throw error;
    }
    throw new Error(error.message || "Erro ao criar conselheiro");
  }
}

