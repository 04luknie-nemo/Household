import { Hono } from "hono";
import { db } from "../../prisma/db.ts";
import { auth } from "../lib/auth.ts";

const leave = new Hono();

leave.post("/:id/leave", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.text("Inte inloggad", 401);
  }

  const household = await db.household.findUnique({
    where: { id: c.req.param("id") },
    select: {
      id: true,
      members: {
        select: {
          userId: true,
          isOwner: true,
          status: true,
        },
      },
    },
  });

  if (!household) {
    return c.text("Hushållet finns inte", 404);
  }

  const member = household.members.find(
    (item) => item.userId === session.user.id,
  );

  if (!member || member.status !== "active") {
    return c.text("Inte aktiv medlem", 403);
  }

  const activeMembers = household.members.filter(
    (item) => item.status === "active",
  );

  if (
    member.isOwner &&
    activeMembers.length > 1 &&
    !activeMembers.some((item) => item.isOwner && item.userId !== member.userId)
  ) {
    return c.text("Gör någon annan till ägare först", 409);
  }

  await db.householdMember.update({
    where: {
      userId_householdId: {
        userId: session.user.id,
        householdId: household.id,
      },
    },
    data: {
      status: "left",
      isOwner: false,
    },
  });

  return c.body(null, 204);
});

export default leave;
