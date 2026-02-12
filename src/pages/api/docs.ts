import type { NextApiRequest, NextApiResponse } from "next";
import { getApiDocs } from "@/lib/swagger";

const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:8000";

/**
 * GET /api/docs -> Swagger UI (HTML) o OpenAPI JSON si ?json=1
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const wantsJson = req.query.json === "1" || req.headers.accept?.includes("application/json");

  if (wantsJson) {
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
