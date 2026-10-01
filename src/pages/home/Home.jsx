import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado do menu lateral fixo: inicializa com preferência salva ou aberto em telas grandes (>= 992px)
  const [menuAberto, setMenuAberto] = useState(() => {
    try {
      const salvo = localStorage.getItem("sidebar_aberto");
      if (salvo !== null) {
        return salvo === "true";
      }
      return typeof window !== "undefined" ? window.innerWidth >= 992 : true;
    } catch (e) {
      return true;
    }
  });

  const toggleMenu = () => {
    setMenuAberto(prev => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar_aberto", String(next));
      } catch (e) {}
      return next;
    });
  };

  const fecharMenu = () => {
    setMenuAberto(false);
    try {
      localStorage.setItem("sidebar_aberto", "false");
    } catch (e) {}
  };

  const abrirMenu = () => {
    setMenuAberto(true);
    try {
      localStorage.setItem("sidebar_aberto", "true");
    } catch (e) {}
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className={`app-wrapper ${menuAberto ? "sidebar-open" : "sidebar-collapsed"}`}>
      <NavBar
        menuAberto={menuAberto}
        toggleMenu={toggleMenu}
        fecharMenu={fecharMenu}
        abrirMenu={abrirMenu}
      />
      <main className="app-main-content">
        <div className="container-fluid px-3 px-lg-4 py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Home;
