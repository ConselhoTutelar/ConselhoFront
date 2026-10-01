import React from "react";
import { useRouteError, Link } from "react-router-dom";

const ErrorPage = () => {
    const error = useRouteError();
    console.error("Erro capturado na rota:", error);

    const is404 = error?.status === 404;

    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "#3159A3",
            color: "#ffffff",
            padding: "20px",
            textAlign: "center"
        }}>
            <h1 style={{ fontSize: "3.5rem", fontWeight: "bold" }}>
                {is404 ? "404" : "Atenção"}
            </h1>
            <p style={{ fontSize: "1.2rem", maxWidth: "550px", opacity: 0.9 }}>
                {is404 
                    ? "A página solicitada não foi encontrada." 
                    : (error?.statusText || error?.message || "Ocorreu um erro ao carregar esta página.")}
            </p>
            <Link to="/home" className="btn btn-light mt-3 fw-semibold px-4 py-2">
                Voltar ao Início
            </Link>
        </div>
    );
};

export default ErrorPage;