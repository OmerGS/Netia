'use client';

import React, { useState, useEffect } from 'react';
import { useMapEvents, Marker } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { createAirport } from '@/lib/api.service';

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
        const customIcon = L.divIcon({ 
            html: '<div class="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg"></div>', 
            iconSize: [16, 16],
            className: ''
        });

        return (
            <Marker 
                position={coords} 
                icon={customIcon} 
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
            await createAirport(dataToSend);
            
            setMessage({ type: 'success', text: `Aéroport ${formData.iata} créé avec succès!` });
            
            setFormData({ iata: '', name: '', city: '', country: '' });
            setCoords(null);
            onCreationSuccess();
        } catch (error: any) {
            const errorText = error.response?.data?.message || 'Erreur réseau/serveur.';
            setMessage({ type: 'error', text: `Création échouée: ${errorText}` });
        } finally {
            setIsLoading(false);
        }
    };
    
    const formClasses = `
        bg-white p-5 rounded-xl shadow-2xl 
        w-full max-w-sm 
        absolute top-4 left-4 z-[600]
        space-y-4
    `;

    const indicatorClasses = `
        p-3 rounded-lg font-bold text-center text-white 
        transition duration-300 ease-in-out
        ${coords ? 'bg-green-600' : 'bg-yellow-500'}
    `;

    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm";
    
    return (
        <form onSubmit={handleCreate} className={formClasses}>
            <h4 className="text-xl font-bold text-gray-800 border-b pb-2">Créer un Nouvel Aéroport</h4>
            
            <div className={indicatorClasses}>
                {coords ? 
                    `Coordonnées Capturées (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : 
                    `CLIQUEZ SUR LA CARTE pour placer l'aéroport`}
            </div>
            
            <input 
                type="text" 
                name="iata" 
                value={formData.iata} 
                onChange={handleChange} 
                placeholder="IATA (ex: XYZ)" 
                required 
                maxLength={3} 
                className={`${inputClasses} uppercase`} 
            />
            <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Nom Complet" 
                required 
                className={inputClasses} 
            />
            <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="Ville" 
                className={inputClasses} 
            />
            <input 
                type="text" 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                placeholder="Pays" 
                className={inputClasses} 
            />
            
            <div className="flex justify-end pt-2">
                <button 
                    type="submit" 
                    disabled={isLoading || !coords} 
                    className={`
                        px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-md 
                        hover:bg-green-700 transition duration-150 ease-in-out
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                    `}
                >
                    {isLoading ? 'Création...' : 'Créer l\'Aéroport'}
                </button>
            </div>
            {message && (
                <p className={`mt-3 font-semibold text-center ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {message.text}
                </p>
            )}
        </form>
    );
};