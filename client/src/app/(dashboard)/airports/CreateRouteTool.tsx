'use client';

import React, { useState } from 'react';
import type { Airport } from '@/lib/types';

interface CreateRouteFormProps {
    airportA: Airport;
    airportB: Airport;
    onCancel: () => void;
    onSuccess: () => void;
    onCreate: (airlineIata: string, equipmentIATA: string) => Promise<void>; 
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
            [name]: value.toUpperCase()
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
            let errorText = 'Erreur inconnue de création de route.';
            if (error.response?.data?.message) {
                 errorText = error.response.data.message;
            } else if (error.message) {
                errorText = error.message;
            }

            const displayMessage = errorText.includes('déjà existante') ? 
                                   'Création échouée: Route déjà existante.' : 
                                   `Création échouée: ${errorText}`;
                                   
            setMessage({ type: 'error', text: displayMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const formClasses = `
        absolute top-4 right-4 z-[600] 
        bg-white p-5 rounded-xl shadow-2xl 
        w-full max-w-xs 
        border-l-4 border-green-600
        transition-opacity duration-300
    `;
    
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md uppercase focus:ring-blue-500 focus:border-blue-500 shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed";

    return (
        <form onSubmit={handleCreate} className={formClasses}>
            <h4 className="text-xl font-bold text-gray-800 border-b pb-2">Créer une Route</h4>
            
            <p className="text-sm text-gray-600 mt-4 mb-4 font-medium">
                De <strong className="text-blue-600">{airportA.iata}</strong> ({airportA.city}) <br/>
                À <strong className="text-blue-600">{airportB.iata}</strong> ({airportB.city})
            </p>

            <div className="space-y-4">
                <div>
                    <label htmlFor="airlineIata" className="text-sm block font-medium text-gray-700 mb-1">Compagnie (IATA)</label>
                    <input 
                        id="airlineIata"
                        type="text" 
                        name="airlineIata" 
                        value={formData.airlineIata} 
                        onChange={handleChange} 
                        required 
                        className={inputClasses} 
                        placeholder="Ex: AF, LH" 
                        maxLength={3} 
                        disabled={isLoading || !isActive} 
                    />
                </div>
                <div>
                    <label htmlFor="equipmentIATA" className="text-sm block font-medium text-gray-700 mb-1">Équipement (IATA)</label>
                    <input 
                        id="equipmentIATA"
                        type="text" 
                        name="equipmentIATA" 
                        value={formData.equipmentIATA} 
                        onChange={handleChange} 
                        required 
                        className={inputClasses} 
                        placeholder="Ex: 737, 320" 
                        maxLength={3} 
                        disabled={isLoading || !isActive} 
                    />
                </div>
            </div>

            {message && (
                <p className={`mt-4 text-sm font-semibold ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {message.text}
                </p>
            )}

            <div className="flex justify-end space-x-3 pt-5 border-t mt-5 border-gray-100">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out disabled:opacity-50" 
                    disabled={isLoading}
                >
                    Annuler
                </button>
                <button 
                    type="submit" 
                    className={`
                        px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md 
                        hover:bg-green-700 transition duration-150 ease-in-out
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                    `} 
                    disabled={isLoading || !isActive}
                >
                    {isLoading ? 'Création...' : 'Créer la Route'}
                </button>
            </div>
        </form>
    );
};