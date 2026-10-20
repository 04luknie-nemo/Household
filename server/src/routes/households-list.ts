import { Hono } from "hono";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const list = new Hono();

list.get("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.text("Inte inloggad", 401);
  }

  const myHouseholds = await db.household.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
          status: { not: "left" },
        },
      },
    },
    select: {
      id: true,
      name: true,
      members: {
        where: {
          userId: session.user.id,
        },
        select: {
          isOwner: true,
          status: true,
        },
      },
    },
  });

  const response = myHouseholds.map((h) => ({
        id: h.id,
        name: h.name,
        status: h.members[0]?.status,
        isOwner: h.members[0]?.isOwner,
      }));
  return c.json(response);
});

export default list;
