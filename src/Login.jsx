import React, { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";
import logoImg from "./assets/logo.png";

import './Login.css'

function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!usuario.trim() || !senha.trim()) {
      setErro("Por favor, preencha o usuário e a senha.");
      return;
    }

    setErro("");
    setIsSubmitting(true);

    try {
      const resultado = await login(usuario.trim(), senha.trim());

      if (resultado.sucesso) {
        navigate('/home');
      } else {
        setErro(resultado.mensagem || 'Não foi possível autenticar.');
      }
    } catch (err) {
      setErro(err.message || 'Erro inesperado na conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <>
      <div className="min-vh-100 w-100 d-flex justify-content-center align-items-center px-3" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3159A3 100%)' }}>
        <div className="card shadow-lg" style={{ maxWidth: "440px", width: "100%", borderRadius: "12px", border: "none" }}>
          <div className="card-header text-center bg-white border-0 pt-4 pb-2">
            <div className="d-flex justify-content-center mb-2">
              <img
                src={logoImg}
                alt="Logo Conselho Tutelar"
                style={{ width: "110px", height: "auto" }}
              />
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#3159A3" }}>Conselho Tutelar de Panambi</h5>
            <p className="text-muted small">Acesso Seguro ao Sistema de Gestão</p>
          </div>

          <div className="card-body px-4 pb-4">
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="usuario" className="form-label text-muted small fw-semibold">
                  Usuário ou Matrícula
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ex: admin ou conselheiro"
                  disabled={isSubmitting}
                  style={{
                    borderColor: "#dee2e6",
                    fontSize: "14px",
                    padding: "10px 12px"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3159A3"
                    e.target.style.boxShadow = "0 0 0 0.2rem rgba(49, 89, 163, 0.2)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dee2e6"
                    e.target.style.boxShadow = "none"
                  }}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="senha" className="form-label text-muted small fw-semibold">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={isSubmitting}
                  style={{
                    borderColor: "#dee2e6",
                    fontSize: "14px",
                    padding: "10px 12px"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3159A3"
                    e.target.style.boxShadow = "0 0 0 0.2rem rgba(49, 89, 163, 0.2)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dee2e6"
                    e.target.style.boxShadow = "none"
                  }}
                  required
                />
              </div>

              {erro && (
                <div className="alert alert-danger small py-2 px-3 mb-3 d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <span>{erro}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn w-100 text-white fw-medium d-flex justify-content-center align-items-center gap-2"
                style={{
                  backgroundColor: "#3159A3",
                  borderColor: "#3159A3",
                  padding: "11px 16px",
                  fontSize: "15px",
                  borderRadius: "6px"
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = "#244580"
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = "#3159A3"
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </button>

              <div className="mt-3 text-center">
                <small className="text-muted" style={{ fontSize: "12px" }}>
                  Ambiente Protegido - Modelo Zero-Trust & LGPD/ECA
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
