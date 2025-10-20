import L from 'leaflet';

export const airportIcon = L.icon({
  iconUrl: '/airport.png',
  iconSize: [30, 30],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});