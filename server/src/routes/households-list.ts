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
          status: "active",
        },
      },
    },
  });
  return c.json(myHouseholds);
});

export default list;
