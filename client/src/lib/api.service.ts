import axios from 'axios';
import type { Airport, AirportFilters, Airline, AirlineFilters, RouteDestination, Itinerary } from './types';

const API_URL = 'http://localhost:4000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
});

export const fetchAirports = (params: AirportFilters = {}) => {
  const apiParams: any = { ...params };

  if (params.importances && params.importances.length > 0) {
    apiParams.importances = params.importances.join(',');
  } else {
    delete apiParams.importances;
  }

  return apiClient.get<Airport[]>('/data/airports', { params: apiParams });
};

export const fetchRoutesFromAirport = (iata: string) => {
  return apiClient.get<RouteDestination[]>(`/routes/from/${iata}`);
};

export const searchItineraries = (dep: string, arr: string) => {
    return apiClient.get<Itinerary[]>(`/flights/search`, { 
        params: { dep, arr } 
    });
};

export const updateAirportName = (iataCode: string, newName: string) => {
    return apiClient.put(`/data/airport/${iataCode}`, { name: newName });
};

export const deleteAirport = (iataCode: string) => {
  return apiClient.delete(`/data/airport/${iataCode}`);
};

export const createRoute = (
    iataA: string, 
    iataB: string, 
    airlineIata: string, 
    equipmentIATA: string, 
) => {
    return apiClient.post('/data/route', {
        iataA,
        iataB,
        airlineIata,
        equipmentIATA,
    });
};

export const fetchAirlineById = (id: number) => {
  return apiClient.get<Airline>(`/airlines/${id}`);
};

export const fetchAirlines = (skip: number, limit: number, country?: string, active?: boolean) => {
  return apiClient.get<any>('/airlines', { 
    params: { country, active, limit, skip } 
  });
};
/**
 * Met à jour les détails d'une compagnie (Nom, Pays, Active). (CRUD: U)
 */
export const updateAirline = (id: number, data: Partial<Airline>) => {
  return apiClient.put(`/airlines/${id}`, data);
};

/**
 * Supprime une compagnie par ID. (CRUD: D)
 */
export const deleteAirline = (id: number) => {
  return apiClient.delete(`/airlines/${id}`);
};

/**
 * Analyse 1: Obtient le nombre total de destinations et de pays desservis.
 */
export const fetchAirlineCoverage = (id: number) => {
    return apiClient.get<any>(`/airlines/${id}/coverage`);
};

/**
 * Analyse 2: Obtient les hubs principaux de la compagnie (Top 5).
 */
export const fetchAirlineTopHubs = (id: number, limit: number = 5) => {
    return apiClient.get<any[]>(`/airlines/${id}/hubs`, { params: { limit } });
};

/**
 * Analyse 3: Obtient la diversité de la flotte utilisée.
 */
export const fetchAirlineFleetDiversity = (id: number) => {
    return apiClient.get<any>(`/airlines/${id}/fleet`);
};