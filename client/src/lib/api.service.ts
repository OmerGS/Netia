import axios from 'axios';
import type { Airport, AirportFilters, Airline, AirlineFilters, RouteDestination, Itinerary } from './types';

const API_URL = 'http://localhost:4000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
});

/**
 * Récupère les aéroports depuis l'API avec des filtres.
 */
export const fetchAirports = (params: AirportFilters = {}) => {
  const apiParams: any = { ...params };

  if (params.importances && params.importances.length > 0) {
    apiParams.importances = params.importances.join(',');
  } else {
    delete apiParams.importances;
  }

  return apiClient.get<Airport[]>('/data/airports', { params: apiParams });
};

/**
 * Récupère les compagnies aériennes depuis l'API.
 */
export const fetchAirlines = (params: AirlineFilters = {}) => {
  return apiClient.get<Airline[]>('/data/airlines', { params });
};

/**
 * Fetches direct destinations for a given airport IATA.
 */
export const fetchRoutesFromAirport = (iata: string) => {
  return apiClient.get<RouteDestination[]>(`/routes/from/${iata}`);
};

export const searchItineraries = (dep: string, arr: string) => {
    return apiClient.get<Itinerary[]>(`/flights/search`, { 
        params: { dep, arr } 
    });
};