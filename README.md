# 🛡️ Sistema de Gestão do Conselho Tutelar de Panambi/RS - Front-end

Aplicação web moderna desenvolvida em React para auxiliar na gestão, registro e tramitação das atividades do **Conselho Tutelar de Panambi, Rio Grande do Sul**. A plataforma centraliza o atendimento, denúncias, notificações, aplicação de medidas protetivas, georreferenciamento de ocorrências e trilhas de auditoria, garantindo conformidade com o Estatuto da Criança e do Adolescente (ECA).

---

## 📌 Funcionalidades Principais

### 📄 Gestão de Documentos e Atendimentos
- **Ficha de Recebimento de Denúncia:** Registro detalhado de denúncias recebidas com coleta de dados e categorização.
- **Ficha de Atendimento:** Registro e documentação de atendimentos realizados a crianças, adolescentes e familiares.
- **Notificação:** Emissão e controle de notificações e suas segundas vias.
- **Termo de Aplicação de Medidas (Pais/Responsáveis):** Registro formal de medidas aplicadas a pais ou responsáveis, fundamentadas no ECA.
- **Termo de Aplicação de Medidas (Criança/Adolescente):** Registro e aplicação de medidas protetivas individuais a crianças e adolescentes.
- **Visualização e Exportação de Documentos:** Consulta centralizada, filtros de busca e geração/impressão de documentos em formato PDF com suporte a assinatura.

### 🗺️ Georreferenciamento e Mapa de Ocorrências
- **Mapa Interativo (Leaflet):** Visualização geográfica de ocorrências e denúncias registradas na cidade.
- **Mapa de Calor (Heatmap):** Identificação visual de densidade de denúncias e atendimentos para subsidiar decisões estratégicas e ações preventivas.

### 🔒 Autenticação e Controle de Acesso (RBAC)
- **Login Seguro com JWT:** Autenticação protegida, gestão de sessão e renovação de acesso.
- **Rotas Protegidas:** Restrição de acesso por papéis de usuário (`admin` e `conselheiro`).
- **Perfis Personalizados:** Visualização e edição de perfis de Administrador e Conselheiro Tutelar.

### 👥 Gestão de Equipe e Painel Administrativo
- **Gerenciamento de Profissionais:** Visualização em cards de conselheiros e administradores cadastrados, com opção de edição e inativação.
- **Cadastro de Novos Profissionais:** Formulário guiado para inclusão de novos membros na equipe.

### 📋 Módulo de Auditoria
- **Trilha de Auditoria e Logs:** Registro e rastreamento de ações realizadas no sistema (criação, edição e exclusão de dados) para garantir transparência, conformidade legal e segurança da informação.

---

## 🛠️ Tecnologias Utilizadas

- **Core:** [React 19](https://react.dev/) & [Vite 6](https://vitejs.dev/)
- **Roteamento:** [React Router DOM v7](https://reactrouter.com/)
- **Estilização e UI:** [Bootstrap 5](https://getbootstrap.com/), [React-Bootstrap](https://react-bootstrap.github.io/) e [React Icons](https://react-icons.github.io/react-icons/)
- **Mapas e Georreferenciamento:** [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/) e [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat)
- **Comunicação HTTP:** [Axios](https://axios-http.com/) com interceptors para tokens de autorização
- **Geração e Manipulação de PDF:** [jsPDF](https://github.com/parallax/jsPDF) e [pdf-lib](https://pdf-lib.js.org/)
- **Criptografia / Utilitários:** [node-forge](https://github.com/digitalbazaar/forge)
- **Containerização:** [Docker](https://www.docker.com/) e Docker Compose

---

## 📁 Estrutura do Projeto

```text
conselho-tutelar-front/
├── public/                     # Ativos estáticos públicos (logo, favicon)
├── src/
│   ├── api/                    # Integração com a API REST (Axios)
│   │   ├── api.js              # Configuração base e interceptors
│   │   ├── atendimento.js      # Serviços de atendimentos
│   │   ├── auditoria.js        # Serviços de trilha de auditoria
│   │   ├── conselheiros.js     # Serviços de conselheiros e usuários
│   │   ├── denuncia.js         # Serviços de denúncias
│   │   ├── documentos.js       # Serviços de documentos
│   │   ├── marcadores.js       # Serviços de marcadores georreferenciados
│   │   ├── notificacao.js      # Serviços de notificações
│   │   └── termosMedidas.js    # Serviços de termos de medidas
│   ├── assets/                 # Imagens e identidades visuais internas
│   ├── components/             # Componentes globais e formulários
│   │   ├── Assinatura/         # Componente de assinatura eletrônica
│   │   ├── documentos/         # Componentes de formulários padronizados
│   │   ├── NavBar.jsx          # Barra de navegação principal
│   │   └── ProtectedRoute.jsx  # Controle de acesso e proteção de rotas
│   ├── context/                # Contextos React (AuthContext para autenticação)
│   ├── pages/                  # Telas e páginas completas
│   │   ├── auditoria/          # Painel e listagem de auditoria
│   │   ├── cadastrarProfissionais/ # Cadastro de novos profissionais
│   │   ├── error/              # Página de erro / 404
│   │   ├── gerenciarProfissionais/ # Listagem e edição de membros da equipe
│   │   ├── home/               # Estrutura base da dashboard
│   │   ├── mapas/              # Visualização de mapa e mapa de calor
│   │   ├── menu/               # Menu inicial com atalhos de navegação
│   │   ├── perfilAdministrador/# Gerenciamento de perfil do administrador
│   │   ├── perfilConselheiro/  # Gerenciamento de perfil do conselheiro
│   │   └── visualizarDocumentos/ # Consulta, filtros e exportação em PDF
│   ├── utils/                  # Utilitários, geração de PDF e mocks
│   ├── App.jsx                 # Componente auxiliar de rotas/aplicação
│   ├── Login.jsx               # Tela de autenticação e login
│   ├── index.css               # Estilos globais e tokens de cores
│   └── main.jsx                # Ponto de entrada do React e RouterProvider
├── .dockerignore               # Arquivos ignorados pelo Docker
├── .env.example                # Exemplo de configuração de variáveis de ambiente
├── .gitignore                  # Arquivos ignorados pelo Git
├── docker-compose.yml          # Orquestração do ambiente com Docker
├── Dockerfile                  # Especificação da imagem Docker de desenvolvimento
├── package.json                # Dependências e scripts do projeto
└── vite.config.js              # Configuração do bundler Vite
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto copiando o modelo `.env.example`:

```env
# URL base da API do backend
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Como Rodar o Projeto com Docker (Recomendado)

Com ambos os repositórios (`conselho-tutelar-front` e `conselho-tutelar-back`) clonados lado a lado no mesmo diretório, você pode subir toda a aplicação (Front-end, Back-end API e MySQL) diretamente:

```bash
npm run docker:up
```
*(Ou diretamente com: `docker compose up -d`)*

Isso irá inicializar:
- **Front-end (React/Vite):** http://localhost:5173 (com hot-reload ativado)
- **Back-end API (Node.js):** http://localhost:3000
- **Banco de Dados (MySQL 8.0):** porta `3306`

### Comandos Docker úteis:
```bash
# Acompanhar os logs dos containers em tempo real
npm run docker:logs

# Parar e remover todos os containers
npm run docker:down
```

---

## 💻 Como Rodar o Projeto Localmente (Sem Docker)

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes `npm` ou `yarn`
- Back-end em execução (via Docker ou localmente na porta 3000)

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Configuração do Ambiente
Certifique-se de que o arquivo `.env` existe e que a variável `VITE_API_URL` aponta para o endereço correto do backend.

### 3. Execução em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador em: `http://localhost:5173`.

### 4. Build de Produção
Para compilar o pacote de produção otimizado:
```bash
npm run build
```
Os arquivos finais para publicação serão gerados no diretório `dist/`.