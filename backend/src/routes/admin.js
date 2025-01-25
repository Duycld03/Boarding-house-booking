import { Router } from 'express';

import {
  withdrawalRequestsController, BoardingHouseController,




  AccountController
} from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get(
  '/withdrawRequests',
  withdrawalRequestsController.getWithdrawRequests
);

adminRouter.get('/boardinghouse', BoardingHouseController.getAllBHOnDashBoard)

//Account
adminRouter.get('/account', AccountController.getAllAccount)
adminRouter.delete('/account/:accountId', AccountController.softDeleteAccount)
adminRouter.get('/account/filter', AccountController.filterAccounts);




export default adminRouter;
