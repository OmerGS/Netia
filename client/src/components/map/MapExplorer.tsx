'use client'; 

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAirports } from '@/lib/api.service';
import type { Airport, AirportFilters } from '@/lib/types';

type ImportanceLevel = 'major' | 'regional' | 'minor';

const MapExplorer = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [importanceFilter, setImportanceFilter] = useState<ImportanceLevel>('regional');

  useEffect(() => {
    loadAirports({ importance: importanceFilter });
  }, [importanceFilter]);

  const loadAirports = async (filters: AirportFilters) => {
    setIsLoading(true);
    try {
      const response = await fetchAirports(filters);
      setAirports(response.data);
      console.log(`Filtre '${filters.importance}' appliqué. ${response.data.length} aéroports chargés.`);
    } catch (error) {
      console.error('Erreur lors du chargement des aéroports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newLevel: ImportanceLevel) => {
    if (newLevel === 'minor') {
      const confirmation = window.confirm(
        "ATTENTION :\n\nVous êtes sur le point d'afficher TOUS les aéroports (mineurs inclus).\n" +
        "Cela peut charger des milliers de points et ralentir fortement votre navigateur.\n\n" +
        "Voulez-vous continuer ?"
      );
      
      if (!confirmation) {
        return; 
      }
    }
    setImportanceFilter(newLevel);
  };

  const position: [number, number] = [48.85, 2.35];

  return (
    // Le composant retourne les filtres ET la carte
    <div>
      {/* 5. LE NOUVEAU MENU DE FILTRAGE */}
      <div style={{ padding: '10px', background: '#eee', borderBottom: '1px solid #ccc' }}>
        <strong>Filtres d'affichage :</strong>
        <button 
          onClick={() => handleFilterChange('major')} 
          disabled={isLoading || importanceFilter === 'major'}
        >
          Hubs Majeurs
        </button>
        <button 
          onClick={() => handleFilterChange('regional')}
          disabled={isLoading || importanceFilter === 'regional'}
        >
          <p>Hubs Régionaux</p>
        </button>
        <button 
          onClick={() => handleFilterChange('minor')}
          disabled={isLoading || importanceFilter === 'minor'}
        >
          Tous (Mineurs inclus - LENT)
        </button>
        {isLoading && <span style={{ marginLeft: '15px' }}>Chargement des données...</span>}
      </div>

      {/* 6. LA CARTE (code inchangé) */}
      <MapContainer center={position} zoom={5} style={{ height: '85vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {airports.map((airport) => (
          <Marker 
            key={airport.iata} 
            position={[airport.latitude, airport.longitude]}
          >
            <Popup>
              <b>{airport.iata} - {airport.name}</b><br />
              PageRank: {airport.pageRank?.toFixed(2) ?? 'N/A'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapExplorer;