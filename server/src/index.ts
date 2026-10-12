import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth.ts";

const app = new Hono();

app.use(
  "/api/auth/*",
  cors({
    origin: ["http://localhost:3001", "http://localhost:8081"],
    credentials: true,
  }),
);

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
