'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAirports, fetchRoutesFromAirport, updateAirportName } from '@/lib/api.service';
import type { Airport, AirportFilters, ImportanceLevel, RouteDestination } from '@/lib/types';
import L, { LatLngTuple, LatLngBounds, LatLng } from 'leaflet';
import styles from '@/components/dashboard/Dashboard.module.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { MapEvents } from '@/components/map/MapEvents';
import { ActiveFiltersDisplay } from '@/components/ui/ActiveFilterDisplay';
import { airportIcon } from '@/components/map/MapIcon';
import { AirportDetailCard } from './AirportDetailCard';
import { CreateAirportForm, CreateAirportMapHandler } from './CreateAirportTool'; 

const ALL_IMPORTANCES: { label: string, value: ImportanceLevel }[] = [
  { label: 'Majeurs (>= 9.0)', value: 'major' },
  { label: 'Régionaux (>= 4.0)', value: 'regional' },
  { label: 'Mineurs (< 4.0)', value: 'minor' },
];
const ROUTE_COLORS = ['#e63946', '#457b9d', '#1d3557', '#fca311', '#2a9d8f', '#8338ec', '#0077b6'];

const AirportDashboard = () => {
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [isLoadingAirports, setIsLoadingAirports] = useState(false);
  const [filters, setFilters] = useState<AirportFilters>({
    importances: ['major', 'regional'],
  });
  const [currentBounds, setCurrentBounds] = useState<LatLngBounds | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [currentRoutes, setCurrentRoutes] = useState<RouteDestination[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [destinationAirportObjects, setDestinationAirportObjects] = useState<Airport[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [newAirportCoords, setNewAirportCoords] = useState<LatLng | null>(null); 

  const loadAirportsData = useCallback(async (currentFilters: AirportFilters, bounds: LatLngBounds | null) => {
    setIsLoadingAirports(true);
    setShowWarning(false);
    if (!currentFilters.importances || currentFilters.importances.length === 0) {
      setFilteredAirports([]); setIsLoadingAirports(false); return;
    }
    if (currentFilters.importances.includes('minor')) { setShowWarning(true); }
    const apiFilters: AirportFilters = {
      ...currentFilters,
      minLat: bounds?.getSouth(), maxLat: bounds?.getNorth(),
      minLon: bounds?.getWest(), maxLon: bounds?.getEast(),
    };
    try {
      const response = await fetchAirports(apiFilters);
      setFilteredAirports(response.data);
    } catch (error) { console.error('Error loading airports:', error); setFilteredAirports([]); }
    finally { setIsLoadingAirports(false); }
  }, []);

  const handleSaveAirportData = useCallback(async (data: Partial<Airport>) => {
    if (!selectedAirport || !data.name) return;
    setIsLoadingAirports(true);
    try {
        await updateAirportName(selectedAirport.iata, data.name);
        setSelectedAirport(prev => prev ? { ...prev, name: data.name! } : null);
        if (currentBounds) { await loadAirportsData(filters, currentBounds); }
    } catch (error) {
        console.error('Échec de la sauvegarde API:', error);
        alert('Échec de la sauvegarde des données (Vérifiez la console du serveur).');
    } finally {
        setIsLoadingAirports(false);
    }
  }, [selectedAirport, filters, currentBounds, loadAirportsData]);

  const handleCreationSuccess = () => {
      if (currentBounds) {
          loadAirportsData(filters, currentBounds);
      }
      setIsCreationMode(false);
      setNewAirportCoords(null);
  };

  const handleToggleCreationMode = () => {
      setIsCreationMode(prev => !prev);
      setSelectedAirport(null);
      setNewAirportCoords(null);
  };
  
  useEffect(() => {
    if (currentBounds) { loadAirportsData(filters, currentBounds); }
  }, [filters, currentBounds, loadAirportsData]);

  useEffect(() => {
    const loadRoutesAndDestinations = async () => {
      if (!selectedAirport) {
        setCurrentRoutes([]);
        setDestinationAirportObjects([]);
        return;
      }
      setIsLoadingRoutes(true);
      try {
        const routesResponse = await fetchRoutesFromAirport(selectedAirport.iata);
        const destinations = routesResponse.data;
        setCurrentRoutes(destinations);
        const destinationIatas = destinations.map(d => d.iata);
        if (destinationIatas.length > 0) {
           const allTypesFilters: AirportFilters = { importances: ['major', 'regional', 'minor'] };
           const allAirportsResponse = await fetchAirports(allTypesFilters);
           const destObjects = allAirportsResponse.data.filter(ap => destinationIatas.includes(ap.iata));
           setDestinationAirportObjects(destObjects);
        } else {
          setDestinationAirportObjects([]);
        }
      } catch (error) {
        console.error(`Error loading routes/destinations for ${selectedAirport.iata}:`, error);
        setCurrentRoutes([]);
        setDestinationAirportObjects([]);
      } finally {
        setIsLoadingRoutes(false);
      }
    };
    loadRoutesAndDestinations();
  }, [selectedAirport]);
  
  const handleImportanceToggle = (level: ImportanceLevel) => {
    setFilters(prev => {
      const current = prev.importances || [];
      const newImportances = current.includes(level) ? current.filter(l => l !== level) : [...current, level];
      setSelectedAirport(null);
      return { ...prev, importances: newImportances };
    });
  };

  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setCurrentBounds(bounds);
  }, []);

  const handleMarkerClick = (airport: Airport) => {
    if (isEditing || isCreationMode) { 
        setIsEditing(false); 
        return; 
    }
    
    // Bascule la sélection
    if (selectedAirport && selectedAirport.iata === airport.iata) {
      setSelectedAirport(null);
    } else {
      setSelectedAirport(airport);
    }
  };

  const airportsToDisplay = useMemo(() => {
    if (selectedAirport) {
      const airportsMap = new Map<string, Airport>();
      airportsMap.set(selectedAirport.iata, selectedAirport);
      destinationAirportObjects.forEach(ap => airportsMap.set(ap.iata, ap));
      return Array.from(airportsMap.values());
    }
    else {
      return filteredAirports;
    }
  }, [selectedAirport, destinationAirportObjects, filteredAirports]);

  const initialMapPosition: LatLngTuple = [48.85, 2.35];

  return (
    <div className={styles.dashboardContainer}>

      <Sidebar
        isLoading={isLoadingAirports || isLoadingRoutes}
        filters={filters}
        onImportanceToggle={handleImportanceToggle}
        showWarning={showWarning}
        importanceOptions={ALL_IMPORTANCES}
        isCreationMode={isCreationMode}
        onToggleCreationMode={handleToggleCreationMode} // Passé
      />

      <main className={styles.mainContent}>
        <ActiveFiltersDisplay filters={filters} isLoading={isLoadingAirports} />

        {selectedAirport && (
            <AirportDetailCard
                airport={selectedAirport}
                destinations={currentRoutes}
                isEditing={isEditing} 
                onToggleEdit={() => setIsEditing(prev => !prev)}
                onSave={handleSaveAirportData}
                isLoadingRoutes={isLoadingRoutes}
            />
        )}
        
        {isCreationMode && (
            <CreateAirportForm 
                onCreationSuccess={handleCreationSuccess}
                coords={newAirportCoords} 
                setCoords={setNewAirportCoords} 
                isActive={isCreationMode}
            />
        )}

        {/* 4. La Carte */}
        <MapContainer center={initialMapPosition} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapEvents onBoundsChange={handleBoundsChange} />

          {isCreationMode && (
              <CreateAirportMapHandler 
                  coords={newAirportCoords} 
                  setCoords={setNewAirportCoords}
                  isActive={isCreationMode}
              />
          )}

          {/* Markers */}
          {airportsToDisplay.map((airport) => (
            <Marker
              key={airport.iata}
              position={[airport.latitude, airport.longitude]}
              icon={airportIcon}
              eventHandlers={{ click: () => handleMarkerClick(airport) }}
              opacity={selectedAirport && airport.iata !== selectedAirport.iata ? 0.6 : 1.0}
              zIndexOffset={selectedAirport && airport.iata === selectedAirport.iata ? 1000 : 0}
            >
              <Popup>
                <b>{airport.iata} - {airport.name}</b><br />
                Location: {airport.city}, {airport.country}<br />
                Importance: {
                  (airport.pageRank ?? 0) >= 9.0 ? 'Major Hub' :
                  (airport.pageRank ?? 0) >= 4.0 ? 'Regional Hub' :
                  'Minor Airport'
                }
              </Popup>
            </Marker>
          ))}

          {/* Polylines */}
          {selectedAirport && currentRoutes.map((dest, index) => (
            <Polyline
              key={`${selectedAirport.iata}-${dest.iata}`}
              positions={[
                [selectedAirport.latitude, selectedAirport.longitude],
                [dest.latitude, dest.longitude],
              ]}
              pathOptions={{
                color: ROUTE_COLORS[index % ROUTE_COLORS.length],
                weight: 1.5,
                opacity: 0.8
              }}
            />
          ))}

        </MapContainer>
      </main>
    </div>
  );
};

export default AirportDashboard;