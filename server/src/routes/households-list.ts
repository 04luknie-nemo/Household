import { Hono } from "hono";
import { auth } from "../lib/auth.ts";

const list = new Hono();

list.get("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.text("Inte inloggad", 401);
  }
  return c.text("Inloggad!");
});

export default list;