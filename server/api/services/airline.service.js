import driver from '../../config/neo4j.driver.js'; 

const mapAirlineRecord = (record) => ({
    id: record.get('id').low || record.get('id'), 
    name: record.get('name'),
    alias: record.get('alias'),
    iata: record.get('iata'),
    icao: record.get('icao'),
    country: record.get('country'),
    active: record.get('active'),
});

const airlineProjection = `
    RETURN c.id AS id, c.name AS name, c.alias AS alias, c.iata AS iata, c.icao AS icao, c.country AS country, c.active AS active
    ORDER BY c.name
`;

export const getAirlines = async ({ country, active, limit = 100, skip = 0 }) => {
  const session = driver.session();
  
  let isActive = null; 
  if (active === 'true') { isActive = true; } else if (active === 'false') { isActive = false; }
  
  const dataQuery = `
    MATCH (c:Airline)
    WHERE ($country IS NULL OR c.country = $country)
      AND ($active IS NULL OR c.active = $active)
    ORDER BY c.name
    SKIP toInteger($skip) 
    LIMIT toInteger($limit) 
  ` + airlineProjection;

  const countQuery = `
    MATCH (c:Airline)
    WHERE ($country IS NULL OR c.country = $country)
      AND ($active IS NULL OR c.active = $active)
    RETURN count(c) AS totalCount
  `;

  try {
    const { airlines, totalCount } = await session.executeRead(async tx => {
      
      const params = { 
          country: country || null, 
          active: isActive, 
          limit: limit, 
          skip: skip 
      };

      const [dataResult, countResult] = await Promise.all([
        tx.run(dataQuery, params),
        tx.run(countQuery, params),
      ]);

      const totalCountValue = countResult.records.length > 0 ? countResult.records[0].get('totalCount').low : 0;
      const airlinesList = dataResult.records.map(mapAirlineRecord);
      
      return { airlines: airlinesList, totalCount: totalCountValue };
    });

    return { airlines, totalCount };
  } catch (error) {
    console.error('Erreur lors de la récupération des compagnies:', error);
    throw new Error('Impossible de récupérer les compagnies.');
  } finally {
    await session.close();
  }
};

export const getAirlineById = async (id) => {
    const session = driver.session();
    const query = `
        MATCH (c:Airline)
        WHERE c.id = toInteger($id)
    ` + airlineProjection + ` LIMIT 1`;

    try {
        const result = await session.run(query, { id });
        return result.records.length > 0 ? mapAirlineRecord(result.records[0]) : null;
    } catch (error) {
        console.error('Erreur lors de la récupération de la compagnie par ID:', error);
        throw new Error('Impossible de récupérer la compagnie.');
    } finally {
        await session.close();
    }
};

export const updateAirline = async (id, data) => {
    const session = driver.session();
    const query = `
        MATCH (c:Airline)
        WHERE c.id = toInteger($id)
        SET 
            c.name = coalesce($name, c.name),
            c.country = coalesce($country, c.country),
            c.active = coalesce($active, c.active) 
        RETURN c
    `;
    try {
        const result = await session.run(query, { id, ...data });
        return result.records.length > 0;
    } catch (error) {
        console.error(`Erreur Cypher lors de la mise à jour de l'ID ${id}:`, error);
        throw new Error('Échec de la mise à jour de la compagnie.');
    } finally {
        await session.close();
    }
};

export const deleteAirline = async (id) => {
    const session = driver.session();
    const query = `
        MATCH (c:Airline)
        WHERE c.id = toInteger($id)
        DETACH DELETE c
        RETURN count(c) AS deletedCount
    `;
    try {
        const result = await session.run(query, { id });
        return result.records[0].get('deletedCount').low > 0;
    } catch (error) {
        console.error(`Erreur Cypher lors de la suppression de l'ID ${id}:`, error);
        throw new Error('Échec de la suppression de la compagnie.');
    } finally {
        await session.close();
    }
};

export const getAirlineCoverage = async (id) => {
    const session = driver.session();
    const query = `
        MATCH (c:Airline)
        WHERE c.id = toInteger($id)
        
        MATCH (a1:Airport)-[r:FLIES_TO]->(a2:Airport)
        
        WHERE r.airline_iata = c.iata 
        
        RETURN 
            count(DISTINCT a2) AS totalDestinations,
            count(DISTINCT a2.country) AS totalCountries
    `;
    try {
        const result = await session.run(query, { id });
        const record = result.records[0];
        
        const destinations = record.get('totalDestinations') ? record.get('totalDestinations').low : 0;
        const countries = record.get('totalCountries') ? record.get('totalCountries').low : 0;
        
        return { destinations, countries };
    } catch (error) {
        console.error(`Erreur lors de l'analyse de couverture pour l'ID ${id}:`, error);
        throw new Error('Échec de l\'analyse de couverture.');
    } finally {
        await session.close();
    }
};

export const getAirlineTopHubs = async (id, limit = 5) => {
    const session = driver.session();
    const query = `
        MATCH (c:Airline)
        WHERE c.id = toInteger($id)
        
        MATCH (a:Airport)-[r:FLIES_TO]->(:Airport)
        
        WHERE r.airline_iata = c.iata
        
        RETURN 
            a.iata AS hubIata, 
            a.city AS hubCity, 
            a.name AS hubName,
            count(r) AS routesOperated,
            a.pageRank AS airportPageRank
        ORDER BY routesOperated DESC
        LIMIT toInteger($limit)
    `;
    try {
        const result = await session.run(query, { id, limit });
        return result.records.map(record => ({
            iata: record.get('hubIata'),
            city: record.get('hubCity'),
            routesOperated: record.get('routesOperated') ? record.get('routesOperated').low : 0,
            airportPageRank: record.get('airportPageRank') || 0.0, 
        }));
    } catch (error) {
        console.error(`Erreur lors de l'analyse des hubs pour l'ID ${id}:`, error);
        throw new Error('Échec de l\'analyse des hubs.');
    } finally {
        await session.close();
    }
};

export const getAirlineFleetDiversity = async (id) => {
    const session = driver.session();
    const query = `
        MATCH (c:Airline)
        WHERE c.id = toInteger($id)
        
        MATCH (a1:Airport)-[r:FLIES_TO]->(a2:Airport)
        
        WHERE r.airline_iata = c.iata 
        
        WITH r.equipment_list AS equipmentList
        
        UNWIND split(equipmentList, ' ') AS equipmentIATA
        
        WITH equipmentIATA
        WHERE equipmentIATA <> ''
        
        RETURN 
            count(DISTINCT equipmentIATA) AS uniqueAircraftTypes,
            collect(DISTINCT equipmentIATA) AS sampleFleet
    `;
    try {
        const result = await session.run(query, { id });
        const record = result.records[0];
        
        if (!record || !record.get('uniqueAircraftTypes')) {
            return { uniqueAircraftTypes: 0, sampleFleet: [] };
        }
        
        return {
            uniqueAircraftTypes: record.get('uniqueAircraftTypes').low,
            sampleFleet: record.get('sampleFleet'),
        };
    } catch (error) {
        console.error(`Erreur lors de l'analyse de la flotte pour l'ID ${id}:`, error);
        throw new Error('Échec de l\'analyse de la flotte.');
    } finally {
        await session.close();
    }
};