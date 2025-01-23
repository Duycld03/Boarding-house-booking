import { Router } from 'express';

import { ReviewController } from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get(
    '/listReviews',
    ReviewController.getReviews
);

export default adminRouter;