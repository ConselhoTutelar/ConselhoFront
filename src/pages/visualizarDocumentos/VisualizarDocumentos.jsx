import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert, InputGroup, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { buscarTodosDocumentos } from '../../api/documentos';
import { gerarPDF } from '../../utils/gerarPDF';
import { documentosFalsos } from '../../utils/dadosFalsos';
import './VisualizarDocumentos.css';

function VisualizarDocumentos() {
  const [documentos, setDocumentos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const aplicarFallbackDocumentos = (dadosReais) => ({
    denuncias: dadosReais?.denuncias?.length ? dadosReais.denuncias : documentosFalsos.denuncias,
    atendimentos: dadosReais?.atendimentos?.length ? dadosReais.atendimentos : documentosFalsos.atendimentos,
    notificacoes: dadosReais?.notificacoes?.length ? dadosReais.notificacoes : documentosFalsos.notificacoes,
    termosMedidasMenor: dadosReais?.termosMedidasMenor?.length ? dadosReais.termosMedidasMenor : documentosFalsos.termosMedidasMenor,
    termosMedidasResponsavel: dadosReais?.termosMedidasResponsavel?.length ? dadosReais.termosMedidasResponsavel : documentosFalsos.termosMedidasResponsavel
  });

  useEffect(() => {
    carregarDocumentos();
  }, []);

  const carregarDocumentos = async () => {
    try {
      setLoading(true);
      const dados = await buscarTodosDocumentos();
      const dadosComFallback = aplicarFallbackDocumentos(dados || {});
      setDocumentos(dadosComFallback);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar documentos. Usando dados falsos:', err);
      setDocumentos(documentosFalsos);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  const getTipoBadge = (tipo) => {
    const tipos = {
      'denuncia': { variant: 'danger', label: 'Denúncia' },
      'atendimento': { variant: 'primary', label: 'Atendimento' },
      'notificacao': { variant: 'warning', label: 'Notificação' },
      'termo-medidas-menor': { variant: 'info', label: 'Termo Medidas (Menor)' },
      'termo-medidas-responsavel': { variant: 'success', label: 'Termo Medidas (Responsável)' }
    };
    const tipoInfo = tipos[tipo] || { variant: 'secondary', label: tipo };
    return <Badge bg={tipoInfo.variant}>{tipoInfo.label}</Badge>;
  };

  const todosDocumentos = documentos ? [
    ...documentos.denuncias.map(d => ({ ...d, id: d.nrDenuncia, tipo: 'denuncia' })),
    ...documentos.atendimentos.map(a => ({ ...a, id: a.idAtendimento, tipo: 'atendimento' })),
    ...documentos.notificacoes.map(n => ({ ...n, id: n.id, tipo: 'notificacao' })),
    ...documentos.termosMedidasMenor.map(t => ({ ...t, id: t.idmedida_aplicada, tipo: 'termo-medidas-menor' })),
    ...documentos.termosMedidasResponsavel.map(t => ({ ...t, id: t.idmedida_aplicada, tipo: 'termo-medidas-responsavel' }))
  ].sort((a, b) => {
    const dataA = a.Data || a.data || new Date(0);
    const dataB = b.Data || b.data || new Date(0);
    return new Date(dataB) - new Date(dataA);
  }) : [];

  // Função para filtrar documentos
  const filtrarDocumentos = (docs) => {
    let filtrados = docs;

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(doc => doc.tipo === filtroTipo);
    }

    // Filtro por pesquisa
    if (termoPesquisa.trim() !== '') {
      const termo = termoPesquisa.toLowerCase();
      filtrados = filtrados.filter(doc => {
        const id = String(doc.nrDenuncia || doc.idAtendimento || doc.id || doc.idmedida_aplicada || '').toLowerCase();
        const descricao = String(doc.DescricaoFato || doc.Relato || doc.descricao || doc.recebedor || '').toLowerCase();
        const data = formatarData(doc.Data || doc.data).toLowerCase();
        return id.includes(termo) || descricao.includes(termo) || data.includes(termo);
      });
    }

    return filtrados;
  };

  const documentosFiltrados = filtrarDocumentos(todosDocumentos);

  if (loading) {
    return (
      <div className="visualizar-documentos-background">
        <Container className="visualizar-documentos-container text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <p className="mt-3">Carregando documentos...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualizar-documentos-background">
        <Container className="visualizar-documentos-container">
          <Alert variant="danger">
            <Alert.Heading>Erro!</Alert.Heading>
            <p>{error}</p>
            <Button onClick={carregarDocumentos} variant="outline-danger">
              Tentar Novamente
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="visualizar-documentos-background">
      <Container className="visualizar-documentos-container">
        <Card className="visualizar-documentos-card">
          <Card.Header className="visualizar-documentos-header">
            <h2 className="visualizar-documentos-title mb-0 text-white">
              <i className="bi bi-file-earmark-text me-2 text-white"></i>
              Documentos Salvos
            </h2>
          </Card.Header>
          <Card.Body className="p-4">
            {/* Barra de pesquisa e filtro */}
            <div className="search-filter-container">
              <div className="row g-3">
                <div className="col-md-8">
                  <InputGroup className="search-input-group">
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Pesquisar por ID, descrição ou data..."
                      value={termoPesquisa}
                      onChange={(e) => setTermoPesquisa(e.target.value)}
                    />
                  </InputGroup>
                </div>
                <div className="col-md-4">
                  <Form.Select
                    className="filter-select"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <option value="todos">Todos os tipos</option>
                    <option value="denuncia">Denúncia</option>
                    <option value="atendimento">Atendimento</option>
                    <option value="notificacao">Notificação</option>
                    <option value="termo-medidas-menor">Termo Medidas (Menor)</option>
                    <option value="termo-medidas-responsavel">Termo Medidas (Responsável)</option>
                  </Form.Select>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="mb-0">
                {documentosFiltrados.length === todosDocumentos.length ? (
                  <>Total de documentos: <strong>{todosDocumentos.length}</strong></>
                ) : (
                  <>
                    Mostrando <strong>{documentosFiltrados.length}</strong> de <strong>{todosDocumentos.length}</strong> documentos
                  </>
                )}
              </p>
              <Button 
                variant="outline-primary" 
                onClick={carregarDocumentos}
                className="btn-refresh"
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar
              </Button>
            </div>

            {todosDocumentos.length === 0 ? (
              <Alert variant="info">
                Nenhum documento encontrado. Os documentos aparecerão aqui após serem salvos.
              </Alert>
            ) : documentosFiltrados.length === 0 ? (
              <Alert variant="warning">
                Nenhum documento encontrado com os filtros aplicados. Tente ajustar sua pesquisa.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover className="documentos-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>ID</th>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosFiltrados.map((doc, index) => (
                      <tr key={`${doc.tipo}-${doc.id}-${index}`}>
                        <td>{getTipoBadge(doc.tipo)}</td>
                        <td>
                          {doc.nrDenuncia || doc.idAtendimento || doc.id || doc.idmedida_aplicada}
                        </td>
                        <td>
                          {formatarData(doc.Data || doc.data)}
                        </td>
                        <td>
                          <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.DescricaoFato || doc.Relato || doc.descricao || doc.recebedor || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="btn-pdf"
                            onClick={() => {
                              try {
                                gerarPDF(doc);
                              } catch (error) {
                                console.error('Erro ao gerar PDF:', error);
                                alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
                              }
                            }}
                          >
                            <i className="bi bi-file-earmark-pdf me-1"></i>
                            Gerar PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {documentos && (
              <div className="mt-4 resumo-badges">
                <h5>Resumo por Tipo:</h5>
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg="danger">Denúncias: {documentos.denuncias.length}</Badge>
                  <Badge bg="primary">Atendimentos: {documentos.atendimentos.length}</Badge>
                  <Badge bg="warning">Notificações: {documentos.notificacoes.length}</Badge>
                  <Badge bg="info">Termos Medidas (Menor): {documentos.termosMedidasMenor.length}</Badge>
                  <Badge bg="success">Termos Medidas (Responsável): {documentos.termosMedidasResponsavel.length}</Badge>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default VisualizarDocumentos;

