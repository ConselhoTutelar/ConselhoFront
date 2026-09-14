import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './GerenciarProfissionais.css';
import { buscarConselheiros, deletarConselheiro } from '../../api/conselheiros';
import { useNavigate } from 'react-router-dom';

function GerenciarProfissionais() {
    const navigate = useNavigate();
    const [profissionais, setProfissionais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        carregarProfissionais();
    }, []);

    const carregarProfissionais = async () => {
        try {
            setLoading(true);
            setError(null);
            const conselheiros = await buscarConselheiros();
            // Mapear os dados do banco para o formato esperado
            const profissionaisFormatados = conselheiros.map(conselheiro => ({
                id: conselheiro.idConselheiro,
                name: conselheiro.nomeConselheiro || 'Nome não informado',
                cargo: conselheiro.cargo || null,
                contato: conselheiro.contatoConselheiro,
                rg: conselheiro.rg,
                cpf: conselheiro.cpf,
                nacionalidade: conselheiro.nacionalidade,
                endereco: conselheiro.endereco,
                dataNascimento: conselheiro.data_nascimento,
                iniMandato: conselheiro.iniMandato,
                fimMandato: conselheiro.fimMandato
            }));
            setProfissionais(profissionaisFormatados);
        } catch (err) {
            console.error('Erro ao carregar profissionais:', err);
            setError('Erro ao carregar profissionais. Verifique se o servidor está rodando.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id) => {
        // Navegar para página de cadastrar com o ID para edição
        navigate(`/home/cadastrar-profissional?id=${id}`);
    };

    const handleDelete = async (id) => {
        const profissional = profissionais.find(p => p.id === id);
        
        if (!window.confirm(`Tem certeza que deseja excluir ${profissional.name}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            setDeletingId(id);
            setError(null);
            await deletarConselheiro(id);
            // Remover o profissional da lista localmente
            setProfissionais(profissionais.filter(p => p.id !== id));
            alert('Profissional excluído com sucesso!');
        } catch (err) {
            console.error('Erro ao deletar profissional:', err);
            setError(err.message || 'Erro ao excluir profissional. Verifique se o servidor está rodando.');
            alert(`Erro ao excluir profissional: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <Container className="gerenciar-profissionais-container my-5">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </Spinner>
                    <p className="mt-3">Carregando profissionais...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="gerenciar-profissionais-container my-5">
                <Alert variant="danger">
                    <Alert.Heading>Erro!</Alert.Heading>
                    <p>{error}</p>
                    <Button onClick={carregarProfissionais} variant="outline-danger">
                        Tentar Novamente
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
            <Container className="gerenciar-profissionais-container my-5">
                <h2 className="text-center mb-5 gerenciar-profissionais-title">GERENCIAR PROFISSIONAIS</h2>

            {profissionais.length === 0 ? (
                <Alert variant="info" className="text-center">
                    Nenhum profissional cadastrado no banco de dados.
                </Alert>
            ) : (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {profissionais.map(profissional => (
                        <Col key={profissional.id}>
                            <Card className="profissional-card h-100 shadow-sm">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-between p-3">
                                    <div className="profissional-icon-container mb-3">
                                        <i className="bi bi-person-fill gerenciar-icon"></i>
                                    </div>
                                    <Card.Title className="text-center mb-3 profissional-name">
                                        {profissional.name}
                                    </Card.Title>
                                    {profissional.cargo && (
                                        <p className="text-primary text-center small mb-2 fw-bold">
                                            {profissional.cargo === 'secretario' ? 'Secretário/a' : 
                                             profissional.cargo === 'conselheiro' ? 'Conselheiro/a' : 
                                             profissional.cargo}
                                        </p>
                                    )}
                                    {profissional.contato && (
                                        <p className="text-muted text-center small mb-2">
                                            {profissional.contato}
                                        </p>
                                    )}
                                    <div className="d-flex w-100 justify-content-center">
                                        <Button
                                            variant="outline-success"
                                            className="edit-button w-100 me-2"
                                            onClick={() => handleEdit(profissional.id)}
                                        >
                                            EDITAR <i className="bi bi-pencil-square ms-1"></i>
                                        </Button>  
                                        <Button 
                                            variant="outline-danger"
                                            onClick={() => handleDelete(profissional.id)}
                                            disabled={deletingId === profissional.id}
                                        >
                                            {deletingId === profissional.id ? (
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <i className="bi bi-trash"></i>
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            </Container>
    );
}

export default GerenciarProfissionais;