import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/infrastructure/database/prisma";

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:8000";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseUrl,
  trustedOrigins: [frontendUrl],
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
      // Necesario para que GitHub devuelva el email (evita error email_not_found)
      scope: ["read:user", "user:email"],
    },
  },
  callbacks: {
    redirect: {
      redirectTo: () => frontendUrl,
    },
  },
});
