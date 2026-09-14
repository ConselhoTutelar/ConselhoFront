// src/components/Mapa.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { buscarMarcadores } from '../../api/marcadores';
import { marcadoresFalsos } from '../../utils/dadosFalsos';

// CSS da Leaflet
import 'leaflet/dist/leaflet.css'; 

// Nosso CSS customizado para o layout de página inteira
import './mapacss.css';

// Fix para ícones do Marker no Leaflet
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

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
            html: `<span class="marker-dot" style="background:${cor};border-color:${cor};"></span>`,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
        });
    }
    return markerIconCache[cor];
};

const Mapa = () => {
    // As coordenadas de Panambi continuam no centro
    const position = [-28.2916, -53.5014];
    const [marcadores, setMarcadores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarMarcadores();
    }, []);

    const carregarMarcadores = async () => {
        try {
            setLoading(true);
            console.log('[MAPA] Carregando marcadores...');
            const dados = await buscarMarcadores();
            if (dados?.length) {
                console.log('[MAPA] Marcadores carregados do servidor:', dados.length);
                setMarcadores(dados);
            } else {
                console.warn('[MAPA] Nenhum marcador encontrado no servidor. Aplicando dados falsos.');
                setMarcadores(marcadoresFalsos);
            }
        } catch (error) {
            console.error('[MAPA] Erro ao carregar marcadores, usando dados falsos:', error);
            setMarcadores(marcadoresFalsos);
        } finally {
            setLoading(false);
        }
    };

    const getTipoLabel = (tipo) => {
        return tipoLabels[tipo] || tipo || 'Documento';
    };

    useEffect(() => {
        // Garantir que os ícones estejam configurados
        L.Marker.prototype.options.icon = DefaultIcon;
    }, []);

    return (
        // Este div é o nosso contêiner de página inteira
        <div className="map-wrapper"> 
            <MapContainer 
                center={position} 
                zoom={13} 
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Marcador fixo do Conselho Tutelar */}
                <Marker position={position}>
                    <Popup>
                        <strong>Conselho Tutelar</strong><br />
                        Rua Hermann Mayer, 43, Térreo<br />
                        Centro, Panambi/RS
                    </Popup>
                </Marker>

                {/* Marcadores dos documentos */}
                {!loading && marcadores.length > 0 && (
                    <>
                        {console.log('[MAPA] Renderizando marcadores:', marcadores)}
                        {marcadores.map((marcador) => {
                            console.log('[MAPA] Renderizando marcador:', marcador);
                            if (!marcador.latitude || !marcador.longitude) {
                                console.warn('[MAPA] Marcador sem coordenadas:', marcador);
                                return null;
                            }
                            return (
                                <Marker 
                                    key={marcador.idMarcador} 
                                    position={[parseFloat(marcador.latitude), parseFloat(marcador.longitude)]}
                                    icon={getMarkerIcon(marcador.tipoDocumento)}
                                >
                                    <Popup>
                                        <strong>{getTipoLabel(marcador.tipoDocumento)}</strong>
                                        {marcador.idDocumento && <><br />ID: {marcador.idDocumento}</>}
                                        <br />
                                        <strong>Endereço:</strong> {marcador.endereco}
                                        {marcador.descricao && (
                                            <>
                                                <br />
                                                <strong>Descrição:</strong> {marcador.descricao}
                                            </>
                                        )}
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </>
                )}
                {!loading && marcadores.length === 0 && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'white', padding: '10px', zIndex: 1000, borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                        Nenhum marcador encontrado. Verifique o console do servidor para logs de geocodificação.
                    </div>
                )}
            </MapContainer>
        </div>
    );
};

export default Mapa;