import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style.css';
import { assinaturaPadrao } from '../../../utils/assinaturaPadrao';
import { obterHoraAtual } from '../../../utils/dataHora';
import { geocodificarEnderecoAPI } from '../../../api/marcadores';
import { buscarConselheiros } from '../../../api/conselheiros';

// Ícone personalizado moderno para o pino de denúncia
const denunciaPinIcon = L.divIcon({
  className: 'custom-denuncia-pin',
  html: `<div style="
    background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #ffffff;
    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  "><div style="
    width: 10px;
    height: 10px;
    background: #ffffff;
    border-radius: 50%;
    transform: rotate(45deg);
  "></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Componente para recentralizar o mapa suavemente
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, 16, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

// Marcador interativo que responde a clique e arrasto
function DraggablePin({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={denunciaPinIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const latlng = e.target.getLatLng();
          onPositionChange({ lat: latlng.lat, lng: latlng.lng });
        }
      }}
    >
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ color: '#e11d48' }}>📍 Local da Ocorrência</strong>
          <br />
          <small>Arraste este pino ou clique no mapa para ajustar com precisão.</small>
        </div>
      </Popup>
    </Marker>
  );
}

function RecebimentoDenuncia() {
  const PANAMBI_CENTRO = { lat: -28.2916, lng: -53.5014 };

  const [formData, setFormData] = useState({
    dataDenuncia: '',
    horaDenuncia: obterHoraAtual(),
    tipoPessoa: 'identificada',
    identificacaoDenunciante: '',
    fatos: '',
    nomeDataNascimentoCriancaAdolescente: '',
    nomesPaisResponsaveis: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: 'Panambi',
    conselheiroRecebeu: '',
    dataAveriguacao: '',
    conselheiroEfetuouAveriguacao: ''
  });

  const [pinPosition, setPinPosition] = useState(PANAMBI_CENTRO);
  const [mapCenter, setMapCenter] = useState([PANAMBI_CENTRO.lat, PANAMBI_CENTRO.lng]);
  const [isLocating, setIsLocating] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState(null);

  const [listaConselheiros, setListaConselheiros] = useState([]);
  const [conselheiroQuery, setConselheiroQuery] = useState('');

  useEffect(() => {
    async function carregarListaConselheiros() {
      try {
        const dados = await buscarConselheiros();
        if (Array.isArray(dados) && dados.length > 0) {
          const unicos = [];
          const nomesVistos = new Set();
          for (const item of dados) {
            const nome = item.nomeConselheiro || item.nome;
            if (nome && !nomesVistos.has(nome.toLowerCase().trim())) {
              nomesVistos.add(nome.toLowerCase().trim());
              unicos.push({
                idConselheiro: item.idConselheiro || item.idUsuario,
                nomeConselheiro: nome.trim(),
                cargo: item.cargo === 'secretario' ? 'Secretário/a' : (item.cargo || 'Conselheiro/a')
              });
            }
          }
          setListaConselheiros(unicos);
        }
      } catch (err) {
        console.warn('Aviso: Não foi possível carregar conselheiros para o seletor:', err);
      }
    }
    carregarListaConselheiros();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBuscarEnderecoNoMapa = async () => {
    const enderecoBusca = [formData.rua, formData.numero, formData.bairro, formData.cidade || 'Panambi', 'RS']
      .filter(Boolean)
      .join(', ');

    if (!formData.rua && !formData.bairro) {
      setGeoFeedback({
        tipo: 'warning',
        texto: 'Por favor, informe ao menos o nome da Rua ou Bairro para buscar no mapa.'
      });
      return;
    }

    try {
      setIsLocating(true);
      setGeoFeedback({ tipo: 'info', texto: `Buscando "${enderecoBusca}" no mapa...` });
      
      const res = await geocodificarEnderecoAPI(enderecoBusca);
      
      if (res?.latitude && res?.longitude) {
        const novaPos = { lat: parseFloat(res.latitude), lng: parseFloat(res.longitude) };
        setPinPosition(novaPos);
        setMapCenter([novaPos.lat, novaPos.lng]);
        setGeoFeedback({
          tipo: res.sucesso ? 'success' : 'warning',
          texto: res.sucesso 
            ? `Endereço localizado com sucesso! Coordenadas: [${novaPos.lat.toFixed(5)}, ${novaPos.lng.toFixed(5)}]`
            : (res.mensagem || 'Endereço aproximado encontrado. Ajuste o pino no mapa se desejar.')
        });
      } else {
        setGeoFeedback({
          tipo: 'warning',
          texto: 'Endereço exato não encontrado. Você pode clicar no mapa ou arrastar o pino vermelho para marcar a rua exata.'
        });
      }
    } catch (err) {
      console.error('Erro ao buscar coordenadas:', err);
      setGeoFeedback({
        tipo: 'danger',
        texto: 'Não foi possível buscar automaticamente. Por favor, marque o local desejado clicando no mapa.'
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { enviarDenuncia } = await import('../../../api/denuncia');
      // Combinar campos de endereço para enviar ao backend
      const enderecoCompleto = `${formData.rua}, ${formData.numero}, ${formData.bairro}, ${formData.cidade || 'Panambi'}, RS`;
      
      await enviarDenuncia({
        ...formData,
        endereco: enderecoCompleto,
        latitude: pinPosition.lat,
        conselheiroRecebeu: formData.conselheiroRecebeu || conselheiroQuery,
        conselheiroEfetuouAveriguacao: formData.conselheiroEfetuouAveriguacao,
        assinatura: assinaturaPadrao
      });

      alert('Denúncia salva com sucesso e georreferenciada no mapa de ocorrências!');
      // Reset form
      setFormData({
        dataDenuncia: '',
        horaDenuncia: obterHoraAtual(),
        tipoPessoa: 'identificada',
        identificacaoDenunciante: '',
        fatos: '',
        nomeDataNascimentoCriancaAdolescente: '',
        nomesPaisResponsaveis: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: 'Panambi',
        conselheiroRecebeu: '',
        dataAveriguacao: '',
        conselheiroEfetuouAveriguacao: ''
      });
      setConselheiroQuery('');
      setPinPosition(PANAMBI_CENTRO);
      setMapCenter([PANAMBI_CENTRO.lat, PANAMBI_CENTRO.lng]);
      setGeoFeedback(null);
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error);
      alert('Erro ao salvar denúncia. Tente novamente.');
    }
  };

  return (
    <Container className="my-5 form-container">
      <Card className="shadow-lg p-4 form-card">
        <Card.Body>
          <h2 className="text-center mb-4 text-primary">
          <i className="bi bi-shield-check me-2"></i>FICHA RECEBIMENTO DE DENÚNCIA
          </h2>
          <p className="text-center text-muted mb-4">
            Conselho Tutelar - Panambi | Rua: Hermann Mayer, 43, Térreo, Centro, Panambi/RS.
            <br />
            Fone (55) 3375 6592/84195737 Email: conselhotutelar@panambi.rs.gov.br
          </p>

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6">
                <Form.Label>Data e Hora da Denúncia</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="date"
                    name="dataDenuncia"
                    value={formData.dataDenuncia}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control
                    type="time"
                    name="horaDenuncia"
                    value={formData.horaDenuncia}
                    onChange={handleChange}
                    className="ms-2"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group as={Col} md="6">
                <Form.Label>Tipo de Denunciante</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Pessoa identificada"
                    name="tipoPessoa"
                    id="radioIdentificada"
                    value="identificada"
                    checked={formData.tipoPessoa === 'identificada'}
                    onChange={handleChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Anônima"
                    name="tipoPessoa"
                    id="radioAnonima"
                    value="anonima"
                    checked={formData.tipoPessoa === 'anonima'}
                    onChange={handleChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Telefone"
                    name="tipoPessoa"
                    id="radioTelefone"
                    value="telefone"
                    checked={formData.tipoPessoa === 'telefone'}
                    onChange={handleChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Pessoalmente"
                    name="tipoPessoa"
                    id="radioPessoalmente"
                    value="pessoalmente"
                    checked={formData.tipoPessoa === 'pessoalmente'}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
            </Row>

            {formData.tipoPessoa === 'identificada' && (
              <Form.Group className="mb-3" controlId="formIdentificacaoDenunciante">
                <Form.Label>Identificação do Denunciante</Form.Label>
                <Form.Control
                  type="text"
                  name="identificacaoDenunciante"
                  value={formData.identificacaoDenunciante}
                  onChange={handleChange}
                  placeholder="Nome completo ou informações de identificação"
                  required={formData.tipoPessoa === 'identificada'}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="formFatos">
              <Form.Label>Fatos da Denúncia</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="fatos"
                value={formData.fatos}
                onChange={handleChange}
                placeholder="Descreva detalhadamente os fatos da denúncia..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNomeDataNascimentoCriancaAdolescente">
              <Form.Label>Nome(s) e Data(s) de Nascimento da(s) Criança(s) / Adolescente(s) com suspeita de violação</Form.Label>
              <Form.Control
                type="text"
                name="nomeDataNascimentoCriancaAdolescente"
                value={formData.nomeDataNascimentoCriancaAdolescente}
                onChange={handleChange}
                placeholder="Ex: João da Silva (01/01/2010), Maria Souza (05/03/2015)"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNomesPaisResponsaveis">
              <Form.Label>Nome(s) dos Pais ou Responsáveis</Form.Label>
              <Form.Control
                type="text"
                name="nomesPaisResponsaveis"
                value={formData.nomesPaisResponsaveis}
                onChange={handleChange}
                placeholder="Ex: Ana Paula Pereira, Carlos Alberto Lima"
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="formRua">
                <Form.Label>Rua</Form.Label>
                <Form.Control
                  type="text"
                  name="rua"
                  value={formData.rua}
                  onChange={handleChange}
                  placeholder="Nome da rua"
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="3" controlId="formNumero">
                <Form.Label>Número</Form.Label>
                <Form.Control
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Número"
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="3" controlId="formBairro">
                <Form.Label>Bairro</Form.Label>
                <Form.Control
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                  required
                />
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formCidade">
              <Form.Label>Cidade</Form.Label>
              <Form.Control
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Cidade"
                required
              />
            </Form.Group>

            {/* SEÇÃO DO MAPA INTERATIVO PARA DEFINIÇÃO DO PIN */}
            <div className="p-3 mb-4 rounded-3 border" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: '#3159A3' }}>
                    <i className="bi bi-geo-alt-fill me-2 text-danger"></i>Localização da Denúncia no Mapa
                  </h6>
                  <small className="text-muted">
                    Defina o ponto exato da ocorrência para alimentar o mapa de calor e estatísticas.
                  </small>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleBuscarEnderecoNoMapa} 
                  disabled={isLocating}
                  className="d-flex align-items-center gap-2"
                >
                  {isLocating ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search"></i>
                      <span>Localizar Endereço no Mapa</span>
                    </>
                  )}
                </Button>
              </div>

              {geoFeedback && (
                <Alert variant={geoFeedback.tipo} className="py-2 px-3 mb-2 small" dismissible onClose={() => setGeoFeedback(null)}>
                  {geoFeedback.texto}
                </Alert>
              )}

              <div style={{ height: '300px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #94a3b8', position: 'relative' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <MapRecenter center={mapCenter} />
                  <DraggablePin position={pinPosition} onPositionChange={setPinPosition} />
                </MapContainer>
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 pt-1 border-top small text-muted">
                <div>
                  <i className="bi bi-info-circle me-1 text-primary"></i>
                  Clique no mapa ou arraste o <strong>pino vermelho</strong> para posicionar a denúncia.
                </div>
                <div className="badge bg-light text-dark border">
                  Coordenadas: {pinPosition.lat.toFixed(5)}, {pinPosition.lng.toFixed(5)}
                </div>
              </div>
            </div>

            <Row className="mb-3">
              <Form.Group as={Col} md="6">
                <Form.Label className="d-flex justify-content-between align-items-center mb-1">
                  <span>Conselheiro que recebeu a denúncia</span>
                  <span className="badge bg-light text-primary border" style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-people me-1"></i>Usuários do Sistema
                  </span>
                </Form.Label>

                {/* Dropdown Select com conselheiros cadastrados */}
                <Form.Select
                  className="mb-2"
                  value={
                    listaConselheiros.some(c => c.nomeConselheiro === (formData.conselheiroRecebeu || conselheiroQuery))
                      ? (formData.conselheiroRecebeu || conselheiroQuery)
                      : ((formData.conselheiroRecebeu || conselheiroQuery) ? 'outro' : '')
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'outro') {
                      // Mantém o campo livre para o usuário digitar
                    } else {
                      setConselheiroQuery(val);
                      setFormData(prev => ({ ...prev, conselheiroRecebeu: val }));
                    }
                  }}
                >
                  <option value="">-- Selecionar usuário/conselheiro do sistema --</option>
                  {listaConselheiros.map((c, idx) => (
                    <option key={c.idConselheiro || idx} value={c.nomeConselheiro}>
                      {c.nomeConselheiro} {c.cargo ? `(${c.cargo})` : ''}
                    </option>
                  ))}
                  <option value="outro">✍️ Outro (digitar nome diferente manualmente)</option>
                </Form.Select>

                {/* Input de texto liberado para digitar ou editar */}
                <Form.Control
                  type="text"
                  name="conselheiroRecebeu"
                  value={formData.conselheiroRecebeu || conselheiroQuery}
                  onChange={(e) => {
                    setConselheiroQuery(e.target.value);
                    setFormData(prev => ({ ...prev, conselheiroRecebeu: e.target.value }));
                  }}
                  placeholder="Ou digite o nome do conselheiro livremente..."
                  list="datalist-conselheiros-recebeu"
                  required
                />
                <datalist id="datalist-conselheiros-recebeu">
                  {listaConselheiros.map((c, idx) => (
                    <option key={idx} value={c.nomeConselheiro} />
                  ))}
                </datalist>
                <Form.Text className="text-muted small">
                  Selecione acima ou digite outro nome manualmente.
                </Form.Text>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="formGridDataAveriguacao">
                <Form.Label>Data da Averiguação</Form.Label>
                <Form.Control
                  type="date"
                  name="dataAveriguacao"
                  value={formData.dataAveriguacao}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="d-flex justify-content-between align-items-center mb-1">
                <span>Conselheiro Tutelar que efetuou Averiguação</span>
                <span className="badge bg-light text-primary border" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-people me-1"></i>Usuários do Sistema
                </span>
              </Form.Label>

              {/* Dropdown Select com conselheiros cadastrados */}
              <Form.Select
                className="mb-2"
                value={
                  listaConselheiros.some(c => c.nomeConselheiro === formData.conselheiroEfetuouAveriguacao)
                    ? formData.conselheiroEfetuouAveriguacao
                    : (formData.conselheiroEfetuouAveriguacao ? 'outro' : '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'outro') {
                    // Mantém o campo livre para o usuário digitar
                  } else {
                    setFormData(prev => ({ ...prev, conselheiroEfetuouAveriguacao: val }));
                  }
                }}
              >
                <option value="">-- Selecionar usuário/conselheiro do sistema --</option>
                {listaConselheiros.map((c, idx) => (
                  <option key={c.idConselheiro || idx} value={c.nomeConselheiro}>
                    {c.nomeConselheiro} {c.cargo ? `(${c.cargo})` : ''}
                  </option>
                ))}
                <option value="outro">✍️ Outro (digitar nome diferente manualmente)</option>
              </Form.Select>

              {/* Input de texto liberado para digitar ou editar */}
              <Form.Control
                type="text"
                name="conselheiroEfetuouAveriguacao"
                value={formData.conselheiroEfetuouAveriguacao}
                onChange={handleChange}
                placeholder="Ou digite o nome do conselheiro livremente..."
                list="datalist-conselheiros-averiguou"
                required
              />
              <datalist id="datalist-conselheiros-averiguou">
                {listaConselheiros.map((c, idx) => (
                  <option key={idx} value={c.nomeConselheiro} />
                ))}
              </datalist>
              <Form.Text className="text-muted small">
                Selecione acima ou digite outro nome manualmente.
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" size="lg" className="generate-document-button">
                <i className="bi bi-download me-2"></i>GERAR DOCUMENTO
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RecebimentoDenuncia;