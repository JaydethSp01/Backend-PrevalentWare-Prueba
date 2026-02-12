import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { withAuthAdmin } from "@/lib/withAuth";
import { userRepository } from "@/core/repositories/user-repository";

const updateBodySchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  phone: z.string().optional(),
});

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID (solo ADMIN)
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Usuario }
 *       401: { description: No autenticado }
 *       403: { description: Solo administradores }
 *       404: { description: No encontrado }
 *   patch:
 *     summary: Actualiza usuario (solo ADMIN)
 *     tags: [Usuarios]
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
 *               name: { type: string }
 *               role: { type: string, enum: [USER, ADMIN] }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Usuario actualizado }
 *       400: { description: Datos inválidos }
 *       401: { description: No autenticado }
 *       403: { description: Solo administradores }
 *       404: { description: No encontrado }
 *   delete:
 *     summary: Elimina un usuario (solo ADMIN)
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Eliminado }
 *       401: { description: No autenticado }
 *       403: { description: Solo administradores }
 *       404: { description: No encontrado }
 */
function setCors(res: NextApiResponse) {
  const origin = process.env.FRONTEND_URL ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
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
    return withAuthAdmin(req, res, async () => {
      const user = await userRepository.findById(id);
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.status(200).json(user);
    });
  }

  if (req.method === "PATCH") {
    return withAuthAdmin(req, res, async (_req, res) => {
      const parsed = updateBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
        return;
      }
      const updated = await userRepository.update(id, parsed.data);
      if (!updated) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.status(200).json(updated);
    });
  }

  if (req.method === "DELETE") {
    return withAuthAdmin(req, res, async () => {
      try {
        await userRepository.delete(id);
        res.status(204).end();
      } catch (e) {
        res.status(404).json({ error: "Usuario no encontrado" });
      }
    });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  res.status(405).json({ error: "Method Not Allowed" });
}
