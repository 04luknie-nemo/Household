import { Hono } from "hono";

const authProviders = new Hono();

// Öppen route så att inloggningssidan kan dölja GitHub-knappen när
// GitHub-nycklarna saknas i server/.env
authProviders.get("/", (c) => {
  return c.json({
    github: Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
    ),
  });
});

export default authProviders;
