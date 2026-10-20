import { Hono } from "hono";
import { validator } from "hono/validator";
import { Prisma } from "../../generated/prisma/client.ts";
import { db } from "../../prisma/db.ts";
import { auth } from "../lib/auth.ts";
import { createInviteCode } from "../lib/invite-code.ts";
import join from "./households-join.ts";
import list from "./households-list.ts";
import createTask from "./households-tasks.ts";
import detail from "./households-detail.ts";

const households = new Hono();

households.post(
  "/",
  validator("json", (value, c) => {
    let householdName = value["name"];
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

    const { householdName } = await c.req.valid("json");

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
  },
);

households.route("/", detail)
households.route("/", join);
households.route("/", list);
households.route("/", createTask);
export default households;
