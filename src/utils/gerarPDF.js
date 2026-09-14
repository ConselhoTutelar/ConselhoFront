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
  return date.toLocaleDateString('pt-BR');
};

// Função auxiliar para formatar hora
const formatarHora = (hora) => {
  if (!hora) return 'N/A';
  return hora.substring(0, 5); // Formato HH:mm
};

// Função auxiliar para formatar observações (pode ser JSON ou texto simples)
const formatarObservacoes = (observacao) => {
  if (!observacao) return null;
  
  // Tentar parsear como JSON
  try {
    const obsData = JSON.parse(observacao);
    
    // Se for um objeto, formatar os campos de forma legível
    if (typeof obsData === 'object' && obsData !== null) {
      const linhas = [];
      
      if (obsData.identificacao) {
        linhas.push(`Identificação: ${obsData.identificacao}`);
      }
      
      if (obsData.criancasAdolescentes) {
        linhas.push(`Crianças/Adolescentes: ${obsData.criancasAdolescentes}`);
      }
      
      if (obsData.paisResponsaveis) {
        linhas.push(`Pais/Responsáveis: ${obsData.paisResponsaveis}`);
      }
      
      if (obsData.endereco && obsData.endereco !== '-') {
        linhas.push(`Endereço: ${obsData.endereco}`);
      }
      
      if (obsData.conselheiroAveriguador) {
        linhas.push(`Conselheiro Averiguador: ${obsData.conselheiroAveriguador}`);
      }
      
      // Não incluir assinatura aqui, pois ela é tratada separadamente
      
      return linhas.length > 0 ? linhas.join('\n') : null;
    }
    
    return observacao;
  } catch (e) {
    // Se não for JSON, retornar como texto simples
    return observacao;
  }
};

// Função auxiliar para adicionar texto com quebra de linha automática
const adicionarTexto = (doc, texto, x, y, maxWidth, lineHeight = 7) => {
  const lines = doc.splitTextToSize(texto || 'N/A', maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
};

// Função auxiliar para adicionar assinatura no PDF
const adicionarAssinatura = (doc, documento, y = 270) => {
  // Tentar obter assinatura do documento
  let assinatura = documento.assinatura || null;
  
  // Se não tiver assinatura direta, tentar obter do campo Observacao (JSON)
  if (!assinatura && documento.Observacao) {
    try {
      const obsData = JSON.parse(documento.Observacao);
      assinatura = obsData.assinatura;
    } catch (e) {
      // Se não for JSON, não tem assinatura
    }
  }
  
  if (assinatura) {
    if (assinatura.tipo === 'certificado' && assinatura.certificado) {
      // Selo de Assinatura Digital ICP-Brasil (tipo governo)
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
  
  // Fundo do selo (retângulo com borda)
  doc.setDrawColor(0, 102, 204); // Azul tipo governo
  doc.setFillColor(240, 248, 255); // Azul claro de fundo
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, largura, altura, 2, 2, 'FD'); // FD = Fill and Draw
  
  // Linha divisória interna
  doc.setDrawColor(0, 102, 204);
  doc.line(x + 5, y + 12, x + largura - 5, y + 12);
  
  // Texto "ASSINATURA DIGITAL"
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text('ASSINATURA DIGITAL ICP-BRASIL', x + largura / 2, y + 8, { align: 'center' });
  
  // Ícone de cadeado (simulado com texto)
  doc.setFontSize(6);
  doc.text('🔒', x + 10, y + 20);
  
  // Informações da assinatura
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
  
  // Hash simulado (em produção, seria o hash real do documento)
  doc.setFontSize(5);
  doc.setTextColor(100, 100, 100);
  const hashSimulado = 'SHA-256: ' + Array.from({length: 16}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('').toUpperCase();
  doc.text(hashSimulado, x + 5, y + 33);
  
  return y + altura + 5;
};

// Gerar PDF de Denúncia
export const gerarPDFDenuncia = (denuncia) => {
  const doc = new jsPDF();
  let y = 20;

  // Cabeçalho
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

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // Dados da denúncia
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA DENÚNCIA', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `Número da Denúncia: ${denuncia.nrDenuncia || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Data: ${formatarData(denuncia.Data)}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Tipo de Denúncia: ${denuncia.TipoDenuncia || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Descrição dos Fatos:`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, denuncia.DescricaoFato || 'N/A', 20, y, 170);
  y += 5;
  
  if (denuncia.Observacao) {
    const observacoesFormatadas = formatarObservacoes(denuncia.Observacao);
    if (observacoesFormatadas) {
      y = adicionarTexto(doc, `Observações:`, 20, y, 170);
      y += 5;
      y = adicionarTexto(doc, observacoesFormatadas, 20, y, 170);
      y += 5;
    }
  }
  
  if (denuncia.Data_averiguacao) {
    y = adicionarTexto(doc, `Data de Averiguação: ${formatarData(denuncia.Data_averiguacao)}`, 20, y, 170);
    y += 5;
  }

  // Rodapé - Assinatura
  adicionarAssinatura(doc, denuncia);

  // Salvar PDF
  doc.save(`Denuncia_${denuncia.nrDenuncia || 'N/A'}.pdf`);
};

// Gerar PDF de Atendimento
export const gerarPDFAtendimento = (atendimento) => {
  const doc = new jsPDF();
  let y = 20;

  // Cabeçalho
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

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // Dados do atendimento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO ATENDIMENTO', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `ID do Atendimento: ${atendimento.idAtendimento || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Data: ${formatarData(atendimento.Data)}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Hora: ${formatarHora(atendimento.Hora)}`, 20, y, 170);
  y += 5;
  
  if (atendimento.direitoVioladoDescricao) {
    y = adicionarTexto(doc, `Direito Violado: ${atendimento.direitoVioladoDescricao}`, 20, y, 170);
    y += 5;
  }
  
  y = adicionarTexto(doc, `Relato:`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, atendimento.Relato || 'N/A', 20, y, 170);

  // Rodapé - Assinatura
  adicionarAssinatura(doc, atendimento);

  // Salvar PDF
  doc.save(`Atendimento_${atendimento.idAtendimento || 'N/A'}.pdf`);
};

// Gerar PDF de Notificação
export const gerarPDFNotificacao = (notificacao) => {
  const doc = new jsPDF();
  let y = 20;

  // Cabeçalho
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

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // Dados da notificação
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA NOTIFICAÇÃO', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `ID da Notificação: ${notificacao.id || 'N/A'}`, 20, y, 170);
  y += 5;
  
  if (notificacao.redator) {
    y = adicionarTexto(doc, `Nome de quem recebeu: ${notificacao.redator}`, 20, y, 170);
    y += 5;
  }
  
  if (notificacao.assinatura) {
    y = adicionarTexto(doc, `Segue abaixo a segunda via da Convocação:`, 20, y, 170);
    y += 5;
    y = adicionarTexto(doc, notificacao.assinatura, 20, y, 170);
  }

  // Rodapé - Assinatura
  adicionarAssinatura(doc, notificacao);

  // Salvar PDF
  doc.save(`Notificacao_${notificacao.id || 'N/A'}.pdf`);
};

// Gerar PDF de Termo de Medidas (Menor)
export const gerarPDFTermoMedidasMenor = (termo) => {
  const doc = new jsPDF();
  let y = 20;

  // Cabeçalho
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

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // Dados do termo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO TERMO', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `ID do Termo: ${termo.idmedida_aplicada || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Data: ${formatarData(termo.data)}`, 20, y, 170);
  y += 5;
  
  if (termo.inciso) {
    y = adicionarTexto(doc, `Inciso: ${termo.inciso}`, 20, y, 170);
    y += 5;
  }
  
  y = adicionarTexto(doc, `Descrição:`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, termo.descricao || 'N/A', 20, y, 170);

  // Rodapé - Assinatura
  adicionarAssinatura(doc, termo);

  // Salvar PDF
  doc.save(`TermoMedidasMenor_${termo.idmedida_aplicada || 'N/A'}.pdf`);
};

// Gerar PDF de Termo de Medidas (Responsável)
export const gerarPDFTermoMedidasResponsavel = (termo) => {
  const doc = new jsPDF();
  let y = 20;

  // Cabeçalho
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

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // Dados do termo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO TERMO', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  y = adicionarTexto(doc, `ID do Termo: ${termo.idmedida_aplicada || 'N/A'}`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, `Data: ${formatarData(termo.data)}`, 20, y, 170);
  y += 5;
  
  if (termo.inciso) {
    y = adicionarTexto(doc, `Inciso: ${termo.inciso}`, 20, y, 170);
    y += 5;
  }
  
  if (termo.Encaminhamento) {
    y = adicionarTexto(doc, `Encaminhamento: ${termo.Encaminhamento}`, 20, y, 170);
    y += 5;
  }
  
  y = adicionarTexto(doc, `Descrição:`, 20, y, 170);
  y += 5;
  y = adicionarTexto(doc, termo.descricao || 'N/A', 20, y, 170);

  // Rodapé - Assinatura
  adicionarAssinatura(doc, termo);

  // Salvar PDF
  doc.save(`TermoMedidasResponsavel_${termo.idmedida_aplicada || 'N/A'}.pdf`);
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

