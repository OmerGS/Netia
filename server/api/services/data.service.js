import driver from '../../config/neo4j.driver.js';

export const getAirports = async ({
  country,
  minLat, maxLat, minLon, maxLon,
  importances
}) => {
  const session = driver.session();

  const importanceList = importances ? (importances).split(',') : null;
  const params = {
    country: country || null,
    importanceList: importanceList,
    minLat: minLat ? parseFloat(minLat) : null,
    maxLat: maxLat ? parseFloat(maxLat) : null,
    minLon: minLon ? parseFloat(minLon) : null,
    maxLon: maxLon ? parseFloat(maxLon) : null,
  };

  const query = `
    // REQUÊTE 1
    MATCH (a:Airport)
    WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
    
    WITH a, 
      CASE
        WHEN a.pageRank >= 9.0 THEN 'major'
        WHEN a.pageRank >= 4.0 THEN 'regional'
        ELSE 'minor'
      END AS importanceCategory
      
    WHERE 
      ($minLat IS NULL OR a.latitude >= $minLat)
      AND ($maxLat IS NULL OR a.latitude <= $maxLat)
      AND ($minLon IS NULL OR a.longitude >= $minLon)
      AND ($maxLon IS NULL OR a.longitude <= $maxLon)
      AND ($country IS NULL OR a.country = $country)
      AND ($importanceList IS NULL OR importanceCategory IN $importanceList)
    
    // REQUÊTE 2
    WITH a, importanceCategory
    RETURN 
      a.iata AS iata,
      a.name AS name,
      a.city AS city,
      a.country AS country,
      a.latitude AS latitude,
      a.longitude AS longitude,
      a.pageRank AS pageRank,
      a.betweenness AS betweenness
    ORDER BY a.pageRank DESC
  `;

  try {
    const result = await session.run(query, params);

    return result.records.map(record => ({
      iata: record.get('iata'),
      name: record.get('name'),
      city: record.get('city'),
      country: record.get('country'),
      latitude: record.get('latitude'),
      longitude: record.get('longitude'),
      pageRank: record.get('pageRank'),
      betweenness: record.get('betweenness')
    }));

  } catch (error) {
    console.error('Erreur loading airports:', error);
    throw new Error('Could not fetch airports.');
  } finally {
    await session.close();
  }
};

export const updateAirportName = async (iataCode, newName) => {
  const session = driver.session();
  
  const query = `
    MATCH (a:Airport {iata: $iataCode})
    SET a.name = $newName
    RETURN a
  `;

  try {
    const result = await session.run(query, { iataCode, newName });
    return result.records.length > 0; 
  } catch (error) {
    console.error(`Erreur Cypher lors de la mise à jour de ${iataCode}:`, error);
    throw new Error(`Échec de la mise à jour de l'aéroport.`);
  } finally {
    await session.close();
  }
};

export const getAirlines = async ({ country, active }) => {
  const session = driver.session();
  
  let isActive = null; 
  if (active === 'true') {
    isActive = true;
  } else if (active === 'false') {
    isActive = false;
  }

  const query = `
    MATCH (c:Airline)
    WHERE ($country IS NULL OR c.country = $country)
      AND ($active IS NULL OR c.active = $active)
    RETURN 
      c.name AS name,
      c.country AS country,
      c.iata AS iata,
      c.icao AS icao,
      c.callsign AS callsign,
      c.active AS active
    ORDER BY c.name
  `;

  try {
    const result = await session.run(query, { 
      country: country || null, 
      active: isActive 
    });

    return result.records.map(record => ({
      name: record.get('name'),
      country: record.get('country'),
      iata: record.get('iata'),
      icao: record.get('icao'),
      callsign: record.get('callsign'),
      active: record.get('active')
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des compagnies:', error);
    throw new Error('Impossible de récupérer les compagnies depuis la base de données.');
  } finally {
    await session.close();
  }
};

export const createAirport = async (data) => {
  const session = driver.session();
  
  const query = `
    CREATE (a:Airport {
      iata: $iata,
      name: $name,
      city: $city,
      country: $country,
      latitude: $latitude,
      longitude: $longitude,
      pageRank: 1.0,
      betweenness: 0.0,
      degree: 0
    })
    RETURN a
  `;

  try {
    const result = await session.run(query, data);
    return result.records.length > 0;
  } catch (error) {
    console.error('Erreur Cypher lors de la création de l\'aéroport:', error);
    if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
        throw new Error("L'IATA existe déjà.");
    }
    throw new Error('Échec de la création de l\'aéroport.');
  } finally {
    await session.close();
  }
};

export const deleteAirport = async (iataCode) => {
  const session = driver.session();
  
  const query = `
    MATCH (a:Airport {iata: $iataCode})
    DETACH DELETE a
    RETURN count(a) AS deletedCount
  `;

  try {
    const result = await session.run(query, { iataCode });
    const deletedCount = result.records[0].get('deletedCount').low;
    return deletedCount;
  } catch (error) {
    console.error(`Erreur Cypher lors de la suppression de ${iataCode}:`, error);
    throw new Error(`Échec de la suppression de l'aéroport.`);
  } finally {
    await session.close();
  }
};

export const createRoute = async (iataA, iataB, airlineIata, equipmentIATA, pageRank) => {
  const session = driver.session();
  
  const query = `
    MATCH (a:Airport {iata: $iataA})
    MATCH (b:Airport {iata: $iataB})
    
    MERGE (a)-[r:FLIES_TO]->(b)
    ON CREATE SET
      r.airline_iata = $airlineIata,
      r.stops = 0,
      r.codeshare = 'N',
      r.equipment_list = $equipmentIATA
      
    RETURN r
  `;

  try {
    const result = await session.run(query, { iataA, iataB, pageRank, airlineIata, equipmentIATA });
    return result.summary.counters.updates().relationshipsCreated > 0;
  } catch (error) {
    console.error(`Erreur Cypher lors de la création de la route ${iataA}->${iataB}:`, error);
    throw new Error(`Échec de la création de la route.`);
  } finally {
    await session.close();
  }
};