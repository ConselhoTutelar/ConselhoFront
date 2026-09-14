import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const usuariosPreCadastrados = [
  {
    username: 'admin',
    password: 'admin',
    role: 'admin',
    nome: 'Ana Beatriz Lima',
    cargo: 'Secretária Municipal',
    email: 'ana.lima@panambi.rs.gov.br',
    telefone: '(55) 99921-1111',
    matricula: 'CT-ADM-001',
    unidade: 'Secretaria Municipal de Assistência Social'
  },
  {
    username: 'conselheiro',
    password: 'conselheiro',
    role: 'conselheiro',
    nome: 'João Paulo Richter',
    cargo: 'Conselheiro Tutelar',
    email: 'joao.richter@panambi.rs.gov.br',
    telefone: '(55) 99988-2222',
    matricula: 'CT-CON-014',
    areaAtuacao: 'Bairros Esperança e Centro',
    plantao: 'Segunda a Sexta, 8h às 12h e 13h30 às 17h30'
  }
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('conselho:user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('conselho:user', JSON.stringify(user));
    } else {
      localStorage.removeItem('conselho:user');
    }
  }, [user]);

  const login = (username, password) => {
    const encontrado = usuariosPreCadastrados.find(
      (u) => u.username === username && u.password === password
    );

    if (!encontrado) {
      return { sucesso: false, mensagem: 'Credenciais inválidas.' };
    }

    const { password: _, ...usuarioSemSenha } = encontrado;
    setUser(usuarioSemSenha);
    return { sucesso: true };
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      usuariosPreCadastrados: usuariosPreCadastrados.map(({ password, ...rest }) => rest)
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

