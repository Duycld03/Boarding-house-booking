import { apiRouter } from "./api.js";
function routes(app) {
  app.use("/api", apiRouter);
}

export default routes;
