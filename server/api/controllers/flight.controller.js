import { findItineraries } from '../services/flight.service.js';

/**
 * Handles GET /flights/search?dep=...&arr=...
 */
export const searchFlights = async (req, res) => {
  const { dep, arr } = req.query;

  if (!dep || !arr) {
    return res.status(400).json({ status: 'error', message: 'Departure (dep) and arrival (arr) IATA codes are required.' });
  }

  try {
    const itineraries = await findItineraries(dep.toUpperCase(), arr.toUpperCase());
    res.status(200).json(itineraries);
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to search flights.' });
  }
};