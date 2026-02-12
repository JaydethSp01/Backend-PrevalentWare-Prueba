import fs from "node:fs";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { getApiDocs } from "@/lib/swagger";

const rawBaseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:8000";
const baseUrl = rawBaseUrl.replace(/\/api\/auth\/?$/, "");

/**
 * GET /api/docs -> Swagger UI (HTML) o OpenAPI JSON si ?json=1
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const wantsJson =
    req.query.json === "1" || req.headers.accept?.includes("application/json");

  if (wantsJson) {
    // En producción servimos el fichero pre-generado public/openapi.json.
    // En desarrollo, si no existe, caemos al generador en tiempo real.
    const openapiPath = path.join(process.cwd(), "public", "openapi.json");
    if (fs.existsSync(openapiPath)) {
      const file = fs.readFileSync(openapiPath, "utf-8");
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(file);
    }
    const spec = getApiDocs();
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(spec);
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>PrevalentWare API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "${baseUrl}/api/docs?json=1",
      dom_id: "#swagger-ui",
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
    });
  </script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html");
  res.status(200).end(html);
}
