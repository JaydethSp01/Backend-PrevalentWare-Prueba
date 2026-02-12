import fs from "node:fs";
import path from "node:path";
import { getApiDocs } from "@/lib/swagger";

/**
 * Script para pre-generar el fichero OpenAPI en build.
 * Genera public/openapi.json a partir de los comentarios @openapi.
 */
function main() {
  const spec = getApiDocs();
  const outDir = path.join(process.cwd(), "public");
  const outFile = path.join(outDir, "openapi.json");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outFile, JSON.stringify(spec, null, 2), "utf-8");
  // eslint-disable-next-line no-console
  console.log(`OpenAPI spec generado en ${outFile}`);
}

main();

