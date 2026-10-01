import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PerfilAdministrador.css';

function PerfilAdministrador() {
    const { user } = useAuth();

    return (
        <Container className="my-4" style={{ maxWidth: '960px' }}>
            <Card className="shadow-lg border-0 bg-white" style={{ borderRadius: '16px' }}>
                <Card.Body className="p-4 p-md-5">
            {/* Logo e Título Centralizados */}
            <div className="text-center mb-4">
                <img
                    src={logo}
                    alt="Logo Conselho Tutelar"
                    style={{ width: "95px", height: "auto" }}
                    className="mb-2"
                />
                <h3 className="fw-bold" style={{ color: '#3159A3' }}>Painel Administrativo & Gestão</h3>
                <p className="text-muted small">Conselho Tutelar de Panambi - Gestão de Acessos e Pessoal</p>
            </div>

            {/* Informações do Administrador Conectado */}
            {user && (
                <Row className="justify-content-center mb-4">
                    <Col md={10} lg={8}>
                        <div className="p-3 bg-light rounded-3 border">
                            <h6 className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '12px' }}>
                                Administrador Logado
                            </h6>
                            <Row>
                                <Col sm={6}>
                                    <p className="mb-1"><strong>Nome:</strong> {user.nome}</p>
                                    <p className="mb-1"><strong>Cargo:</strong> {user.cargo}</p>
                                    <p className="mb-0"><strong>Unidade:</strong> {user.unidade || 'Secretaria Geral'}</p>
                                </Col>
                                <Col sm={6}>
                                    <p className="mb-1"><strong>E-mail:</strong> {user.email}</p>
                                    <p className="mb-1"><strong>Telefone:</strong> {user.telefone || '(55) 3375-6592'}</p>
                                    <p className="mb-0"><strong>Nível de Acesso:</strong> <span className="badge bg-primary">Administrador (Zero-Trust)</span></p>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            )}

            {/* Opções de Cadastro/Gerenciamento e Auditoria */}
            <Row className="justify-content-center mt-3">
                <Col xs={12} md={4} className="mb-3">
                    <Link to="/home/cadastrar-profissional" className="action-card-link text-decoration-none">
                        <div className="action-card d-flex flex-column align-items-center justify-content-center p-4 shadow-sm h-100 border rounded-3 bg-white">
                            <i className="bi bi-person-plus-fill fs-1 mb-2" style={{ color: '#3159A3' }}></i>
                            <span className="action-card-title text-center fw-bold text-dark">Cadastrar Profissional</span>
                            <small className="text-muted text-center mt-1">Registrar novos conselheiros ou secretários</small>
                        </div>
                    </Link>
                </Col>
                <Col xs={12} md={4} className="mb-3">
                    <Link to="/home/gerenciar-profissionais" className="action-card-link text-decoration-none">
                        <div className="action-card d-flex flex-column align-items-center justify-content-center p-4 shadow-sm h-100 border rounded-3 bg-white">
                            <i className="bi bi-person-lines-fill fs-1 mb-2" style={{ color: '#3159A3' }}></i>
                            <span className="action-card-title text-center fw-bold text-dark">Gerenciar Profissionais</span>
                            <small className="text-muted text-center mt-1">Editar, monitorar ou remover membros</small>
                        </div>
                    </Link>
                </Col>
                <Col xs={12} md={4} className="mb-3">
                    <Link to="/home/auditoria" className="action-card-link text-decoration-none">
                        <div className="action-card d-flex flex-column align-items-center justify-content-center p-4 shadow-sm h-100 border rounded-3 bg-white">
                            <i className="bi bi-shield-lock-fill fs-1 mb-2" style={{ color: '#3159A3' }}></i>
                            <span className="action-card-title text-center fw-bold text-dark">Trilha de Auditoria</span>
                            <small className="text-muted text-center mt-1">Conformidade e histórico entre mandatos</small>
                        </div>
                    </Link>
                </Col>
            </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default PerfilAdministrador;