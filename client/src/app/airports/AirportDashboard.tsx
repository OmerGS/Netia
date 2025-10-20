'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAirports } from '@/lib/api.service';
import type { Airport, AirportFilters, ImportanceLevel } from '@/lib/types';
import L, { LatLngTuple, LatLngBounds } from 'leaflet';
import styles from '@/components/dashboard/Dashboard.module.css';

import { MapEvents } from '@/components/map/MapEvents';
import { ImportanceFilter } from '@/components/filter/ImportanceFilter';
import { ActiveFiltersDisplay } from '@/components/ui/ActiveFilterDisplay';
import { airportIcon } from '@/components/map/MapIcon';
import { Sidebar } from '@/components/layout/Sidebar';


// --- Constants ---
const ALL_IMPORTANCES: { label: string, value: ImportanceLevel }[] = [
  { label: 'Majeurs (>= 9.0)', value: 'major' },
  { label: 'Régionaux (>= 4.0)', value: 'regional' },
  { label: 'Mineurs (< 4.0)', value: 'minor' },
];

// --- Le Dashboard ---
const AirportDashboard = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<AirportFilters>({
    importances: ['major', 'regional'],
  });
  const [currentBounds, setCurrentBounds] = useState<LatLngBounds | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // --- DATA FETCHING ---
  const loadData = useCallback(async (currentFilters: AirportFilters, bounds: LatLngBounds | null) => {
    setIsLoading(true);
    setShowWarning(false);

    if (!currentFilters.importances || currentFilters.importances.length === 0) {
      setAirports([]);
      setIsLoading(false);
      return;
    }
    if (currentFilters.importances.includes('minor')) {
      setShowWarning(true);
    }

    const apiFilters: AirportFilters = {
      ...currentFilters,
      minLat: bounds?.getSouth(),
      maxLat: bounds?.getNorth(),
      minLon: bounds?.getWest(),
      maxLon: bounds?.getEast(),
    };

    try {
      console.log("Calling API with filters:", apiFilters);
      const response = await fetchAirports(apiFilters);
      setAirports(response.data);
      console.log(`Loaded ${response.data.length} airports.`);
    } catch (error) {
      console.error('Erreur loading airports:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- EFFECT FOR RELOADING DATA ---
  useEffect(() => {
    if (currentBounds) {
        loadData(filters, currentBounds);
    }
  }, [filters, currentBounds, loadData]);


  // --- HANDLERS ---
  const handleImportanceToggle = (level: ImportanceLevel) => {
    setFilters(prev => {
      const current = prev.importances || [];
      const newImportances = current.includes(level)
        ? current.filter(l => l !== level)
        : [...current, level];
      return { ...prev, importances: newImportances };
    });
  };

  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    console.log("Map bounds changed:", bounds);
    setCurrentBounds(bounds);
  }, []);


  // --- RENDER ---
  const position: LatLngTuple = [48.85, 2.35];

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. SIDEBAR */}
      <Sidebar
        isLoading={isLoading}
        filters={filters}
        onImportanceToggle={handleImportanceToggle}
        showWarning={showWarning}
        importanceOptions={ALL_IMPORTANCES}
      />

      {/* 2. MAIN CONTENT */}
      <main className={styles.mainContent}>
        <ActiveFiltersDisplay filters={filters} isLoading={isLoading} />
        <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="OSM">OSM</a>'
          />
          <MapEvents onBoundsChange={handleBoundsChange} />

          {airports.map((airport) => (
            <Marker
              key={airport.iata}
              position={[airport.latitude, airport.longitude]}
              icon={airportIcon}
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
        </MapContainer>
      </main>
    </div>
  );
};

export default AirportDashboard;