import { Hono } from "hono";
import { db } from "../../prisma/db.ts";
import { auth } from "../lib/auth.ts";

const requests = new Hono();

requests.post("/:id/requests/:memberId/approve", async (c) => {
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

  const request = await db.householdMember.findUnique({
    where: { id: c.req.param("memberId") },
    select: { id: true, householdId: true, status: true },
  });

  if (!request || request.householdId !== household.id) {
    return c.text("Medlemmen finns inte på det hushållet!", 404);
  }
  if (request.status !== "pending") {
    return c.text("Medlemmen har inte skickat en förfrågan!", 404);
  }
  const requestData = await db.householdMember.update({
    where: { id: request.id },
    data: { status: "active" },
  });
  return c.json(requestData, 200);
});

requests.delete("/:id/requests/:memberId", async (c) => {
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

  const request = await db.householdMember.findUnique({
    where: { id: c.req.param("memberId") },
    select: { id: true, householdId: true, status: true },
  });

  if (!request || request.householdId !== household.id) {
    return c.text("Medlemmen finns inte på det hushållet!", 404);
  }
  if (request.status !== "pending") {
    return c.text("Medlemmen har inte skickat en förfrågan!", 404);
  }
  await db.householdMember.delete({
    where: { id: request.id },
  });
  return c.body(null, 204);
});
