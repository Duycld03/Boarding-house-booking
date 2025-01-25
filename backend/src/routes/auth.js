import { Router } from "express";

const authRouter = Router();

authRouter.get("/", (req, res) => {
    res.send("This is an auth router");
});

export { authRouter };