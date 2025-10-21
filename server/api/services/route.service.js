import driver from '../../config/neo4j.driver.js';

/**
 * Finds direct destinations from a given airport IATA code.
 */
export const getDirectDestinations = async (iataCode) => {
  const session = driver.session();
  const query = `
    MATCH (a:Airport {iata: $iata})-[r:FLIES_TO]->(b:Airport)
    WHERE b.latitude IS NOT NULL AND b.longitude IS NOT NULL
    RETURN
      b.iata AS destinationIata,
      b.name AS destinationName,
      b.latitude AS destLat,
      b.longitude AS destLon
    LIMIT 300
  `;

  try {
    const result = await session.run(query, { iata: iataCode });

    return result.records.map(record => ({
      iata: record.get('destinationIata'),
      name: record.get('destinationName'),
      latitude: record.get('destLat'),
      longitude: record.get('destLon')
    }));

  } catch (error) {
    console.error(`Error fetching destinations for ${iataCode}:`, error);
    throw new Error('Could not fetch destinations.');
  } finally {
    await session.close();
  }
};