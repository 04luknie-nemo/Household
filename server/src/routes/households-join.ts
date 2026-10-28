import { Hono } from "hono";
import { Prisma } from "../../generated/prisma/client.ts";
import { db } from "../../prisma/db.ts";
import { avatars } from "../constants/avatars.ts";
import { auth } from "../lib/auth.ts";

const join = new Hono();

join.post("/join", async (c) => {
  // 1. Kontrollera att användaren är inloggad
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Inte inloggad" }, 401);
  }

  // 2. Läs och validera input
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Ogiltig JSON" }, 400);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("inviteCode" in body)
  ) {
    return c.json({ error: "inviteCode krävs" }, 400);
  }

  const input = body as Record<string, unknown>;
  const inviteCode = input.inviteCode;
  const requestedAvatarId = input.avatarId;

  if (typeof inviteCode !== "string" || inviteCode.trim() === "") {
    return c.json({ error: "Ogiltig inviteCode" }, 400);
  }

  // 3. Hitta hushållet med inbjudningskoden
  const household = await db.household.findUnique({
    where: { inviteCode: inviteCode.toUpperCase().trim() },
  });

  if (!household) {
    return c.json({ error: "Hushållet hittades inte" }, 404);
  }

  // 4. Hämta avatarer som används av medlemmar som inte har lämnat hushållet
  const existingMembers = await db.householdMember.findMany({
    where: {
      householdId: household.id,
      status: {
        not: "left",
      },
    },
    select: { avatarId: true },
  });

  const takenAvatarIds = new Set(
    existingMembers.map((member) => member.avatarId),
  );

  let avatarId: number;

  if (requestedAvatarId === undefined) {
    // Välj den lägsta lediga avataren automatiskt
    const availableAvatar = avatars.find(
      (avatar) => !takenAvatarIds.has(avatar.id),
    );

    if (!availableAvatar) {
      return c.json({ error: "Hushållet är fullt" }, 409);
    }

    avatarId = availableAvatar.id;
  } else {
    // Om avatarId skickas måste det vara giltigt
    if (
      typeof requestedAvatarId !== "number" ||
      !Number.isInteger(requestedAvatarId) ||
      !avatars.some((avatar) => avatar.id === requestedAvatarId)
    ) {
      return c.json({ error: "Ogiltigt avatarId" }, 400);
    }

    if (takenAvatarIds.has(requestedAvatarId)) {
      return c.json(
        { error: "Avataren används redan av en annan medlem" },
        409,
      );
    }

    avatarId = requestedAvatarId;
  }

  // 5. Skapa medlemsförfrågan
  // 5. Skapa eller återaktivera medlemsförfrågan
  try {
    const existingMember = await db.householdMember.findUnique({
      where: {
        userId_householdId: {
          userId: session.user.id,
          householdId: household.id,
        },
      },
    });

    const member = existingMember
      ? await db.householdMember.update({
          where: { id: existingMember.id },
          data: {
            nickname: session.user.name,
            avatarId,
            isOwner: false,
            isPaused: false,
            status: "pending",
          },
        })
      : await db.householdMember.create({
          data: {
            userId: session.user.id,
            householdId: household.id,
            nickname: session.user.name,
            avatarId,
            isOwner: false,
            status: "pending",
          },
        });

    return c.json(
      {
        message: "Förfrågan om medlemskap skapad",
        member,
      },
      201,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return c.json(
        {
          error:
            "Du är redan medlem i hushållet eller så används avataren redan.",
        },
        409,
      );
    }

    throw error;
  }
});

export default join;
