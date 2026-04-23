import { QueryInterface } from "sequelize";

/**
 * Fix the broken FK on fields.assignedAgentId.
 * It incorrectly references the fields table; we drop it and recreate it
 * pointing to users.id.
 */
export async function fixFieldsFk(queryInterface: QueryInterface) {
  try {
    // Drop the bad constraint (may not exist if DB is fresh)
    await queryInterface.removeConstraint("fields", "fields_assignedAgentId_fkey");
    console.log(" Dropped bad FK constraint");
  } catch {
    // Constraint may not exist yet – that's fine
  }

  try {
    await queryInterface.addConstraint("fields", {
      type: "foreign key",
      fields: ["assignedAgentId"],
      name: "fields_assignedAgentId_fkey",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    console.log(" Recreated fields_assignedAgentId_fkey → users.id");
  } catch (err: any) {
    // Constraint already correct – safe to ignore duplicate errors
    if (!err.message?.includes("already exists")) {
      throw err;
    }
    console.log(" FK constraint already correct, skipping");
  }
}
