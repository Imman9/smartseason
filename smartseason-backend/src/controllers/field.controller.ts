
import { Request, Response } from "express";
import { Field } from "../models/Field";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";

//  Admin: Create Field
export const createField = async (req: AuthRequest, res: Response) => {
  try {
    const { name, cropType, plantingDate, assignedAgentId } = req.body;

    const field = await Field.create({
      name,
      cropType,
      plantingDate,
      assignedAgentId: assignedAgentId || null,
    });

    return res.status(201).json(field);
  } catch (error) {
    console.error("createField error:", error);
    return res.status(500).json({ message: "Failed to create field", error });
  }
};

//  Admin: Assign / Unassign Agent
export const assignField = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;  // null means unassign

    const field = await Field.findByPk(typeof id === "string" ? id : id[0]);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }

    if (agentId !== null && agentId !== undefined) {
      const agent = await User.findByPk(agentId);
      if (!agent || agent.role !== "AGENT") {
        return res.status(400).json({ message: "Invalid agent" });
      }
    }

    field.assignedAgentId = agentId ?? null;
    await field.save();

    return res.json(field);
  } catch (error) {
    console.error("assignField error:", error);
    return res.status(500).json({ message: "Assignment failed", error });
  }
};

// Get Fields
export const getFields = async (req: AuthRequest, res: Response) => {
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

    return res.json(fields);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch fields", error });
  }
};

//  Get Single Field
export const getFieldById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(typeof id === "string" ? id : id[0], {
      include: [{ model: User, as: "agent", attributes: ["id", "name"] }],
    });

    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }

    //  Agents can only access their own fields
    if (req.user.role === "AGENT" && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(field);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch field", error });
  }
};

//  Admin: List all agents
export const getAgents = async (req: AuthRequest, res: Response) => {
  try {
    const agents = await User.findAll({
      where: { role: "AGENT" },
      attributes: ["id", "name", "email"],
    });
    return res.json(agents);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch agents", error });
  }
};
