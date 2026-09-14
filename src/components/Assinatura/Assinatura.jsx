import React, { useState, useRef } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Assinatura({ onAssinaturaChange, tipoAssinatura: initialTipo = 'certificado', nomeAssinatura: initialNome = '', imagemAssinatura: initialImagem = null, certificado: initialCertificado = null }) {
  const [tipoAssinatura, setTipoAssinatura] = useState(initialTipo);
  const [nomeAssinatura, setNomeAssinatura] = useState(initialNome);
  const [imagemAssinatura, setImagemAssinatura] = useState(initialImagem);
  const [previewImagem, setPreviewImagem] = useState(initialImagem);
  const [certificado, setCertificado] = useState(initialCertificado);
  const [senhaCertificado, setSenhaCertificado] = useState('');
  const [infoCertificado, setInfoCertificado] = useState(null);
  const fileInputRef = useRef(null);
  const certificadoInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleTipoChange = (e) => {
    const novoTipo = e.target.value;
    setTipoAssinatura(novoTipo);
    if (novoTipo === 'digital' || novoTipo === 'certificado') {
      setImagemAssinatura(null);
      setPreviewImagem(null);
    }
    if (novoTipo !== 'certificado') {
      setCertificado(null);
      setInfoCertificado(null);
      setSenhaCertificado('');
    }
    onAssinaturaChange({
      tipo: novoTipo,
      nome: nomeAssinatura,
      imagem: null,
      certificado: novoTipo === 'certificado' ? certificado : null,
      senhaCertificado: novoTipo === 'certificado' ? senhaCertificado : ''
    });
  };

  const handleNomeChange = (e) => {
    const nome = e.target.value;
    setNomeAssinatura(nome);
    onAssinaturaChange({
      tipo: tipoAssinatura,
      nome: nome,
      imagem: imagemAssinatura
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagemAssinatura(base64String);
        setPreviewImagem(base64String);
        onAssinaturaChange({
          tipo: tipoAssinatura,
          nome: nomeAssinatura,
          imagem: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasMouseDown = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      const base64String = canvas.toDataURL();
      setImagemAssinatura(base64String);
      setPreviewImagem(base64String);
      onAssinaturaChange({
        tipo: tipoAssinatura,
        nome: nomeAssinatura,
        imagem: base64String
      });
    }
  };

  const limparCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setImagemAssinatura(null);
    setPreviewImagem(null);
    onAssinaturaChange({
      tipo: tipoAssinatura,
      nome: nomeAssinatura,
      imagem: null,
      certificado: certificado,
      senhaCertificado: senhaCertificado
    });
  };

  const handleCertificadoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        setCertificado(base64);
        
        // Tentar ler informações básicas do certificado
        // Nota: Leitura completa de certificado requer biblioteca específica
        setInfoCertificado({
          nome: file.name,
          tamanho: file.size,
          tipo: file.type || 'application/x-pkcs12'
        });
        
        onAssinaturaChange({
          tipo: tipoAssinatura,
          nome: nomeAssinatura,
          imagem: imagemAssinatura,
          certificado: base64,
          senhaCertificado: senhaCertificado
        });
      } catch (error) {
        console.error('Erro ao carregar certificado:', error);
        alert('Erro ao carregar certificado. Verifique se o arquivo é válido.');
      }
    }
  };

  const handleSenhaCertificadoChange = (e) => {
    const senha = e.target.value;
    setSenhaCertificado(senha);
    onAssinaturaChange({
      tipo: tipoAssinatura,
      nome: nomeAssinatura,
      imagem: imagemAssinatura,
      certificado: certificado,
      senhaCertificado: senha
    });
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-pen me-2"></i>
          Assinatura do Conselheiro Tutelar
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md="6">
            <Form.Label>Tipo de Assinatura</Form.Label>
            <Form.Select
              value={tipoAssinatura}
              onChange={handleTipoChange}
              required
            >
              <option value="certificado">Assinatura Digital com Certificado ICP-Brasil</option>
              <option value="digital">Assinatura Digital (Texto)</option>
              <option value="fisica">Assinatura Física (Imagem)</option>
            </Form.Select>
          </Col>
        </Row>

        {tipoAssinatura === 'certificado' ? (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-shield-check me-2 text-success"></i>
                Certificado Digital ICP-Brasil (.p12 ou .pfx)
              </Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Button
                  variant="outline-success"
                  onClick={() => certificadoInputRef.current?.click()}
                >
                  <i className="bi bi-upload me-2"></i>
                  Carregar Certificado
                </Button>
                {certificado && (
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      setCertificado(null);
                      setInfoCertificado(null);
                      setSenhaCertificado('');
                      if (certificadoInputRef.current) {
                        certificadoInputRef.current.value = '';
                      }
                      onAssinaturaChange({
                        tipo: tipoAssinatura,
                        nome: nomeAssinatura,
                        imagem: imagemAssinatura,
                        certificado: null,
                        senhaCertificado: ''
                      });
                    }}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Remover
                  </Button>
                )}
              </div>
              <input
                ref={certificadoInputRef}
                type="file"
                accept=".p12,.pfx,application/x-pkcs12"
                onChange={handleCertificadoChange}
                style={{ display: 'none' }}
              />
              {infoCertificado && (
                <div className="alert alert-info mt-2">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Certificado carregado:</strong> {infoCertificado.nome}
                  <br />
                  <small>Tamanho: {(infoCertificado.tamanho / 1024).toFixed(2)} KB</small>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha do Certificado</Form.Label>
              <Form.Control
                type="password"
                value={senhaCertificado}
                onChange={handleSenhaCertificadoChange}
                placeholder="Digite a senha do certificado"
                required={!!certificado}
              />
              <Form.Text className="text-muted">
                <i className="bi bi-lock me-1"></i>
                A senha é necessária para validar e usar o certificado digital
              </Form.Text>
            </Form.Group>
            {certificado && (
              <div className="alert alert-success">
                <i className="bi bi-shield-check me-2"></i>
                <strong>Certificado Digital ICP-Brasil</strong>
                <br />
                <small>O documento será assinado digitalmente com este certificado, garantindo autenticidade e integridade.</small>
              </div>
            )}
          </div>
        ) : tipoAssinatura === 'digital' ? (
          <Form.Group className="mb-3">
            <Form.Label>Nome do Conselheiro Tutelar</Form.Label>
            <Form.Control
              type="text"
              value={nomeAssinatura}
              onChange={handleNomeChange}
              placeholder="Digite o nome completo do conselheiro"
              required
            />
            <Form.Text className="text-muted">
              Esta assinatura aparecerá no PDF como texto
            </Form.Text>
          </Form.Group>
        ) : (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Assinatura Física</Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Button
                  variant="outline-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="bi bi-upload me-2"></i>
                  Carregar Imagem
                </Button>
                {previewImagem && (
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      setImagemAssinatura(null);
                      setPreviewImagem(null);
                      limparCanvas();
                    }}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Limpar
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Form.Group>

            {previewImagem ? (
              <div className="mb-3">
                <img
                  src={previewImagem}
                  alt="Assinatura"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '150px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
            ) : (
              <div className="mb-3">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  style={{
                    border: '2px dashed #ccc',
                    borderRadius: '4px',
                    cursor: 'crosshair',
                    backgroundColor: '#fff'
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
                <Form.Text className="text-muted">
                  Desenhe sua assinatura no canvas acima, ou carregue uma imagem
                </Form.Text>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default Assinatura;

