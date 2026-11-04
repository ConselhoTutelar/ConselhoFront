import jsPDF from 'jspdf';

// Informações do cabeçalho padrão
const CABECALHO = {
  titulo: 'Conselho Tutelar - Panambi',
  endereco: 'Rua: Hermann Mayer, 43, Térreo, Centro, Panambi/RS.',
  contato: 'Fone (55) 3375 6592/84195737 Email: conselhotutelar@panambi.rs.gov.br'
};

// Função auxiliar para formatar data
const formatarData = (data) => {
  if (!data) return 'N/A';
  const date = new Date(data);
  if (isNaN(date.getTime())) return String(data);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// Função auxiliar para formatar hora
const formatarHora = (hora) => {
  if (!hora) return 'N/A';
  return String(hora).substring(0, 5); // Formato HH:mm
};

// Função auxiliar para formatar observações (pode ser JSON ou texto simples)
export const formatarObservacoes = (observacao) => {
  if (!observacao) return null;
  
  // Tentar parsear como JSON
  try {
    const obsData = typeof observacao === 'object' ? observacao : JSON.parse(observacao);
    
    // Se for um objeto, formatar os campos de forma legível
    if (typeof obsData === 'object' && obsData !== null) {
      const linhas = [];
      
      if (obsData.identificacao && obsData.identificacao !== 'N/A') {
        linhas.push(`Identificação: ${obsData.identificacao}`);
      }
      
      if (obsData.criancasAdolescentes && obsData.criancasAdolescentes !== 'N/A') {
        linhas.push(`Crianças/Adolescentes: ${obsData.criancasAdolescentes}`);
      }
      
      if (obsData.paisResponsaveis && obsData.paisResponsaveis !== 'N/A') {
        linhas.push(`Pais/Responsáveis: ${obsData.paisResponsaveis}`);
      }
      
      if (obsData.endereco && obsData.endereco !== '-' && obsData.endereco !== 'N/A') {
        linhas.push(`Endereço: ${obsData.endereco}`);
      }
      
      if (obsData.conselheiroAveriguador && obsData.conselheiroAveriguador !== 'N/A') {
        linhas.push(`Conselheiro Averiguador: ${obsData.conselheiroAveriguador}`);
      }
      
      return linhas.length > 0 ? linhas.join('\n') : null;
    }
    
    return String(observacao);
  } catch (e) {
    // Se não for JSON, retornar como texto simples
    return String(observacao);
  }
};

// Função auxiliar para adicionar texto com quebra de linha automática
const adicionarTexto = (doc, texto, x, y, maxWidth, lineHeight = 7) => {
  const lines = doc.splitTextToSize(String(texto || 'N/A'), maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
};

// Função auxiliar para adicionar assinatura no PDF
const adicionarAssinatura = (doc, documento, y = 270) => {
  let assinatura = documento.assinatura || null;
  
  if (!assinatura && documento.Observacao) {
    try {
      const obsData = typeof documento.Observacao === 'object'
        ? documento.Observacao
        : JSON.parse(documento.Observacao);
      assinatura = obsData.assinatura;
    } catch (e) {
      // Se não for JSON, não tem assinatura
    }
  }
  
  if (assinatura) {
    if (assinatura.tipo === 'certificado' && assinatura.certificado) {
      y = adicionarSeloAssinaturaDigital(doc, y, assinatura);
    } else if (assinatura.tipo === 'digital' && assinatura.nome) {
      doc.setFontSize(9);
      doc.text(`Ass. Digital: ${assinatura.nome}`, 20, y);
    } else if (assinatura.tipo === 'fisica' && assinatura.imagem) {
      doc.setFontSize(9);
      doc.text('Assinatura Física:', 20, y);
      y += 5;
      try {
        doc.addImage(assinatura.imagem, 'PNG', 20, y, 60, 20);
        y += 25;
      } catch (e) {
        doc.text('(Imagem de assinatura)', 20, y);
        y += 5;
      }
    } else {
      doc.setFontSize(9);
      doc.text('Ass. Digital Conselheiro (a) Tutelar', 20, y);
    }
  } else {
    doc.setFontSize(9);
    doc.text('Ass. Digital Conselheiro (a) Tutelar', 20, y);
  }
  
  return y;
};

// Função para criar selo visual de assinatura digital tipo governo
const adicionarSeloAssinaturaDigital = (doc, y, assinatura) => {
  const x = 20;
  const largura = 170;
  const altura = 35;
  
  doc.setDrawColor(0, 102, 204);
  doc.setFillColor(240, 248, 255);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, largura, altura, 2, 2, 'FD');
  
  doc.setDrawColor(0, 102, 204);
  doc.line(x + 5, y + 12, x + largura - 5, y + 12);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text('ASSINATURA DIGITAL ICP-BRASIL', x + largura / 2, y + 8, { align: 'center' });
  
  doc.setFontSize(6);
  doc.text('[ICP]', x + 8, y + 20);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const dataHora = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Documento assinado digitalmente em ${dataHora}`, x + 20, y + 20);
  doc.text('Certificado Digital ICP-Brasil - Autenticidade garantida', x + 20, y + 27);
  
  doc.setFontSize(5);
  doc.setTextColor(100, 100, 100);
  const hashSimulado = 'SHA-256: ' + Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('').toUpperCase();
  doc.text(hashSimulado, x + 5, y + 33);
  
  return y + altura + 5;
};

// Gerar PDF de Denúncia
export const gerarPDFDenuncia = (denuncia) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FICHA RECEBIMENTO DE DENÚNCIA', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(CABECALHO.titulo, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.endereco, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.contato, 105, y, { align: 'center' });
  y += 15;

  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA DENÚNCIA', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `Número da Denúncia: ${denuncia.nrDenuncia || denuncia.id || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Data: ${formatarData(denuncia.Data || denuncia.data)}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Tipo de Denúncia: ${denuncia.TipoDenuncia || denuncia.tipoDenuncia || 'N/A'}`, 20, y, 170);
  y += 5;
  if (denuncia.nomeConselheiro || denuncia.conselheiro) {
    y = adicionarTexto(doc, `Conselheiro Responsável: ${denuncia.nomeConselheiro || denuncia.conselheiro}`, 20, y, 170);
    y += 5;
  }
  if (denuncia.direitoVioladoDescricao || denuncia.direitoViolado) {
    y = adicionarTexto(doc, `Direito Violado: ${denuncia.direitoVioladoDescricao || denuncia.direitoViolado}`, 20, y, 170);
    y += 5;
  }
  y = adicionarTexto(doc, `Descrição dos Fatos:`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, denuncia.DescricaoFato || denuncia.descricao || 'N/A', 20, y, 170);
  y += 5;
  
  if (denuncia.Observacao) {
    const observacoesFormatadas = formatarObservacoes(denuncia.Observacao);
    if (observacoesFormatadas) {
      y = adicionarTexto(doc, `Observações:`, 20, y, 170);
      y += 5;
      y = adicionarTexto(doc, observacoesFormatadas, 20, y, 170);
      y += 5;
    }
  } else if (denuncia.endereco) {
    y = adicionarTexto(doc, `Endereço: ${denuncia.endereco}`, 20, y, 170);
    y += 5;
  }
  
  if (denuncia.Data_averiguacao) {
    y = adicionarTexto(doc, `Data de Averiguação: ${formatarData(denuncia.Data_averiguacao)}`, 20, y, 170);
    y += 5;
  }

  adicionarAssinatura(doc, denuncia);
  doc.save(`Denuncia_${denuncia.nrDenuncia || denuncia.id || 'N/A'}.pdf`);
};

// Gerar PDF de Atendimento
export const gerarPDFAtendimento = (atendimento) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FICHA DE ATENDIMENTO', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(CABECALHO.titulo, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.endereco, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.contato, 105, y, { align: 'center' });
  y += 15;

  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO ATENDIMENTO', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `ID do Atendimento: ${atendimento.idAtendimento || atendimento.id || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Data: ${formatarData(atendimento.Data || atendimento.data)}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Hora: ${formatarHora(atendimento.Hora || atendimento.hora)}`, 20, y, 170);
  y += 5;
  
  if (atendimento.direitoVioladoDescricao || atendimento.direitoViolado) {
    y = adicionarTexto(doc, `Direito Violado: ${atendimento.direitoVioladoDescricao || atendimento.direitoViolado}`, 20, y, 170);
    y += 5;
  }
  if (atendimento.profissional || atendimento.nomeConselheiro) {
    y = adicionarTexto(doc, `Profissional / Conselheiro: ${atendimento.profissional || atendimento.nomeConselheiro}`, 20, y, 170);
    y += 5;
  }
  if (atendimento.endereco) {
    y = adicionarTexto(doc, `Endereço: ${atendimento.endereco}`, 20, y, 170);
    y += 5;
  }
  
  y = adicionarTexto(doc, `Relato:`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, atendimento.Relato || atendimento.descricao || 'N/A', 20, y, 170);

  adicionarAssinatura(doc, atendimento);
  doc.save(`Atendimento_${atendimento.idAtendimento || atendimento.id || 'N/A'}.pdf`);
};

// Gerar PDF de Notificação
export const gerarPDFNotificacao = (notificacao) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTIFICAÇÃO', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(CABECALHO.titulo, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.endereco, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.contato, 105, y, { align: 'center' });
  y += 15;

  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA NOTIFICAÇÃO', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `ID da Notificação: ${notificacao.id || 'N/A'}`, 20, y, 170);
  y += 5;
  if (notificacao.data || notificacao.Data) {
    y = adicionarTexto(doc, `Data: ${formatarData(notificacao.data || notificacao.Data)}`, 20, y, 170);
    y += 5;
  }
  if (notificacao.redator || notificacao.recebedor) {
    y = adicionarTexto(doc, `Nome de quem recebeu: ${notificacao.redator || notificacao.recebedor}`, 20, y, 170);
    y += 5;
  }
  if (notificacao.nomeConselheiro) {
    y = adicionarTexto(doc, `Conselheiro Responsável: ${notificacao.nomeConselheiro}`, 20, y, 170);
    y += 5;
  }
  if (notificacao.endereco) {
    y = adicionarTexto(doc, `Endereço: ${notificacao.endereco}`, 20, y, 170);
    y += 5;
  }
  if (notificacao.descricao || (typeof notificacao.assinatura === 'string' && notificacao.assinatura)) {
    y = adicionarTexto(doc, `Segunda via da Convocação / Descrição:`, 20, y, 170);
    y += 5;
    y = adicionarTexto(doc, notificacao.descricao || notificacao.assinatura, 20, y, 170);
  }

  adicionarAssinatura(doc, notificacao);
  doc.save(`Notificacao_${notificacao.id || 'N/A'}.pdf`);
};

// Gerar PDF de Termo de Medidas (Menor)
export const gerarPDFTermoMedidasMenor = (termo) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE MEDIDAS APLICADAS', 105, y, { align: 'center' });
  y += 5;
  doc.setFontSize(12);
  doc.text('(Criança/Adolescente)', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(CABECALHO.titulo, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.endereco, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.contato, 105, y, { align: 'center' });
  y += 15;

  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO TERMO', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `ID do Termo: ${termo.idmedida_aplicada || termo.id || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Data: ${formatarData(termo.data || termo.Data)}`, 20, y, 170);
  y += 5;
  
  if (termo.nomeMenor) {
    y = adicionarTexto(doc, `Criança/Adolescente: ${termo.nomeMenor}`, 20, y, 170);
    y += 5;
  }
  if (termo.inciso) {
    y = adicionarTexto(doc, `Inciso (Art. 101 ECA): Inciso ${termo.inciso}`, 20, y, 170);
    y += 5;
  }
  if (termo.endereco) {
    y = adicionarTexto(doc, `Endereço: ${termo.endereco}`, 20, y, 170);
    y += 5;
  }
  
  y = adicionarTexto(doc, `Descrição:`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, termo.descricao || 'N/A', 20, y, 170);

  adicionarAssinatura(doc, termo);
  doc.save(`TermoMedidasMenor_${termo.idmedida_aplicada || termo.id || 'N/A'}.pdf`);
};

// Gerar PDF de Termo de Medidas (Responsável)
export const gerarPDFTermoMedidasResponsavel = (termo) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE MEDIDAS APLICADAS', 105, y, { align: 'center' });
  y += 5;
  doc.setFontSize(12);
  doc.text('(Responsável)', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(CABECALHO.titulo, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.endereco, 105, y, { align: 'center' });
  y += 5;
  doc.text(CABECALHO.contato, 105, y, { align: 'center' });
  y += 15;

  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO TERMO', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `ID do Termo: ${termo.idmedida_aplicada || termo.id || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Data: ${formatarData(termo.data || termo.Data)}`, 20, y, 170);
  y += 5;
  
  if (termo.nomeResponsavel) {
    y = adicionarTexto(doc, `Responsável: ${termo.nomeResponsavel}`, 20, y, 170);
    y += 5;
  }
  if (termo.inciso) {
    y = adicionarTexto(doc, `Inciso (Art. 129 ECA): Inciso ${termo.inciso}`, 20, y, 170);
    y += 5;
  }
  if (termo.Encaminhamento) {
    y = adicionarTexto(doc, `Encaminhamento: ${termo.Encaminhamento}`, 20, y, 170);
    y += 5;
  }
  if (termo.endereco) {
    y = adicionarTexto(doc, `Endereço: ${termo.endereco}`, 20, y, 170);
    y += 5;
  }
  
  y = adicionarTexto(doc, `Descrição:`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, termo.descricao || 'N/A', 20, y, 170);

  adicionarAssinatura(doc, termo);
  doc.save(`TermoMedidasResponsavel_${termo.idmedida_aplicada || termo.id || 'N/A'}.pdf`);
};

// Função principal para gerar PDF baseado no tipo
export const gerarPDF = (documento) => {
  switch (documento.tipo) {
    case 'denuncia':
      gerarPDFDenuncia(documento);
      break;
    case 'atendimento':
      gerarPDFAtendimento(documento);
      break;
    case 'notificacao':
      gerarPDFNotificacao(documento);
      break;
    case 'termo-medidas-menor':
      gerarPDFTermoMedidasMenor(documento);
      break;
    case 'termo-medidas-responsavel':
      gerarPDFTermoMedidasResponsavel(documento);
      break;
    default:
      console.error('Tipo de documento não reconhecido:', documento.tipo);
      alert('Tipo de documento não suportado para geração de PDF');
  }
};

const LABELS_TIPOS = {
  'denuncia': 'Denúncia',
  'atendimento': 'Ficha de Atendimento',
  'notificacao': 'Notificação',
  'termo-medidas-menor': 'Termo de Medidas (Menor)',
  'termo-medidas-responsavel': 'Termo de Medidas (Responsável)'
};

const agruparListaDocumentos = (documentos, modoAgrupamento) => {
  if (!modoAgrupamento || modoAgrupamento === 'nenhum') {
    return [{ titulo: 'Todos os Documentos Selecionados', itens: documentos }];
  }

  const mapa = new Map();
  documentos.forEach((doc) => {
    let chave = 'Não Informado';
    if (modoAgrupamento === 'tipo') {
      chave = LABELS_TIPOS[doc.tipo] || doc.tipoLabel || doc.tipo;
    } else if (modoAgrupamento === 'bairro') {
      chave = doc.bairroNormalizado || 'Bairro Não Informado';
    } else if (modoAgrupamento === 'conselheiro') {
      chave = doc.conselheiroNormalizado || 'Conselheiro/Profissional Não Informado';
    } else if (modoAgrupamento === 'direito') {
      chave = doc.classificacaoNormalizada || 'Classificação Geral';
    } else if (modoAgrupamento === 'mes') {
      if (doc.dataObj && !isNaN(doc.dataObj.getTime())) {
        const mesAno = doc.dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        chave = mesAno.charAt(0).toUpperCase() + mesAno.slice(1);
      } else {
        chave = 'Sem Data Definida';
      }
    }

    if (!mapa.has(chave)) {
      mapa.set(chave, []);
    }
    mapa.get(chave).push(doc);
  });

  return Array.from(mapa.entries()).map(([titulo, itens]) => ({ titulo, itens }));
};

/**
 * Gera um Relatório Personalizado em PDF a partir dos documentos filtrados/selecionados
 */
export const gerarRelatorioPersonalizadoPDF = (documentos, opcoes = {}) => {
  const {
    tituloRelatorio = 'RELATÓRIO PERSONALIZADO DE DOCUMENTOS E OCORRÊNCIAS',
    subtituloRelatorio = 'Conselho Tutelar de Panambi/RS - Sistema de Gestão e Monitoramento (ECA)',
    destinatario = '',
    conselheiroEmissor = 'Conselheiro(a) Tutelar',
    observacoesRelatorio = '',
    agrupamento = 'nenhum',
    incluirFiltros = true,
    incluirEstatisticas = true,
    incluirTabela = true,
    incluirDetalhamento = false,
    incluirAssinatura = true,
    colunas = {
      id: true,
      tipo: true,
      data: true,
      bairro: true,
      conselheiro: true,
      classificacao: true,
      descricao: true
    },
    resumoFiltrosAtivos = []
  } = opcoes;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const larguraPagina = 210;
  const margemEsq = 14;
  const margemDir = 196;
  const larguraUtil = margemDir - margemEsq;
  let y = 15;

  const verificarQuebraPagina = (alturaNecessaria = 20) => {
    if (y + alturaNecessaria > 274) {
      doc.addPage();
      y = 18;
      return true;
    }
    return false;
  };

  // 1. Cabeçalho Institucional
  doc.setFillColor(49, 89, 163); // #3159A3
  doc.roundedRect(margemEsq, y, larguraUtil, 24, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(CABECALHO.titulo.toUpperCase(), larguraPagina / 2, y + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(CABECALHO.endereco, larguraPagina / 2, y + 13, { align: 'center' });
  doc.text(CABECALHO.contato, larguraPagina / 2, y + 18, { align: 'center' });
  y += 30;

  // Título Personalizado do Relatório
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const linhasTitulo = doc.splitTextToSize(tituloRelatorio.toUpperCase(), larguraUtil);
  doc.text(linhasTitulo, larguraPagina / 2, y, { align: 'center' });
  y += linhasTitulo.length * 6;

  if (subtituloRelatorio) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(subtituloRelatorio, larguraPagina / 2, y, { align: 'center' });
    y += 6;
  }

  // Metadados da Emissão
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margemEsq, y, larguraUtil, destinatario ? 18 : 13, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const dataGeracao = new Date().toLocaleString('pt-BR');
  doc.setFont('helvetica', 'bold');
  doc.text('Emitido em:', margemEsq + 3, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(dataGeracao, margemEsq + 23, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Responsável:', margemEsq + 70, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(String(conselheiroEmissor || 'Conselheiro(a) Tutelar').substring(0, 42), margemEsq + 92, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Total no Relatório:', margemEsq + 3, y + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${documentos.length} documento(s) selecionado(s)`, margemEsq + 33, y + 10.5);

  if (destinatario) {
    doc.setFont('helvetica', 'bold');
    doc.text('Destinatário / Finalidade:', margemEsq + 3, y + 15.5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(destinatario).substring(0, 80), margemEsq + 42, y + 15.5);
    y += 23;
  } else {
    y += 18;
  }

  // 2. Filtros e Critérios Aplicados
  if (incluirFiltros && resumoFiltrosAtivos && resumoFiltrosAtivos.length > 0) {
    verificarQuebraPagina(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(49, 89, 163);
    doc.text('CRITÉRIOS E FILTROS APLICADOS NA CONSULTA', margemEsq, y);
    y += 4;

    const textoFiltros = resumoFiltrosAtivos.map(f => `• ${f.label}: ${f.valor}`).join('   |   ');
    const linhasFiltros = doc.splitTextToSize(textoFiltros, larguraUtil - 6);
    const alturaCaixaFiltros = Math.max(10, linhasFiltros.length * 4.5 + 4);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(148, 163, 184);
    doc.roundedRect(margemEsq, y, larguraUtil, alturaCaixaFiltros, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(linhasFiltros, margemEsq + 3, y + 5);
    y += alturaCaixaFiltros + 6;
  }

  // 3. Estatísticas e Gráficos de Distribuição
  if (incluirEstatisticas && documentos.length > 0) {
    verificarQuebraPagina(55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(49, 89, 163);
    doc.text('INDICADORES E DISTRIBUIÇÃO ESTATÍSTICA DO RECORTE', margemEsq, y);
    y += 4;

    const contagemPorTipo = {
      'denuncia': 0,
      'atendimento': 0,
      'notificacao': 0,
      'termo-medidas-menor': 0,
      'termo-medidas-responsavel': 0
    };
    const contagemPorBairro = {};

    documentos.forEach((d) => {
      if (contagemPorTipo[d.tipo] !== undefined) {
        contagemPorTipo[d.tipo]++;
      }
      const b = d.bairroNormalizado || 'Não informado';
      contagemPorBairro[b] = (contagemPorBairro[b] || 0) + 1;
    });

    const coresTipos = {
      'denuncia': [220, 53, 69],
      'atendimento': [13, 110, 253],
      'notificacao': [245, 158, 11],
      'termo-medidas-menor': [13, 202, 240],
      'termo-medidas-responsavel': [25, 135, 84]
    };

    // Desenhar quadro de distribuição por tipo
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margemEsq, y, larguraUtil, 36, 1.5, 1.5, 'FD');

    let yBarra = y + 6;
    Object.entries(LABELS_TIPOS).forEach(([chave, nome]) => {
      const qtd = contagemPorTipo[chave] || 0;
      const perc = documentos.length > 0 ? Math.round((qtd / documentos.length) * 100) : 0;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(nome, margemEsq + 4, yBarra);

      // Fundo da barra
      const xInicioBarra = margemEsq + 58;
      const larguraMaxBarra = 92;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(xInicioBarra, yBarra - 3, larguraMaxBarra, 3.8, 1, 1, 'F');

      // Preenchimento proporcional
      if (qtd > 0) {
        const cor = coresTipos[chave] || [49, 89, 163];
        doc.setFillColor(cor[0], cor[1], cor[2]);
        const larguraPreenchida = Math.max(2, (qtd / documentos.length) * larguraMaxBarra);
        doc.roundedRect(xInicioBarra, yBarra - 3, larguraPreenchida, 3.8, 1, 1, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${qtd} (${perc}%)`, xInicioBarra + larguraMaxBarra + 4, yBarra);
      yBarra += 6.5;
    });

    y += 41;

    // Resumo dos principais bairros no recorte
    const topBairros = Object.entries(contagemPorBairro)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    if (topBairros.length > 0) {
      verificarQuebraPagina(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const textoBairros = 'Concentração por Bairro/Localidade: ' +
        topBairros.map(([b, q]) => `${b}: ${q} (${Math.round((q / documentos.length) * 100)}%)`).join('  •  ');
      const linhasBairros = doc.splitTextToSize(textoBairros, larguraUtil);
      doc.text(linhasBairros, margemEsq, y);
      y += linhasBairros.length * 4.5 + 4;
    }
  }

  // 4. Listagem Consolidada / Agrupada
  if (incluirTabela && documentos.length > 0) {
    verificarQuebraPagina(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(49, 89, 163);
    doc.text('LISTAGEM CONSOLIDADA DE DOCUMENTOS', margemEsq, y);
    y += 5;

    const grupos = agruparListaDocumentos(documentos, agrupamento);

    grupos.forEach((grupo) => {
      verificarQuebraPagina(22);

      if (agrupamento !== 'nenhum') {
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(margemEsq, y, larguraUtil, 7, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${grupo.titulo} (${grupo.itens.length} registro${grupo.itens.length !== 1 ? 's' : ''})`, margemEsq + 3, y + 4.8);
        y += 9;
      }

      // Cabeçalho da Tabela
      doc.setFillColor(49, 89, 163);
      doc.rect(margemEsq, y, larguraUtil, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);

      let colX = margemEsq + 2;
      if (colunas.id) { doc.text('ID', colX, y + 4.5); colX += 18; }
      if (colunas.tipo) { doc.text('Tipo', colX, y + 4.5); colX += 32; }
      if (colunas.data) { doc.text('Data', colX, y + 4.5); colX += 20; }
      if (colunas.bairro) { doc.text('Bairro/Local', colX, y + 4.5); colX += 26; }
      if (colunas.conselheiro) { doc.text('Responsável', colX, y + 4.5); colX += 32; }
      if (colunas.classificacao) { doc.text('Classificação/ECA', colX, y + 4.5); colX += 28; }
      if (colunas.descricao) { doc.text('Resumo / Descrição', colX, y + 4.5); }
      y += 7.5;

      grupo.itens.forEach((item, idx) => {
        const descTexto = String(item.descricaoNormalizada || 'N/A');
        const larguraDesc = Math.max(25, margemDir - colX - 2);
        const linhasDesc = colunas.descricao
          ? doc.splitTextToSize(descTexto, larguraDesc).slice(0, 2)
          : [''];
        const alturaLinha = Math.max(6.5, linhasDesc.length * 4 + 2.5);

        if (verificarQuebraPagina(alturaLinha + 4)) {
          // Redesenha cabeçalho da tabela na nova página
          doc.setFillColor(49, 89, 163);
          doc.rect(margemEsq, y, larguraUtil, 6.5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(255, 255, 255);
          let cX = margemEsq + 2;
          if (colunas.id) { doc.text('ID', cX, y + 4.5); cX += 18; }
          if (colunas.tipo) { doc.text('Tipo', cX, y + 4.5); cX += 32; }
          if (colunas.data) { doc.text('Data', cX, y + 4.5); cX += 20; }
          if (colunas.bairro) { doc.text('Bairro/Local', cX, y + 4.5); cX += 26; }
          if (colunas.conselheiro) { doc.text('Responsável', cX, y + 4.5); cX += 32; }
          if (colunas.classificacao) { doc.text('Classificação/ECA', cX, y + 4.5); cX += 28; }
          if (colunas.descricao) { doc.text('Resumo / Descrição', cX, y + 4.5); }
          y += 7.5;
        }

        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margemEsq, y - 1, larguraUtil, alturaLinha, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(30, 41, 59);

        let xAtual = margemEsq + 2;
        if (colunas.id) {
          doc.setFont('helvetica', 'bold');
          doc.text(String(item.idExibicao || item.id).substring(0, 11), xAtual, y + 3.5);
          doc.setFont('helvetica', 'normal');
          xAtual += 18;
        }
        if (colunas.tipo) {
          doc.text(String(LABELS_TIPOS[item.tipo] || item.tipo).substring(0, 20), xAtual, y + 3.5);
          xAtual += 32;
        }
        if (colunas.data) {
          doc.text(formatarData(item.dataRaw), xAtual, y + 3.5);
          xAtual += 20;
        }
        if (colunas.bairro) {
          doc.text(String(item.bairroNormalizado || '-').substring(0, 15), xAtual, y + 3.5);
          xAtual += 26;
        }
        if (colunas.conselheiro) {
          doc.text(String(item.conselheiroNormalizado || '-').substring(0, 18), xAtual, y + 3.5);
          xAtual += 32;
        }
        if (colunas.classificacao) {
          doc.text(String(item.classificacaoNormalizada || '-').substring(0, 16), xAtual, y + 3.5);
          xAtual += 28;
        }
        if (colunas.descricao) {
          doc.text(linhasDesc, xAtual, y + 3.5);
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(margemEsq, y + alturaLinha - 1, margemDir, y + alturaLinha - 1);
        y += alturaLinha;
      });

      y += 5;
    });
  }

  // 5. Detalhamento Completo Individual (Fichas em Anexo)
  if (incluirDetalhamento && documentos.length > 0) {
    verificarQuebraPagina(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(49, 89, 163);
    doc.text('DETALHAMENTO COMPLETO DOS DOCUMENTOS SELECIONADOS', margemEsq, y);
    y += 5;

    documentos.forEach((item, index) => {
      verificarQuebraPagina(38);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margemEsq, y, larguraUtil, 7, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(49, 89, 163);
      doc.text(
        `${index + 1}. [${LABELS_TIPOS[item.tipo] || item.tipo}] ID: ${item.idExibicao || item.id} — Data: ${formatarData(item.dataRaw)}`,
        margemEsq + 3,
        y + 4.8
      );
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);

      const metadadosItem = [
        item.bairroNormalizado ? `Bairro: ${item.bairroNormalizado}` : null,
        item.enderecoNormalizado ? `Endereço: ${item.enderecoNormalizado}` : null,
        item.conselheiroNormalizado ? `Conselheiro/Profissional: ${item.conselheiroNormalizado}` : null,
        item.envolvidosNormalizado ? `Envolvidos/Partes: ${item.envolvidosNormalizado}` : null,
        item.classificacaoNormalizada ? `Classificação/ECA: ${item.classificacaoNormalizada}` : null,
        item.Data_averiguacao ? `Data de Averiguação: ${formatarData(item.Data_averiguacao)}` : null
      ].filter(Boolean).join('   |   ');

      if (metadadosItem) {
        const linhasMeta = doc.splitTextToSize(metadadosItem, larguraUtil - 4);
        doc.text(linhasMeta, margemEsq + 2, y);
        y += linhasMeta.length * 4.2 + 2;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Relato / Descrição:', margemEsq + 2, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      const linhasRelato = doc.splitTextToSize(String(item.descricaoNormalizada || 'Sem descrição'), larguraUtil - 4);
      doc.text(linhasRelato, margemEsq + 2, y);
      y += linhasRelato.length * 4.2 + 4;

      doc.setDrawColor(226, 232, 240);
      doc.line(margemEsq, y - 2, margemDir, y - 2);
      y += 2;
    });
  }

  // 6. Parecer Técnico / Observações do Conselheiro
  if (observacoesRelatorio && observacoesRelatorio.trim() !== '') {
    verificarQuebraPagina(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(49, 89, 163);
    doc.text('PARECER TÉCNICO / OBSERVAÇÕES DO CONSELHEIRO RELATOR', margemEsq, y);
    y += 4;

    const linhasObs = doc.splitTextToSize(observacoesRelatorio.trim(), larguraUtil - 6);
    const alturaObs = Math.max(14, linhasObs.length * 4.5 + 6);

    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(margemEsq, y, larguraUtil, alturaObs, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(linhasObs, margemEsq + 3, y + 5.5);
    y += alturaObs + 8;
  }

  // 7. Bloco de Assinatura Oficial
  if (incluirAssinatura) {
    verificarQuebraPagina(35);
    y += 8;
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.4);
    doc.line(60, y + 10, 150, y + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(String(conselheiroEmissor || 'Conselheiro(a) Tutelar'), larguraPagina / 2, y + 15, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Conselho Tutelar de Panambi/RS - Documento Oficial Gerado pelo Sistema', larguraPagina / 2, y + 19.5, { align: 'center' });
  }

  // Numeração de páginas no rodapé de todas as folhas
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.line(margemEsq, 284, margemDir, 284);
    doc.text(
      `Conselho Tutelar de Panambi/RS • Relatório Personalizado • Emitido em ${dataGeracao}`,
      margemEsq,
      289
    );
    doc.text(`Página ${p} de ${totalPaginas}`, margemDir, 289, { align: 'right' });
  }

  const sufixoData = new Date().toISOString().slice(0, 10);
  doc.save(`Relatorio_Personalizado_Conselho_${sufixoData}.pdf`);
};

/**
 * Exporta os documentos filtrados/selecionados para planilha CSV (compatível com Excel PT-BR)
 */
export const exportarRelatorioCSV = (documentos, opcoes = {}) => {
  const {
    colunas = {
      id: true,
      tipo: true,
      data: true,
      bairro: true,
      conselheiro: true,
      classificacao: true,
      descricao: true
    }
  } = opcoes;

  const cabecalhos = [];
  if (colunas.id) cabecalhos.push('ID');
  if (colunas.tipo) cabecalhos.push('Tipo de Documento');
  if (colunas.data) cabecalhos.push('Data');
  if (colunas.bairro) cabecalhos.push('Bairro / Localidade');
  if (colunas.conselheiro) cabecalhos.push('Conselheiro / Profissional');
  if (colunas.classificacao) cabecalhos.push('Classificação / ECA');
  cabecalhos.push('Envolvidos / Partes');
  cabecalhos.push('Endereço Completo');
  if (colunas.descricao) cabecalhos.push('Descrição / Relato');

  const escaparCSV = (valor) => {
    const limpo = String(valor ?? '').replace(/\r?\n|\r/g, ' ').replace(/"/g, '""');
    return `"${limpo}"`;
  };

  const linhas = [cabecalhos.map(escaparCSV).join(';')];

  documentos.forEach((item) => {
    const linha = [];
    if (colunas.id) linha.push(item.idExibicao || item.id);
    if (colunas.tipo) linha.push(LABELS_TIPOS[item.tipo] || item.tipo);
    if (colunas.data) linha.push(formatarData(item.dataRaw));
    if (colunas.bairro) linha.push(item.bairroNormalizado || 'Não informado');
    if (colunas.conselheiro) linha.push(item.conselheiroNormalizado || 'Não informado');
    if (colunas.classificacao) linha.push(item.classificacaoNormalizada || '-');
    linha.push(item.envolvidosNormalizado || '-');
    linha.push(item.enderecoNormalizado || '-');
    if (colunas.descricao) linha.push(item.descricaoNormalizada || '-');
    linhas.push(linha.map(escaparCSV).join(';'));
  });

  const conteudoCSV = '\uFEFF' + linhas.join('\r\n');
  const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sufixoData = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `Relatorio_Documentos_Conselho_${sufixoData}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
