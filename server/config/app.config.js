import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 4000,

    neo4j: {
        uri: process.env.NEO4J_URI,
        user: process.env.NEO4J_USER,
        pass: process.env.NEO4J_PASS,
    },

    gds: {
        projectionName: 'net'
    },

    // Configuration CORS
    corsOptions: {
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200
    }
};

export default config;