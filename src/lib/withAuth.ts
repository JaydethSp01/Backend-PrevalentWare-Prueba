import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "./auth";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

function toHeaders(incoming: NextApiRequest["headers"]): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(incoming)) {
    if (v !== undefined)
      h.set(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  return h;
}

export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ user: SessionUser } | null> {
  const session = await auth.api.getSession({
    headers: toHeaders(req.headers),
  });
  if (!session?.user) return null;
  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: (session.user as SessionUser).role ?? "ADMIN",
    },
  };
}

/**
 * RBAC: Protege rutas que solo ADMIN puede acceder.
 * Devuelve 401 si no hay sesión, 403 si no es ADMIN.
 */
export async function withAuthAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse, user: SessionUser) => void | Promise<void>
) {
  const session = await getSession(req, res);
  if (!session) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }
  const role = (session.user.role ?? "ADMIN") as string;
  if (role !== "ADMIN") {
    res.status(403).json({ error: "Acceso denegado. Solo administradores." });
    return;
  }
  await handler(req, res, session.user as SessionUser);
}

/**
 * Requiere sesión (cualquier rol). Devuelve 401 si no hay sesión.
 */
export async function withAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse, user: SessionUser) => void | Promise<void>
) {
  const session = await getSession(req, res);
  if (!session) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }
  await handler(req, res, session.user as SessionUser);
}
