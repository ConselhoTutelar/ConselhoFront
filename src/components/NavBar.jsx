import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    IoPerson,
    IoMap,
    IoClose,
    IoDocumentText,
    IoHome,
    IoPeople,
    IoAddCircle,
    IoLogOut,
    IoCreate
} from "react-icons/io5";

import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const documentosParaPreencher = [
    { label: "Recebimento de Denúncia", descricao: "Registrar denúncia", to: "/home/recebimento-denuncia" },
    { label: "Ficha de Atendimento", descricao: "Relato de atendimento", to: "/home/ficha-atendimento" },
    { label: "Notificação", descricao: "Emitir notificação", to: "/home/notificacao" },
    { label: "Termo Medidas Responsáveis", descricao: "Aplicar medidas aos responsáveis", to: "/home/termo-medidas-responsaveis" },
    { label: "Termo Medidas Criança/Adolescente", descricao: "Registrar medida protetiva", to: "/home/termo-medidas-crianca" }
];

const NavBar = () => {
    const [menuAberto, setMenuAberto] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const linksBasicos = [
        { label: "Menu Principal", to: "/home", icon: IoHome },
        { label: "Mapas", to: "/home/mapas", icon: IoMap },
        { label: "Documentos Salvos", to: "/home/visualizar-documentos", icon: IoDocumentText },
    ];

    const linksAdmin = [
        { label: "Seu Perfil", to: "/home/perfil-administrador", icon: IoPerson },
        { label: "Gerenciar Profissionais", to: "/home/gerenciar-profissionais", icon: IoPeople },
        { label: "Cadastrar Profissionais", to: "/home/cadastrar-profissional", icon: IoAddCircle },
    ];

    const linksConselheiro = [
        { label: "Meu Perfil", to: "/home/perfil-conselheiro", icon: IoPerson },
    ];

    const profileLinks = [
        ...(user?.role === 'admin' ? linksAdmin : linksConselheiro),
        { label: "Sair do sistema", icon: IoLogOut, variant: "danger", action: () => { logout(); navigate('/'); } }
    ];

    const fecharMenu = () => setMenuAberto(false);

    const handleLinkClick = (action) => {
        if (action) {
            action();
            fecharMenu();
        } else {
            fecharMenu();
        }
    };

    return (
        <>
            <nav className="navbar bg-white fixed-top px-4 px-lg-5 py-3 shadow-lg">
                <div className="w-100 d-flex align-items-center position-relative gap-3 nav-bar-inner">
                    <div className="nav-side d-flex align-items-center">
                        <button
                            className="hamburger-toggle"
                            type="button"
                            onClick={() => setMenuAberto(true)}
                            aria-label="Abrir menu"
                        >
                            <span className="hamburger-line" />
                            <span className="hamburger-line" />
                            <span className="hamburger-line" />
                        </button>
                    </div>
                    <div className="nav-center d-flex justify-content-center">
                        <Link to="/home" className="logo-center-link text-decoration-none text-center">
                            <img src={logo} style={{ width: "90px" }} alt="Conselho Tutelar" />
                        </Link>
                    </div>
                    <div className="nav-side header-text text-end">
                        {user && (
                            <>
                                <strong className="d-block">{user.nome}</strong>
                                <small className="text-muted">{user.cargo}</small>
                            </>
                        )}
                        {!user && <small className="text-muted">Painel Administrativo</small>}
                    </div>
                </div>
            </nav>

            <div className={`hamburger-overlay ${menuAberto ? "show" : ""}`} onClick={fecharMenu} />
            <aside className={`hamburger-drawer ${menuAberto ? "open" : ""}`}>
                <div className="drawer-header">
                    <div className="d-flex align-items-center gap-2">
                        <img src={logo} alt="Conselho Tutelar" style={{ width: "56px" }} />
                    </div>
                    <button className="btn btn-link text-dark p-1" onClick={fecharMenu} aria-label="Fechar menu">
                        <IoClose size={28} />
                    </button>
                </div>

                <div className="drawer-section">
                    <p className="drawer-title">Navegação</p>
                    <div className="d-flex flex-column gap-2">
                        {linksBasicos.map(({ label, to, icon: Icon }) => (
                            <Link
                                key={label}
                                to={to}
                                onClick={fecharMenu}
                                className="drawer-link"
                            >
                                {Icon && <Icon className="me-2" />}
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                {profileLinks.length > 0 && (
                    <div className="drawer-section">
                        <p className="drawer-title">Perfil e gestão</p>
                        <div className="d-flex flex-column gap-2">
                            {profileLinks.map(({ label, to, icon: Icon, variant, action }) =>
                                action ? (
                                    <button
                                        key={label}
                                        onClick={() => handleLinkClick(action)}
                                        className={`drawer-link ${variant === 'danger' ? 'drawer-link-danger' : ''}`}
                                    >
                                        {Icon && <Icon className="me-2" />}
                                        {label}
                                    </button>
                                ) : (
                                    <Link
                                        key={label}
                                        to={to}
                                        onClick={fecharMenu}
                                        className="drawer-link"
                                    >
                                        {Icon && <Icon className="me-2" />}
                                        {label}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                )}

                <div className="drawer-section">
                    <p className="drawer-title d-flex align-items-center gap-2">
                        <IoCreate /> Documentos para preencher
                    </p>
                    <div className="drawer-documents">
                        {documentosParaPreencher.map((doc) => (
                            <Link
                                key={doc.to}
                                to={doc.to}
                                onClick={fecharMenu}
                                className="drawer-document text-decoration-none"
                            >
                                <p className="mb-1 fw-semibold text-dark">{doc.label}</p>
                                <small className="text-muted">{doc.descricao}</small>
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default NavBar;