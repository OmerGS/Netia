import { getDirectDestinations as fetchDestinations } from '../services/route.service.js';

/**
 * Handles GET /routes/from/:iata
 */
export const getDestinationsFromAirport = async (req, res) => {
  const { iata } = req.params;

  if (!iata) {
    return res.status(400).json({ status: 'error', message: 'IATA code is required.' });
  }

  try {
    const destinations = await fetchDestinations(iata.toUpperCase());
    res.status(200).json(destinations);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};