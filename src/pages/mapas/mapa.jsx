// src/pages/mapas/mapa.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Garantir window.L antes do carregamento do plugin leaflet.heat
if (typeof window !== 'undefined') {
  window.L = L;
}
import 'leaflet.heat';

import { buscarMarcadores } from '../../api/marcadores';
import { marcadoresFalsos } from '../../utils/dadosFalsos';

// CSS do Leaflet e estilos da página
import 'leaflet/dist/leaflet.css'; 
import './mapacss.css';

// Fix para ícones padrão do Marker no Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Cores por tipo de documento
const tipoCores = {
    'denuncia': '#e11d48',
    'atendimento': '#3159A3',
    'notificacao': '#f97316',
    'termo-medidas-menor': '#14b8a6',
    'termo-medidas-responsavel': '#22c55e',
    'default': '#6b7280'
};

const tipoLabels = {
    'denuncia': 'Denúncia',
    'atendimento': 'Atendimento',
    'notificacao': 'Notificação',
    'termo-medidas-menor': 'Termo Medidas (Menor)',
    'termo-medidas-responsavel': 'Termo Medidas (Responsável)'
};

const markerIconCache = {};

const getMarkerIcon = (tipo) => {
    const cor = tipoCores[tipo] || tipoCores.default;
    if (!markerIconCache[cor]) {
        markerIconCache[cor] = L.divIcon({
            className: 'custom-marker-icon',
            html: `<span class="marker-dot" style="background:${cor};border-color:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></span>`,
            iconSize: [22, 22],
            iconAnchor: [11, 22],
            popupAnchor: [0, -22]
        });
    }
    return markerIconCache[cor];
};

// Componente React-Leaflet para renderizar a camada de Heatmap (Mapa de Calor)
function HeatmapLayer({ points, intensity = 1.0 }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !L.heatLayer) return;
        if (!points || points.length === 0) return;

        // Formato esperado pelo leaflet.heat: [lat, lng, intensidade]
        const heatPoints = points.map(p => [p[0], p[1], p[2] || intensity]);

        const heatLayer = L.heatLayer(heatPoints, {
            radius: 35,
            blur: 24,
            maxZoom: 16,
            max: 1.0,
            minOpacity: 0.4,
            gradient: {
                0.2: '#2563eb', // Azul (baixa ocorrência)
                0.4: '#06b6d4', // Ciano
                0.6: '#10b981', // Verde
                0.8: '#f59e0b', // Laranja
                1.0: '#ef4444'  // Vermelho (alta concentração)
            }
        });

        heatLayer.addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points, intensity]);

    return null;
}

const Mapa = () => {
    const PANAMBI_CENTRO = [-28.2916, -53.5014];
    const [marcadores, setMarcadores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de controle de visualização
    const [modoVisualizacao, setModoVisualizacao] = useState('calor'); // 'calor' | 'marcadores' | 'hibrido'
    const [filtroTipo, setFiltroTipo] = useState('denuncia'); // 'todas' | 'denuncia' | etc.

    useEffect(() => {
        carregarMarcadores();
    }, []);

    const carregarMarcadores = async () => {
        try {
            setLoading(true);
            const dados = await buscarMarcadores();
            if (dados?.length) {
                setMarcadores(dados);
            } else {
                setMarcadores(marcadoresFalsos);
            }
        } catch (error) {
            console.error('[MAPA] Erro ao carregar marcadores, aplicando dados de contingência:', error);
            setMarcadores(marcadoresFalsos);
        } finally {
            setLoading(false);
        }
    };

    const getTipoLabel = (tipo) => {
        return tipoLabels[tipo] || tipo || 'Documento';
    };

    // Filtra marcadores válidos com coordenadas
    const marcadoresFiltrados = useMemo(() => {
        return marcadores.filter((m) => {
            const hasCoords = m.latitude && m.longitude && !isNaN(parseFloat(m.latitude)) && !isNaN(parseFloat(m.longitude));
            if (!hasCoords) return false;
            if (filtroTipo === 'todas') return true;
            return m.tipoDocumento === filtroTipo;
        });
    }, [marcadores, filtroTipo]);

    // Extrai pontos [lat, lng, peso] para o Heatmap
    const heatPoints = useMemo(() => {
        return marcadoresFiltrados.map((m) => [
            parseFloat(m.latitude),
            parseFloat(m.longitude),
            m.tipoDocumento === 'denuncia' ? 1.0 : 0.8
        ]);
    }, [marcadoresFiltrados]);

    const contagemDenuncias = useMemo(() => {
        return marcadores.filter(m => m.tipoDocumento === 'denuncia').length;
    }, [marcadores]);

    return (
        <div className="map-page-container">
            {/* Toolbar Superior de Controle e Filtros */}
            <div className="map-toolbar">
                <div className="map-toolbar-left">
                    <h5 className="map-title mb-0">
                        <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                        Mapeamento de Ocorrências
                    </h5>
                    <span className="badge bg-primary text-white ms-2">
                        {filtroTipo === 'denuncia' ? `${marcadoresFiltrados.length} Denúncias` : `${marcadoresFiltrados.length} Registros`}
                    </span>
                </div>

                <div className="map-toolbar-controls">
                    {/* Filtro por Categoria */}
                    <div className="control-group">
                        <label className="control-label">Filtro:</label>
                        <div className="btn-group btn-group-sm">
                            <button
                                type="button"
                                className={`btn ${filtroTipo === 'denuncia' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                onClick={() => setFiltroTipo('denuncia')}
                                title="Mostrar somente denúncias"
                            >
                                <i className="bi bi-shield-exclamation me-1"></i> Apenas Denúncias
                            </button>
                            <button
                                type="button"
                                className={`btn ${filtroTipo === 'todas' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setFiltroTipo('todas')}
                                title="Mostrar todas as ocorrências cadastradas"
                            >
                                <i className="bi bi-collection me-1"></i> Todas as Ocorrências
                            </button>
                        </div>
                    </div>

                    {/* Alternador de Modo: Calor vs Marcadores vs Híbrido */}
                    <div className="control-group ms-md-3">
                        <label className="control-label">Camada:</label>
                        <div className="btn-group btn-group-sm">
                            <button
                                type="button"
                                className={`btn ${modoVisualizacao === 'calor' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                                onClick={() => setModoVisualizacao('calor')}
                                title="Visualizar densidade de ocorrências por calor"
                            >
                                🔥 Mapa de Calor
                            </button>
                            <button
                                type="button"
                                className={`btn ${modoVisualizacao === 'marcadores' ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary'}`}
                                onClick={() => setModoVisualizacao('marcadores')}
                                title="Visualizar marcadores individuais com informações detalhadas"
                            >
                                📍 Marcadores
                            </button>
                            <button
                                type="button"
                                className={`btn ${modoVisualizacao === 'hibrido' ? 'btn-success text-white fw-bold' : 'btn-outline-secondary'}`}
                                onClick={() => setModoVisualizacao('hibrido')}
                                title="Visualizar mapa de calor com os marcadores por cima"
                            >
                                🗺️ Híbrido
                            </button>
                        </div>
                    </div>

                    {/* Botão de atualização */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={carregarMarcadores}
                        disabled={loading}
                        title="Recarregar dados do mapa"
                    >
                        <i className={`bi bi-arrow-clockwise ${loading ? 'spin-icon' : ''}`}></i>
                    </button>
                </div>
            </div>

            {/* Container do Mapa */}
            <div className="map-wrapper position-relative">
                {/* Legenda do Mapa de Calor (Visível nos modos calor e híbrido) */}
                {(modoVisualizacao === 'calor' || modoVisualizacao === 'hibrido') && (
                    <div className="heatmap-legend">
                        <div className="legend-title">
                            <i className="bi bi-fire text-danger me-1"></i> Densidade de Denúncias
                        </div>
                        <div className="legend-bar"></div>
                        <div className="legend-labels">
                            <span>Baixa</span>
                            <span>Média</span>
                            <span>Alta concentração</span>
                        </div>
                    </div>
                )}

                <MapContainer 
                    center={PANAMBI_CENTRO} 
                    zoom={13} 
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Marcador fixo da sede do Conselho Tutelar */}
                    <Marker position={PANAMBI_CENTRO}>
                        <Popup>
                            <strong>Conselho Tutelar de Panambi</strong><br />
                            Rua Hermann Mayer, 43, Térreo<br />
                            Centro, Panambi/RS
                        </Popup>
                    </Marker>

                    {/* Camada do Mapa de Calor (Heatmap) */}
                    {(modoVisualizacao === 'calor' || modoVisualizacao === 'hibrido') && (
                        <HeatmapLayer points={heatPoints} />
                    )}

                    {/* Marcadores Individuais */}
                    {(modoVisualizacao === 'marcadores' || modoVisualizacao === 'hibrido') && !loading && (
                        marcadoresFiltrados.map((marcador) => (
                            <Marker 
                                key={marcador.idMarcador} 
                                position={[parseFloat(marcador.latitude), parseFloat(marcador.longitude)]}
                                icon={getMarkerIcon(marcador.tipoDocumento)}
                            >
                                <Popup>
                                    <div style={{ maxWidth: '240px' }}>
                                        <div className="d-flex align-items-center mb-1">
                                            <span 
                                                className="badge me-1" 
                                                style={{ backgroundColor: tipoCores[marcador.tipoDocumento] || '#3159A3' }}
                                            >
                                                {getTipoLabel(marcador.tipoDocumento)}
                                            </span>
                                            {marcador.idDocumento && (
                                                <small className="text-muted">#{marcador.idDocumento}</small>
                                            )}
                                        </div>
                                        <div className="small mb-1">
                                            <strong>Endereço:</strong> {marcador.endereco}
                                        </div>
                                        {marcador.descricao && (
                                            <div className="small text-secondary border-top pt-1 mt-1">
                                                {marcador.descricao}
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default Mapa;