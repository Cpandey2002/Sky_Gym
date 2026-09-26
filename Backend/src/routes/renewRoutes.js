import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  createRenew,
  getAllRenew,
  getRenewByClientId,
  updateRenew,
  deleteRenew
} from "../controllers/renewController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createRenew);

router.get("/", getAllRenew);

router.get("/client/:clientId", getRenewByClientId);

router.put("/", updateRenew);

router.delete("/", deleteRenew);

export default router;
