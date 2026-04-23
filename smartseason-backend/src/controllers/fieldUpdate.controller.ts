import { Response } from "express";
import { Field } from "../models/Field";
import { FieldUpdate } from "../models/FieldUpdate";
import { AuthRequest } from "../middleware/auth.middleware";

//  Agent: Update field + add note
export const updateField = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;

    const field = await Field.findByPk(typeof id === "string" ? id : id[0]);

    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }

    // Ensure agent owns the field
    if (req.user.role === "AGENT" && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Update field stage
    field.currentStage = stage;
    await field.save();

    // Create update record
    const update = await FieldUpdate.create({
      fieldId: field.id,
      agentId: req.user.id,
      stage,
      notes,
    });

    return res.json({
      message: "Field updated successfully",
      field,
      update,
    });
  } catch (error) {
    return res.status(500).json({ message: "Update failed", error });
  }
};

// Get updates for a field
export const getFieldUpdates = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(typeof id === "string" ? id : id[0]);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }

    // Agents only see their fields
    if (req.user.role === "AGENT" && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updates = await FieldUpdate.findAll({
      where: { fieldId: id },
      order: [["createdAt", "DESC"]],
    });

    return res.json(updates);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch updates", error });
  }
};

// Admin only
export const getAllUpdates = async (req: AuthRequest, res: Response) => {
  try {
    const updates = await FieldUpdate.findAll({
      order: [["createdAt", "DESC"]],
      limit: 20, // recent updates
    });

    return res.json(updates);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch updates", error });
  }
};
