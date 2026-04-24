import bcrypt from "bcryptjs";
import { User, UserRole } from "../models/User";
import { sequelize } from "../config/database";

export const seedUsers = async () => {
  try {
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
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: hashedPassword,
        },
      });

      if (!created) {
        // If user already exists, update their password and role to match demo credentials
        await user.update({
          password: hashedPassword,
          role: userData.role,
          name: userData.name,
        });
        console.log(`User ${userData.email} updated successfully.`);
      } else {
        console.log(`User ${userData.email} created successfully.`);
      }
    }

    console.log("Seeding completed.");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
};

// If run directly
if (require.main === module) {
  sequelize.authenticate()
    .then(() => seedUsers())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
