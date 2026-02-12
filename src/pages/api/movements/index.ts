import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { withAuth } from "@/lib/withAuth";
import { movementService } from "@/core/services/movement-service";

/**
 * @openapi
 * /api/movements:
 *   get:
 *     summary: Lista movimientos (todos los autenticados)
 *     description: Sin query devuelve todos; con page y pageSize devuelve paginado.
 *     tags: [Movimientos]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, minimum: 1 }
 *         description: Número de página (opcional)
 *       - name: pageSize
 *         in: query
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *         description: Tamaño de página (opcional)
 *     responses:
 *       200:
 *         description: Lista de movimientos o objeto paginado { items, total, page, pageSize, totalPages }
 *       401: { description: No autenticado }
 *   post:
 *     summary: Crea un nuevo ingreso o egreso (solo ADMIN)
 *     tags: [Movimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [concept, amount, type, date]
 *             properties:
 *               concept: { type: string, minLength: 1, maxLength: 500 }
 *               amount: { type: number, minimum: 0, exclusiveMinimum: true }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               date: { type: string, format: date-time }
 *           example:
 *             concept: "Venta producto"
 *             amount: 150.5
 *             type: "INCOME"
 *             date: "2025-02-11T12:00:00.000Z"
 *     responses:
 *       201: { description: Movimiento creado }
 *       400: { description: Datos inválidos }
 *       401: { description: No autenticado }
 *       403: { description: Solo administradores pueden crear movimientos }
 */
const createBodySchema = z.object({
  concept: z.string().min(1).max(500),
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

function setCors(res: NextApiResponse) {
  const origin = process.env.FRONTEND_URL ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
    return withAuth(req, res, async () => {
      const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
      const pageSizeParam = Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize;

      const page = pageParam ? Math.max(1, Number.parseInt(String(pageParam), 10) || 1) : null;
      const pageSize = pageSizeParam
        ? Math.min(100, Math.max(1, Number.parseInt(String(pageSizeParam), 10) || 10))
        : 10;

      // Sin paginación explítica: mantenemos compatibilidad y devolvemos lista completa
      if (!page) {
        const list = await movementService.list();
        res.status(200).json(list);
        return;
      }

      const { items, total } = await movementService.listPage(page, pageSize);
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

  if (req.method === "POST") {
    return withAuth(req, res, async (_req, res, user) => {
      const role = ((user.role as string | undefined) ?? "ADMIN") as "ADMIN" | "USER";
      if (role !== "ADMIN") {
        res.status(403).json({ error: "Solo administradores pueden crear movimientos" });
        return;
      }

      const parsed = createBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
        return;
      }
      const { concept, amount, type, date } = parsed.data;
      const dateObj = typeof date === "string" ? new Date(date) : date;
      const created = await movementService.create(
        { concept, amount, type, date: dateObj },
        user.id,
        role
      );
      res.status(201).json(created);
    });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Method Not Allowed" });
}
