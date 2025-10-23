'use client';

import React, { useState } from 'react';
import type { Airport } from '@/lib/types';
interface CreateRouteFormProps {
    airportA: Airport;
    airportB: Airport;
    onCancel: () => void;
    onSuccess: () => void;
    onCreate: (airlineIata: string, equipmentIATA: string, pageRank: number) => Promise<void>; 
    isActive: boolean;
}

export const CreateRouteForm: React.FC<CreateRouteFormProps> = ({ 
    airportA, 
    airportB, 
    onCancel, 
    onSuccess,
    onCreate,
    isActive
}) => {
    const [formData, setFormData] = useState({
        airlineIata: '',
        equipmentIATA: '737',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'pageRankCost' ? parseFloat(value) : value.toUpperCase() 
        }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const { airlineIata, equipmentIATA } = formData;

        if (!airlineIata || !equipmentIATA) {
            setMessage({ type: 'error', text: 'Vérifiez Compagnie et Équipement' });
            return;
        }

        setIsLoading(true);

        try {
            await onCreate(
                airlineIata,
                equipmentIATA,
            );

            onSuccess(); 
            
        } catch (error: any) {
            const errorText = error.message || 'Erreur inconnue de création de route.';
            setMessage({ type: 'error', text: errorText.includes('déjà existante') ? 'Route déjà existante.' : errorText });
        } finally {
            setIsLoading(false);
        }
    };

    const formStyle: React.CSSProperties = {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        width: '300px',
        borderLeft: '4px solid #10b981',
    };
    
    return (
        <form onSubmit={handleCreate} style={formStyle}>
            <h4 className="text-lg font-bold text-gray-800 mb-2">Créer une Route</h4>
            <p className="text-sm text-gray-600 mb-4">
                De <strong>{airportA.iata}</strong> ({airportA.city}) <br/>
                À <strong>{airportB.iata}</strong> ({airportB.city})
            </p>

            <div className="space-y-3">
                {/* Champ Compagnie Aérienne */}
                <div>
                    <label className="text-sm block text-gray-600">Compagnie (IATA)</label>
                    <input type="text" name="airlineIata" value={formData.airlineIata} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded uppercase" placeholder="Ex: AF, LH" maxLength={3} disabled={isLoading || !isActive} />
                </div>
                {/* Champ Équipement */}
                <div>
                    <label className="text-sm block text-gray-600">Équipement (IATA)</label>
                    <input type="text" name="equipmentIATA" value={formData.equipmentIATA} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded uppercase" placeholder="Ex: 737, 320" maxLength={3} disabled={isLoading || !isActive} />
                </div>
            </div>

            {message && <p style={{ color: message.type === 'error' ? 'red' : 'green', marginTop: '10px' }}>{message.text}</p>}

            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500" disabled={isLoading}>
                    Annuler
                </button>
                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700" disabled={isLoading || !isActive}>
                    {isLoading ? 'Création...' : 'Créer la Route'}
                </button>
            </div>
        </form>
    );
};