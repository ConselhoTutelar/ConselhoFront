import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import './index.css'
import ErrorPage from './pages/error/ErrorPage.jsx'
import Login from './Login.jsx'
import Home from './pages/home/Home.jsx'
import Menu from './pages/menu/Menu.jsx'
import RecebimentoDenuncia from './components/documentos/recebimento-denuncia/Recebimento-denuncia.jsx';
import FichaAtendimento from './components/documentos/ficha-atendimento/FichaAtendimento.jsx';
import Notificacao from './components/documentos/notificacao/Notificacao.jsx';
import TermoMedidasResponsaveis from './components/documentos/termo-medidas-responsaveis/TermoMedidasResponsaveis.jsx';
import TermoMedidasCriancaAdolescente from './components/documentos/termo-medidas-crianca/TermoMedidasCrianca.jsx';
import PerfilAdministrador from './pages/perfilAdministrador/PerfilAdministrador.jsx';
import GerenciarProfissionais from './pages/gerenciarProfissionais/GerenciarProfissionais.jsx';
import CadastrarProfissional from './pages/cadastrarProfissionais/CadastrarProfissional.jsx';
import VisualizarDocumentos from './pages/visualizarDocumentos/VisualizarDocumentos.jsx';
import Mapa from './pages/mapas/mapa.jsx';
import PerfilConselheiro from './pages/perfilConselheiro/PerfilConselheiro.jsx';
import Auditoria from './pages/auditoria/Auditoria.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Menu />, // Conteúdo inicial da página home
      },
      {
        path: "recebimento-denuncia",
        element: <RecebimentoDenuncia />,
      },
      {
        path: "ficha-atendimento",
        element: <FichaAtendimento />,
      },
      {
        path: "notificacao",
        element: <Notificacao />,
      },
      {
        path: "termo-medidas-responsaveis",
        element: <TermoMedidasResponsaveis />,
      },
      {
        path: "termo-medidas-crianca",
        element: <TermoMedidasCriancaAdolescente />,
      },
      {
        path: "administrador",
        element: (
          <ProtectedRoute roles={['admin']}>
            <PerfilAdministrador />
          </ProtectedRoute>
        ),
      },
      {
        path: "profissionais",
        element: (
          <ProtectedRoute roles={['admin']}>
            <GerenciarProfissionais />
          </ProtectedRoute>
        ),
      },
      {
        path: "cadastro",
        element: (
          <ProtectedRoute roles={['admin']}>
            <CadastrarProfissional />
          </ProtectedRoute>
        ),
      },
      {
        path: "auditoria",
        element: (
          <ProtectedRoute roles={['admin']}>
            <Auditoria />
          </ProtectedRoute>
        ),
      },
      {
        path: "perfil",
        element: (
          <ProtectedRoute roles={['conselheiro']}>
            <PerfilConselheiro />
          </ProtectedRoute>
        ),
      },
      {
        path: "documentos",
        element: <VisualizarDocumentos />,
      },
      {
        path: "mapas",
        element: <Mapa />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
