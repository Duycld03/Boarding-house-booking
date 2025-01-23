import { apiRouter } from "./api.js";
import reviewRouter from './reviewRoutes.js';

function routes(app) {
  app.use("/api", apiRouter);
  app.use('/dashboard/admin', reviewRouter);

}

export default routes;
