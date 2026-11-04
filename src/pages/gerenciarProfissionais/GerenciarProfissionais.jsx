import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './GerenciarProfissionais.css';
import { buscarConselheiros, deletarConselheiro, resetarSenhaConselheiro } from '../../api/conselheiros';
import { useNavigate } from 'react-router-dom';

function GerenciarProfissionais() {
    const navigate = useNavigate();
    const [profissionais, setProfissionais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [resettingId, setResettingId] = useState(null);
    const [credenciaisResetadas, setCredenciaisResetadas] = useState(null);
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        carregarProfissionais();
    }, []);

    const carregarProfissionais = async () => {
        try {
            setLoading(true);
            setError(null);
            const conselheiros = await buscarConselheiros();
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
                fimMandato: conselheiro.fimMandato,
                username: conselheiro.username || null,
                matricula: conselheiro.matricula || null,
                precisaTrocarSenha: Boolean(conselheiro.precisaTrocarSenha)
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
        navigate(`/home/cadastrar-profissional?id=${id}`);
    };

    const handleResetarSenha = async (profissional) => {
        if (!window.confirm(`Deseja gerar uma nova senha temporária de 1º acesso para ${profissional.name}?`)) {
            return;
        }
        try {
            setResettingId(profissional.id);
            const res = await resetarSenhaConselheiro(profissional.id);
            if (res && res.credenciaisAcesso) {
                setCredenciaisResetadas({
                    nome: profissional.name,
                    ...res.credenciaisAcesso
                });
                carregarProfissionais();
            }
        } catch (err) {
            alert(`Erro ao resetar senha: ${err.message}`);
        } finally {
            setResettingId(null);
        }
    };

    const handleCopiarReset = () => {
        if (!credenciaisResetadas) return;
        const texto = [
            `Conselho Tutelar de Panambi/RS - Nova Senha Temporária`,
            `Profissional: ${credenciaisResetadas.nome}`,
            `Usuário (Login): ${credenciaisResetadas.username}`,
            `Senha Temporária: ${credenciaisResetadas.senhaTemporaria}`,
            `* Obs: No próximo acesso, o sistema solicitará a troca por uma senha pessoal.`
        ].join('\n');
        navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 3000);
    };

    const handleDelete = async (id) => {
        const profissional = profissionais.find(p => p.id === id);

        if (!window.confirm(`Tem certeza que deseja excluir ${profissional.name} e revogar seu acesso ao sistema? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            setDeletingId(id);
            setError(null);
            await deletarConselheiro(id);
            setProfissionais(profissionais.filter(p => p.id !== id));
            alert('Profissional excluído e credenciais revogadas com sucesso!');
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
            <Container className="gerenciar-profissionais-container my-4">
                <Card className="shadow-lg p-5 border-0 bg-white text-center" style={{ borderRadius: '16px' }}>
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Carregando...</span>
                    </Spinner>
                    <p className="mt-3 mb-0 text-muted">Carregando profissionais...</p>
                </Card>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="gerenciar-profissionais-container my-4">
                <Card className="shadow-lg p-4 border-0 bg-white" style={{ borderRadius: '16px' }}>
                    <Alert variant="danger" className="mb-0">
                        <Alert.Heading>Erro!</Alert.Heading>
                        <p>{error}</p>
                        <Button onClick={carregarProfissionais} variant="outline-danger">
                            Tentar Novamente
                        </Button>
                    </Alert>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="gerenciar-profissionais-container my-4">
            <Card className="shadow-lg p-4 p-md-5 border-0 bg-white" style={{ borderRadius: '16px' }}>
                <h2 className="text-center mb-5 gerenciar-profissionais-title">GERENCIAR PROFISSIONAIS</h2>

                {profissionais.length === 0 ? (
                    <Alert variant="info" className="text-center mb-0">
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
                                        <Card.Title className="text-center mb-2 profissional-name">
                                            {profissional.name}
                                        </Card.Title>
                                        {profissional.cargo && (
                                            <p className="text-primary text-center small mb-1 fw-bold">
                                                {profissional.cargo === 'secretario' ? 'Secretário/a' :
                                                 profissional.cargo === 'conselheiro' ? 'Conselheiro/a' :
                                                 profissional.cargo}
                                            </p>
                                        )}

                                        {/* Informações de Login Vinculado */}
                                        <div className="w-100 text-center bg-light rounded p-2 mb-2 border">
                                            <div className="small text-muted">
                                                Login: <strong className="text-dark">{profissional.username || 'Sem conta'}</strong>
                                            </div>
                                            {profissional.username && (
                                                <Badge
                                                    bg={profissional.precisaTrocarSenha ? 'warning' : 'success'}
                                                    text={profissional.precisaTrocarSenha ? 'dark' : 'light'}
                                                    className="mt-1"
                                                    style={{ fontSize: '0.68rem' }}
                                                >
                                                    {profissional.precisaTrocarSenha ? '1º Acesso Pendente' : 'Senha Pessoal Ativa'}
                                                </Badge>
                                            )}
                                        </div>

                                        {profissional.contato && (
                                            <p className="text-muted text-center small mb-2">
                                                {profissional.contato}
                                            </p>
                                        )}

                                        <div className="d-flex w-100 justify-content-center gap-1 mt-1">
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="edit-button flex-grow-1"
                                                onClick={() => handleEdit(profissional.id)}
                                                title="Editar dados cadastrais"
                                            >
                                                EDITAR <i className="bi bi-pencil-square ms-1"></i>
                                            </Button>
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => handleResetarSenha(profissional)}
                                                disabled={resettingId === profissional.id}
                                                title="Gerar nova senha temporária de 1º acesso"
                                            >
                                                {resettingId === profissional.id ? (
                                                    <Spinner as="span" animation="border" size="sm" />
                                                ) : (
                                                    <i className="bi bi-key-fill text-dark"></i>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(profissional.id)}
                                                disabled={deletingId === profissional.id}
                                                title="Excluir profissional e revogar acesso"
                                            >
                                                {deletingId === profissional.id ? (
                                                    <Spinner as="span" animation="border" size="sm" />
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
            </Card>

            {/* Modal com Nova Senha Temporária Gerada */}
            <Modal show={Boolean(credenciaisResetadas)} onHide={() => setCredenciaisResetadas(null)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h5 fw-bold text-primary">
                        <i className="bi bi-key-fill me-2 text-warning"></i>
                        Nova Senha Temporária Gerada
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {credenciaisResetadas && (
                        <div>
                            <p className="text-muted small mb-3">
                                As credenciais de acesso de <strong>{credenciaisResetadas.nome}</strong> foram redefinidas:
                            </p>
                            <div className="p-3 bg-light rounded border mb-3">
                                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                    <span className="text-muted small">Usuário (Login):</span>
                                    <code className="fw-bold text-primary">{credenciaisResetadas.username}</code>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted small">Nova Senha Temporária:</span>
                                    <code className="fw-bold text-danger">{credenciaisResetadas.senhaTemporaria}</code>
                                </div>
                            </div>
                            <Button
                                variant={copiado ? 'success' : 'outline-primary'}
                                className="w-100"
                                onClick={handleCopiarReset}
                            >
                                <i className={`bi ${copiado ? 'bi-check2-all' : 'bi-clipboard'} me-2`}></i>
                                {copiado ? 'Copiado!' : 'Copiar Credenciais'}
                            </Button>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setCredenciaisResetadas(null)}>
                        Concluir
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default GerenciarProfissionais;
