import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('conselho:token') || null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('conselho:user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Validação contínua do token ao iniciar a aplicação (Zero-Trust verification)
  useEffect(() => {
    const verificarSessao = async () => {
      const storedToken = localStorage.getItem('conselho:token');
      if (storedToken) {
        try {
          const data = await apiRequest('/auth/me');
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('conselho:user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('[ZERO-TRUST] Sessão expirada ou inválida ao verificar /auth/me:', err.message);
          localStorage.removeItem('conselho:token');
          localStorage.removeItem('conselho:user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verificarSessao();

    // Ouvinte para evento de token expirado vindo do apiRequest
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      if (response && response.token && response.user) {
        localStorage.setItem('conselho:token', response.token);
        localStorage.setItem('conselho:user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return {
          sucesso: true,
          precisaTrocarSenha: Boolean(response.user.precisaTrocarSenha)
        };
      }

      return {
        sucesso: false,
        mensagem: response?.message || 'Falha ao autenticar no servidor.'
      };
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao conectar ao serviço de autenticação.'
      };
    }
  };

  const alterarSenha = async (senhaAtual, novaSenha) => {
    try {
      const response = await apiRequest('/auth/alterar-senha', {
        method: 'POST',
        body: JSON.stringify({
          senhaAtual: senhaAtual.trim(),
          novaSenha: novaSenha.trim()
        })
      });

      if (response && response.token && response.user) {
        localStorage.setItem('conselho:token', response.token);
        localStorage.setItem('conselho:user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return { sucesso: true };
      }

      return {
        sucesso: false,
        mensagem: response?.message || 'Não foi possível alterar a senha.'
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao alterar a senha.'
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('conselho:token');
      localStorage.removeItem('conselho:user');
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      alterarSenha,
      logout,
      isAuthenticated: !!user && !!token
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
