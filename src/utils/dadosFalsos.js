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
      Data_averiguacao: '2024-10-04',
      TipoDenuncia: 'anonima',
      nomeConselheiro: 'Conselheira Ana Paula Silva',
      direitoVioladoDescricao: 'Convivência Familiar e Comunitária',
      DescricaoFato: 'Negligência com ausência dos responsáveis no Bairro Centro.',
      endereco: 'Av. Presidente JK, 215 - Bairro Centro, Panambi/RS',
      bairro: 'Centro',
      Observacao: JSON.stringify({
        identificacao: 'Anônimo',
        criancasAdolescentes: 'Lucas Mendes (08 anos)',
        paisResponsaveis: 'Roberto Mendes e Helena Mendes',
        endereco: 'Av. Presidente JK, 215 - Bairro Centro, Panambi/RS',
        conselheiroAveriguador: 'Conselheira Ana Paula Silva',
        horaDenuncia: '14:30'
      })
    },
    {
      nrDenuncia: 'DEN-01011',
      Data: '2024-09-18',
      Data_averiguacao: '2024-09-19',
      TipoDenuncia: 'telefone',
      nomeConselheiro: 'Conselheiro Carlos Eduardo',
      direitoVioladoDescricao: 'Dignidade, Respeito e Liberdade',
      DescricaoFato: 'Crianças flagradas desacompanhadas no Bairro Arco-Íris.',
      endereco: 'Rua das Laranjeiras, 88 - Bairro Arco-Íris, Panambi/RS',
      bairro: 'Arco-Íris',
      Observacao: JSON.stringify({
        identificacao: 'Vizinho via telefone',
        criancasAdolescentes: 'Pedro Alves (06 anos), Sofia Alves (09 anos)',
        paisResponsaveis: 'Marcos Alves',
        endereco: 'Rua das Laranjeiras, 88 - Bairro Arco-Íris, Panambi/RS',
        conselheiroAveriguador: 'Conselheiro Carlos Eduardo',
        horaDenuncia: '21:15'
      })
    },
    {
      nrDenuncia: 'DEN-01025',
      Data: '2024-10-12',
      Data_averiguacao: null,
      TipoDenuncia: 'identificada',
      nomeConselheiro: 'Conselheira Mariana Costa',
      direitoVioladoDescricao: 'Direito à Educação',
      DescricaoFato: 'Evasão escolar recorrente informada pela direção da escola estadual.',
      endereco: 'Rua Sete de Setembro, 310 - Bairro Centro, Panambi/RS',
      bairro: 'Centro',
      Observacao: JSON.stringify({
        identificacao: 'Diretora Escolar Fernanda Rocha',
        criancasAdolescentes: 'Gabriel Oliveira (13 anos)',
        paisResponsaveis: 'Cláudia Oliveira',
        endereco: 'Rua Sete de Setembro, 310 - Bairro Centro, Panambi/RS',
        conselheiroAveriguador: 'Pendente',
        horaDenuncia: '09:45'
      })
    }
  ],
  atendimentos: [
    {
      idAtendimento: 'ATD-2301',
      Data: '2024-10-01',
      data: '2024-10-01',
      Hora: '10:00',
      direitoVioladoDescricao: 'Direito à Educação',
      nomeViolador: 'Responsáveis legais',
      Relato: 'Orientação presencial a responsáveis e escola do Bairro Esperança.',
      profissional: 'Assistente Social Carla Moura',
      nomeConselheiro: 'Assistente Social Carla Moura',
      endereco: 'Rua das Violetas, 402 - Bairro Esperança, Panambi/RS',
      bairro: 'Esperança'
    },
    {
      idAtendimento: 'ATD-2294',
      Data: '2024-09-12',
      data: '2024-09-12',
      Hora: '15:30',
      direitoVioladoDescricao: 'Direito à Saúde',
      nomeViolador: 'Omissão familiar',
      Relato: 'Acompanhamento remoto com equipe escolar do Bairro Bela Vista.',
      profissional: 'Psicóloga Juliana Martins',
      nomeConselheiro: 'Psicóloga Juliana Martins',
      endereco: 'Rua Dom Feliciano, 55 - Bairro Bela Vista, Panambi/RS',
      bairro: 'Bela Vista'
    },
    {
      idAtendimento: 'ATD-2315',
      Data: '2024-10-10',
      data: '2024-10-10',
      Hora: '11:20',
      direitoVioladoDescricao: 'Convivência Familiar e Comunitária',
      nomeViolador: 'Genitor',
      Relato: 'Escuta especializada e encaminhamento à rede de proteção social.',
      profissional: 'Conselheira Ana Paula Silva',
      nomeConselheiro: 'Conselheira Ana Paula Silva',
      endereco: 'Rua Paraguai, 190 - Bairro Jardim Paraguai, Panambi/RS',
      bairro: 'Jardim Paraguai'
    }
  ],
  notificacoes: [
    {
      id: 'NOT-5411',
      data: '2024-09-27',
      descricao: 'Convocação para apresentação do responsável no Bairro Italiana.',
      recebedor: 'Responsável: João Batista',
      redator: 'João Batista',
      nomeConselheiro: 'Conselheiro Carlos Eduardo',
      endereco: 'Rua Itália, 730 - Bairro Italiana, Panambi/RS',
      bairro: 'Italiana'
    },
    {
      id: 'NOT-5402',
      data: '2024-08-30',
      descricao: 'Atualização cadastral solicitada no Bairro São Jorge.',
      recebedor: 'Responsável: Marta Duarte',
      redator: 'Marta Duarte',
      nomeConselheiro: 'Conselheira Mariana Costa',
      endereco: 'Travessa São Miguel, 12 - Bairro São Jorge, Panambi/RS',
      bairro: 'São Jorge'
    }
  ],
  termosMedidasMenor: [
    {
      idmedida_aplicada: 'TMM-1077',
      data: '2024-10-05',
      inciso: 6,
      nomeMenor: 'Lucas Mendes',
      nomeConselheiro: 'Conselheira Ana Paula Silva',
      direitoVioladoDescricao: 'Direito à Saúde',
      descricao: 'Medida protetiva com acompanhamento psicológico no Jardim Paraguai.',
      endereco: 'Rua Paraguai, 190 - Bairro Jardim Paraguai, Panambi/RS',
      bairro: 'Jardim Paraguai'
    },
    {
      idmedida_aplicada: 'TMM-1082',
      data: '2024-10-14',
      inciso: 3,
      nomeMenor: 'Gabriel Oliveira',
      nomeConselheiro: 'Conselheira Mariana Costa',
      direitoVioladoDescricao: 'Direito à Educação',
      descricao: 'Matrícula e frequência obrigatórias em estabelecimento oficial de ensino fundamental.',
      endereco: 'Rua Sete de Setembro, 310 - Bairro Centro, Panambi/RS',
      bairro: 'Centro'
    }
  ],
  termosMedidasResponsavel: [
    {
      idmedida_aplicada: 'TMR-3348',
      data: '2024-09-21',
      inciso: 6,
      Encaminhamento: 'Secretaria Municipal de Educação',
      nomeResponsavel: 'Cláudia Oliveira',
      nomeConselheiro: 'Conselheiro Carlos Eduardo',
      direitoVioladoDescricao: 'Direito à Educação',
      descricao: 'Compromisso de frequência escolar firmado no Bairro Erica.',
      endereco: 'Rua Erico Verissimo, 65 - Bairro Erica, Panambi/RS',
      bairro: 'Erica'
    },
    {
      idmedida_aplicada: 'TMR-3355',
      data: '2024-10-08',
      inciso: 4,
      Encaminhamento: 'CAPS / Rede de Saúde Mental',
      nomeResponsavel: 'Roberto Mendes',
      nomeConselheiro: 'Conselheira Ana Paula Silva',
      direitoVioladoDescricao: 'Convivência Familiar e Comunitária',
      descricao: 'Encaminhamento dos responsáveis a acompanhamento psicológico e orientação familiar.',
      endereco: 'Av. Presidente JK, 215 - Bairro Centro, Panambi/RS',
      bairro: 'Centro'
    }
  ]
};
