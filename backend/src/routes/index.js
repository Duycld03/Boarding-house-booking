import {
  authMiddleware,
  managementMiddleware,
  adminMiddleware,
} from '../middlewares/index.js';
import { apiRouter } from './api.js';
import adminRouter from './admin.js';
import reviewRouter from './reviewRoutes.js';

function routes(app) {
  app.use("/api", apiRouter);
  app.use('/dashboard/admin', reviewRouter);

export default routes;
