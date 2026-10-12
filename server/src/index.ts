import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./lib/auth.ts";

const app = new Hono();

// endpoint hämtar posts i version 1
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
