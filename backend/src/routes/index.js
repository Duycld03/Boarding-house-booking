import {
  authMiddleware,
  managementMiddleware,
  adminMiddleware,
} from '../middlewares/index.js';
import { apiRouter } from './api.js';
import adminRouter from './admin.js';
import reportRoute from './reportRoutes.js';
function routes(app) {
  app.use('/api', apiRouter);
  app.use('/dashboard/admin', adminRouter);
  app.use('/dashboard/admin', reportRoute);
}

export default routes;
