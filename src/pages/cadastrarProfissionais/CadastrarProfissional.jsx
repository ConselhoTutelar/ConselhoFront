import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, FormControl, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CadastrarProfissional.css';
import { criarConselheiro, buscarConselheiroPorId, atualizarConselheiro } from '../../api/conselheiros';
import { useNavigate, useSearchParams } from 'react-router-dom';

const parseEnderecoCompleto = (enderecoCompleto) => {
    const partes = (enderecoCompleto || '')
        .split(',')
        .map((parte) => parte.trim())
        .filter(Boolean);

    const resultado = {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
    };

    if (!partes.length) {
        return resultado;
    }

    resultado.rua = partes[0] || '';
    resultado.numero = partes[1] || '';
    resultado.bairro = partes[2] || '';

    if (partes.length >= 4) {
        const restantes = partes.slice(3);
        if (restantes.length) {
            const ultima = restantes[restantes.length - 1];
            if (/^[A-Z]{2}$/.test(ultima)) {
                restantes.pop();
            }
            resultado.cidade = restantes.join(', ');
        }
    }

    return resultado;
};

const montarEnderecoCompleto = ({ rua, numero, bairro, cidade }) => {
    const partes = [rua, numero, bairro].map((parte) => parte?.trim()).filter(Boolean);
    const cidadeNormalizada = cidade?.trim();

    if (cidadeNormalizada) {
        partes.push(cidadeNormalizada);
        if (!cidadeNormalizada.toUpperCase().endsWith('RS')) {
            partes.push('RS');
        }
    }

    return partes.join(', ');
};

function CadastrarProfissional() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idEdicao = searchParams.get('id');
    const [isEditMode, setIsEditMode] = useState(!!idEdicao);
    const [formData, setFormData] = useState({
        nome: '',
        cargo: '', // 'Secretário/a' ou 'Conselheiro/a'
        cpf: '',
        rg: '',
        dataNascimento: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        celularDDD: '',
        celularNumero: '',
        nacionalidade: '',
        fotoPerfil: null, // Para armazenar o arquivo da imagem
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Carregar dados do conselheiro se estiver em modo de edição
    const carregarDadosConselheiro = async (id) => {
        try {
            setLoadingData(true);
            setError(null);
            const conselheiro = await buscarConselheiroPorId(id);
            
            // Extrair DDD e número do contato se existir
            let celularDDD = '';
            let celularNumero = '';
            if (conselheiro.contatoConselheiro) {
                const match = conselheiro.contatoConselheiro.match(/\((\d+)\)\s*(.+)/);
                if (match) {
                    celularDDD = match[1];
                    celularNumero = match[2];
                }
            }

            // Converter cargo do ENUM para o formato do formulário
            let cargoForm = '';
            if (conselheiro.cargo === 'secretario') {
                cargoForm = 'Secretário/a';
            } else if (conselheiro.cargo === 'conselheiro') {
                cargoForm = 'Conselheiro/a';
            }

            let dataNascFormatada = '';
            if (conselheiro.data_nascimento) {
                if (typeof conselheiro.data_nascimento === 'string') {
                    dataNascFormatada = conselheiro.data_nascimento.substring(0, 10);
                } else {
                    const d = new Date(conselheiro.data_nascimento);
                    if (!isNaN(d.getTime())) {
                        dataNascFormatada = d.toISOString().split('T')[0];
                    }
                }
            }

            const enderecoForm = parseEnderecoCompleto(conselheiro.endereco);

            setFormData({
                nome: conselheiro.nomeConselheiro || '',
                cargo: cargoForm,
                cpf: conselheiro.cpf ? String(conselheiro.cpf) : '',
                rg: conselheiro.rg ? String(conselheiro.rg) : '',
                dataNascimento: dataNascFormatada,
                rua: enderecoForm.rua,
                numero: enderecoForm.numero,
                bairro: enderecoForm.bairro,
                cidade: enderecoForm.cidade,
                celularDDD,
                celularNumero,
                nacionalidade: conselheiro.nacionalidade || '',
                fotoPerfil: null,
            });
        } catch (err) {
            console.error('Erro ao carregar conselheiro:', err);
            setError(err.message || 'Erro ao carregar dados do profissional.');
        } finally {
            setLoadingData(false);
        }
    };

    // Carregar dados do conselheiro se estiver em modo de edição
    useEffect(() => {
        if (idEdicao) {
            carregarDadosConselheiro(idEdicao);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idEdicao]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prevState => ({
                ...prevState,
                [name]: files[0] // Pega o primeiro arquivo selecionado
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Converter cargo para o formato do ENUM do banco de dados
            let cargoEnum = null;
            if (formData.cargo === 'Secretário/a') {
                cargoEnum = 'secretario';
            } else if (formData.cargo === 'Conselheiro/a') {
                cargoEnum = 'conselheiro';
            }

            const enderecoCompleto = montarEnderecoCompleto({
                rua: formData.rua,
                numero: formData.numero,
                bairro: formData.bairro,
                cidade: formData.cidade,
            });

            // Preparar dados para enviar ao backend
            const dadosConselheiro = {
                nome: formData.nome,
                cargo: cargoEnum,
                cpf: formData.cpf,
                rg: formData.rg,
                dataNascimento: formData.dataNascimento,
                endereco: enderecoCompleto,
                celularDDD: formData.celularDDD,
                celularNumero: formData.celularNumero,
                nacionalidade: formData.nacionalidade || null,
                // Foto será implementada depois se necessário
                foto: null
            };

            if (isEditMode && idEdicao) {
                // Atualizar conselheiro existente
                await atualizarConselheiro(idEdicao, dadosConselheiro);
                setSuccess(true);
                alert('Profissional atualizado com sucesso!');
            } else {
                // Criar novo conselheiro
                await criarConselheiro(dadosConselheiro);
                setSuccess(true);
                alert('Profissional cadastrado com sucesso!');
                
                // Limpar formulário apenas se for criação
                setFormData({
                    nome: '',
                    cargo: '',
                    cpf: '',
                    rg: '',
                    dataNascimento: '',
                    rua: '',
                    numero: '',
                    bairro: '',
                    cidade: '',
                    celularDDD: '',
                    celularNumero: '',
                    nacionalidade: '',
                    fotoPerfil: null,
                });
            }

            // Redirecionar para gerenciar profissionais após 2 segundos
            setTimeout(() => {
                navigate('/home/gerenciar-profissionais');
            }, 2000);
        } catch (err) {
            console.error('Erro ao salvar profissional:', err);
            setError(err.message || 'Erro ao salvar profissional. Verifique se o servidor está rodando.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/home/gerenciar-profissionais');
    };

    return (
            <Container className="cadastrar-profissional-container my-5">
                <Card className="cadastrar-profissional-card shadow-lg">
                    <Card.Body className="p-4">
                        <h2 className="text-center mb-5 cadastrar-profissional-title">
                            {isEditMode ? 'EDITAR PROFISSIONAL' : 'CADASTRAR NOVO PROFISSIONAL'}
                        </h2>

                        {error && (
                            <Alert variant="danger" className="mb-4">
                                <Alert.Heading>Erro!</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}

                        {success && (
                            <Alert variant="success" className="mb-4">
                                <Alert.Heading>Sucesso!</Alert.Heading>
                                <p>{isEditMode ? 'Profissional atualizado com sucesso! Redirecionando...' : 'Profissional cadastrado com sucesso! Redirecionando...'}</p>
                            </Alert>
                        )}

                        {loadingData && (
                            <div className="text-center mb-4">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Carregando dados...</span>
                                </Spinner>
                                <p className="mt-2">Carregando dados do profissional...</p>
                            </div>
                        )}

                        <Form onSubmit={handleSubmit}>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formNome">
                                <Form.Label column sm="3">Nome:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        placeholder="Nome completo do profissional"
                                        disabled={loadingData}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center">
                                <Form.Label column sm="3">Cargo:</Form.Label>
                                <Col sm="9">
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Secretário/a"
                                        name="cargo"
                                        id="cargoSecretaria"
                                        value="Secretário/a"
                                        checked={formData.cargo === 'Secretário/a'}
                                        onChange={handleChange}
                                        disabled={loadingData}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Conselheiro/a"
                                        name="cargo"
                                        id="cargoConselheira"
                                        value="Conselheiro/a"
                                        checked={formData.cargo === 'Conselheiro/a'}
                                        onChange={handleChange}
                                        disabled={loadingData}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formCPF">
                                <Form.Label column sm="3">CPF:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleChange}
                                        placeholder="Ex: 000.000.000-00"
                                        maxLength="14" // Para formatar com pontos e traço
                                        disabled={loadingData}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formRG">
                                <Form.Label column sm="3">RG:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        name="rg"
                                        value={formData.rg}
                                        onChange={handleChange}
                                        placeholder="Ex: 00.000.000-0"
                                        maxLength="12" // Depende do formato do RG
                                        disabled={loadingData}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formDateNascimento">
                                <Form.Label column sm="3">Data de Nascimento:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="date"
                                        name="dataNascimento"
                                        value={formData.dataNascimento}
                                        onChange={handleChange}
                                        disabled={loadingData}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formNacionalidade">
                                <Form.Label column sm="3">Nacionalidade:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        name="nacionalidade"
                                        value={formData.nacionalidade}
                                        onChange={handleChange}
                                        placeholder="Ex: Brasileiro"
                                        disabled={loadingData}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formRua">
                                <Form.Label column sm="3">Rua:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        name="rua"
                                        value={formData.rua}
                                        onChange={handleChange}
                                        placeholder="Nome da rua"
                                        disabled={loadingData}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formNumero">
                                <Form.Label column sm="3">Número:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        name="numero"
                                        value={formData.numero}
                                        onChange={handleChange}
                                        placeholder="Número"
                                        disabled={loadingData}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formBairro">
                                <Form.Label column sm="3">Bairro:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        name="bairro"
                                        value={formData.bairro}
                                        onChange={handleChange}
                                        placeholder="Bairro"
                                        disabled={loadingData}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center" controlId="formCidade">
                                <Form.Label column sm="3">Cidade:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        name="cidade"
                                        value={formData.cidade}
                                        onChange={handleChange}
                                        placeholder="Cidade"
                                        disabled={loadingData}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3 align-items-center">
                                <Form.Label column sm="3">Celular:</Form.Label>
                                <Col sm="9">
                                    <InputGroup>
                                        <InputGroup.Text className="celular-prefix">+ 55</InputGroup.Text>
                                        <FormControl
                                            type="text"
                                            name="celularDDD"
                                            value={formData.celularDDD}
                                            onChange={handleChange}
                                            placeholder="(__)"
                                            maxLength="2"
                                            className="ddd-input"
                                            disabled={loadingData}
                                            required
                                        />
                                        <FormControl
                                            type="text"
                                            name="celularNumero"
                                            value={formData.celularNumero}
                                            onChange={handleChange}
                                            placeholder="_____-____"
                                            maxLength="10" // Ex: 99999-9999
                                            className="numero-celular-input"
                                            disabled={loadingData}
                                            required
                                        />
                                    </InputGroup>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-4 align-items-center" controlId="uploadFotoPerfil">
                                <Form.Label column sm="3">Foto de Perfil:</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="file"
                                        name="fotoPerfil"
                                        onChange={handleChange}
                                        className="d-none"
                                        disabled={loadingData}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => document.getElementById('uploadFotoPerfil').click()}
                                        className="anexar-imagem-button"
                                        disabled={loadingData}
                                    >
                                        Anexar Imagem <i className="bi bi-paperclip ms-2"></i>
                                    </Button>
                                    {formData.fotoPerfil && (
                                        <span className="ms-2 file-name-display">{formData.fotoPerfil.name}</span>
                                    )}
                                </Col>
                            </Form.Group>

                            <div className="d-flex justify-content-center mt-5 button-group">
                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="submit-button me-3"
                                    disabled={loading || loadingData}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            {isEditMode ? 'Atualizando...' : 'Cadastrando...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Atualizar' : 'Cadastrar'
                                    )}
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    type="button" 
                                    onClick={handleCancel} 
                                    className="cancel-button"
                                    disabled={loading || loadingData}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
    );
}

export default CadastrarProfissional;