import { Hono } from "hono";
import { db } from "../../prisma/db.ts";
import { auth } from "../lib/auth.ts";

const handleSetOwner = new Hono();

handleSetOwner.patch("/:id/members/:memberId/owner", async (c) => {
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
        select: { status: true, isOwner: true },
      },
    },
  });

  if (!household) {
    return c.text("Hushållet finns inte!", 404);
  }

  const me = household.members[0];
  if (!me || me.status !== "active") {
    return c.text("Du är inte medlem!", 403);
  }
  if (!me.isOwner) {
    return c.text("Du är inte en ägare!", 403);
  }

  const member = await db.householdMember.findUnique({
    where: { id: c.req.param("memberId") },
    select: { id: true, householdId: true, status: true, isOwner: true },
  });

  if (!member || member.householdId !== household.id) {
    return c.text("Medlemmen finns inte på det hushållet!", 404);
  }
  if (member.status !== "active") {
    return c.text("Medlemmen är inte aktiv!", 403);
  }
  const ownerCount = await db.householdMember.count({
    where: { householdId: household.id, isOwner: true, status: "active" },
  });
  if (member.isOwner && ownerCount <= 1) {
    return c.text("Någon annan behöver bli ägare först!", 409);
  }
  const memberData = await db.householdMember.update({
    where: { id: member.id },
    data: { isOwner: !member.isOwner },
  });
  return c.json(memberData, 200);
});

export default handleSetOwner;
