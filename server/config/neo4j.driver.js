import neo4j from 'neo4j-driver';
import config from './app.config.js';

const { uri, user, pass } = config.neo4j;

if (!uri || !user || !pass) {
    throw new Error('NEO4J_URI, NEO4J_USER, or NEO4J_PASS are not defined in your .env file');
}

const driver = neo4j.driver(
    uri,
    neo4j.auth.basic(user, pass),
    {
        maxConnectionPoolSize: 50,
        connectionTimeout: 30000
    }
);

(async () => {
    try {
        await driver.verifyConnectivity();
        console.log('Neo4j connection successful. (Driver initialized)');
    } catch (error) {
        console.error('Neo4j connection failed:', error);
        process.exit(1); 
    }
})();

export default driver;