import { Hono } from "hono";
import { validator } from "hono/validator";
import { createInviteCode } from "../lib/invite-code.ts";
import { db } from "../../prisma/db.ts";
import { Prisma } from "../../generated/prisma/client.ts";

const households = new Hono();

households.post(
  "/",
  validator("json", (value, c) => {
    let householdName = value["name"];
    if (!householdName || typeof householdName !== "string") {
      return c.text("Invalid", 400);
    }
    householdName = householdName.trim();
    if (householdName === "") {
      return c.text("Invalid", 400);
    }
    return { householdName };
  }),
  async (c) => {
    const { householdName } = await c.req.valid("json");

    for (let i = 0; i < 10; i++) {
      const inviteCode = createInviteCode();

      const newHousehold = {
        name: householdName,
        inviteCode: inviteCode,
      };
      try {
        const data = await db.household.create({ data: newHousehold });
        return c.json(data, 201);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          continue;
        } else {
          throw error;
        }
      }
    }
    return c.text("Failed to create household", 500);
  },
);
export default households;
