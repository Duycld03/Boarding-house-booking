import { Router } from "express";

const ownerRouter = Router();

ownerRouter.get("/", (req, res) => {
    res.send("This is a owner router");
});

export { ownerRouter };