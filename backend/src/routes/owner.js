import { Router } from 'express';
import { boardingHouseController } from '../controllers/index.js';

const ownerRouter = Router();

ownerRouter.get('/', (req, res) => {
  res.send('This is a owner router');
});
ownerRouter.get('/boardinghouseowner', boardingHouseController.getAllBHOwner);

export { ownerRouter };
