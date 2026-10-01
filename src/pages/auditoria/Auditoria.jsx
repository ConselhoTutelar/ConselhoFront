import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import { buscarLogsAuditoria, verificarIntegridadeAuditoria, buscarEstatisticasAuditoria } from '../../api/auditoria';
import './Auditoria.css';

function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estatísticas
  const [stats, setStats] = useState({
    totalEventos: 0,
    eventosHoje: 0,
    alertasSeguranca: 0,
    totalMandatosRegistrados: 0
  });

  // Integridade
  const [verificandoIntegridade, setVerificandoIntegridade] = useState(false);
  const [resultadoIntegridade, setResultadoIntegridade] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    search: '',
    acao: 'todos',
    status: 'todos',
    mandato: 'todos',
    dataInicio: '',
    dataFim: '',
    limit: 50,
    offset: 0
  });

  // Modal de Detalhes
  const [logSelecionado, setLogSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    carregarDados();
    carregarEstatisticas();
  }, []);

  const carregarDados = async (novosFiltros = filtros) => {
    try {
      setLoading(true);
      setError(null);
      const res = await buscarLogsAuditoria(novosFiltros);
      setLogs(res.logs || []);
      setTotalLogs(res.total || 0);
    } catch (err) {
      console.error('Erro ao buscar logs de auditoria:', err);
      setError(err.message || 'Erro ao comunicar com o servidor de auditoria.');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const dadosStats = await buscarEstatisticasAuditoria();
      setStats(dadosStats);
    } catch (err) {
      console.warn('Não foi possível obter estatísticas de auditoria:', err.message);
    }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    const filtrosAtualizados = { ...filtros, offset: 0 };
    setFiltros(filtrosAtualizados);
    carregarDados(filtrosAtualizados);
  };

  const handleLimparFiltros = () => {
    const filtrosPadrao = {
      search: '',
      acao: 'todos',
      status: 'todos',
      mandato: 'todos',
      dataInicio: '',
      dataFim: '',
      limit: 50,
      offset: 0
    };
    setFiltros(filtrosPadrao);
    carregarDados(filtrosPadrao);
  };

  const handleVerificarIntegridade = async () => {
    try {
      setVerificandoIntegridade(true);
      const resultado = await verificarIntegridadeAuditoria();
      setResultadoIntegridade(resultado);
    } catch (err) {
      alert(`Erro na validação da cadeia: ${err.message}`);
    } finally {
      setVerificandoIntegridade(false);
    }
  };

  const formatarDataHora = (dataStr) => {
    if (!dataStr) return 'N/A';
    const d = new Date(dataStr);
    return d.toLocaleString('pt-BR');
  };

  const getAcaoBadge = (acao) => {
    if (acao.includes('LOGIN')) return <Badge bg="info">{acao}</Badge>;
    if (acao.includes('CRIAR') || acao.includes('CADASTRAR') || acao.includes('REGISTRAR')) return <Badge bg="success">{acao}</Badge>;
    if (acao.includes('ATUALIZAR') || acao.includes('EDITAR')) return <Badge bg="warning" text="dark">{acao}</Badge>;
    if (acao.includes('EXCLUIR') || acao.includes('DELETAR')) return <Badge bg="danger">{acao}</Badge>;
    if (acao.includes('CONSULTAR') || acao.includes('VISUALIZAR')) return <Badge bg="secondary">{acao}</Badge>;
    return <Badge bg="dark">{acao}</Badge>;
  };

  const getStatusBadge = (status) => {
    if (status === 'SUCESSO') return <span className="badge bg-success-subtle text-success border border-success-subtle">SUCESSO</span>;
    if (status === 'ACESSO_NEGADO') return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">ACESSO NEGADO</span>;
    return <span className="badge bg-warning-subtle text-warning border border-warning-subtle">{status || 'FALHA'}</span>;
  };

  const handleAbrirDetalhes = (log) => {
    setLogSelecionado(log);
    setModalAberto(true);
  };

  return (
    <Container fluid className="auditoria-container py-3">
      <Card className="shadow-lg border-0 p-4 bg-white" style={{ borderRadius: '16px' }}>
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#3159A3' }}>
            <i className="bi bi-shield-lock-fill me-2"></i>Trilha de Auditoria & Segurança Permanente
          </h2>
          <p className="text-muted small mb-0">
            Registro contínuo e imutável de todas as ações e acessos para conformidade com ECA, LGPD e transição transparente de mandatos.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={handleVerificarIntegridade}
            disabled={verificandoIntegridade}
            className="d-flex align-items-center gap-2"
          >
            {verificandoIntegridade ? (
              <>
                <Spinner size="sm" animation="border" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <i className="bi bi-link-45deg fs-5"></i>
                <span>Verificar Cadeia SHA-256</span>
              </>
            )}
          </Button>
          <Button
            variant="primary"
            onClick={() => window.print()}
            style={{ backgroundColor: '#3159A3', borderColor: '#3159A3' }}
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-printer-fill"></i>
            <span>Exportar Relatório</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Integridade Criptográfica */}
      {resultadoIntegridade && (
        <Alert
          variant={resultadoIntegridade.integra ? 'success' : 'danger'}
          dismissible
          onClose={() => setResultadoIntegridade(null)}
          className="mb-4 shadow-sm"
        >
          <div className="d-flex align-items-center">
            <i className={`bi ${resultadoIntegridade.integra ? 'bi-patch-check-fill' : 'bi-exclamation-octagon-fill'} fs-3 me-3`}></i>
            <div>
              <h6 className="fw-bold mb-0">
                {resultadoIntegridade.integra ? 'Cadeia de Auditoria Verificada e 100% Íntegra' : 'Alerta de Violação de Integridade'}
              </h6>
              <small>{resultadoIntegridade.mensagem} (Total de {resultadoIntegridade.totalLogs} registros validados).</small>
            </div>
          </div>
        </Alert>
      )}

      {/* Cards de Métricas e Conformidade */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} lg={3}>
          <div className="auditoria-card-stat p-3 shadow-sm">
            <span className="text-muted small text-uppercase fw-semibold">Total de Registros</span>
            <h3 className="fw-bold mt-1 mb-0" style={{ color: '#3159A3' }}>{stats.totalEventos || totalLogs}</h3>
            <small className="text-muted" style={{ fontSize: '11px' }}>Registros preservados permanentemente</small>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="auditoria-card-stat p-3 shadow-sm">
            <span className="text-muted small text-uppercase fw-semibold">Eventos Hoje</span>
            <h3 className="fw-bold mt-1 mb-0 text-success">{stats.eventosHoje || 0}</h3>
            <small className="text-muted" style={{ fontSize: '11px' }}>Operações do plantão atual</small>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="auditoria-card-stat p-3 shadow-sm">
            <span className="text-muted small text-uppercase fw-semibold">Alertas de Acesso</span>
            <h3 className="fw-bold mt-1 mb-0 text-danger">{stats.alertasSeguranca || 0}</h3>
            <small className="text-muted" style={{ fontSize: '11px' }}>Tentativas não autorizadas bloqueadas</small>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="auditoria-card-stat p-3 shadow-sm">
            <span className="text-muted small text-uppercase fw-semibold">Mandatos Catalogados</span>
            <h3 className="fw-bold mt-1 mb-0 text-info">{stats.totalMandatosRegistrados || 1}</h3>
            <small className="text-muted" style={{ fontSize: '11px' }}>Gestões documentadas no banco</small>
          </div>
        </Col>
      </Row>

      {/* Caixa de Filtros */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Form onSubmit={handleFiltrar}>
            <Row className="g-2">
              <Col md={4} sm={12}>
                <Form.Label className="small fw-semibold text-muted mb-1">Palavra-Chave / Operador</Form.Label>
                <InputGroup>
                  <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                  <Form.Control
                    size="sm"
                    placeholder="Buscar por nome, CPF, recurso ou ação..."
                    value={filtros.search}
                    onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                  />
                </InputGroup>
              </Col>
              <Col md={2} sm={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Tipo de Ação</Form.Label>
                <Form.Select
                  size="sm"
                  value={filtros.acao}
                  onChange={(e) => setFiltros({ ...filtros, acao: e.target.value })}
                >
                  <option value="todos">Todas as Ações</option>
                  <option value="LOGIN_SUCESSO">Login Efetuado</option>
                  <option value="LOGIN_FALHA">Tentativa de Login Falha</option>
                  <option value="REGISTRAR_DENUNCIA">Registro de Denúncia</option>
                  <option value="REGISTRAR_ATENDIMENTO">Registro de Atendimento</option>
                  <option value="EMITIR_NOTIFICACAO">Emissão de Notificação</option>
                  <option value="APLICAR_MEDIDA_MENOR">Medida para Menor</option>
                  <option value="APLICAR_MEDIDA_RESPONSAVEL">Medida para Pais/Resp.</option>
                  <option value="CADASTRAR_PROFISSIONAL">Cadastro de Profissional</option>
                  <option value="ATUALIZAR_PROFISSIONAL">Atualização de Profissional</option>
                  <option value="EXCLUIR_PROFISSIONAL">Exclusão de Profissional</option>
                  <option value="CONSULTAR_DOCUMENTOS">Consulta de Documentos</option>
                  <option value="ACESSO_NEGADO_ROLE">Tentativa Não Autorizada</option>
                </Form.Select>
              </Col>
              <Col md={2} sm={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Status da Operação</Form.Label>
                <Form.Select
                  size="sm"
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                >
                  <option value="todos">Todos os Status</option>
                  <option value="SUCESSO">Sucesso</option>
                  <option value="ACESSO_NEGADO">Acesso Negado</option>
                  <option value="FALHA">Falha</option>
                </Form.Select>
              </Col>
              <Col md={2} sm={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Data Início</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                />
              </Col>
              <Col md={2} sm={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Data Fim</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button size="sm" variant="outline-secondary" onClick={handleLimparFiltros}>
                Limpar Filtros
              </Button>
              <Button size="sm" variant="primary" type="submit" style={{ backgroundColor: '#3159A3', borderColor: '#3159A3' }}>
                <i className="bi bi-funnel-fill me-1"></i>Aplicar Filtros
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erro na consulta da trilha</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {/* Tabela de Auditoria */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Carregando trilha de auditoria...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder-x fs-1 d-block mb-2"></i>
              <p className="mb-0">Nenhum evento registrado encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="audit-table mb-0">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Operador Histórico</th>
                    <th>Mandato / Gestão</th>
                    <th>Ação Executada</th>
                    <th>Recurso</th>
                    <th>IP / Origem</th>
                    <th>Status</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.idLog}>
                      <td className="text-nowrap font-monospace small">
                        {formatarDataHora(log.dataHora)}
                      </td>
                      <td>
                        <strong className="d-block text-dark">{log.usuarioNome || log.username}</strong>
                        <small className="text-muted">{log.usuarioCargo || log.role}</small>
                      </td>
                      <td>
                        <span className="badge badge-mandato">
                          {log.mandatoGestao || 'Gestão Vigente'}
                        </span>
                      </td>
                      <td>{getAcaoBadge(log.acao)}</td>
                      <td>
                        <span className="text-dark small">{log.recurso}</span>
                        {log.idRecurso && <small className="text-muted d-block">ID #{log.idRecurso}</small>}
                      </td>
                      <td className="small font-monospace text-muted">{log.ip || '127.0.0.1'}</td>
                      <td>{getStatusBadge(log.status)}</td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="py-1 px-2"
                          onClick={() => handleAbrirDetalhes(log)}
                        >
                          <i className="bi bi-eye"></i> Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <small className="text-muted">
            Exibindo {logs.length} de {totalLogs} registros catalogados no banco de dados
          </small>
        </Card.Footer>
      </Card>

      {/* Modal de Detalhes da Auditoria */}
      <Modal show={modalAberto} onHide={() => setModalAberto(false)} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#f8fafc' }}>
          <Modal.Title className="h5 fw-bold" style={{ color: '#3159A3' }}>
            <i className="bi bi-file-earmark-text me-2"></i>Detalhes do Registro de Auditoria #{logSelecionado?.idLog}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {logSelecionado && (
            <div>
              {/* Snapshot do Operador */}
              <h6 className="fw-bold text-uppercase text-muted border-bottom pb-1" style={{ fontSize: '12px' }}>
                Snapshot Histórico do Operador (Válido na Data do Registro)
              </h6>
              <Row className="mb-3">
                <Col sm={6}>
                  <p className="mb-1"><strong>Nome:</strong> {logSelecionado.usuarioNome || logSelecionado.username}</p>
                  <p className="mb-1"><strong>Cargo/Função:</strong> {logSelecionado.usuarioCargo || logSelecionado.role}</p>
                  <p className="mb-0"><strong>CPF Cadastrado:</strong> {logSelecionado.usuarioCpf || 'Não informado'}</p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Mandato da Ação:</strong> <span className="badge badge-mandato">{logSelecionado.mandatoGestao}</span></p>
                  <p className="mb-1"><strong>Papel no Sistema:</strong> <span className="badge bg-secondary">{logSelecionado.role}</span></p>
                  <p className="mb-0"><strong>ID Usuário:</strong> #{logSelecionado.usuarioId || 'N/A'}</p>
                </Col>
              </Row>

              {/* Informações da Ação */}
              <h6 className="fw-bold text-uppercase text-muted border-bottom pb-1" style={{ fontSize: '12px' }}>
                Dados da Transação
              </h6>
              <Row className="mb-3">
                <Col sm={6}>
                  <p className="mb-1"><strong>Ação:</strong> {getAcaoBadge(logSelecionado.acao)}</p>
                  <p className="mb-1"><strong>Recurso:</strong> {logSelecionado.recurso}</p>
                  <p className="mb-0"><strong>ID do Recurso:</strong> {logSelecionado.idRecurso || 'Geral'}</p>
                </Col>
                <Col sm={6}>
                  <p className="mb-1"><strong>Data e Hora:</strong> {formatarDataHora(logSelecionado.dataHora)}</p>
                  <p className="mb-1"><strong>Endereço IP:</strong> {logSelecionado.ip || '127.0.0.1'}</p>
                  <p className="mb-0"><strong>Status:</strong> {getStatusBadge(logSelecionado.status)}</p>
                </Col>
              </Row>

              {/* Detalhes / Payload */}
              {logSelecionado.detalhes && (
                <div className="mb-3">
                  <h6 className="fw-bold text-uppercase text-muted border-bottom pb-1" style={{ fontSize: '12px' }}>
                    Metadados da Operação
                  </h6>
                  <pre className="p-3 bg-light rounded border small mb-0" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(logSelecionado.detalhes), null, 2);
                      } catch {
                        return logSelecionado.detalhes;
                      }
                    })()}
                  </pre>
                </div>
              )}

              {/* Snapshot Antes/Depois (se houver) */}
              {(logSelecionado.dadosAntes || logSelecionado.dadosDepois) && (
                <Row className="mb-3">
                  {logSelecionado.dadosAntes && (
                    <Col sm={6}>
                      <h6 className="fw-bold text-danger" style={{ fontSize: '12px' }}>Estado Anterior (Antes)</h6>
                      <pre className="p-2 bg-light rounded border small" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        {typeof logSelecionado.dadosAntes === 'object' ? JSON.stringify(logSelecionado.dadosAntes, null, 2) : logSelecionado.dadosAntes}
                      </pre>
                    </Col>
                  )}
                  {logSelecionado.dadosDepois && (
                    <Col sm={6}>
                      <h6 className="fw-bold text-success" style={{ fontSize: '12px' }}>Estado Posterior (Depois)</h6>
                      <pre className="p-2 bg-light rounded border small" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        {typeof logSelecionado.dadosDepois === 'object' ? JSON.stringify(logSelecionado.dadosDepois, null, 2) : logSelecionado.dadosDepois}
                      </pre>
                    </Col>
                  )}
                </Row>
              )}

              {/* Integridade Criptográfica do Registro */}
              <h6 className="fw-bold text-uppercase text-muted border-bottom pb-1" style={{ fontSize: '12px' }}>
                Integridade Criptográfica (SHA-256 Anti-Adulteração)
              </h6>
              <div className="bg-light p-2 rounded border small">
                <div className="mb-1">
                  <strong>Hash do Registro Atual:</strong><br />
                  <code className="text-primary">{logSelecionado.hashRegistro || 'HASH_CALCULADO_NO_SISTEMA'}</code>
                </div>
                <div>
                  <strong>Hash do Registro Anterior (Cadeia):</strong><br />
                  <code className="text-secondary">{logSelecionado.hashAnterior || 'GENESIS'}</code>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalAberto(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
      </Card>
    </Container>
  );
}

export default Auditoria;
