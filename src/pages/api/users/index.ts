import type { NextApiRequest, NextApiResponse } from "next";
import { withAuthAdmin } from "@/lib/withAuth";
import { userRepository } from "@/core/repositories/user-repository";

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lista usuarios (solo ADMIN)
 *     tags: [Usuarios]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, minimum: 1 }
 *       - name: pageSize
 *         in: query
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Lista de usuarios o { items, total, page, pageSize, totalPages }
 *       401: { description: No autenticado }
 *       403: { description: Acceso denegado. Solo administradores }
 */
function setCors(res: NextApiResponse) {
  const origin = process.env.FRONTEND_URL ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method === "GET") {
    return withAuthAdmin(req, res, async () => {
      const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
      const pageSizeParam = Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize;

      const page = pageParam ? Math.max(1, Number.parseInt(String(pageParam), 10) || 1) : null;
      const pageSize = pageSizeParam
        ? Math.min(100, Math.max(1, Number.parseInt(String(pageSizeParam), 10) || 10))
        : 10;

      // Sin paginación explícita: compatibilidad hacia atrás
      if (!page) {
        const list = await userRepository.findAll();
        res.status(200).json(list);
        return;
      }

      const { items, total } = await userRepository.findPage(page, pageSize);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      res.status(200).json({
        items,
        total,
        page,
        pageSize,
        totalPages,
      });
    });
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).json({ error: "Method Not Allowed" });
}
