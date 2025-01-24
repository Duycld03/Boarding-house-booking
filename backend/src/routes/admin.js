import { Router } from 'express';

import { withdrawalRequestsController, BoardingHouseController } from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get(
  '/withdrawRequests',
  withdrawalRequestsController.getWithdrawRequests
);

adminRouter.get('/boardinghouse', BoardingHouseController.getAllBHOnDashBoard)



export default adminRouter;
