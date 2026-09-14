export const marcadoresFalsos = [
  {
    idMarcador: 'denuncia-centro-panambi',
    latitude: -28.2895,
    longitude: -53.501,
    tipoDocumento: 'denuncia',
    idDocumento: 'DEN-00982',
    endereco: 'Av. Presidente JK, 215 - Bairro Centro, Panambi/RS',
    descricao: 'Vizinha relatou negligência com ausência prolongada de responsáveis.'
  },
  {
    idMarcador: 'denuncia-arco-iris-panambi',
    latitude: -28.2852,
    longitude: -53.4901,
    tipoDocumento: 'denuncia',
    idDocumento: 'DEN-01011',
    endereco: 'Rua das Laranjeiras, 88 - Bairro Arco-Íris, Panambi/RS',
    descricao: 'Relato de crianças desacompanhadas circulando tarde da noite.'
  },
  {
    idMarcador: 'atendimento-esperanca-panambi',
    latitude: -28.297,
    longitude: -53.5075,
    tipoDocumento: 'atendimento',
    idDocumento: 'ATD-2301',
    endereco: 'Rua das Violetas, 402 - Bairro Esperança, Panambi/RS',
    descricao: 'Atendimento presencial para orientar responsáveis e escola.'
  },
  {
    idMarcador: 'atendimento-bela-vista-panambi',
    latitude: -28.2928,
    longitude: -53.495,
    tipoDocumento: 'atendimento',
    idDocumento: 'ATD-2294',
    endereco: 'Rua Dom Feliciano, 55 - Bairro Bela Vista, Panambi/RS',
    descricao: 'Acompanhamento remoto com equipe pedagógica da escola municipal.'
  },
  {
    idMarcador: 'notificacao-italiana-panambi',
    latitude: -28.288,
    longitude: -53.5122,
    tipoDocumento: 'notificacao',
    idDocumento: 'NOT-5411',
    endereco: 'Rua Itália, 730 - Bairro Italiana, Panambi/RS',
    descricao: 'Convocação urgente para apresentação de responsável legal.'
  },
  {
    idMarcador: 'notificacao-sao-jorge-panambi',
    latitude: -28.2808,
    longitude: -53.4978,
    tipoDocumento: 'notificacao',
    idDocumento: 'NOT-5402',
    endereco: 'Travessa São Miguel, 12 - Bairro São Jorge, Panambi/RS',
    descricao: 'Solicitação de atualização cadastral e comprovação de matrícula.'
  },
  {
    idMarcador: 'termo-menor-jardim-paraguai',
    latitude: -28.3001,
    longitude: -53.4925,
    tipoDocumento: 'termo-medidas-menor',
    idDocumento: 'TMM-1077',
    endereco: 'Rua Paraguai, 190 - Bairro Jardim Paraguai, Panambi/RS',
    descricao: 'Medida protetiva garantindo acompanhamento psicológico semanal.'
  },
  {
    idMarcador: 'termo-responsavel-erico',
    latitude: -28.2955,
    longitude: -53.5028,
    tipoDocumento: 'termo-medidas-responsavel',
    idDocumento: 'TMR-3348',
    endereco: 'Rua Erico Verissimo, 65 - Bairro Erica, Panambi/RS',
    descricao: 'Responsáveis firmaram termo para garantir frequência escolar.'
  }
];

export const documentosFalsos = {
  denuncias: [
    {
      nrDenuncia: 'DEN-00982',
      Data: '2024-10-03',
      DescricaoFato: 'Negligência com ausência dos responsáveis no Bairro Centro.',
      endereco: 'Av. Presidente JK, 215 - Centro, Panambi/RS'
    },
    {
      nrDenuncia: 'DEN-01011',
      Data: '2024-09-18',
      DescricaoFato: 'Crianças flagradas desacompanhadas no Bairro Arco-Íris.',
      endereco: 'Rua das Laranjeiras, 88 - Bairro Arco-Íris, Panambi/RS'
    }
  ],
  atendimentos: [
    {
      idAtendimento: 'ATD-2301',
      data: '2024-10-01',
      Relato: 'Orientação presencial a responsáveis e escola do Bairro Esperança.',
      profissional: 'Assistente Social Carla Moura',
      endereco: 'Rua das Violetas, 402 - Bairro Esperança, Panambi/RS'
    },
    {
      idAtendimento: 'ATD-2294',
      data: '2024-09-12',
      Relato: 'Acompanhamento remoto com equipe escolar do Bairro Bela Vista.',
      profissional: 'Psicóloga Juliana Martins',
      endereco: 'Rua Dom Feliciano, 55 - Bairro Bela Vista, Panambi/RS'
    }
  ],
  notificacoes: [
    {
      id: 'NOT-5411',
      data: '2024-09-27',
      descricao: 'Convocação para apresentação do responsável no Bairro Italiana.',
      recebedor: 'Responsável: João Batista',
      endereco: 'Rua Itália, 730 - Bairro Italiana, Panambi/RS'
    },
    {
      id: 'NOT-5402',
      data: '2024-08-30',
      descricao: 'Atualização cadastral solicitada no Bairro São Jorge.',
      recebedor: 'Responsável: Marta Duarte',
      endereco: 'Travessa São Miguel, 12 - Bairro São Jorge, Panambi/RS'
    }
  ],
  termosMedidasMenor: [
    {
      idmedida_aplicada: 'TMM-1077',
      data: '2024-10-05',
      descricao: 'Medida protetiva com acompanhamento psicológico no Jardim Paraguai.',
      endereco: 'Rua Paraguai, 190 - Bairro Jardim Paraguai, Panambi/RS'
    }
  ],
  termosMedidasResponsavel: [
    {
      idmedida_aplicada: 'TMR-3348',
      data: '2024-09-21',
      descricao: 'Compromisso de frequência escolar firmado no Bairro Erica.',
      endereco: 'Rua Erico Verissimo, 65 - Bairro Erica, Panambi/RS'
    }
  ]
};

