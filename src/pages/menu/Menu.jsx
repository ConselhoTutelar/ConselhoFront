import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Menu.css'; // Novo arquivo para estilos específicos do dashboard/menu

function Menu() {
    // Lista dos formulários com seus nomes e caminhos de rota
    const formLinks = [
        { name: "Ficha Recebimento de Denúncia", path: "recebimento-denuncia" },
        { name: "Ficha de Atendimento", path: "ficha-atendimento" },
        { name: "Notificação", path: "notificacao" },
        { name: "Termo Aplicação Medidas Pais e Responsáveis", path: "termo-medidas-responsaveis" },
        { name: "Termo Aplicação Medidas Para a Criança ou Adolescente", path: "termo-medidas-crianca" },
    ];

    return (
                    <Card.Body>
                        <Row className="justify-content-center text-center mb-5">
                            <Col md={10} lg={8}>
                                <h2 className="dashboard-title mb-2">Conselho Tutelar de Panambi</h2>
                                <p className="text-muted mb-0">Sistema de registro de documentos</p>
                            </Col>
                        </Row>
                        {/* Lista de Links para Formulários */}
                        <Row className="justify-content-center">
                            <Col md={10} lg={8}>
                                <div className="form-list-container">
                                    {formLinks.map((form, index) => (
                                        <Link to={form.path} key={index} className="form-list-item-link">
                                            <div className="form-list-item d-flex justify-content-between align-items-center">
                                                <span>{form.name}</span>
                                                <i className="bi bi-plus"></i> {/* Ícone de + */}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
    );
}

export default Menu;