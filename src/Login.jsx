import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import logoImg from "./assets/logo.png";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login, alterarSenha, logout, user } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para troca obrigatória de senha no primeiro acesso
  const [senhaTemporariaAtual, setSenhaTemporariaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [sucessoTroca, setSucessoTroca] = useState("");

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
        if (resultado.precisaTrocarSenha) {
          setSenhaTemporariaAtual(senha.trim());
        } else {
          navigate("/home");
        }
      } else {
        setErro(resultado.mensagem || "Não foi possível autenticar.");
      }
    } catch (err) {
      setErro(err.message || "Erro inesperado na conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrocarSenhaPrimeiroAcesso = async (e) => {
    e.preventDefault();
    setErro("");
    setSucessoTroca("");

    if (!senhaTemporariaAtual.trim() || !novaSenha.trim() || !confirmarNovaSenha.trim()) {
      setErro("Preencha todos os campos para definir sua nova senha.");
      return;
    }

    if (novaSenha.trim().length < 6) {
      setErro("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (novaSenha.trim() !== confirmarNovaSenha.trim()) {
      setErro("A confirmação da nova senha não confere.");
      return;
    }

    if (novaSenha.trim() === senhaTemporariaAtual.trim()) {
      setErro("A nova senha deve ser diferente da senha temporária.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await alterarSenha(senhaTemporariaAtual, novaSenha);
      if (res.sucesso) {
        setSucessoTroca("Senha pessoal definida com sucesso! Entrando no sistema...");
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        setErro(res.mensagem || "Erro ao atualizar senha.");
      }
    } catch (err) {
      setErro(err.message || "Erro ao atualizar senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user && !user.precisaTrocarSenha) {
      navigate("/home");
    }
  }, [user, navigate]);

  // Se o usuário autenticou mas está com flag de 1º acesso (precisaTrocarSenha)
  if (user && user.precisaTrocarSenha) {
    return (
      <div
        className="min-vh-100 w-100 d-flex justify-content-center align-items-center px-3"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3159A3 100%)" }}
      >
        <div
          className="card shadow-lg"
          style={{ maxWidth: "460px", width: "100%", borderRadius: "12px", border: "none" }}
        >
          <div className="card-header text-center bg-white border-0 pt-4 pb-2">
            <div className="d-flex justify-content-center mb-2">
              <img src={logoImg} alt="Logo Conselho Tutelar" style={{ width: "90px", height: "auto" }} />
            </div>
            <span className="badge bg-warning text-dark mb-2">
              <i className="bi bi-shield-lock-fill me-1"></i>Primeiro Acesso Detectado
            </span>
            <h5 className="fw-bold mb-1" style={{ color: "#3159A3" }}>
              Defina sua Senha Pessoal
            </h5>
            <p className="text-muted small mb-0">
              Olá, <strong>{user.nome}</strong>! Por segurança (Política Zero-Trust), substitua sua senha temporária antes de acessar o sistema.
            </p>
          </div>

          <div className="card-body px-4 pb-4">
            <form onSubmit={handleTrocarSenhaPrimeiroAcesso}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">
                  Senha Temporária Atual
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={senhaTemporariaAtual}
                  onChange={(e) => setSenhaTemporariaAtual(e.target.value)}
                  placeholder="Informe a senha temporária recebida"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">
                  Nova Senha Pessoal (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite sua nova senha exclusiva"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {erro && (
                <div className="alert alert-danger small py-2 px-3 mb-3 d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <span>{erro}</span>
                </div>
              )}

              {sucessoTroca && (
                <div className="alert alert-success small py-2 px-3 mb-3 d-flex align-items-center" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <span>{sucessoTroca}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn w-100 text-white fw-medium d-flex justify-content-center align-items-center gap-2 mb-2"
                style={{
                  backgroundColor: "#3159A3",
                  borderColor: "#3159A3",
                  padding: "11px 16px",
                  fontSize: "15px",
                  borderRadius: "6px"
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Salvando Nova Senha...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    <span>Confirmar Nova Senha e Acessar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100 btn-sm"
                onClick={logout}
                disabled={isSubmitting}
              >
                Sair / Trocar de Conta
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-vh-100 w-100 d-flex justify-content-center align-items-center px-3"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3159A3 100%)" }}
      >
        <div
          className="card shadow-lg"
          style={{ maxWidth: "440px", width: "100%", borderRadius: "12px", border: "none" }}
        >
          <div className="card-header text-center bg-white border-0 pt-4 pb-2">
            <div className="d-flex justify-content-center mb-2">
              <img
                src={logoImg}
                alt="Logo Conselho Tutelar"
                style={{ width: "110px", height: "auto" }}
              />
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#3159A3" }}>
              Conselho Tutelar de Panambi
            </h5>
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
                  placeholder="Ex: nome.sobrenome ou matrícula"
                  disabled={isSubmitting}
                  style={{
                    borderColor: "#dee2e6",
                    fontSize: "14px",
                    padding: "10px 12px"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3159A3";
                    e.target.style.boxShadow = "0 0 0 0.2rem rgba(49, 89, 163, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dee2e6";
                    e.target.style.boxShadow = "none";
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
                    e.target.style.borderColor = "#3159A3";
                    e.target.style.boxShadow = "0 0 0 0.2rem rgba(49, 89, 163, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dee2e6";
                    e.target.style.boxShadow = "none";
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
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = "#244580";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = "#3159A3";
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
  );
}

export default Login;
