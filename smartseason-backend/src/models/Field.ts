import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export enum FieldStage {
  PLANTED = "PLANTED",
  GROWING = "GROWING",
  READY = "READY",
  HARVESTED = "HARVESTED",
}

export class Field extends Model {
  public id!: number;
  public name!: string;
  public cropType!: string;
  public plantingDate!: Date;
  public currentStage!: FieldStage;
  public assignedAgentId!: number | null;
}

Field.init(
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
    cropType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plantingDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    currentStage: {
      type: DataTypes.ENUM("PLANTED", "GROWING", "READY", "HARVESTED"),
      defaultValue: "PLANTED",
    },
    assignedAgentId: {
      type: DataTypes.INTEGER,
      allowNull: true, // field can exist before assignment
    },
  },
  {
    sequelize,
    tableName: "fields",
    timestamps: true,
  }
);
