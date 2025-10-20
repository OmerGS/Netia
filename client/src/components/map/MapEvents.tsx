'use client';

import { useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself
import { useEffect } from 'react';

interface MapEventsProps {
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}

export const MapEvents = ({ onBoundsChange }: MapEventsProps) => {
  const map = useMap(); // Get the map instance

  useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
        onBoundsChange(map.getBounds());
    }, 500);
    return () => clearTimeout(timer);
  }, [map, onBoundsChange]);

  return null;
};