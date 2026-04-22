import { Field } from "../models/Field";

export const computeStatus = (field: Field): string => {
  const now = new Date();
  const plantingDate = new Date(field.plantingDate);

  const days = Math.floor(
    (now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (field.currentStage === "HARVESTED") return "COMPLETED";

  // example logic (you can explain this in README 👇)
  if (days > 90 && field.currentStage !== "READY") {
    return "AT_RISK";
  }

  return "ACTIVE";
};
