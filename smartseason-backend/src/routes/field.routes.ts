import { Router } from "express";
import {
  createField,
  assignField,
  getFields,
  getFieldById,
  getAgents,
} from "../controllers/field.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

//  Admin only – must be before /:id to avoid route conflict
router.post("/", authenticate, authorize(["ADMIN"]), createField);
router.get("/agents", authenticate, authorize(["ADMIN"]), getAgents);
router.patch("/:id/assign", authenticate, authorize(["ADMIN"]), assignField);


router.get("/", authenticate, getFields);
router.get("/:id", authenticate, getFieldById);

export default router;
