import { Hono } from "hono";
import { Prisma } from "../../generated/prisma/client.ts";
import { db } from "../../prisma/db.ts";
import { avatars } from "../constants/avatars.ts";
import { auth } from "../lib/auth.ts";

const profile = new Hono();

profile.get("/:id/members/me", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Inte inloggad" }, 401);
  }

  const household = await db.household.findUnique({
    where: { id: c.req.param("id") },
    select: {
      id: true,
      members: {
        where: { userId: session.user.id },
        select: {
          nickname: true,
          avatarId: true,
          status: true,
        },
      },
    },
  });

  if (!household) {
    return c.json({ error: "Hushållet finns inte" }, 404);
  }

  const member = household.members[0];

  if (!member || member.status !== "active") {
    return c.json({ error: "Inte aktiv medlem" }, 403);
  }

  const otherMembers = await db.householdMember.findMany({
    where: {
      householdId: household.id,
      userId: { not: session.user.id },
    },
    select: { avatarId: true },
  });

  return c.json({
    nickname: member.nickname,
    avatarId: member.avatarId,
    takenAvatarIds: otherMembers.map((item) => item.avatarId),
  });
});

profile.patch("/:id/members/me", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Inte inloggad" }, 401);
  }

  const household = await db.household.findUnique({
    where: { id: c.req.param("id") },
    select: {
      id: true,
      members: {
        where: { userId: session.user.id },
        select: { id: true, status: true },
      },
    },
  });

  if (!household) {
    return c.json({ error: "Hushållet finns inte" }, 404);
  }

  const member = household.members[0];

  if (!member || member.status !== "active") {
    return c.json({ error: "Inte aktiv medlem" }, 403);
  }

  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Ogiltig JSON" }, 400);
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return c.json({ error: "Ogiltig input" }, 400);
  }

  const input = body as Record<string, unknown>;
  const data: { nickname?: string; avatarId?: number } = {};

  if ("nickname" in input) {
    if (
      typeof input.nickname !== "string" ||
      input.nickname.trim().length === 0 ||
      input.nickname.trim().length > 20
    ) {
      return c.json({ error: "Smeknamnet måste vara 1–20 tecken" }, 400);
    }

    data.nickname = input.nickname.trim();
  }

  if ("avatarId" in input) {
    if (
      typeof input.avatarId !== "number" ||
      !Number.isInteger(input.avatarId) ||
      !avatars.some((avatar) => avatar.id === input.avatarId)
    ) {
      return c.json({ error: "Ogiltigt avatarId" }, 400);
    }

    data.avatarId = input.avatarId;
  }

  if (Object.keys(data).length === 0) {
    return c.json({ error: "Ange nickname och/eller avatarId" }, 400);
  }

  try {
    const updatedMember = await db.householdMember.update({
      where: { id: member.id },
      data,
      select: {
        nickname: true,
        avatarId: true,
      },
    });

    return c.json(updatedMember);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return c.json(
        { error: "Avataren används redan av en annan medlem" },
        409,
      );
    }

    throw error;
  }
});

export default profile;
