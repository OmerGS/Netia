'use client';

import React, { useState, useEffect } from 'react';
import { useMapEvents, Marker } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

interface CreateAirportFormProps {
    onCreationSuccess: () => void;
    coords: LatLng | null;
    setCoords: (c: LatLng | null) => void;
    isActive: boolean;
}

interface CreateAirportMapHandlerProps {
    coords: LatLng | null;
    setCoords: (c: LatLng | null) => void;
    isActive: boolean;
}

export const CreateAirportMapHandler: React.FC<CreateAirportMapHandlerProps> = ({ coords, setCoords, isActive }) => {
    
    useMapEvents({
        click: (e: L.LeafletMouseEvent) => {
            if (isActive && !coords) { 
                setCoords(e.latlng);
            }
        },
    });

    if (coords) {
        return (
            <Marker 
                position={coords} 
                icon={L.divIcon({ html: '<div style="background:orange; width:15px; height:15px; border-radius:50%; border: 2px solid white;"></div>', iconSize: [15, 15] })} 
            />
        );
    }
    return null;
};

export const CreateAirportForm: React.FC<CreateAirportFormProps> = ({ coords, setCoords, onCreationSuccess, isActive }) => {
    
    const [formData, setFormData] = useState({ iata: '', name: '', city: '', country: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);
    
    useEffect(() => {
        if (!isActive) {
            setCoords(null);
            setFormData({ iata: '', name: '', city: '', country: '' });
            setMessage(null);
        }
    }, [isActive, setCoords]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coords || !formData.iata || !formData.name) {
            setMessage({ type: 'error', text: 'Veuillez cliquer sur la carte et remplir IATA/Nom.' });
            return;
        }

        setIsLoading(true);
        const dataToSend = {
            ...formData,
            latitude: coords.lat,
            longitude: coords.lng,
        };

        try {
            await axios.post(`${API_URL}/data/airport`, dataToSend);
            setMessage({ type: 'success', text: `Aéroport ${formData.iata} créé avec succès!` });
            
            setCoords(null);
            onCreationSuccess();
        } catch (error: any) {
            const errorText = error.response?.data?.message || 'Erreur réseau/serveur.';
            setMessage({ type: 'error', text: `Création échouée: ${errorText}` });
        } finally {
            setIsLoading(false);
        }
    };
    
    const formStyle: React.CSSProperties = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '300px',
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 1000,
    };
    const buttonStyle: React.CSSProperties = {
        padding: '8px 12px', 
        color: 'white',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    };
    const indicatorStyle: React.CSSProperties = {
        padding: '10px 15px', 
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'default',
        marginBottom: '15px',
        textAlign: 'center',
        backgroundColor: coords ? '#10b981' : '#fca311',
        color: 'white',
    };

    return (
        <form onSubmit={handleCreate} style={formStyle}>
            <h4 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>Créer un Nouvel Aéroport</h4>
            
            <div style={indicatorStyle}>
                {coords ? 
                    `Coordonnées Capturées (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : 
                    `CLIQUEZ SUR LA CARTE pour placer l'aéroport`}
            </div>
            
            <input type="text" name="iata" value={formData.iata} onChange={handleChange} placeholder="IATA (ex: XYZ)" required maxLength={3} style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ccc', textTransform: 'uppercase' }} />
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom Complet" required style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ccc' }} />
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Ville" style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ccc' }} />
            <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Pays" style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ccc' }} />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button type="submit" disabled={isLoading || !coords} style={{...buttonStyle, backgroundColor: '#10b981'}}>
                    {isLoading ? 'Création...' : 'Créer l\'Aéroport'}
                </button>
            </div>
            {message && <p style={{ color: message.type === 'error' ? 'red' : 'green', marginTop: '10px', fontWeight: 'bold' }}>{message.text}</p>}
        </form>
    );
};