import axios from 'axios';
import type { Airport, AirportFilters, Airline, RouteDestination, Itinerary, AirportCreationData } from './types';

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

export const createAirport = (data: AirportCreationData) => {
    return apiClient.post('/data/airport', data);
};

export const updateAirline = (id: number, data: Partial<Airline>) => {
  return apiClient.put(`/airlines/${id}`, data);
};

export const deleteAirline = (id: number) => {
  return apiClient.delete(`/airlines/${id}`);
};

export const fetchAirlineCoverage = (id: number) => {
    return apiClient.get<any>(`/airlines/${id}/coverage`);
};

export const fetchAirlineTopHubs = (id: number, limit: number = 5) => {
    return apiClient.get<any[]>(`/airlines/${id}/hubs`, { params: { limit } });
};

export const fetchAirlineFleetDiversity = (id: number) => {
    return apiClient.get<any>(`/airlines/${id}/fleet`);
};