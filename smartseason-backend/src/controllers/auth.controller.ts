import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, UserRole } from "../models/User";
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // First user becomes ADMIN
    const userCount = await User.count();
    const role = userCount === 0 ? UserRole.ADMIN : UserRole.AGENT;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return res.json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error });
  }
};
