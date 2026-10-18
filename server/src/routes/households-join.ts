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
    !("inviteCode" in body) ||
    !("avatarId" in body)
  ) {
    return c.json({ error: "inviteCode och avatarId krävs" }, 400);
  }

  const { inviteCode, avatarId } = body;

  if (
    typeof inviteCode !== "string" ||
    inviteCode.trim() === "" ||
    typeof avatarId !== "number" ||
    !Number.isInteger(avatarId)
  ) {
    return c.json({ error: "Ogiltig input" }, 400);
  }

  // 3. Kontrollera att avatar-ID:t finns
  const validAvatar = avatars.some((avatar) => avatar.id === avatarId);

  if (!validAvatar) {
    return c.json({ error: "Ogiltigt avatarId" }, 400);
  }

  // 4. Hitta hushållet med inbjudningskoden
  const household = await db.household.findUnique({
    where: { inviteCode: inviteCode.trim() },
  });

  if (!household) {
    return c.json({ error: "Hushållet hittades inte" }, 404);
  }

  try {
    const member = await db.householdMember.create({
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
