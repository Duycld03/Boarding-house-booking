import { Router } from 'express';
import {
  authController,
  AccountController,
  favoriteController,
} from './../controllers/index.js';

const authRouter = Router();

authRouter.get('/', (req, res) => {
  res.send('This is an auth router');
});

authRouter.get('/user', authController.getAccountFromToken);
authRouter.post('/change-password', AccountController.changePassword);
authRouter.put('/profile', AccountController.updateAccountFromProfile);
authRouter.post('/favorites', favoriteController.createFavorite);

export { authRouter };
