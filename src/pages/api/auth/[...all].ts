import type { NextApiRequest, NextApiResponse } from "next";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth";

export const config = { api: { bodyParser: false } };

const authHandler = toNodeHandler(auth.handler);

const ALLOW_ORIGIN = process.env.FRONTEND_URL ?? "http://localhost:3000";

function setCorsHeaders(res: NextApiResponse): void {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept",
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const originalSetHeader = res.setHeader.bind(res);
  (res as NextApiResponse & { setHeader: typeof res.setHeader }).setHeader =
    function (name: string | number, value: string | number | string[]) {
      if (
        String(name).toLowerCase() === "access-control-allow-origin" &&
        value === "*"
      ) {
        originalSetHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
        return res;
      }
      originalSetHeader(name as any, value as any);
      return res;
    };

  return authHandler(req, res);
}
