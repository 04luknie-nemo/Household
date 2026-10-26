import { Hono } from "hono";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const members = new Hono();

members.get("/:id/members", async (c) => {
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
        select: { status: true },
      },
    },
  });

  if (!household) {
    return c.text("Hushållet finns inte", 404);
  }
  const member = household.members[0];
  if (!member || member.status !== "active") {
    return c.text("Inte medlem", 403);
  }

  const memberList = await db.householdMember.findMany({
    where: {
      householdId: c.req.param("id"),
      status: "active",
    },
    select: {
      id: true,
      nickname: true,
      avatarId: true,
      isOwner: true,
    },
    orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
  });
  return c.json(memberList);
});

export default members;
