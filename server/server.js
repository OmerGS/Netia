import express from 'express';
import cors from 'cors';
import config from './config/app.config.js';
import mainRouter from './api/routes/index.js';

const app = express();

app.use(cors(config.corsOptions));
app.use(express.json());
app.use('/api', mainRouter);

app.listen(config.port, () => {
  console.log(`Netia API server listening at http://localhost:${config.port}`);
});