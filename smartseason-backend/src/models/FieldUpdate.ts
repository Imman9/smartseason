import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class FieldUpdate extends Model {
  public id!: number;
  public fieldId!: number;
  public agentId!: number;
  public stage!: string;
  public notes!: string;
}

FieldUpdate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fieldId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "field_updates",
    timestamps: true,
  }
);
