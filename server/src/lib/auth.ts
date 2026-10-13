import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "../../prisma/db.ts";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  //...other options
  trustedOrigins: [
    "mobile://",

    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === "development"
      ? [
          "exp://", // Trust any host of the exp:// scheme
          "exp://**", // Trust all Expo URLs (wildcard matching)
          "exp://192.168.*.*:*/**", // Trust 192.168.x.x IP range with any port and path
          "http://localhost:8081", // Expo web
        ]
      : []),
  ],
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});
