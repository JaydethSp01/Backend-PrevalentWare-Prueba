import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/pages/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "PrevalentWare API",
        version: "1.0.0",
        description:
          "API REST para gestión de ingresos/egresos, usuarios y reportes.",
      },
      servers: [
        {
          url: (process.env.BETTER_AUTH_URL ?? "http://localhost:8000").replace(
            /\/api\/auth\/?$/,
            "",
          ),
        },
      ],
      components: {
        securitySchemes: {
          cookie: {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session_token",
          },
        },
      },
      security: [{ cookie: [] }],
      tags: [
        { name: "Movimientos", description: "CRUD de movimientos financieros" },
        { name: "Usuarios", description: "Gestión de usuarios (solo ADMIN)" },
        { name: "Reportes", description: "Saldo y gráficos (solo ADMIN)" },
      ],
    },
  });
  return spec;
};
