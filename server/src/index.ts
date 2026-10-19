import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth.ts";
import households from "./routes/households.ts";

const app = new Hono();

app.use(
  "/api/auth/*",
  cors({
    origin: ["http://localhost:3001", "http://localhost:8081"],
    credentials: true,
  }),
);

app.use(
  "/api/households/*",
  cors({
    origin: ["http://localhost:3001", "http://localhost:8081"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/households", households);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
