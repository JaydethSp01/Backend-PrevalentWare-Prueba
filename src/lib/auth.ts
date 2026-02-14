import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/infrastructure/database/prisma";

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

// Normalizamos BETTER_AUTH_URL para que Better Auth reciba solo el origen
// (https://backend-prevalentware-prueba.vercel.app) y deje el basePath por defecto (/api/auth).
const rawBaseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:8000";
const baseUrl = rawBaseUrl.replace(/\/api\/auth\/?$/, "");

const FIFTEEN_MINUTES = 60 * 15;
const ONE_MINUTE = 60;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseUrl,
  trustedOrigins: [frontendUrl],
  session: {
    expiresIn: FIFTEEN_MINUTES,
    updateAge: ONE_MINUTE,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  account: {
    // Usa base de datos para guardar el state del flujo OAuth
    storeStateStrategy: "database",
    // Evita fallar si la cookie de state no se encuentra o no coincide exactamente.
    // IMPORTANTE: esto reduce ligeramente la seguridad, pero es aceptable para esta prueba técnica.
    skipStateCookieCheck: true,
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
      redirectURI: `${frontendUrl.replace(/\/$/, "")}/api/auth/callback/github`,
    },
  },
  callbacks: {
    redirect: {
      redirectTo: () => frontendUrl,
    },
  },
});
