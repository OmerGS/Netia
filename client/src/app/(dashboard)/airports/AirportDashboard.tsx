'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { deleteAirport, fetchAirports, fetchRoutesFromAirport, updateAirportName, createRoute } from '@/lib/api.service';
import type { Airport, AirportFilters, ImportanceLevel, RouteDestination } from '@/lib/types';
import L, { LatLngTuple, LatLngBounds, LatLng } from 'leaflet';
import styles from '@/components/dashboard/Dashboard.module.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { MapEvents } from '@/components/map/MapEvents';
import { ActiveFiltersDisplay } from '@/components/ui/ActiveFilterDisplay';
import { airportIcon } from '@/components/map/MapIcon';
import { AirportDetailCard } from './AirportDetailCard';
import { CreateAirportForm, CreateAirportMapHandler } from './CreateAirportTool'; 
import { CreateRouteForm } from './CreateRouteTool'; 

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
  const [isRouteCreationMode, setIsRouteCreationMode] = useState(false);
  const [airportA, setAirportA] = useState<Airport | null>(null);
  const [airportB, setAirportB] = useState<Airport | null>(null);

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
    } catch (error) { console.error('Échec de la sauvegarde API:', error); alert('Échec de la sauvegarde des données (Vérifiez la console du serveur).'); }
    finally { setIsLoadingAirports(false); }
  }, [selectedAirport, filters, currentBounds, loadAirportsData]);

  const handleDeleteAirportData = useCallback(async (iata: string) => {
    if (!iata) return;
    setIsLoadingAirports(true);
    setSelectedAirport(null); 
    try {
        await deleteAirport(iata);
        console.log(`Suppression réussie de l'aéroport ${iata}.`);
        if (currentBounds) { await loadAirportsData(filters, currentBounds); }
    } catch (error) { console.error('Échec de la suppression API:', error); alert('Échec de la suppression des données (Vérifiez la console du serveur).'); }
    finally { setIsLoadingAirports(false); }
  }, [filters, currentBounds, loadAirportsData]);
  
  const handleCreationSuccess = () => {
      if (currentBounds) { loadAirportsData(filters, currentBounds); }
      setIsCreationMode(false);
      setNewAirportCoords(null);
  };

  const handleRouteCreationSuccess = () => {
      if (currentBounds) {
          loadAirportsData(filters, currentBounds);
      }
      setIsRouteCreationMode(false);
      setAirportA(null);
      setAirportB(null);
  };

  const handleRouteCreation = useCallback(async (airlineIata: string, equipmentIATA: string) => {
    if (!airportA || !airportB) return;
    
    setIsLoadingAirports(true);
    try {
        await createRoute(airportA.iata, airportB.iata, airlineIata, equipmentIATA);
        alert(`Route de ${airportA.iata} à ${airportB.iata} créée.`);
        
        if (currentBounds) { await loadAirportsData(filters, currentBounds); }
        setIsRouteCreationMode(false);
        setAirportA(null);
        setAirportB(null);
    } catch (error) {
        console.error('Échec de la création de route:', error);
        alert('Échec de la création de route.');
    } finally {
        setIsLoadingAirports(false);
    }
  }, [airportA, airportB, loadAirportsData, filters, currentBounds]);

  const handleToggleCreationMode = () => {
      setIsCreationMode(prev => !prev);
      setSelectedAirport(null);
      setNewAirportCoords(null);
      setIsRouteCreationMode(false); 
  };
  
  const handleToggleRouteCreationMode = () => {
      setIsRouteCreationMode(prev => !prev);
      setAirportA(null);
      setAirportB(null);
      setSelectedAirport(null);
      setIsEditing(false);
      setIsCreationMode(false);
  };


  useEffect(() => {
    if (currentBounds && !isCreationMode) { 
        loadAirportsData(filters, currentBounds); 
    }
  }, [filters, currentBounds, loadAirportsData, isCreationMode]);

  useEffect(() => {
    const loadRoutesAndDestinations = async () => {
      if (!selectedAirport) { setCurrentRoutes([]); setDestinationAirportObjects([]); return; }
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
        } else { setDestinationAirportObjects([]); }
      } catch (error) { console.error(`Error loading routes/destinations for ${selectedAirport.iata}:`, error); setCurrentRoutes([]); setDestinationAirportObjects([]); }
      finally { setIsLoadingRoutes(false); }
    };
    loadRoutesAndDestinations();
  }, [selectedAirport]);
  
  useEffect(() => {
    if (selectedAirport && currentBounds) {
        const airportLatLng = L.latLng(selectedAirport.latitude, selectedAirport.longitude);
        if (!currentBounds.contains(airportLatLng)) {
            setSelectedAirport(null); 
            if (isEditing) { setIsEditing(false); }
        }
    }
  }, [currentBounds, selectedAirport, isEditing]);

  const handleImportanceToggle = (level: ImportanceLevel) => {
    setFilters(prev => {
      const current = prev.importances || [];
      const newImportances = current.includes(level) ? current.filter(l => l !== level) : [...current, level];
      setSelectedAirport(null);
      setIsRouteCreationMode(false);
      return { ...prev, importances: newImportances };
    });
  };

  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    if (isCreationMode) { return; } 
    setCurrentBounds(bounds);
  }, [isCreationMode]);

  const handleMarkerClick = (airport: Airport) => {
    if (isEditing || isCreationMode) { 
        setIsEditing(false); 
        return; 
    }
    
    if (isRouteCreationMode) {
        if (!airportA) {
            setAirportA(airport);
        } else if (airportA.iata === airport.iata) {
            setAirportA(null); 
            setAirportB(null); 
        } else if (!airportB && airport.iata !== airportA.iata) {
            setAirportB(airport);
        } else if (airportB && airportB.iata === airport.iata) {
            setAirportB(null); 
        } else {
            setAirportA(airport); 
            setAirportB(null);
        }
        setSelectedAirport(null); 
        return; 
    }

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
    return filteredAirports;
    
  }, [selectedAirport, destinationAirportObjects, filteredAirports, isRouteCreationMode, airportA, airportB]);

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
        onToggleCreationMode={handleToggleCreationMode}
        isRouteCreationMode={isRouteCreationMode} 
        onToggleRouteCreationMode={handleToggleRouteCreationMode}
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
                onDelete={handleDeleteAirportData}
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

        {isRouteCreationMode && airportA && airportB && (
            <CreateRouteForm
                airportA={airportA}
                airportB={airportB}
                onCancel={handleToggleRouteCreationMode}
                onSuccess={handleRouteCreationSuccess}
                onCreate={handleRouteCreation}
                isActive={isRouteCreationMode}
            />
        )}
        
        {isRouteCreationMode && (!airportA || !airportB) && (
        <div 
            className="fixed bottom-5 left-1/2 -translate-x-1/2 
                       bg-white shadow-xl border border-blue-300 rounded-lg 
                       py-3 px-5 text-gray-700 z-[2000] flex items-center space-x-4"
        >
            <p className="font-semibold text-base">
              {airportA 
                ? `Sélectionnez l'aéroport B (Destination) pour `
                : `Sélectionnez l'aéroport A (Départ)`}
              {airportA && <span className="font-bold text-blue-600 ml-1">{airportA.iata}</span>}
            </p>
            
            <button 
                onClick={handleToggleRouteCreationMode}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
                Annuler
            </button>
        </div>
    )}


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

          {airportsToDisplay.map((airport) => {

            const isSelectedForDetail = selectedAirport && airport.iata === selectedAirport.iata;
            const isDestination = selectedAirport && destinationAirportObjects.some(dest => dest.iata === airport.iata);
            const isConnected = isSelectedForDetail || isDestination;
            
            const isSelectedForRoute = (airport.iata === airportA?.iata || airport.iata === airportB?.iata);

            let opacity = 1.0;
            let zIndex = 0;

            if (isRouteCreationMode) {
                opacity = isSelectedForRoute ? 1.0 : 0.6;
                zIndex = isSelectedForRoute ? 1000 : 0;
            } else if (selectedAirport) {
                opacity = isConnected ? 1.0 : 0.2;
                zIndex = isSelectedForDetail ? 1000 : 0;
            }
                        
            return (
              <Marker
                key={airport.iata}
                position={[airport.latitude, airport.longitude]}
                icon={airportIcon}
                eventHandlers={{ click: () => handleMarkerClick(airport) }}
                opacity={opacity}
                zIndexOffset={zIndex}
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
            );
          })}

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
          
          {isRouteCreationMode && airportA && airportB && (
            <Polyline
                positions={[
                    [airportA.latitude, airportA.longitude],
                    [airportB.latitude, airportB.longitude],
                ]}
                pathOptions={{ color: '#10b981', weight: 3, dashArray: '10, 10' }}
            />
          )}

        </MapContainer>
      </main>
    </div>
  );
};

export default AirportDashboard;