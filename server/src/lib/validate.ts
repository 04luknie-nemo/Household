import { validator } from "hono/validator";

export const householdNameValidator = validator("json", (value, c) => {
  let householdName = value["name"];
  if (!householdName || typeof householdName !== "string") {
    return c.text("Otillåten input", 400);
  }
  householdName = householdName.trim();
  if (householdName === "") {
    return c.text("Otillåten input", 400);
  }
  return { householdName };
});
