'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Airport, RouteDestination } from '@/lib/types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface AirportDetailCardProps {
    airport: Airport;
    destinations: RouteDestination[];
    isEditing: boolean;
    onToggleEdit: () => void;
    onSave: (data: Partial<Airport>) => void;
    onDelete: (iata: string) => void; 
    isLoadingRoutes: boolean;
}

export const AirportDetailCard: React.FC<AirportDetailCardProps> = ({ 
    airport, 
    destinations,
    isEditing, 
    onToggleEdit, 
    onSave,
    onDelete,
    isLoadingRoutes
}) => {
    const [airportName, setAirportName] = useState(airport.name || '');
    
    useEffect(() => {
        setAirportName(airport.name || '');
    }, [airport]);

    const handleLocalSave = () => {
        if (!airportName.trim()) {
            alert("Le nom de l'aéroport ne peut pas être vide.");
            return;
        }
        onSave({ name: airportName.trim() });
        onToggleEdit();
    };

    const handleDeleteClick = () => {
        const confirmation = window.confirm(
            `Êtes-vous sûr de vouloir supprimer l'aéroport ${airport.iata} (${airport.name}) ?\n` +
            `ATTENTION : Ceci supprimera également toutes les routes (lignes) connectées à cet aéroport.`
        );
        
        if (confirmation) {
            onDelete(airport.iata);
        }
    };

    const { importanceLabel, importanceColor } = useMemo(() => {
        const pageRank = airport.pageRank ?? 0;
        if (pageRank >= 9.0) {
            return { importanceLabel: 'Major Hub', importanceColor: 'text-red-600' };
        }
        if (pageRank >= 4.0) {
            return { importanceLabel: 'Regional Hub', importanceColor: 'text-blue-600' };
        }
        return { importanceLabel: 'Minor Airport', importanceColor: 'text-gray-600' };
    }, [airport.pageRank]);


    const RenderEditForm = () => (
        <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-800 border-b pb-2">Modifier : {airport.iata}</h4>
            <div className="space-y-1">
                <label htmlFor="name" className="text-sm block font-medium text-gray-700">Nom de l'aéroport</label>
                <input 
                    id="name"
                    type="text" 
                    value={airportName}
                    onChange={(e) => setAirportName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm" 
                    placeholder="Entrez le nom de l'aéroport"
                />
            </div>
            
            <div className="flex justify-end space-x-3 pt-3">
                <button 
                    onClick={onToggleEdit} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out disabled:opacity-50"
                    disabled={isLoadingRoutes}
                >
                    Annuler
                </button>
                <button 
                    onClick={handleLocalSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoadingRoutes}
                >
                    Sauvegarder
                </button>
            </div>
        </div>
    );

    const RenderReadOnly = () => (
        <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h3 className="text-2xl font-extrabold text-gray-900 truncate">
                    {airport.iata} - {airport.name}
                </h3>
                <div className="flex items-center space-x-2 shrink-0">
                    <button 
                        onClick={onToggleEdit}
                        className="p-1 text-gray-500 hover:text-blue-600 transition duration-150 ease-in-out rounded-full"
                        title="Modifier l'aéroport"
                        aria-label="Modifier l'aéroport"
                        disabled={isLoadingRoutes}
                    >
                         <PencilIcon className="h-5 w-5" />
                    </button>
                    
                    <button 
                        onClick={handleDeleteClick} 
                        disabled={isLoadingRoutes}
                        title="Supprimer l'aéroport et ses routes"
                        className="p-1 text-red-600 hover:text-red-800 transition duration-150 ease-in-out rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Supprimer l'aéroport"
                    >
                         <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
                <p>
                    <strong className="font-semibold text-gray-900">Statut:</strong> 
                    <span className={`ml-2 font-medium ${importanceColor}`}>{importanceLabel}</span>
                </p>
                <p>
                    <strong className="font-semibold text-gray-900">Ville:</strong> 
                    <span className="ml-2">{airport.city}</span>
                </p>
                <p>
                    <strong className="font-semibold text-gray-900">Pays:</strong> 
                    <span className="ml-2">{airport.country}</span>
                </p>
                <p>
                    <strong className="font-semibold text-gray-900">Lat/Lon:</strong> 
                    <span className="ml-2">{airport.latitude?.toFixed(4)} / {airport.longitude?.toFixed(4)}</span>
                </p>
                <p>
                    <strong className="font-semibold text-gray-900">Aéroports desservis:</strong> 
                    <span className="ml-2 font-bold text-lg text-blue-600">{destinations.length}</span>
                </p>
                <p>
                    <strong className="font-semibold text-gray-900">Score PR (PageRank):</strong> 
                    <span className="ml-2 font-mono">{airport.pageRank?.toFixed(4) ?? 'N/A'}</span>
                </p>
                <p>
                    <strong className="font-semibold text-gray-900">Score BW (Betweenness):</strong> 
                    <span className="ml-2 font-mono">{airport.betweenness?.toFixed(4) ?? 'N/A'}</span>
                </p>
            </div>
        </div>
    );

    const cardClasses = `
        absolute top-4 right-4 z-[600]
        bg-white p-5 
        rounded-xl 
        shadow-2xl 
        w-full max-w-sm 
        transition-all duration-300
        border-l-4 
        ${isEditing ? 'border-yellow-500' : 'border-blue-600'}
    `;

    return (
        <div className={cardClasses}>
            {isEditing ? RenderEditForm() : RenderReadOnly()}
        </div>
    );
};