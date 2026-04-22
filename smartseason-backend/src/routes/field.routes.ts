import { Router } from "express";
import {
  createField,
  assignField,
  getFields,
  getFieldById,
} from "../controllers/field.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// 🧑‍💼 Admin only
router.post("/", authenticate, authorize(["ADMIN"]), createField);
router.patch("/:id/assign", authenticate, authorize(["ADMIN"]), assignField);

// 👨‍🌾 + 🧑‍💼
router.get("/", authenticate, getFields);
router.get("/:id", authenticate, getFieldById);

export default router;
