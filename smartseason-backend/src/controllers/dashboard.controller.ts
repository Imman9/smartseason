import { Response } from "express";
import { Field } from "../models/Field";
import { FieldUpdate } from "../models/FieldUpdate";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";
import { computeStatus } from "../utils/status";

// Core aggregation logic
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    let fields;

    if (req.user.role === "ADMIN") {
      fields = await Field.findAll({
        include: [{ model: User, as: "agent", attributes: ["id", "name"] }],
      });
    } else {
      fields = await Field.findAll({
        where: { assignedAgentId: req.user.id },
        include: [{ model: User, as: "agent", attributes: ["id", "name"] }],
      });
    }

    let total = fields.length;
    let active = 0;
    let atRisk = 0;
    let completed = 0;

    const fieldsWithStatus = fields.map((field) => {
      const status = computeStatus(field);
      if (status === "ACTIVE") active++;
      if (status === "AT_RISK") atRisk++;
      if (status === "COMPLETED") completed++;
      return { ...field.toJSON(), status };
    });

    // Recent updates
    const updates = await FieldUpdate.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [
        { model: Field, attributes: ["name"] },
        { model: User, as: "agent", attributes: ["name"] },
      ],
    });

    return res.json({
      stats: {
        total,
        active,
        atRisk,
        completed,
      },
      fields: fieldsWithStatus,
      recentUpdates: updates,
    });
  } catch (error) {
    return res.status(500).json({ message: "Dashboard failed", error });
  }
};
