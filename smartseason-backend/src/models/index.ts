import { User } from "./User";
import { Field } from "./Field";
import { FieldUpdate } from "./FieldUpdate";

// User ↔ Field (assignment)
User.hasMany(Field, { foreignKey: "assignedAgentId" });
Field.belongsTo(User, { foreignKey: "assignedAgentId", as: "agent" });

// Field ↔ Updates
Field.hasMany(FieldUpdate, { foreignKey: "fieldId" });
FieldUpdate.belongsTo(Field, { foreignKey: "fieldId" });

// User ↔ Updates
User.hasMany(FieldUpdate, { foreignKey: "agentId" });
FieldUpdate.belongsTo(User, { foreignKey: "agentId", as: "agent" });
