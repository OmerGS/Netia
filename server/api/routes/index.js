import { Router } from 'express';

import dataRoutes from './data.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Netia API v1',
    status: 'online' 
  });
});

router.use('/v1/data', dataRoutes);

export default router;