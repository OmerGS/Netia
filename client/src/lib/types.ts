/**
 * Définit la structure de données d'un aéroport, 
 * telle que retournée par l'API (endpoint /data/airports).
 */
export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  continent: string;
  latitude: number;
  longitude: number;
  pageRank?: number;
  betweenness?: number;
}

export type ImportanceLevel = 'major' | 'regional' | 'minor';

/**
 * Définit les filtres optionnels que l'API accepte 
 * pour la requête des aéroports.
 */
export interface AirportFilters {
  country?: string;
  minLat?: number;
  maxLat?: number;
  minLon?: number;
  maxLon?: number;
  importances?: ImportanceLevel[]; 
}
/**
 * Définit la structure de données d'une compagnie aérienne,
 * telle que retournée par l'API (endpoint /data/airlines).
 */
export interface Airline {
  name: string;
  country: string;
  iata: string;
  icao: string;
  callsign: string;
  active: boolean;
}

/**
 * Définit les filtres optionnels pour la requête des compagnies.
 */
export interface AirlineFilters {
  country?: string;
  active?: boolean;
}

export interface RouteDestination {
  iata: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RouteNode {
    iata: string;
    lat: number;
    lon: number;
}

/**
 * Structure de données pour un itinéraire retourné par /flights/search
 */
export interface Itinerary {
    departure: string; 
    arrival: string;   
    stops: number;     
    route: string[];   
    airlines: string[]; 
    totalKm: number;
    priceEUR: number;
    routeCoordinates: RouteNode[]; 
}