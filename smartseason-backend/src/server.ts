import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import dotenv from "dotenv";
import fieldRoutes from "./routes/field.routes";
import fieldUpdateRoutes from "./routes/fieldUpdate.routes";
import dashboardRoutes from "./routes/dashboard.routes";

import { sequelize } from "./config/database";
import { fixFieldsFk } from "./migrations/fixFieldsFk";

//importing models
import "./models";

dotenv.config();

const app = express();

//middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://smartseason-pme5.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/fields", fieldUpdateRoutes);
app.use("/api/dashboard", dashboardRoutes);

//health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "SmartSeason API running" });
});

const PORT = process.env.PORT || 3000;

//startup
const startServer = async () => {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log(" Database connected successfully");

    // auto-create tables
    await sequelize.sync({ alter: true });
    console.log(" Database synced");

    // Fix broken FK if present
    await fixFieldsFk(sequelize.getQueryInterface());

    // Start server
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
