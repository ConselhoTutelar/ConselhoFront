Sistema de Gestão do Conselho Tutelar de Panambi/RS
Este projeto é uma aplicação web desenvolvida em React para auxiliar na gestão das atividades do Conselho Tutelar de Panambi, Rio Grande do Sul. Ele oferece formulários padronizados para registro de denúncias, atendimentos, notificações e termos de aplicação de medidas, além de um painel administrativo para gerenciamento de profissionais.

Funcionalidades Principais
Ficha de Recebimento de Denúncia: Registro detalhado de denúncias recebidas.

Ficha de Atendimento: Documentação de atendimentos realizados.

Notificação: Geração de notificações e suas segundas vias.

Termo de Aplicação de Medidas (Pais/Responsáveis): Registro de medidas aplicadas a pais ou responsáveis, conforme o ECA.

Termo de Aplicação de Medidas (Criança/Adolescente): Registro de medidas de proteção aplicadas a crianças ou adolescentes, conforme o ECA.

Painel Administrativo:

Gerenciar Profissionais: Visualização em formato de cards de todos os profissionais cadastrados, com opção de edição.

Cadastrar Novo Profissional: Formulário para inclusão de novos membros na equipe.

Navegação Intuitiva: Menu principal com barra de pesquisa para fácil acesso aos formulários.

Design Moderno e Responsivo: Interface de usuário limpa, intuitiva e adaptável a diferentes tamanhos de tela, utilizando React e Bootstrap.

Tecnologias Utilizadas
React.js: Biblioteca JavaScript para construção da interface de usuário.

React-Router-DOM: Para gerenciamento de rotas na aplicação single-page.

React-Bootstrap: Componentes Bootstrap reutilizáveis para React, facilitando a estilização e o layout responsivo.

Bootstrap CSS: Framework CSS para estilização base.

Bootstrap Icons: Biblioteca de ícones para elementos visuais.

CSS Personalizado: Estilos adicionais para atender ao design específico do projeto.

## 🚀 Como Rodar o Projeto com Docker (Recomendado)

Com ambos os repositórios (`conselho-tutelar-front` e `conselho-tutelar-back`) clonados lado a lado, você pode subir toda a aplicação (Front-end, Back-end API e MySQL) diretamente daqui:

```bash
npm run docker:up
```
*(Ou diretamente com: `docker compose up -d`)*

Isso irá subir:
- **Front-end (React/Vite):** http://localhost:5173 (com hot-reload)
- **Back-end API (Node.js):** http://localhost:3000
- **Banco de Dados (MySQL 8.0):** porta `3306`

Para acompanhar os logs:
```bash
npm run docker:logs
```

Para parar todos os containers:
```bash
npm run docker:down
```

---

## 💻 Como Rodar o Projeto Localmente (Sem Docker)

### Pré-requisitos
- Node.js (versão 18 ou superior recomendada)
- npm ou Yarn
- Back-end em execução (via Docker ou local)

### Instalação
```bash
npm install
```

### Executando a Aplicação
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`.


Estrutura do Projeto
.
├── public/
│   └── logo.png        # Logo do Conselho Tutelar
├── src/
│   ├── assets/
│   │   └── logo.png    # Imagens e outros ativos
│   ├── components/
│   │   └── NavBar.jsx  # Componente de barra de navegação (se houver)
│   ├── pages/          # Componentes de páginas completas
│   │   ├── cadastrarProfissionais/
│   │   │   ├── CadastrarProfissional.jsx
│   │   │   └── CadastrarProfissional.css
│   │   ├── documentos/ # Agrupamento para documentos/formulários
│   │   │   ├── ficha-atendimento/
│   │   │   │   ├── FichaAtendimento.jsx
│   │   │   │   └── FichaAtendimento.css
│   │   │   ├── notificacao/
│   │   │   │   ├── Notificacao.jsx
│   │   │   │   └── Notificacao.css
│   │   │   ├── recebimento-denuncia/
│   │   │   │   ├── RecebimentoDenuncia.jsx
│   │   │   │   └── RecebimentoDenuncia.css
│   │   │   ├── termo-medidas-crianca/
│   │   │   │   ├── TermoMedidasCrianca.jsx
│   │   │   │   └── TermoMedidasCrianca.css
│   │   │   └── termo-medidas-responsaveis/
│   │   │       ├── TermoMedidasResponsaveis.jsx
│   │   │       └── TermoMedidasResponsaveis.css
│   │   │   └── style.css # CSS comum para documentos/formulários? (verificar uso)
│   │   ├── error/
│   │   │   └── ErrorPage.jsx
│   │   ├── gerenciarProfissionais/
│   │   │   ├── GerenciarProfissionais.jsx
│   │   │   └── GerenciarProfissionais.css
│   │   ├── home/
│   │   │   └── Home.jsx # Página inicial ou Dashboard
│   │   ├── menu/         # Menu principal da aplicação (DashboardMenu renomeado?)
│   │   │   ├── Menu.jsx
│   │   │   └── Menu.css
│   │   └── perfilAdministrador/
│   │       ├── PerfilAdministrador.jsx
│   │       └── PerfilAdministrador.css
│   ├── App.jsx           # Componente principal que define as rotas
│   ├── index.css         # CSS global principal
│   ├── Login.jsx         # Componente de login
│   ├── Login.css
│   └── main.jsx          # Ponto de entrada da aplicação React (antigo index.js)
├── package.json          # Dependências e scripts do projeto