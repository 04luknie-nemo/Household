import { Hono } from "hono";
import { validator } from "hono/validator";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const detail = new Hono();

detail.get("/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.text("Inte inloggad", 401);
  }

  const household = await db.household.findUnique({
    where: { id: c.req.param("id") },
    select: {
      id: true,
      name: true,
      inviteCode: true,
      members: {
        where: { userId: session.user.id },
        select: { status: true },
      },
    },
  });

  if (!household) return c.text("Hushållet finns inte", 404);

  const member = household.members[0];
  if (!member || member.status !== "active") {
    return c.text("Inte medlem", 403);
  }

  return c.json({
    id: household.id,
    name: household.name,
    inviteCode: household.inviteCode,
  });
});

detail.patch(
  "/:id",
  validator("json", (value, c) => {
    let householdName = value?.["name"];
    if (!householdName || typeof householdName !== "string") {
      return c.text("Otillåten input", 400);
    }
    householdName = householdName.trim();
    if (householdName === "") {
      return c.text("Otillåten input", 400);
    }
    return { householdName };
  }),
  async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.text("Inte inloggad", 401);
    }

    const household = await db.household.findUnique({
      where: { id: c.req.param("id") },
      select: {
        id: true,
        members: {
          where: { userId: session.user.id },
          select: { isOwner: true, status: true },
        },
      },
    });

    if (!household) return c.text("Hushållet finns inte", 404);

    const member = household.members[0];
    if (!member || member.status !== "active" || !member.isOwner) {
      return c.text("Endast aktiva ägare får ändra namn", 403);
    }

    const { householdName } = c.req.valid("json");
    const householdData = await db.household.update({
      where: { id: household.id },
      data: { name: householdName },
    });

    return c.json(householdData);
  },
);

export default detail;
