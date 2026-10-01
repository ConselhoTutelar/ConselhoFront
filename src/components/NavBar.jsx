import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    IoPerson,
    IoMap,
    IoClose,
    IoDocumentText,
    IoHome,
    IoPeople,
    IoAddCircle,
    IoLogOut,
    IoCreate,
    IoShieldCheckmark,
    IoMenu,
    IoChevronBack
} from "react-icons/io5";

import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const documentosParaPreencher = [
    { label: "Recebimento de Denúncia", descricao: "Registrar denúncia de violação", to: "/home/recebimento-denuncia" },
    { label: "Ficha de Atendimento", descricao: "Relato de atendimento individual", to: "/home/ficha-atendimento" },
    { label: "Notificação", descricao: "Emitir notificação oficial", to: "/home/notificacao" },
    { label: "Termo Medidas Responsáveis", descricao: "Aplicar medidas aos responsáveis", to: "/home/termo-medidas-responsaveis" },
    { label: "Termo Medidas Criança/Adolescente", descricao: "Registrar medida protetiva", to: "/home/termo-medidas-crianca" }
];

const NavBar = ({ menuAberto, toggleMenu, fecharMenu }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const linksBasicos = [
        { label: "Menu Principal", to: "/home", icon: IoHome },
        { label: "Mapas", to: "/home/mapas", icon: IoMap },
        { label: "Documentos Salvos", to: "/home/visualizar-documentos", icon: IoDocumentText },
    ];

    const linksAdmin = [
        { label: "Trilha de Auditoria", to: "/home/auditoria", icon: IoShieldCheckmark, badge: "Zero-Trust" },
        { label: "Gerenciar Profissionais", to: "/home/gerenciar-profissionais", icon: IoPeople },
        { label: "Cadastrar Profissionais", to: "/home/cadastrar-profissional", icon: IoAddCircle },
        { label: "Seu Perfil", to: "/home/perfil-administrador", icon: IoPerson },
    ];

    const linksConselheiro = [
        { label: "Meu Perfil", to: "/home/perfil-conselheiro", icon: IoPerson },
    ];

    const profileLinks = [
        ...(user?.role === 'admin' ? linksAdmin : linksConselheiro)
    ];

    // No desktop (>= 992px) o menu permanece FIXO na tela enquanto o usuário navega!
    // No mobile (< 992px), o menu fecha automaticamente após clicar em um link.
    const handleLinkClick = (action) => {
        if (action) {
            action();
        }
        if (window.innerWidth < 992 && fecharMenu) {
            fecharMenu();
        }
    };

    const isLinkActive = (to) => {
        if (to === "/home") {
            return location.pathname === "/home" || location.pathname === "/home/";
        }
        return location.pathname.startsWith(to);
    };

    return (
        <>
            {/* Topbar Fixa Superior */}
            <nav className="navbar bg-white fixed-top px-3 px-lg-4 shadow-sm app-top-header">
                <div className="w-100 d-flex align-items-center justify-content-between gap-2">
                    
                    {/* Botão de Toggle do Menu Lateral Fixo */}
                    <div className="d-flex align-items-center gap-2">
                        <button
                            className={`btn btn-light d-flex align-items-center gap-2 border px-3 py-2 menu-toggle-btn ${menuAberto ? 'active' : ''}`}
                            type="button"
                            onClick={toggleMenu}
                            aria-label={menuAberto ? "Fechar menu lateral" : "Abrir menu lateral"}
                            title={menuAberto ? "Recolher menu lateral" : "Fixar menu lateral"}
                        >
                            <IoMenu size={22} className="text-primary-emphasis" />
                            <span className="fw-semibold d-none d-sm-inline" style={{ fontSize: "0.9rem" }}>
                                {menuAberto ? "Recolher Menu" : "Menu Lateral"}
                            </span>
                        </button>

                        <span className="fw-semibold text-secondary d-none d-md-inline" style={{ fontSize: "0.9rem" }}>
                            Conselho Tutelar de Panambi
                        </span>
                    </div>

                    {/* Logo Central */}
                    <div className="d-flex justify-content-center">
                        <Link to="/home" className="logo-center-link text-decoration-none">
                            <img src={logo} style={{ height: "46px", width: "auto" }} alt="Conselho Tutelar" />
                        </Link>
                    </div>

                    {/* Perfil do Usuário e Logout */}
                    <div className="d-flex align-items-center gap-2 text-end">
                        {user ? (
                            <div className="d-flex align-items-center gap-2">
                                <div className="d-none d-sm-block text-end">
                                    <strong className="d-block text-dark text-truncate" style={{ maxWidth: "180px", fontSize: "0.85rem" }}>
                                        {user.nome}
                                    </strong>
                                    <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                        <span className={`badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'} me-1`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Conselheiro'}
                                        </span>
                                        {user.cargo}
                                    </small>
                                </div>
                                <button
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-2 py-1"
                                    title="Sair do sistema"
                                >
                                    <IoLogOut size={16} />
                                    <span className="d-none d-md-inline">Sair</span>
                                </button>
                            </div>
                        ) : (
                            <small className="text-muted">Painel Administrativo</small>
                        )}
                    </div>
                </div>
            </nav>

            {/* Overlay apenas para Mobile (< 992px) */}
            <div
                className={`hamburger-overlay ${menuAberto ? "show" : ""}`}
                onClick={fecharMenu}
            />

            {/* Menu Lateral Fixo / Drawer Recolhível */}
            <aside className={`app-sidebar hamburger-drawer ${menuAberto ? "open" : ""}`}>
                {/* Cabeçalho do Menu com Botão de Fechar */}
                <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <img src={logo} alt="Conselho Tutelar" style={{ height: "36px", width: "auto" }} />
                        <div>
                            <span className="fw-bold d-block text-dark lh-1" style={{ fontSize: "0.95rem" }}>
                                Navegação
                            </span>
                            <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                                Painel Integrado
                            </small>
                        </div>
                    </div>
                    <button
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-1 rounded-circle"
                        onClick={fecharMenu}
                        aria-label="Fechar menu lateral"
                        title="Recolher / Fechar menu"
                        style={{ width: "32px", height: "32px" }}
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Conteúdo com rolagem do menu lateral */}
                <div className="sidebar-content-scroll p-3 d-flex flex-column gap-3">
                    
                    {/* 1. Navegação Geral */}
                    <div className="drawer-section">
                        <p className="drawer-title mb-2">Visão Geral</p>
                        <div className="d-flex flex-column gap-1">
                            {linksBasicos.map(({ label, to, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => handleLinkClick()}
                                    className={`drawer-link ${isLinkActive(to) ? 'active' : ''}`}
                                >
                                    {Icon && <Icon className="me-2 fs-5" />}
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 2. Documentos para Preencher */}
                    <div className="drawer-section">
                        <p className="drawer-title d-flex align-items-center gap-2 mb-2">
                            <IoCreate /> Documentos & Medidas
                        </p>
                        <div className="drawer-documents d-flex flex-column gap-1">
                            {documentosParaPreencher.map((doc) => (
                                <Link
                                    key={doc.to}
                                    to={doc.to}
                                    onClick={() => handleLinkClick()}
                                    className={`drawer-document ${isLinkActive(doc.to) ? 'active' : ''}`}
                                >
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p className="mb-0 fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>
                                            {doc.label}
                                        </p>
                                    </div>
                                    <small className="text-muted d-block text-truncate" style={{ fontSize: "0.74rem" }}>
                                        {doc.descricao}
                                    </small>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 3. Gestão e Segurança */}
                    {profileLinks.length > 0 && (
                        <div className="drawer-section">
                            <p className="drawer-title mb-2">Gestão & Segurança</p>
                            <div className="d-flex flex-column gap-1">
                                {profileLinks.map(({ label, to, icon: Icon, badge }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        onClick={() => handleLinkClick()}
                                        className={`drawer-link ${isLinkActive(to) ? 'active' : ''}`}
                                    >
                                        <div className="d-flex align-items-center justify-content-between w-100">
                                            <div className="d-flex align-items-center">
                                                {Icon && <Icon className="me-2 fs-5" />}
                                                <span>{label}</span>
                                            </div>
                                            {badge && (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: "0.68rem" }}>
                                                    {badge}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. Sair */}
                    <div className="mt-auto pt-2">
                        <button
                            onClick={() => handleLinkClick(() => { logout(); navigate('/'); })}
                            className="drawer-link drawer-link-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                        >
                            <IoLogOut size={18} />
                            <span>Sair do Sistema</span>
                        </button>
                    </div>

                </div>
            </aside>
        </>
    );
};

export default NavBar;