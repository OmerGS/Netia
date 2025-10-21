import { Router } from 'express';

import dataRoutes from './data.routes.js';
import routeRoutes from './route.routes.js';
import flightRoutes from './flight.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Netia API v1',
    status: 'online' 
  });
});

router.use('/v1/data', dataRoutes);
router.use('/v1/routes', routeRoutes);
router.use('/v1/flights', flightRoutes);

export default router;