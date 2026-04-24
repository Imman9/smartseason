import bcrypt from "bcryptjs";
import { User, UserRole } from "../models/User";
import { sequelize } from "../config/database";

const seed = async () => {
  try {
    // Sync database
    await sequelize.authenticate();
    console.log("Connected to database.");

    const users = [
      {
        name: "Admin User",
        email: "admin@smartseason.dev",
        password: "admin123",
        role: UserRole.ADMIN,
      },
      {
        name: "Field Agent",
        email: "agent@smartseason.dev",
        password: "agent123",
        role: UserRole.AGENT,
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        console.log(`User ${userData.email} already exists. Skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        ...userData,
        password: hashedPassword,
      });
      console.log(`User ${userData.email} created successfully.`);
    }

    console.log("Seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
