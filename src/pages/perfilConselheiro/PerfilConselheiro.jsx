import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const PerfilConselheiro = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'conselheiro') {
    return (
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body className="text-center">
            <p className="mb-0">Perfil disponível apenas para conselheiros.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow border-0">
        <Card.Header className="text-white" style={{ backgroundColor: '#3159A3' }}>
          <h4 className="mb-0">Meu Perfil</h4>
          <small>Informações pessoais e de plantão</small>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <h6 className="text-muted text-uppercase">Identificação</h6>
              <p className="mb-1"><strong>Nome:</strong> {user.nome}</p>
              
              <p className="mb-0"><strong>Cargo:</strong> {user.cargo}</p>
            </Col>
            <Col md={6}>
              <h6 className="text-muted text-uppercase">Contato</h6>
              <p className="mb-1"><strong>E-mail:</strong> {user.email}</p>
              <p className="mb-0"><strong>Telefone:</strong> {user.telefone}</p>
            </Col>
          </Row>
          <Row>
            
            
            <Col md={6}>
              <h6 className="text-muted text-uppercase">Plantão</h6>
              <p className="mb-0">{user.plantao || 'Não informado'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PerfilConselheiro;

