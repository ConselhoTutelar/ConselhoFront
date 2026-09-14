import React, { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";

import './Login.css'


function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  const handleLogin = (e) => {
    e.preventDefault()
    setErro("")

    const resultado = login(usuario.trim(), senha.trim());

    if (resultado.sucesso) {
      navigate('/home');
    } else {
      setErro(resultado.mensagem || 'Não foi possível autenticar.');
    }
  }

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <>
      <div className="container min-vw-100 d-flex justify-content-center">
      <div className="card shadow-lg w-50" style={{ width: "100%" }}>
        <div className="card-header text-center bg-white border-0 pb-2">
          <div className="d-flex justify-content-center mb-3">
            <img
              src="./src/assets/logo.png"
              alt="Logo Conselho Tutelar"
              style={{ width: "120px", height: "auto" }}
            />
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="usuario" className="form-label text-muted small">
                Usuário
              </label>
              <input
                type="text"
                className="form-control"
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                style={{
                  borderColor: "#dee2e6",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3159A3"
                  e.target.style.boxShadow = "0 0 0 0.2rem rgba(74, 144, 226, 0.25)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#dee2e6"
                  e.target.style.boxShadow = "none"
                }}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="form-label text-muted small">
                Senha
              </label>
              <input
                type="password"
                className="form-control"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{
                  borderColor: "#dee2e6",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3159A3"
                  e.target.style.boxShadow = "0 0 0 0.2rem rgba(74, 144, 226, 0.25)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#dee2e6"
                  e.target.style.boxShadow = "none"
                }}
                required
              />
            </div>

            {erro && (
              <div className="alert alert-danger small" role="alert">
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="btn w-100 text-white fw-medium"
              style={{
                backgroundColor: "#3159A3",
                borderColor: "#3159A3",
                padding: "10px 16px",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#3159A3"
                e.currentTarget.style.borderColor = "#3159A3"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3159A3"
                e.currentTarget.style.borderColor = "#3159A3"
              }}
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  )
}

export default Login
