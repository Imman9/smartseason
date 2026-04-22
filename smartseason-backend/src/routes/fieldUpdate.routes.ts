import { Router } from "express";
import {
  updateField,
  getFieldUpdates,
  getAllUpdates,
} from "../controllers/fieldUpdate.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// 👨‍🌾 Agent updates
router.post("/:id/update", authenticate, authorize(["AGENT"]), updateField);

// 👨‍🌾 + 🧑‍💼
router.get("/:id/updates", authenticate, getFieldUpdates);

// 🧑‍💼 Admin only
router.get("/updates/all", authenticate, authorize(["ADMIN"]), getAllUpdates);

export default router;
