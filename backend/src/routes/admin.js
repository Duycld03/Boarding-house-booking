import { Router } from 'express';

import { withdrawalRequestsController } from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get(
  '/withdrawRequests',
  withdrawalRequestsController.getWithdrawRequests
);

export default adminRouter;
