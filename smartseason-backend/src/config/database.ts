import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

let sequelize: Sequelize;

if (isProduction && process.env.DATABASE_URL) {
  // ✅ Production (Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    logging: false,
  });
} else {
  // ✅ Local development
  const {
    DB_HOST = "localhost",
    DB_PORT = "5433",
    DB_NAME = "smartseason",
    DB_USER = "postgres",
    DB_PASSWORD = "password",
  } = process.env;

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: "postgres",

    logging: false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

export { sequelize };