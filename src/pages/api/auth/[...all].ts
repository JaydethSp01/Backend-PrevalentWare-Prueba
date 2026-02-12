import type { NextApiRequest, NextApiResponse } from "next";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth";

export const config = { api: { bodyParser: false } };

const authHandler = toNodeHandler(auth.handler);

function setCorsHeaders(res: NextApiResponse, origin: string | null): void {
  const allowOrigin = process.env.FRONTEND_URL ?? "http://localhost:3000";
  if (origin === allowOrigin || !origin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const origin = req.headers.origin ?? null;
  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return authHandler(req, res);
}
