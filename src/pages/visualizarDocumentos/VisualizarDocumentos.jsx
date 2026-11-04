import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  InputGroup,
  Form,
  Row,
  Col,
  Modal
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { buscarTodosDocumentos } from '../../api/documentos';
import { buscarConselheiros } from '../../api/conselheiros';
import {
  gerarPDF,
  gerarRelatorioPersonalizadoPDF,
  exportarRelatorioCSV,
  formatarObservacoes
} from '../../utils/gerarPDF';
import { documentosFalsos } from '../../utils/dadosFalsos';
import { useAuth } from '../../context/AuthContext';
import './VisualizarDocumentos.css';

const TIPOS_DOCUMENTO = [
  { value: 'denuncia', label: 'Denúncia', variant: 'danger', icon: 'bi-Megaphone-fill' },
  { value: 'atendimento', label: 'Atendimento', variant: 'primary', icon: 'bi-person-lines-fill' },
  { value: 'notificacao', label: 'Notificação', variant: 'warning', icon: 'bi-bell-fill' },
  { value: 'termo-medidas-menor', label: 'Termo Medidas (Menor)', variant: 'info', icon: 'bi-person-bounding-box' },
  { value: 'termo-medidas-responsavel', label: 'Termo Medidas (Responsável)', variant: 'success', icon: 'bi-people-fill' }
];

const INCISOS_DESCRICAO = {
  '1': 'Inciso I - Encaminhamento / Proteção Familiar',
  '2': 'Inciso II - Orientação e Apoio Temporários',
  '3': 'Inciso III - Matrícula / Tratamento Especializado',
  '4': 'Inciso IV - Auxílio / Tratamento Psicológico',
  '5': 'Inciso V - Programas de Proteção / Orientação',
  '6': 'Inciso VI - Tratamento de Saúde / Frequência Escolar',
  '7': 'Inciso VII - Encaminhamento Especializado (Art. 129)',
  '8': 'Inciso VIII - Advertência (Art. 129)'
};

const extrairBairroDoEndereco = (enderecoTexto, bairroDireto) => {
  if (bairroDireto && String(bairroDireto).trim() !== '' && bairroDireto !== 'Panambi') {
    return String(bairroDireto).trim();
  }
  if (!enderecoTexto || typeof enderecoTexto !== 'string') return '';

  // Padrão "Bairro NomeDoBairro," ou "Bairro NomeDoBairro -"
  const matchBairro = enderecoTexto.match(/Bairro\s+([^,-/]+)/i);
  if (matchBairro && matchBairro[1]) {
    return matchBairro[1].trim();
  }

  // Padrão "- NomeDoBairro, Panambi"
  const matchTraco = enderecoTexto.match(/-\s*([^,-/]+),\s*Panambi/i);
  if (matchTraco && matchTraco[1]) {
    return matchTraco[1].replace(/^Bairro\s+/i, '').trim();
  }

  // Padrão Rua, Numero, Bairro, Cidade
  const partes = enderecoTexto.split(',').map(p => p.trim()).filter(Boolean);
  if (partes.length >= 4) {
    const candidato = partes[2].replace(/^Bairro\s+/i, '').trim();
    if (candidato && candidato.toLowerCase() !== 'panambi' && candidato.toLowerCase() !== 'rs') {
      return candidato;
    }
  }

  return '';
};

const parseObservacaoSegura = (observacao) => {
  if (!observacao) return null;
  if (typeof observacao === 'object') return observacao;
  try {
    const parsed = JSON.parse(observacao);
    return typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

function VisualizarDocumentos() {
  const { user } = useAuth() || {};

  const [documentos, setDocumentos] = useState(null);
  const [listaConselheirosSistema, setListaConselheirosSistema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de Filtros
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [tiposSelecionados, setTiposSelecionados] = useState([]); // vazio = todos (ou controlado por filtroTipo)
  const [periodoRapido, setPeriodoRapido] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroMesAno, setFiltroMesAno] = useState('todos');
  const [filtroBairro, setFiltroBairro] = useState('todos');
  const [filtroConselheiro, setFiltroConselheiro] = useState('todos');
  const [filtroDireitoViolado, setFiltroDireitoViolado] = useState('todos');
  const [filtroModalidadeDenuncia, setFiltroModalidadeDenuncia] = useState('todos');
  const [filtroInciso, setFiltroInciso] = useState('todos');
  const [filtroSituacao, setFiltroSituacao] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data_desc');
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(true);

  // Seleção de documentos na tabela para relatório personalizado
  const [uidsSelecionados, setUidsSelecionados] = useState([]);

  // Modal de Detalhes do Documento
  const [docDetalhe, setDocDetalhe] = useState(null);

  // Modal de Configuração de Relatório Personalizado
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [configRelatorio, setConfigRelatorio] = useState({
    escopo: 'filtrados', // 'filtrados' | 'selecionados'
    tituloRelatorio: 'RELATÓRIO PERSONALIZADO DE DOCUMENTOS E OCORRÊNCIAS',
    subtituloRelatorio: 'Conselho Tutelar de Panambi/RS - Monitoramento Estatístico e Operacional (ECA)',
    destinatario: '',
    conselheiroEmissor: user?.nome || 'Conselheiro(a) Tutelar',
    observacoesRelatorio: '',
    agrupamento: 'nenhum', // 'nenhum' | 'tipo' | 'bairro' | 'conselheiro' | 'mes' | 'direito'
    incluirFiltros: true,
    incluirEstatisticas: true,
    incluirTabela: true,
    incluirDetalhamento: false,
    incluirAssinatura: true,
    colunas: {
      id: true,
      tipo: true,
      data: true,
      bairro: true,
      conselheiro: true,
      classificacao: true,
      descricao: true
    }
  });

  useEffect(() => {
    if (user?.nome) {
      setConfigRelatorio(prev => ({ ...prev, conselheiroEmissor: user.nome }));
    }
  }, [user]);

  useEffect(() => {
    carregarDocumentos();
    carregarConselheiros();
  }, []);

  const carregarConselheiros = async () => {
    try {
      const dados = await buscarConselheiros();
      if (Array.isArray(dados)) {
        const nomes = dados
          .map(c => (c.nomeConselheiro || c.nome || '').trim())
          .filter(Boolean);
        setListaConselheirosSistema([...new Set(nomes)]);
      }
    } catch {
      // Silencioso caso não disponível
    }
  };

  const carregarDocumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await buscarTodosDocumentos();
      const totalDocsReais = (dados?.denuncias?.length || 0) +
                             (dados?.atendimentos?.length || 0) +
                             (dados?.notificacoes?.length || 0) +
                             (dados?.termosMedidasMenor?.length || 0) +
                             (dados?.termosMedidasResponsavel?.length || 0);

      if (totalDocsReais > 0) {
        setDocumentos({
          denuncias: dados.denuncias || [],
          atendimentos: dados.atendimentos || [],
          notificacoes: dados.notificacoes || [],
          termosMedidasMenor: dados.termosMedidasMenor || [],
          termosMedidasResponsavel: dados.termosMedidasResponsavel || []
        });
      } else {
        setDocumentos(documentosFalsos);
      }
    } catch (err) {
      console.error('Erro ao carregar documentos do banco:', err);
      setError('Aviso: Não foi possível conectar ao banco de dados (' + err.message + '). Exibindo dados em cache.');
      setDocumentos(documentosFalsos);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    const date = new Date(data);
    if (isNaN(date.getTime())) return String(data);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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

  // Normalização enriquecida de todos os documentos para permitir múltiplos filtros e relatórios
  const todosDocumentos = useMemo(() => {
    if (!documentos) return [];

    const normalizar = (doc, tipo, idx) => {
      const obs = parseObservacaoSegura(doc.Observacao);
      const idExibicao = doc.nrDenuncia || doc.idAtendimento || doc.id || doc.idmedida_aplicada || `${idx + 1}`;
      const uid = `${tipo}-${idExibicao}-${idx}`;

      const dataRaw = doc.Data || doc.data || doc.dataNotificacao || null;
      const dataObj = dataRaw ? new Date(dataRaw) : null;
      const mesAnoChave = dataObj && !isNaN(dataObj.getTime())
        ? `${dataObj.getUTCFullYear()}-${String(dataObj.getUTCMonth() + 1).padStart(2, '0')}`
        : '';
      const mesAnoLabel = dataObj && !isNaN(dataObj.getTime())
        ? dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        : '';

      const enderecoBruto = doc.endereco || obs?.endereco || (doc.rua ? `${doc.rua}, ${doc.bairro || ''}` : '');
      const enderecoNormalizado = (enderecoBruto && enderecoBruto !== 'N/A' && enderecoBruto !== '-') ? enderecoBruto : '';
      const bairroNormalizado = extrairBairroDoEndereco(enderecoNormalizado, doc.bairro || doc.Bairro);

      const conselheiroBruto =
        doc.nomeConselheiro ||
        doc.profissional ||
        (obs?.conselheiroAveriguador && obs.conselheiroAveriguador !== 'Pendente' && obs.conselheiroAveriguador !== 'N/A'
          ? obs.conselheiroAveriguador
          : '');
      const conselheiroNormalizado = conselheiroBruto ? String(conselheiroBruto).trim() : '';

      const envolvidosLista = [
        obs?.criancasAdolescentes !== 'N/A' ? obs?.criancasAdolescentes : null,
        obs?.paisResponsaveis !== 'N/A' ? obs?.paisResponsaveis : null,
        doc.nomeMenor,
        doc.nomeResponsavel,
        doc.recebedor,
        doc.redator,
        doc.nomeViolador
      ].filter(Boolean);
      const envolvidosNormalizado = [...new Set(envolvidosLista)].join(' / ');

      const descricaoNormalizada =
        doc.DescricaoFato ||
        doc.Relato ||
        doc.descricao ||
        doc.assinaturaTexto ||
        doc.recebedor ||
        doc.redator ||
        'N/A';

      const modalidadeDenuncia = tipo === 'denuncia'
        ? (doc.TipoDenuncia || (doc.PessoalEnfEntrada === 1 ? 'identificada' : '') || '').toLowerCase()
        : '';

      const direitoVioladoNormalizado = (doc.direitoVioladoDescricao || doc.direitoViolado || '').trim();
      const incisoNormalizado = doc.inciso ? String(doc.inciso) : '';

      let classificacaoNormalizada = '';
      if (direitoVioladoNormalizado) {
        classificacaoNormalizada = direitoVioladoNormalizado;
      } else if (incisoNormalizado) {
        const art = tipo === 'termo-medidas-menor' ? 'Art. 101' : 'Art. 129';
        classificacaoNormalizada = `${art} • Inciso ${incisoNormalizado}`;
      } else if (modalidadeDenuncia) {
        const mapMod = {
          identificada: 'Denúncia Identificada',
          anonima: 'Denúncia Anônima',
          telefone: 'Denúncia por Telefone',
          pessoalmente: 'Denúncia Presencial'
        };
        classificacaoNormalizada = mapMod[modalidadeDenuncia] || `Denúncia (${modalidadeDenuncia})`;
      } else if (tipo === 'notificacao') {
        classificacaoNormalizada = 'Convocação / Notificação';
      }

      const temAveriguacao = Boolean(doc.Data_averiguacao);
      const temAssinatura = Boolean(doc.assinatura || obs?.assinatura);

      return {
        ...doc,
        uid,
        id: idExibicao,
        idExibicao,
        tipo,
        dataRaw,
        dataObj,
        mesAnoChave,
        mesAnoLabel: mesAnoLabel ? mesAnoLabel.charAt(0).toUpperCase() + mesAnoLabel.slice(1) : '',
        enderecoNormalizado,
        bairroNormalizado,
        conselheiroNormalizado,
        envolvidosNormalizado,
        descricaoNormalizada,
        modalidadeDenuncia,
        direitoVioladoNormalizado,
        incisoNormalizado,
        classificacaoNormalizada,
        temAveriguacao,
        temAssinatura,
        obsParsed: obs
      };
    };

    const lista = [
      ...(documentos.denuncias || []).map((d, i) => normalizar(d, 'denuncia', i)),
      ...(documentos.atendimentos || []).map((a, i) => normalizar(a, 'atendimento', i)),
      ...(documentos.notificacoes || []).map((n, i) => normalizar(n, 'notificacao', i)),
      ...(documentos.termosMedidasMenor || []).map((t, i) => normalizar(t, 'termo-medidas-menor', i)),
      ...(documentos.termosMedidasResponsavel || []).map((t, i) => normalizar(t, 'termo-medidas-responsavel', i))
    ];

    return lista;
  }, [documentos]);

  // Opções dinâmicas para os seletores de filtro
  const opcoesDinamicas = useMemo(() => {
    const bairros = new Set();
    const conselheiros = new Set(listaConselheirosSistema);
    const direitos = new Set([
      'Direito à Educação',
      'Direito à Saúde',
      'Convivência Familiar e Comunitária',
      'Dignidade, Respeito e Liberdade',
      'Direito à Vida e Alimentação'
    ]);
    const mesesMap = new Map();

    todosDocumentos.forEach((doc) => {
      if (doc.bairroNormalizado) bairros.add(doc.bairroNormalizado);
      if (doc.conselheiroNormalizado) conselheiros.add(doc.conselheiroNormalizado);
      if (doc.direitoVioladoNormalizado) direitos.add(doc.direitoVioladoNormalizado);
      if (doc.mesAnoChave && doc.mesAnoLabel) {
        mesesMap.set(doc.mesAnoChave, doc.mesAnoLabel);
      }
    });

    const mesesOrdenados = Array.from(mesesMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([valor, label]) => ({ valor, label }));

    return {
      bairros: Array.from(bairros).sort((a, b) => a.localeCompare(b)),
      conselheiros: Array.from(conselheiros).sort((a, b) => a.localeCompare(b)),
      direitos: Array.from(direitos).sort((a, b) => a.localeCompare(b)),
      meses: mesesOrdenados
    };
  }, [todosDocumentos, listaConselheirosSistema]);

  // Handler de atalhos de período
  const handlePeriodoRapidoChange = (novoPeriodo) => {
    setPeriodoRapido(novoPeriodo);
    setFiltroMesAno('todos');

    const hoje = new Date();
    const formatISO = (d) => d.toISOString().slice(0, 10);

    if (novoPeriodo === 'todos') {
      setDataInicio('');
      setDataFim('');
    } else if (novoPeriodo === 'hoje') {
      const strHoje = formatISO(hoje);
      setDataInicio(strHoje);
      setDataFim(strHoje);
    } else if (novoPeriodo === '7dias') {
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - 7);
      setDataInicio(formatISO(inicio));
      setDataFim(formatISO(hoje));
    } else if (novoPeriodo === '30dias') {
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - 30);
      setDataInicio(formatISO(inicio));
      setDataFim(formatISO(hoje));
    } else if (novoPeriodo === 'mes_atual') {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      setDataInicio(formatISO(inicio));
      setDataFim(formatISO(hoje));
    } else if (novoPeriodo === 'ano_atual') {
      const inicio = new Date(hoje.getFullYear(), 0, 1);
      setDataInicio(formatISO(inicio));
      setDataFim(formatISO(hoje));
    }
  };

  // Alternar tipo na seleção múltipla por chips
  const handleToggleTipoChip = (tipoVal) => {
    setTiposSelecionados((prev) => {
      let novo;
      if (prev.includes(tipoVal)) {
        novo = prev.filter(t => t !== tipoVal);
      } else {
        novo = [...prev, tipoVal];
      }
      if (novo.length === 0) {
        setFiltroTipo('todos');
      } else if (novo.length === 1) {
        setFiltroTipo(novo[0]);
      } else {
        setFiltroTipo('multiplos');
      }
      return novo;
    });
  };

  const handleSelectTipoDropdown = (val) => {
    setFiltroTipo(val);
    if (val === 'todos') {
      setTiposSelecionados([]);
    } else if (val !== 'multiplos') {
      setTiposSelecionados([val]);
    }
  };

  // Aplicar Modelos / Presets de Relatório com 1 clique
  const aplicarModeloRelatorio = (modelo) => {
    limparTodosFiltros();
    if (modelo === 'geral') {
      setConfigRelatorio(prev => ({
        ...prev,
        tituloRelatorio: 'PANORAMA GERAL DE ATENDIMENTOS E OCORRÊNCIAS',
        agrupamento: 'tipo',
        incluirEstatisticas: true,
        incluirTabela: true,
        incluirDetalhamento: false
      }));
    } else if (modelo === 'denuncias') {
      setTiposSelecionados(['denuncia']);
      setFiltroTipo('denuncia');
      setConfigRelatorio(prev => ({
        ...prev,
        tituloRelatorio: 'RELATÓRIO DE DENÚNCIAS E AVERIGUAÇÕES',
        agrupamento: 'bairro',
        incluirEstatisticas: true,
        incluirTabela: true,
        incluirDetalhamento: true
      }));
    } else if (modelo === 'medidas_eca') {
      setTiposSelecionados(['termo-medidas-menor', 'termo-medidas-responsavel']);
      setFiltroTipo('multiplos');
      setConfigRelatorio(prev => ({
        ...prev,
        tituloRelatorio: 'RELATÓRIO DE MEDIDAS PROTETIVAS APLICADAS (ART. 101 E 129 ECA)',
        agrupamento: 'direito',
        incluirEstatisticas: true,
        incluirTabela: true,
        incluirDetalhamento: true
      }));
    } else if (modelo === 'territorial') {
      setOrdenacao('bairro_asc');
      setConfigRelatorio(prev => ({
        ...prev,
        tituloRelatorio: 'DIAGNÓSTICO TERRITORIAL DE OCORRÊNCIAS POR BAIRRO',
        agrupamento: 'bairro',
        incluirEstatisticas: true,
        incluirTabela: true,
        incluirDetalhamento: false
      }));
    } else if (modelo === 'conselheiro') {
      setOrdenacao('conselheiro_asc');
      setConfigRelatorio(prev => ({
        ...prev,
        tituloRelatorio: 'RELATÓRIO DE ATUAÇÃO POR CONSELHEIRO / PROFISSIONAL',
        agrupamento: 'conselheiro',
        incluirEstatisticas: true,
        incluirTabela: true,
        incluirDetalhamento: false
      }));
    }
  };

  const limparTodosFiltros = () => {
    setTermoPesquisa('');
    setFiltroTipo('todos');
    setTiposSelecionados([]);
    setPeriodoRapido('todos');
    setDataInicio('');
    setDataFim('');
    setFiltroMesAno('todos');
    setFiltroBairro('todos');
    setFiltroConselheiro('todos');
    setFiltroDireitoViolado('todos');
    setFiltroModalidadeDenuncia('todos');
    setFiltroInciso('todos');
    setFiltroSituacao('todos');
    setOrdenacao('data_desc');
  };

  // Filtragem e ordenação completa dos documentos
  const documentosFiltrados = useMemo(() => {
    let filtrados = [...todosDocumentos];

    // 1. Filtro por Tipo (único ou múltiplo)
    if (tiposSelecionados.length > 0) {
      filtrados = filtrados.filter(doc => tiposSelecionados.includes(doc.tipo));
    } else if (filtroTipo !== 'todos' && filtroTipo !== 'multiplos') {
      filtrados = filtrados.filter(doc => doc.tipo === filtroTipo);
    }

    // 2. Filtro por Pesquisa Textual
    if (termoPesquisa.trim() !== '') {
      const termo = termoPesquisa.toLowerCase().trim();
      filtrados = filtrados.filter(doc => {
        const id = String(doc.idExibicao || '').toLowerCase();
        const descricao = String(doc.descricaoNormalizada || '').toLowerCase();
        const data = formatarData(doc.dataRaw).toLowerCase();
        const bairro = String(doc.bairroNormalizado || '').toLowerCase();
        const endereco = String(doc.enderecoNormalizado || '').toLowerCase();
        const conselheiro = String(doc.conselheiroNormalizado || '').toLowerCase();
        const envolvidos = String(doc.envolvidosNormalizado || '').toLowerCase();
        const classificacao = String(doc.classificacaoNormalizada || '').toLowerCase();

        return (
          id.includes(termo) ||
          descricao.includes(termo) ||
          data.includes(termo) ||
          bairro.includes(termo) ||
          endereco.includes(termo) ||
          conselheiro.includes(termo) ||
          envolvidos.includes(termo) ||
          classificacao.includes(termo)
        );
      });
    }

    // 3. Filtro por Mês/Ano específico
    if (filtroMesAno !== 'todos') {
      filtrados = filtrados.filter(doc => doc.mesAnoChave === filtroMesAno);
    }

    // 4. Filtro por Intervalo de Datas (Data Início e Data Fim)
    if (dataInicio) {
      const dtIni = new Date(`${dataInicio}T00:00:00Z`);
      filtrados = filtrados.filter(doc => doc.dataObj && doc.dataObj >= dtIni);
    }
    if (dataFim) {
      const dtFim = new Date(`${dataFim}T23:59:59Z`);
      filtrados = filtrados.filter(doc => doc.dataObj && doc.dataObj <= dtFim);
    }

    // 5. Filtro por Bairro / Localidade
    if (filtroBairro !== 'todos') {
      filtrados = filtrados.filter(
        doc => doc.bairroNormalizado.toLowerCase() === filtroBairro.toLowerCase()
      );
    }

    // 6. Filtro por Conselheiro / Profissional
    if (filtroConselheiro !== 'todos') {
      filtrados = filtrados.filter(
        doc => doc.conselheiroNormalizado.toLowerCase().includes(filtroConselheiro.toLowerCase())
      );
    }

    // 7. Filtro por Direito Violado
    if (filtroDireitoViolado !== 'todos') {
      filtrados = filtrados.filter(
        doc => doc.direitoVioladoNormalizado.toLowerCase().includes(filtroDireitoViolado.toLowerCase())
      );
    }

    // 8. Filtro por Modalidade da Denúncia
    if (filtroModalidadeDenuncia !== 'todos') {
      filtrados = filtrados.filter(
        doc => doc.modalidadeDenuncia === filtroModalidadeDenuncia.toLowerCase()
      );
    }

    // 9. Filtro por Inciso ECA
    if (filtroInciso !== 'todos') {
      filtrados = filtrados.filter(doc => doc.incisoNormalizado === String(filtroInciso));
    }

    // 10. Filtro por Situação / Status Operacional
    if (filtroSituacao !== 'todos') {
      if (filtroSituacao === 'averiguadas') {
        filtrados = filtrados.filter(doc => doc.temAveriguacao);
      } else if (filtroSituacao === 'pendentes') {
        filtrados = filtrados.filter(doc => doc.tipo === 'denuncia' && !doc.temAveriguacao);
      } else if (filtroSituacao === 'com_endereco') {
        filtrados = filtrados.filter(doc => Boolean(doc.enderecoNormalizado));
      } else if (filtroSituacao === 'com_envolvidos') {
        filtrados = filtrados.filter(doc => Boolean(doc.envolvidosNormalizado));
      }
    }

    // 11. Ordenação
    filtrados.sort((a, b) => {
      if (ordenacao === 'data_desc') {
        const tA = a.dataObj ? a.dataObj.getTime() : 0;
        const tB = b.dataObj ? b.dataObj.getTime() : 0;
        return tB - tA;
      }
      if (ordenacao === 'data_asc') {
        const tA = a.dataObj ? a.dataObj.getTime() : 0;
        const tB = b.dataObj ? b.dataObj.getTime() : 0;
        return tA - tB;
      }
      if (ordenacao === 'tipo_asc') {
        return a.tipo.localeCompare(b.tipo);
      }
      if (ordenacao === 'bairro_asc') {
        return (a.bairroNormalizado || 'ZZZ').localeCompare(b.bairroNormalizado || 'ZZZ');
      }
      if (ordenacao === 'conselheiro_asc') {
        return (a.conselheiroNormalizado || 'ZZZ').localeCompare(b.conselheiroNormalizado || 'ZZZ');
      }
      if (ordenacao === 'id_asc') {
        return String(a.idExibicao).localeCompare(String(b.idExibicao), undefined, { numeric: true });
      }
      if (ordenacao === 'id_desc') {
        return String(b.idExibicao).localeCompare(String(a.idExibicao), undefined, { numeric: true });
      }
      return 0;
    });

    return filtrados;
  }, [
    todosDocumentos,
    tiposSelecionados,
    filtroTipo,
    termoPesquisa,
    filtroMesAno,
    dataInicio,
    dataFim,
    filtroBairro,
    filtroConselheiro,
    filtroDireitoViolado,
    filtroModalidadeDenuncia,
    filtroInciso,
    filtroSituacao,
    ordenacao
  ]);

  // Lista de filtros ativos para exibição em chips e inclusão no relatório PDF
  const resumoFiltrosAtivos = useMemo(() => {
    const ativos = [];
    if (tiposSelecionados.length > 0) {
      const nomes = tiposSelecionados.map(t => TIPOS_DOCUMENTO.find(x => x.value === t)?.label || t);
      ativos.push({
        id: 'tipo',
        label: 'Tipo(s)',
        valor: nomes.join(', '),
        limpar: () => { setTiposSelecionados([]); setFiltroTipo('todos'); }
      });
    }
    if (termoPesquisa.trim()) {
      ativos.push({
        id: 'pesquisa',
        label: 'Busca',
        valor: `"${termoPesquisa.trim()}"`,
        limpar: () => setTermoPesquisa('')
      });
    }
    if (filtroMesAno !== 'todos') {
      const mLabel = opcoesDinamicas.meses.find(m => m.valor === filtroMesAno)?.label || filtroMesAno;
      ativos.push({
        id: 'mesAno',
        label: 'Mês/Ano',
        valor: mLabel,
        limpar: () => setFiltroMesAno('todos')
      });
    }
    if (dataInicio || dataFim) {
      ativos.push({
        id: 'datas',
        label: 'Período',
        valor: `${dataInicio ? formatarData(dataInicio) : 'Início'} até ${dataFim ? formatarData(dataFim) : 'Hoje'}`,
        limpar: () => { setDataInicio(''); setDataFim(''); setPeriodoRapido('todos'); }
      });
    }
    if (filtroBairro !== 'todos') {
      ativos.push({
        id: 'bairro',
        label: 'Bairro',
        valor: filtroBairro,
        limpar: () => setFiltroBairro('todos')
      });
    }
    if (filtroConselheiro !== 'todos') {
      ativos.push({
        id: 'conselheiro',
        label: 'Conselheiro/Profissional',
        valor: filtroConselheiro,
        limpar: () => setFiltroConselheiro('todos')
      });
    }
    if (filtroDireitoViolado !== 'todos') {
      ativos.push({
        id: 'direito',
        label: 'Direito Violado',
        valor: filtroDireitoViolado,
        limpar: () => setFiltroDireitoViolado('todos')
      });
    }
    if (filtroModalidadeDenuncia !== 'todos') {
      ativos.push({
        id: 'modalidade',
        label: 'Origem da Denúncia',
        valor: filtroModalidadeDenuncia,
        limpar: () => setFiltroModalidadeDenuncia('todos')
      });
    }
    if (filtroInciso !== 'todos') {
      ativos.push({
        id: 'inciso',
        label: 'Medida ECA',
        valor: `Inciso ${filtroInciso}`,
        limpar: () => setFiltroInciso('todos')
      });
    }
    if (filtroSituacao !== 'todos') {
      const mapSit = {
        averiguadas: 'Com Averiguação Concluída',
        pendentes: 'Pendente de Averiguação',
        com_endereco: 'Com Endereço Mapeado',
        com_envolvidos: 'Com Envolvidos Identificados'
      };
      ativos.push({
        id: 'situacao',
        label: 'Situação',
        valor: mapSit[filtroSituacao] || filtroSituacao,
        limpar: () => setFiltroSituacao('todos')
      });
    }
    return ativos;
  }, [
    tiposSelecionados,
    termoPesquisa,
    filtroMesAno,
    dataInicio,
    dataFim,
    filtroBairro,
    filtroConselheiro,
    filtroDireitoViolado,
    filtroModalidadeDenuncia,
    filtroInciso,
    filtroSituacao,
    opcoesDinamicas.meses
  ]);

  // Estatísticas em tempo real sobre os documentos filtrados
  const estatisticasFiltradas = useMemo(() => {
    const porTipo = {
      'denuncia': 0,
      'atendimento': 0,
      'notificacao': 0,
      'termo-medidas-menor': 0,
      'termo-medidas-responsavel': 0
    };
    const bairrosCount = {};

    documentosFiltrados.forEach(d => {
      if (porTipo[d.tipo] !== undefined) porTipo[d.tipo]++;
      if (d.bairroNormalizado) {
        bairrosCount[d.bairroNormalizado] = (bairrosCount[d.bairroNormalizado] || 0) + 1;
      }
    });

    const bairrosOrdenados = Object.entries(bairrosCount).sort((a, b) => b[1] - a[1]);

    return {
      porTipo,
      totalBairros: bairrosOrdenados.length,
      bairroMaisFrequente: bairrosOrdenados[0] ? `${bairrosOrdenados[0][0]} (${bairrosOrdenados[0][1]})` : 'N/A',
      bairrosOrdenados
    };
  }, [documentosFiltrados]);

  // Controle de checkboxes na tabela
  const todosFiltradosSelecionados =
    documentosFiltrados.length > 0 &&
    documentosFiltrados.every(d => uidsSelecionados.includes(d.uid));

  const handleToggleSelecionarTodos = () => {
    if (todosFiltradosSelecionados) {
      const uidsFiltradosSet = new Set(documentosFiltrados.map(d => d.uid));
      setUidsSelecionados(prev => prev.filter(uid => !uidsFiltradosSet.has(uid)));
    } else {
      const novos = new Set([...uidsSelecionados, ...documentosFiltrados.map(d => d.uid)]);
      setUidsSelecionados(Array.from(novos));
    }
  };

  const handleToggleSelecionarUm = (uid) => {
    setUidsSelecionados(prev =>
      prev.includes(uid) ? prev.filter(item => item !== uid) : [...prev, uid]
    );
  };

  // Documentos efetivos que irão para o relatório
  const documentosParaRelatorio = useMemo(() => {
    if (configRelatorio.escopo === 'selecionados' && uidsSelecionados.length > 0) {
      return documentosFiltrados.filter(d => uidsSelecionados.includes(d.uid));
    }
    return documentosFiltrados;
  }, [configRelatorio.escopo, uidsSelecionados, documentosFiltrados]);

  const handleAbrirModalRelatorio = () => {
    if (uidsSelecionados.length > 0) {
      setConfigRelatorio(prev => ({ ...prev, escopo: 'selecionados' }));
    } else {
      setConfigRelatorio(prev => ({ ...prev, escopo: 'filtrados' }));
    }
    setModalRelatorioAberto(true);
  };

  const handleGerarRelatorioPDF = () => {
    if (documentosParaRelatorio.length === 0) {
      alert('Não há documentos selecionados/filtrados para gerar o relatório.');
      return;
    }
    gerarRelatorioPersonalizadoPDF(documentosParaRelatorio, {
      ...configRelatorio,
      resumoFiltrosAtivos
    });
  };

  const handleExportarCSV = () => {
    const lista = uidsSelecionados.length > 0 && configRelatorio.escopo === 'selecionados'
      ? documentosParaRelatorio
      : documentosFiltrados;
    if (lista.length === 0) {
      alert('Não há documentos filtrados para exportar.');
      return;
    }
    exportarRelatorioCSV(lista, configRelatorio);
  };

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

  return (
    <Container className="visualizar-documentos-container my-3">
      <Card className="visualizar-documentos-card border-0">
        {/* Cabeçalho com Ações de Relatório Personalizado */}
        <Card.Header className="visualizar-documentos-header d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="visualizar-documentos-title mb-1">
              <i className="bi bi-file-earmark-text me-2"></i>
              Documentos Salvos & Relatórios Personalizados
            </h2>
            <p className="text-muted small mb-0">
              Utilize os filtros combinados abaixo para refinar consultas e gerar relatórios estatísticos ou detalhados sob medida.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="outline-primary"
              onClick={carregarDocumentos}
              className="btn-refresh"
              title="Recarregar documentos do servidor"
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Atualizar
            </Button>
            <Button
              variant="outline-success"
              onClick={handleExportarCSV}
              disabled={documentosFiltrados.length === 0}
              className="btn-refresh"
              title="Exportar resultados filtrados para planilha CSV/Excel"
            >
              <i className="bi bi-file-earmark-spreadsheet me-1"></i>
              Exportar CSV
            </Button>
            <Button
              variant="primary"
              onClick={handleAbrirModalRelatorio}
              disabled={documentosFiltrados.length === 0}
              className="btn-relatorio-principal"
            >
              <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>
              Gerar Relatório Personalizado
              {uidsSelecionados.length > 0 && (
                <Badge bg="light" text="dark" className="ms-2">
                  {uidsSelecionados.length}
                </Badge>
              )}
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {error && (
            <Alert variant="warning" dismissible onClose={() => setError(null)} className="mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </Alert>
          )}

          {/* Barra de Modelos Rápidos de Relatório */}
          <div className="modelos-relatorio-bar mb-3">
            <span className="modelos-label">
              <i className="bi bi-magic me-1"></i>Modelos Rápidos de Relatório:
            </span>
            <div className="d-flex flex-wrap gap-2">
              <Button size="sm" variant="outline-secondary" className="preset-btn" onClick={() => aplicarModeloRelatorio('geral')}>
                <i className="bi bi-pie-chart me-1"></i>Panorama Geral
              </Button>
              <Button size="sm" variant="outline-danger" className="preset-btn" onClick={() => aplicarModeloRelatorio('denuncias')}>
                <i className="bi bi-exclamation-octagon me-1"></i>Denúncias & Averiguações
              </Button>
              <Button size="sm" variant="outline-info" className="preset-btn" onClick={() => aplicarModeloRelatorio('medidas_eca')}>
                <i className="bi bi-journal-check me-1"></i>Medidas Protetivas (ECA)
              </Button>
              <Button size="sm" variant="outline-success" className="preset-btn" onClick={() => aplicarModeloRelatorio('territorial')}>
                <i className="bi bi-geo-alt me-1"></i>Por Bairro / Território
              </Button>
              <Button size="sm" variant="outline-primary" className="preset-btn" onClick={() => aplicarModeloRelatorio('conselheiro')}>
                <i className="bi bi-person-badge me-1"></i>Por Conselheiro
              </Button>
            </div>
          </div>

          {/* Painel Principal de Filtros */}
          <div className="search-filter-container">
            {/* Linha 1: Busca Livre + Tipo + Ordenação + Botão Avançado */}
            <Row className="g-3 align-items-end">
              <Col lg={5} md={12}>
                <Form.Label className="filter-label">
                  <i className="bi bi-search me-1"></i>Pesquisa Inteligente Multi-campo
                </Form.Label>
                <InputGroup className="search-input-group">
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por ID, fato, criança, responsável, rua, bairro ou conselheiro..."
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                  />
                  {termoPesquisa && (
                    <Button variant="link" className="text-muted text-decoration-none" onClick={() => setTermoPesquisa('')}>
                      <i className="bi bi-x-lg"></i>
                    </Button>
                  )}
                </InputGroup>
              </Col>

              <Col lg={3} md={4}>
                <Form.Label className="filter-label">
                  <i className="bi bi-folder2-open me-1"></i>Tipo de Documento
                </Form.Label>
                <Form.Select
                  className="filter-select"
                  value={filtroTipo}
                  onChange={(e) => handleSelectTipoDropdown(e.target.value)}
                >
                  <option value="todos">Todos os tipos ({todosDocumentos.length})</option>
                  <option value="denuncia">Denúncia</option>
                  <option value="atendimento">Atendimento</option>
                  <option value="notificacao">Notificação</option>
                  <option value="termo-medidas-menor">Termo Medidas (Menor)</option>
                  <option value="termo-medidas-responsavel">Termo Medidas (Responsável)</option>
                  {tiposSelecionados.length > 1 && (
                    <option value="multiplos">Múltiplos tipos ({tiposSelecionados.length})</option>
                  )}
                </Form.Select>
              </Col>

              <Col lg={2} md={4}>
                <Form.Label className="filter-label">
                  <i className="bi bi-sort-down me-1"></i>Ordenar por
                </Form.Label>
                <Form.Select
                  className="filter-select"
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                >
                  <option value="data_desc">Data (Mais recentes)</option>
                  <option value="data_asc">Data (Mais antigos)</option>
                  <option value="bairro_asc">Bairro (A-Z)</option>
                  <option value="conselheiro_asc">Conselheiro (A-Z)</option>
                  <option value="tipo_asc">Tipo de Documento</option>
                  <option value="id_desc">ID / Nº (Decrescente)</option>
                  <option value="id_asc">ID / Nº (Crescente)</option>
                </Form.Select>
              </Col>

              <Col lg={2} md={4} className="d-flex gap-2">
                <Button
                  variant={mostrarFiltrosAvancados ? 'primary' : 'outline-primary'}
                  className="w-100 filter-toggle-btn"
                  onClick={() => setMostrarFiltrosAvancados(prev => !prev)}
                >
                  <i className={`bi ${mostrarFiltrosAvancados ? 'bi-funnel-fill' : 'bi-funnel'} me-1`}></i>
                  Filtros {resumoFiltrosAtivos.length > 0 ? `(${resumoFiltrosAtivos.length})` : ''}
                </Button>
              </Col>
            </Row>

            {/* Seleção Rápida Combinada de Tipos (Chips Multi-seleção) */}
            <div className="tipo-chips-wrapper mt-3 pt-3 border-top">
              <span className="small text-muted fw-semibold me-2">
                <i className="bi bi-check2-square me-1"></i>Combinar Tipos:
              </span>
              <button
                type="button"
                className={`tipo-chip ${tiposSelecionados.length === 0 ? 'active' : ''}`}
                onClick={() => { setTiposSelecionados([]); setFiltroTipo('todos'); }}
              >
                Todos ({todosDocumentos.length})
              </button>
              {TIPOS_DOCUMENTO.map((t) => {
                const ativo = tiposSelecionados.includes(t.value);
                const qtdTotalTipo = todosDocumentos.filter(d => d.tipo === t.value).length;
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`tipo-chip chip-${t.variant} ${ativo ? 'active' : ''}`}
                    onClick={() => handleToggleTipoChip(t.value)}
                  >
                    {ativo && <i className="bi bi-check-lg me-1"></i>}
                    {t.label} <span className="chip-count">{qtdTotalTipo}</span>
                  </button>
                );
              })}
            </div>

            {/* Filtros Avançados de Recorte para Relatórios */}
            {mostrarFiltrosAvancados && (
              <div className="advanced-filters-panel mt-3 pt-3 border-top">
                <Row className="g-3">
                  {/* Período Rápido */}
                  <Col lg={3} md={4} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-calendar-range me-1"></i>Período Rápido
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="filter-select-sm"
                      value={periodoRapido}
                      onChange={(e) => handlePeriodoRapidoChange(e.target.value)}
                    >
                      <option value="todos">Todo o histórico</option>
                      <option value="hoje">Hoje</option>
                      <option value="7dias">Últimos 7 dias</option>
                      <option value="30dias">Últimos 30 dias</option>
                      <option value="mes_atual">Este mês</option>
                      <option value="ano_atual">Este ano</option>
                      <option value="personalizado">Intervalo personalizado</option>
                    </Form.Select>
                  </Col>

                  {/* Mês / Ano de Referência */}
                  <Col lg={3} md={4} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-calendar-month me-1"></i>Mês / Ano de Referência
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="filter-select-sm"
                      value={filtroMesAno}
                      onChange={(e) => {
                        setFiltroMesAno(e.target.value);
                        if (e.target.value !== 'todos') {
                          setDataInicio('');
                          setDataFim('');
                          setPeriodoRapido('todos');
                        }
                      }}
                    >
                      <option value="todos">Todos os meses</option>
                      {opcoesDinamicas.meses.map((m) => (
                        <option key={m.valor} value={m.valor}>{m.label}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Data Inicial */}
                  <Col lg={3} md={4} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-calendar-event me-1"></i>Data Inicial (De)
                    </Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      className="filter-select-sm"
                      value={dataInicio}
                      onChange={(e) => {
                        setDataInicio(e.target.value);
                        setPeriodoRapido('personalizado');
                        setFiltroMesAno('todos');
                      }}
                    />
                  </Col>

                  {/* Data Final */}
                  <Col lg={3} md={4} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-calendar-check me-1"></i>Data Final (Até)
                    </Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      className="filter-select-sm"
                      value={dataFim}
                      onChange={(e) => {
                        setDataFim(e.target.value);
                        setPeriodoRapido('personalizado');
                        setFiltroMesAno('todos');
                      }}
                    />
                  </Col>

                  {/* Bairro / Localidade */}
                  <Col lg={3} md={4} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-geo-alt-fill me-1"></i>Bairro / Localidade
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="filter-select-sm"
                      value={filtroBairro}
                      onChange={(e) => setFiltroBairro(e.target.value)}
                    >
                      <option value="todos">Todos os bairros</option>
                      {opcoesDinamicas.bairros.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Conselheiro / Profissional */}
                  <Col lg={3} md={4} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-person-check-fill me-1"></i>Conselheiro / Profissional
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="filter-select-sm"
                      value={filtroConselheiro}
                      onChange={(e) => setFiltroConselheiro(e.target.value)}
                    >
                      <option value="todos">Todos os responsáveis</option>
                      {opcoesDinamicas.conselheiros.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Direito Violado (ECA) */}
                  <Col lg={3} md={4} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-shield-exclamation me-1"></i>Direito Violado (ECA)
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="filter-select-sm"
                      value={filtroDireitoViolado}
                      onChange={(e) => setFiltroDireitoViolado(e.target.value)}
                    >
                      <option value="todos">Todos os direitos</option>
                      {opcoesDinamicas.direitos.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Medida Protetiva / Inciso ECA */}
                  <Col lg={3} md={4} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-journal-bookmark-fill me-1"></i>Medida Aplicada (Inciso ECA)
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="filter-select-sm"
                      value={filtroInciso}
                      onChange={(e) => setFiltroInciso(e.target.value)}
                    >
                      <option value="todos">Todos os incisos (Art. 101 / 129)</option>
                      {Object.entries(INCISOS_DESCRICAO).map(([num, desc]) => (
                        <option key={num} value={num}>{desc}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Origem / Modalidade da Denúncia */}
                  <Col lg={4} md={6} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-telephone-inbound-fill me-1"></i>Origem / Canal da Denúncia
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="filter-select-sm"
                      value={filtroModalidadeDenuncia}
                      onChange={(e) => setFiltroModalidadeDenuncia(e.target.value)}
                    >
                      <option value="todos">Todas as origens de denúncia</option>
                      <option value="identificada">Pessoa Identificada</option>
                      <option value="anonima">Anônima (Sigilosa)</option>
                      <option value="telefone">Via Telefone / Disque 100</option>
                      <option value="pessoalmente">Presencialmente na Sede</option>
                    </Form.Select>
                  </Col>

                  {/* Situação Operacional / Averiguação */}
                  <Col lg={4} md={6} sm={6}>
                    <Form.Label className="filter-label">
                      <i className="bi bi-clipboard2-check-fill me-1"></i>Situação / Status do Registro
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="filter-select-sm"
                      value={filtroSituacao}
                      onChange={(e) => setFiltroSituacao(e.target.value)}
                    >
                      <option value="todos">Qualquer situação</option>
                      <option value="averiguadas">Com Data de Averiguação Concluída</option>
                      <option value="pendentes">Denúncias Pendentes de Averiguação</option>
                      <option value="com_endereco">Com Endereço / Localização Informada</option>
                      <option value="com_envolvidos">Com Criança / Responsável Identificado</option>
                    </Form.Select>
                  </Col>

                  {/* Ações Rápidas dos Filtros */}
                  <Col lg={4} md={12} className="d-flex align-items-end justify-content-end gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={limparTodosFiltros}
                      disabled={resumoFiltrosAtivos.length === 0 && ordenacao === 'data_desc'}
                    >
                      <i className="bi bi-eraser me-1"></i>Limpar Todos os Filtros
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleAbrirModalRelatorio}
                      disabled={documentosFiltrados.length === 0}
                      style={{ backgroundColor: '#3159A3', borderColor: '#3159A3' }}
                    >
                      <i className="bi bi-Sliders me-1"></i>Personalizar Relatório ({documentosFiltrados.length})
                    </Button>
                  </Col>
                </Row>
              </div>
            )}

            {/* Chips de Filtros Ativos */}
            {resumoFiltrosAtivos.length > 0 && (
              <div className="filtros-ativos-bar mt-3 pt-2 border-top d-flex flex-wrap align-items-center gap-2">
                <span className="small fw-bold text-primary">
                  <i className="bi bi-funnel-fill me-1"></i>Filtros aplicados:
                </span>
                {resumoFiltrosAtivos.map((f) => (
                  <span key={f.id} className="filtro-ativo-tag">
                    <strong>{f.label}:</strong> {f.valor}
                    <button type="button" className="btn-remove-tag" onClick={f.limpar} title="Remover este filtro">
                      ×
                    </button>
                  </span>
                ))}
                <Button variant="link" size="sm" className="p-0 ms-2 text-danger text-decoration-none" onClick={limparTodosFiltros}>
                  Limpar tudo
                </Button>
              </div>
            )}
          </div>

          {/* Painel Dinâmico de Estatísticas do Recorte Filtrado */}
          <Row className="g-3 mb-4">
            <Col md={3} sm={6}>
              <div className="kpi-filter-card kpi-blue">
                <div className="kpi-label">Documentos no Recorte</div>
                <div className="kpi-value">
                  {documentosFiltrados.length}
                  <span className="kpi-sub"> / {todosDocumentos.length} total</span>
                </div>
                <small className="text-muted">
                  {todosDocumentos.length > 0
                    ? `${Math.round((documentosFiltrados.length / todosDocumentos.length) * 100)}% do acervo selecionado`
                    : 'Sem registros'}
                </small>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="kpi-filter-card kpi-red">
                <div className="kpi-label">Denúncias & Atendimentos</div>
                <div className="kpi-value">
                  {estatisticasFiltradas.porTipo['denuncia'] + estatisticasFiltradas.porTipo['atendimento']}
                </div>
                <small className="text-muted">
                  {estatisticasFiltradas.porTipo['denuncia']} denúncias • {estatisticasFiltradas.porTipo['atendimento']} atendimentos
                </small>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="kpi-filter-card kpi-green">
                <div className="kpi-label">Medidas & Notificações</div>
                <div className="kpi-value">
                  {estatisticasFiltradas.porTipo['termo-medidas-menor'] +
                    estatisticasFiltradas.porTipo['termo-medidas-responsavel'] +
                    estatisticasFiltradas.porTipo['notificacao']}
                </div>
                <small className="text-muted">
                  {estatisticasFiltradas.porTipo['termo-medidas-menor'] + estatisticasFiltradas.porTipo['termo-medidas-responsavel']} termos ECA • {estatisticasFiltradas.porTipo['notificacao']} notificações
                </small>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="kpi-filter-card kpi-purple">
                <div className="kpi-label">Concentração Territorial</div>
                <div className="kpi-value text-truncate" style={{ fontSize: '1.15rem' }}>
                  {estatisticasFiltradas.bairroMaisFrequente}
                </div>
                <small className="text-muted">
                  {estatisticasFiltradas.totalBairros} bairro(s) no filtro atual
                </small>
              </div>
            </Col>
          </Row>

          {/* Barra de Status da Listagem e Seleção em Lote */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <p className="mb-0">
                {documentosFiltrados.length === todosDocumentos.length ? (
                  <>Total de documentos: <strong>{todosDocumentos.length}</strong></>
                ) : (
                  <>
                    Mostrando <strong>{documentosFiltrados.length}</strong> de <strong>{todosDocumentos.length}</strong> documentos
                  </>
                )}
              </p>
              {uidsSelecionados.length > 0 && (
                <div className="selecao-lote-pill">
                  <i className="bi bi-check2-all me-1"></i>
                  <strong>{uidsSelecionados.length}</strong> selecionado(s) para o relatório
                  <button
                    type="button"
                    className="btn-limpar-selecao ms-2"
                    onClick={() => setUidsSelecionados([])}
                  >
                    Desmarcar
                  </button>
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                disabled={documentosFiltrados.length === 0}
                onClick={() =>
                  gerarRelatorioPersonalizadoPDF(
                    uidsSelecionados.length > 0
                      ? documentosFiltrados.filter(d => uidsSelecionados.includes(d.uid))
                      : documentosFiltrados,
                    { ...configRelatorio, resumoFiltrosAtivos }
                  )
                }
              >
                <i className="bi bi-file-earmark-pdf-fill me-1"></i>
                Baixar PDF Rápido ({uidsSelecionados.length > 0 ? uidsSelecionados.length : documentosFiltrados.length})
              </Button>
            </div>
          </div>

          {/* Tabela de Documentos */}
          {todosDocumentos.length === 0 ? (
            <Alert variant="info">
              Nenhum documento encontrado. Os documentos aparecerão aqui após serem salvos.
            </Alert>
          ) : documentosFiltrados.length === 0 ? (
            <Alert variant="warning" className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <i className="bi bi-search me-2"></i>
                Nenhum documento encontrado com os filtros aplicados. Tente ajustar ou limpar seus critérios de pesquisa.
              </div>
              <Button size="sm" variant="outline-dark" onClick={limparTodosFiltros}>
                Limpar Filtros
              </Button>
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="documentos-table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '42px' }} className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={todosFiltradosSelecionados}
                        onChange={handleToggleSelecionarTodos}
                        title="Selecionar/desmarcar todos os documentos filtrados"
                      />
                    </th>
                    <th>Tipo</th>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Bairro / Local</th>
                    <th>Responsável / Partes</th>
                    <th>Classificação / ECA</th>
                    <th>Descrição</th>
                    <th className="text-center">Detalhes / Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documentosFiltrados.map((doc) => {
                    const selecionado = uidsSelecionados.includes(doc.uid);
                    return (
                      <tr key={doc.uid} className={selecionado ? 'table-primary-subtle' : ''}>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={selecionado}
                            onChange={() => handleToggleSelecionarUm(doc.uid)}
                          />
                        </td>
                        <td>{getTipoBadge(doc.tipo)}</td>
                        <td className="fw-semibold text-nowrap">{doc.idExibicao}</td>
                        <td className="text-nowrap">{formatarData(doc.dataRaw)}</td>
                        <td>
                          {doc.bairroNormalizado ? (
                            <span className="badge bg-light text-dark border">
                              <i className="bi bi-geo-alt text-danger me-1"></i>
                              {doc.bairroNormalizado}
                            </span>
                          ) : (
                            <span className="text-muted small">Não informado</span>
                          )}
                        </td>
                        <td>
                          {doc.conselheiroNormalizado && (
                            <div className="small fw-semibold text-dark">
                              <i className="bi bi-person-check me-1 text-primary"></i>
                              {doc.conselheiroNormalizado}
                            </div>
                          )}
                          {doc.envolvidosNormalizado ? (
                            <div className="small text-muted text-truncate" style={{ maxWidth: '180px' }} title={doc.envolvidosNormalizado}>
                              {doc.envolvidosNormalizado}
                            </div>
                          ) : (
                            !doc.conselheiroNormalizado && <span className="text-muted small">-</span>
                          )}
                        </td>
                        <td>
                          {doc.classificacaoNormalizada ? (
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                              {doc.classificacaoNormalizada}
                            </span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                        <td>
                          <div style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.descricaoNormalizada}>
                            {doc.descricaoNormalizada}
                          </div>
                        </td>
                        <td className="text-nowrap text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => setDocDetalhe(doc)}
                              title="Visualizar detalhes completos do documento"
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="btn-pdf"
                              onClick={() => {
                                try {
                                  gerarPDF(doc);
                                } catch (err) {
                                  console.error('Erro ao gerar PDF:', err);
                                  alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
                                }
                              }}
                            >
                              <i className="bi bi-file-earmark-pdf me-1"></i>
                              Gerar PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}

          {/* Resumo por Tipo (Geral vs. Filtrado) */}
          {documentos && (
            <div className="mt-4 resumo-badges">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                <h5 className="mb-0">Resumo por Tipo (Recorte Atual / Total):</h5>
                <small className="text-muted">Clique em um tipo abaixo para filtrar rapidamente</small>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Badge
                  bg="danger"
                  className="resumo-badge-clickable"
                  onClick={() => handleSelectTipoDropdown(filtroTipo === 'denuncia' ? 'todos' : 'denuncia')}
                >
                  Denúncias: {estatisticasFiltradas.porTipo['denuncia']} / {documentos.denuncias.length}
                </Badge>
                <Badge
                  bg="primary"
                  className="resumo-badge-clickable"
                  onClick={() => handleSelectTipoDropdown(filtroTipo === 'atendimento' ? 'todos' : 'atendimento')}
                >
                  Atendimentos: {estatisticasFiltradas.porTipo['atendimento']} / {documentos.atendimentos.length}
                </Badge>
                <Badge
                  bg="warning"
                  text="dark"
                  className="resumo-badge-clickable"
                  onClick={() => handleSelectTipoDropdown(filtroTipo === 'notificacao' ? 'todos' : 'notificacao')}
                >
                  Notificações: {estatisticasFiltradas.porTipo['notificacao']} / {documentos.notificacoes.length}
                </Badge>
                <Badge
                  bg="info"
                  className="resumo-badge-clickable"
                  onClick={() => handleSelectTipoDropdown(filtroTipo === 'termo-medidas-menor' ? 'todos' : 'termo-medidas-menor')}
                >
                  Termos Medidas (Menor): {estatisticasFiltradas.porTipo['termo-medidas-menor']} / {documentos.termosMedidasMenor.length}
                </Badge>
                <Badge
                  bg="success"
                  className="resumo-badge-clickable"
                  onClick={() => handleSelectTipoDropdown(filtroTipo === 'termo-medidas-responsavel' ? 'todos' : 'termo-medidas-responsavel')}
                >
                  Termos Medidas (Responsável): {estatisticasFiltradas.porTipo['termo-medidas-responsavel']} / {documentos.termosMedidasResponsavel.length}
                </Badge>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Visualização de Detalhes Completos do Documento */}
      <Modal show={Boolean(docDetalhe)} onHide={() => setDocDetalhe(null)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="h5 fw-bold" style={{ color: '#3159A3' }}>
            <i className="bi bi-file-earmark-medical me-2"></i>
            Ficha do Documento — {docDetalhe?.idExibicao}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {docDetalhe && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>{getTipoBadge(docDetalhe.tipo)}</div>
                <span className="text-muted small">
                  Data do Registro: <strong>{formatarData(docDetalhe.dataRaw)}</strong>
                </span>
              </div>

              <Row className="g-3 mb-3">
                <Col sm={6}>
                  <div className="p-2 bg-light rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-semibold">Conselheiro / Profissional</small>
                    <strong>{docDetalhe.conselheiroNormalizado || 'Não informado'}</strong>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-2 bg-light rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-semibold">Classificação / ECA</small>
                    <strong>{docDetalhe.classificacaoNormalizada || 'Registro Geral'}</strong>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-2 bg-light rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-semibold">Bairro / Localidade</small>
                    <strong>{docDetalhe.bairroNormalizado || 'Não informado'}</strong>
                    {docDetalhe.enderecoNormalizado && (
                      <div className="small text-muted">{docDetalhe.enderecoNormalizado}</div>
                    )}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-2 bg-light rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-semibold">Partes / Envolvidos</small>
                    <strong>{docDetalhe.envolvidosNormalizado || 'Não especificado'}</strong>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <h6 className="fw-bold text-primary mb-1">Descrição / Relato Completo:</h6>
                <div className="p-3 bg-light rounded border" style={{ whiteSpace: 'pre-wrap' }}>
                  {docDetalhe.descricaoNormalizada}
                </div>
              </div>

              {docDetalhe.Observacao && formatarObservacoes(docDetalhe.Observacao) && (
                <div className="mb-3">
                  <h6 className="fw-bold text-primary mb-1">Dados Complementares / Observações:</h6>
                  <div className="p-3 bg-light rounded border small" style={{ whiteSpace: 'pre-wrap' }}>
                    {formatarObservacoes(docDetalhe.Observacao)}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDocDetalhe(null)}>
            Fechar
          </Button>
          {docDetalhe && (
            <Button variant="primary" onClick={() => gerarPDF(docDetalhe)}>
              <i className="bi bi-file-earmark-pdf me-1"></i>
              Baixar PDF Individual
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Configurador de Relatório Personalizado */}
      <Modal
        show={modalRelatorioAberto}
        onHide={() => setModalRelatorioAberto(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: '#f8fafc' }}>
          <Modal.Title className="h5 fw-bold" style={{ color: '#3159A3' }}>
            <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>
            Construtor de Relatório Personalizado — Conselho Tutelar
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-4">
            {/* Coluna Esquerda: Opções de Personalização */}
            <Col lg={7}>
              <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3" style={{ fontSize: '0.8rem' }}>
                1. Identificação e Escopo do Relatório
              </h6>

              <Row className="g-3 mb-3">
                <Col md={12}>
                  <Form.Label className="small fw-semibold mb-1">Escopo de Documentos a Incluir</Form.Label>
                  <div className="d-flex gap-3 flex-wrap">
                    <Form.Check
                      type="radio"
                      id="escopo-filtrados"
                      name="escopoRelatorio"
                      label={`Todos os documentos filtrados (${documentosFiltrados.length})`}
                      checked={configRelatorio.escopo === 'filtrados'}
                      onChange={() => setConfigRelatorio(prev => ({ ...prev, escopo: 'filtrados' }))}
                    />
                    <Form.Check
                      type="radio"
                      id="escopo-selecionados"
                      name="escopoRelatorio"
                      disabled={uidsSelecionados.length === 0}
                      label={`Apenas documentos marcados na tabela (${uidsSelecionados.length})`}
                      checked={configRelatorio.escopo === 'selecionados'}
                      onChange={() => setConfigRelatorio(prev => ({ ...prev, escopo: 'selecionados' }))}
                    />
                  </div>
                </Col>

                <Col md={12}>
                  <Form.Label className="small fw-semibold mb-1">Título Oficial do Relatório</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={configRelatorio.tituloRelatorio}
                    onChange={(e) => setConfigRelatorio(prev => ({ ...prev, tituloRelatorio: e.target.value }))}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label className="small fw-semibold mb-1">Órgão Destinatário / Finalidade</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Ex: Ministério Público, CMDCA, Juizado..."
                    value={configRelatorio.destinatario}
                    onChange={(e) => setConfigRelatorio(prev => ({ ...prev, destinatario: e.target.value }))}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label className="small fw-semibold mb-1">Conselheiro(a) Relator(a)</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={configRelatorio.conselheiroEmissor}
                    onChange={(e) => setConfigRelatorio(prev => ({ ...prev, conselheiroEmissor: e.target.value }))}
                  />
                </Col>
              </Row>

              <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3 mt-4" style={{ fontSize: '0.8rem' }}>
                2. Estrutura, Agrupamento e Seções do Documento
              </h6>

              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Label className="small fw-semibold mb-1">Agrupar Documentos no Relatório por</Form.Label>
                  <Form.Select
                    size="sm"
                    value={configRelatorio.agrupamento}
                    onChange={(e) => setConfigRelatorio(prev => ({ ...prev, agrupamento: e.target.value }))}
                  >
                    <option value="nenhum">Sem agrupamento (Lista direta)</option>
                    <option value="tipo">Tipo de Documento</option>
                    <option value="bairro">Bairro / Localidade</option>
                    <option value="conselheiro">Conselheiro / Profissional Responsável</option>
                    <option value="mes">Mês / Ano do Registro</option>
                    <option value="direito">Direito Violado / Classificação ECA</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label className="small fw-semibold mb-1">Seções Incluídas no PDF</Form.Label>
                  <div className="bg-light p-2 rounded border">
                    <Form.Check
                      type="checkbox"
                      id="chk-filtros"
                      label="Resumo dos Filtros e Critérios Aplicados"
                      checked={configRelatorio.incluirFiltros}
                      onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirFiltros: e.target.checked }))}
                      className="small mb-1"
                    />
                    <Form.Check
                      type="checkbox"
                      id="chk-estatisticas"
                      label="Indicadores Estatísticos e Gráficos por Tipo/Bairro"
                      checked={configRelatorio.incluirEstatisticas}
                      onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirEstatisticas: e.target.checked }))}
                      className="small mb-1"
                    />
                    <Form.Check
                      type="checkbox"
                      id="chk-tabela"
                      label="Tabela Consolidada de Registros"
                      checked={configRelatorio.incluirTabela}
                      onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirTabela: e.target.checked }))}
                      className="small mb-1"
                    />
                    <Form.Check
                      type="checkbox"
                      id="chk-detalhamento"
                      label="Fichas Completas Detalhadas de Cada Documento"
                      checked={configRelatorio.incluirDetalhamento}
                      onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirDetalhamento: e.target.checked }))}
                      className="small mb-1"
                    />
                    <Form.Check
                      type="checkbox"
                      id="chk-assinatura"
                      label="Bloco de Assinatura Oficial do Conselheiro"
                      checked={configRelatorio.incluirAssinatura}
                      onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirAssinatura: e.target.checked }))}
                      className="small"
                    />
                  </div>
                </Col>

                <Col md={12}>
                  <Form.Label className="small fw-semibold mb-1">Colunas Visíveis na Tabela do Relatório</Form.Label>
                  <div className="d-flex flex-wrap gap-3 bg-light p-2 rounded border small">
                    {[
                      { key: 'id', label: 'ID / Nº' },
                      { key: 'tipo', label: 'Tipo' },
                      { key: 'data', label: 'Data' },
                      { key: 'bairro', label: 'Bairro/Local' },
                      { key: 'conselheiro', label: 'Conselheiro/Resp.' },
                      { key: 'classificacao', label: 'Classificação ECA' },
                      { key: 'descricao', label: 'Resumo/Descrição' }
                    ].map((col) => (
                      <Form.Check
                        key={col.key}
                        type="checkbox"
                        id={`col-rel-${col.key}`}
                        label={col.label}
                        checked={configRelatorio.colunas[col.key]}
                        onChange={(e) =>
                          setConfigRelatorio(prev => ({
                            ...prev,
                            colunas: { ...prev.colunas, [col.key]: e.target.checked }
                          }))
                        }
                      />
                    ))}
                  </div>
                </Col>

                <Col md={12}>
                  <Form.Label className="small fw-semibold mb-1">
                    Parecer Técnico / Observações Finais do Conselheiro (Opcional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    size="sm"
                    placeholder="Digite considerações técnicas, encaminhamentos sugeridos ou síntese para constar no fechamento do relatório..."
                    value={configRelatorio.observacoesRelatorio}
                    onChange={(e) => setConfigRelatorio(prev => ({ ...prev, observacoesRelatorio: e.target.value }))}
                  />
                </Col>
              </Row>
            </Col>

            {/* Coluna Direita: Pré-visualização ao vivo do Relatório */}
            <Col lg={5}>
              <div className="preview-relatorio-box p-3 rounded border h-100">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <span className="fw-bold small text-uppercase text-primary">
                    <i className="bi bi-eye-fill me-1"></i>Prévia do Relatório
                  </span>
                  <Badge bg="primary">{documentosParaRelatorio.length} registro(s)</Badge>
                </div>

                <div className="preview-paper p-3 bg-white rounded shadow-sm border">
                  <div className="text-center border-bottom pb-2 mb-2">
                    <div className="fw-bold text-primary" style={{ fontSize: '0.82rem' }}>
                      CONSELHO TUTELAR DE PANAMBI/RS
                    </div>
                    <div className="fw-bold text-dark mt-1" style={{ fontSize: '0.78rem' }}>
                      {configRelatorio.tituloRelatorio || 'RELATÓRIO PERSONALIZADO'}
                    </div>
                    {configRelatorio.destinatario && (
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        Destinatário: {configRelatorio.destinatario}
                      </div>
                    )}
                  </div>

                  {configRelatorio.incluirFiltros && (
                    <div className="mb-2 p-2 bg-light rounded" style={{ fontSize: '0.7rem' }}>
                      <strong>Filtros Aplicados:</strong>{' '}
                      {resumoFiltrosAtivos.length > 0
                        ? resumoFiltrosAtivos.map(f => `${f.label}: ${f.valor}`).join(' | ')
                        : 'Todos os documentos cadastrados (Sem restrição)'}
                    </div>
                  )}

                  {configRelatorio.incluirEstatisticas && (
                    <div className="mb-2">
                      <div className="fw-bold text-secondary mb-1" style={{ fontSize: '0.72rem' }}>
                        Distribuição por Tipo no Relatório:
                      </div>
                      {TIPOS_DOCUMENTO.map((t) => {
                        const qtd = documentosParaRelatorio.filter(d => d.tipo === t.value).length;
                        const perc = documentosParaRelatorio.length > 0
                          ? Math.round((qtd / documentosParaRelatorio.length) * 100)
                          : 0;
                        return (
                          <div key={t.value} className="mb-1" style={{ fontSize: '0.7rem' }}>
                            <div className="d-flex justify-content-between">
                              <span>{t.label}</span>
                              <strong>{qtd} ({perc}%)</strong>
                            </div>
                            <div className="progress" style={{ height: '5px' }}>
                              <div
                                className={`progress-bar bg-${t.variant}`}
                                style={{ width: `${perc}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-top" style={{ fontSize: '0.72rem' }}>
                    <div><strong>Agrupamento:</strong> {configRelatorio.agrupamento === 'nenhum' ? 'Cronológico / Padrão' : `Por ${configRelatorio.agrupamento}`}</div>
                    <div><strong>Detalhamento individual:</strong> {configRelatorio.incluirDetalhamento ? 'Sim (Fichas completas)' : 'Não (Apenas tabela)'}</div>
                    <div><strong>Emitente:</strong> {configRelatorio.conselheiroEmissor}</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between flex-wrap gap-2">
          <Button variant="outline-secondary" onClick={() => setModalRelatorioAberto(false)}>
            Cancelar
          </Button>
          <div className="d-flex gap-2">
            <Button variant="outline-success" onClick={handleExportarCSV}>
              <i className="bi bi-file-earmark-spreadsheet me-1"></i>
              Exportar Planilha (.CSV)
            </Button>
            <Button
              variant="primary"
              onClick={handleGerarRelatorioPDF}
              style={{ backgroundColor: '#3159A3', borderColor: '#3159A3' }}
            >
              <i className="bi bi-file-earmark-pdf-fill me-1"></i>
              Baixar Relatório Personalizado (.PDF)
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default VisualizarDocumentos;
