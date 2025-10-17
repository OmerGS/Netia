LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmerGS/doc/refs/heads/main/airlines.csv' AS row
MERGE (c:Airline {id: toInteger(row.`Airline ID`)}) 
ON CREATE SET 
    c.name = row.Name,
    c.alias = row.Alias,
    c.iata = row.IATA,
    c.icao = row.ICAO,
    c.country = row.Country,
    c.active = (row.Active = 'Y')
RETURN count(c) AS total_airlines;

LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmerGS/doc/refs/heads/main/airports.csv' AS row
MERGE (a:Airport {iata: row.IATA}) 
ON CREATE SET 
    a.of_id = toInteger(row.`Airport ID`),
    a.name = row.Name,
    a.city = row.City,
    a.country = row.Country,
    a.icao = row.ICAO,
    a.latitude = toFloat(row.Latitude),
    a.longitude = toFloat(row.Longitude),
    a.altitude = toInteger(row.Altitude),
    a.tz_db = row.`Tz database time zone`
RETURN count(a) AS total_airports;

LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmerGS/doc/refs/heads/main/airplanes.csv' AS row
MERGE (p:Airplane {name: row.Name}) 
ON CREATE SET 
    p.iata = row.`IATA code`,
    p.icao = row.`ICAO code`
RETURN count(p) AS total_airplanes;