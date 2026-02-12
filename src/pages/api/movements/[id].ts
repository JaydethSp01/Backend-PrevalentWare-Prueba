import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { withAuth } from "@/lib/withAuth";
import { movementService } from "@/core/services/movement-service";

const updateBodySchema = z.object({
  concept: z.string().min(1).max(500).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  date: z.string().optional(),
});

/**
 * @openapi
 * /api/movements/{id}:
 *   get:
 *     summary: Obtiene un movimiento por ID
 *     tags: [Movimientos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Movimiento }
 *       401: { description: No autenticado }
 *       404: { description: No encontrado }
 *   patch:
 *     summary: Actualiza un movimiento (dueño o ADMIN)
 *     tags: [Movimientos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               concept: { type: string }
 *               amount: { type: number }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               date: { type: string }
 *     responses:
 *       200: { description: Movimiento actualizado }
 *       400: { description: Datos inválidos }
 *       401: { description: No autenticado }
 *       403: { description: No autorizado }
 *       404: { description: No encontrado }
 *   delete:
 *     summary: Elimina un movimiento (dueño o ADMIN)
 *     tags: [Movimientos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Eliminado }
 *       401: { description: No autenticado }
 *       403: { description: No autorizado }
 *       404: { description: No encontrado }
 */
function setCors(res: NextApiResponse) {
  const origin = process.env.FRONTEND_URL ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
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

  const id = req.query.id as string;
  if (!id) {
    res.status(400).json({ error: "ID requerido" });
    return;
  }

  if (req.method === "GET") {
    return withAuth(req, res, async () => {
      const movement = await movementService.getById(id);
      if (!movement) {
        res.status(404).json({ error: "Movimiento no encontrado" });
        return;
      }
      res.status(200).json(movement);
    });
  }

  if (req.method === "PATCH") {
    return withAuth(req, res, async (_req, res, user) => {
      const existing = await movementService.getById(id);
      if (!existing) {
        res.status(404).json({ error: "Movimiento no encontrado" });
        return;
      }
      const parsed = updateBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
        return;
      }
      const data = parsed.data as { concept?: string; amount?: number; type?: "INCOME" | "EXPENSE"; date?: string };
      const patch: { concept?: string; amount?: number; type?: "INCOME" | "EXPENSE"; date?: Date } = {};
      if (data.concept !== undefined) patch.concept = data.concept;
      if (data.amount !== undefined) patch.amount = data.amount;
      if (data.type !== undefined) patch.type = data.type;
      if (data.date !== undefined) patch.date = new Date(data.date);
      const updated = await movementService.update(
        id,
        patch,
        user.id,
        (user.role as "ADMIN" | "USER") ?? "ADMIN"
      );
      if (!updated) {
        res.status(403).json({ error: "No autorizado para editar este movimiento" });
        return;
      }
      res.status(200).json(updated);
    });
  }

  if (req.method === "DELETE") {
    return withAuth(req, res, async (_req, res, user) => {
      const existing = await movementService.getById(id);
      if (!existing) {
        res.status(404).json({ error: "Movimiento no encontrado" });
        return;
      }
      const deleted = await movementService.delete(
        id,
        user.id,
        (user.role as "ADMIN" | "USER") ?? "ADMIN"
      );
      if (!deleted) {
        res.status(403).json({ error: "No autorizado para eliminar este movimiento" });
        return;
      }
      res.status(204).end();
    });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  res.status(405).json({ error: "Method Not Allowed" });
}
