import { Hono } from "hono";
import { auth } from "../lib/auth.ts";
import { createInviteCode } from "../lib/invite-code.ts";
import { db } from "../../prisma/db.ts";
import { Prisma } from "../../generated/prisma/client.ts";
import { householdNameValidator } from "../lib/validate.ts";

const create = new Hono();

create.post("/", householdNameValidator, async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.text("Inte inloggad", 401);
  }

  const { householdName } = c.req.valid("json");

  for (let i = 0; i < 10; i++) {
    const inviteCode = createInviteCode();

    const newHousehold = {
      name: householdName,
      inviteCode: inviteCode,
    };
    try {
      const householdData = await db.household.create({
        data: {
          ...newHousehold,
          members: {
            create: {
              nickname: session.user.name,
              avatarId: 1,
              isOwner: true,
              status: "active",
              userId: session.user.id,
            },
          },
        },
      });

      return c.json(householdData, 201);
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
  return c.text("Misslyckades att skapa hushåll", 500);
});

export default create;
