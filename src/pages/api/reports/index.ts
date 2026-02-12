import type { NextApiRequest, NextApiResponse } from "next";
import { withAuthAdmin } from "@/lib/withAuth";
import { reportService } from "@/core/services/report-service";

/**
 * @openapi
 * /api/reports:
 *   get:
 *     summary: Saldo actual y datos para gráfico (solo ADMIN)
 *     description: Devuelve balance y chartData para reportes y exportación CSV.
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Objeto con balance y chartData para gráficos
 *       401: { description: No autenticado }
 *       403: { description: Solo administradores }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return withAuthAdmin(req, res, async () => {
      const [balance, chartData] = await Promise.all([
        reportService.getBalance(),
        reportService.getChartData(),
      ]);
      res.status(200).json({ balance, chartData });
    });
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).json({ error: "Method Not Allowed" });
}
