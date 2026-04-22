import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export enum UserRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "AGENT"),
      defaultValue: "AGENT",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);
