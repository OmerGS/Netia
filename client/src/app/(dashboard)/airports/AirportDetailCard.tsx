'use client';

import React, { useState, useEffect } from 'react';
import type { Airport, RouteDestination } from '@/lib/types';

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


    const importanceLabel = (airport.pageRank ?? 0) >= 9.0 ? 'Major Hub' :
                              (airport.pageRank ?? 0) >= 4.0 ? 'Regional Hub' : 'Minor Airport';

    const cardStyle: React.CSSProperties = {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        width: '300px',
        maxWidth: '90vw',
        borderLeft: isEditing ? '4px solid #fca311' : '4px solid #007bff'
    };
    
    const iconStyle: React.CSSProperties = {
        cursor: 'pointer', 
        marginLeft: '10px', 
        transition: 'color 0.2s',
        color: isEditing ? '#fca311' : '#6c757d',
    };

    const RenderEditForm = () => (
        <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800">Modifier : {airport.iata}</h4>
            <div className="space-y-1">
                <label htmlFor="name" className="text-sm block text-gray-600">Nom de l'aéroport</label>
                <input 
                    id="name"
                    type="text" 
                    value={airportName}
                    onChange={(e) => setAirportName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded" 
                />
            </div>
            
            <div className="flex justify-end space-x-2 pt-3">
                <button 
                    onClick={handleLocalSave}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    disabled={isLoadingRoutes}
                >
                    Sauvegarder
                </button>
                <button 
                    onClick={onToggleEdit} 
                    className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                    disabled={isLoadingRoutes}
                >
                    Annuler
                </button>
            </div>
        </div>
    );

    const RenderReadOnly = () => (
        <div className="space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">{airport.iata} - {airport.name}</h3>
                <div className="flex items-center space-x-2">
                    <svg onClick={onToggleEdit} style={iconStyle} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5l4 4L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    
                    <button 
                        onClick={handleDeleteClick} 
                        disabled={isLoadingRoutes}
                        title="Supprimer l'aéroport et ses routes"
                        className="p-0 border-none bg-transparent"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 hover:text-red-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="space-y-1 text-sm pt-2">
                <p><strong>Statut:</strong> <span style={{color: (airport.pageRank ?? 0) >= 4.0 ? '#007bff' : '#6c757d'}}>{importanceLabel}</span></p>
                <p><strong>Ville:</strong> {airport.city}</p>
                <p><strong>Pays:</strong> {airport.country}</p>
                <p><strong>Lat/Lon:</strong> {airport.latitude?.toFixed(4)} / {airport.longitude?.toFixed(4)}</p>
                <p><strong>Aéroports desservis:</strong> {destinations.length}</p>
                <p><strong>Score PR:</strong> {airport.pageRank?.toFixed(4) ?? 'N/A'}</p>
                <p><strong>Score BW:</strong> {airport.betweenness?.toFixed(4) ?? 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div style={cardStyle}>
            {isEditing ? RenderEditForm() : RenderReadOnly()}
        </div>
    );
};