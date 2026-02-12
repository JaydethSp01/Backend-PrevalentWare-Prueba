import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/infrastructure/database/prisma";

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

// Normalizamos BETTER_AUTH_URL para que Better Auth reciba solo el origen
// (https://backend-prevalentware-prueba.vercel.app) y deje el basePath por defecto (/api/auth).
const rawBaseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:8000";
const baseUrl = rawBaseUrl.replace(/\/api\/auth\/?$/, "");

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseUrl,
  trustedOrigins: [frontendUrl],
  advanced: {},
  cookie: {
    extraCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "ADMIN",
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ["read:user", "user:email"],
    },
  },
  callbacks: {
    redirect: {
      redirectTo: () => frontendUrl,
    },
  },
});
