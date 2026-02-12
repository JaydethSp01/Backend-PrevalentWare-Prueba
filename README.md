# Backend - Gestión Financiera (PrevalentWare)

API REST para gestión de ingresos/egresos, usuarios y reportes. Next.js (Pages Router), Better Auth con GitHub, Prisma y PostgreSQL (Supabase).

## Stack

- **Runtime:** Node.js
- **Framework:** Next.js 14 (Pages Router) + TypeScript
- **Base de datos:** PostgreSQL (Supabase) con Prisma
- **Auth:** Better Auth + GitHub OAuth, sesiones en BD
- **Documentación API:** OpenAPI/Swagger en `/api/docs`
- **Tests:** Vitest

## Requisitos

- Node.js 18+
- Cuenta en Supabase (PostgreSQL)
- App OAuth de GitHub (Client ID y Secret)

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del backend con:

```env
# Base de datos (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# URLs
FRONTEND_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:8000"

# Better Auth
BETTER_AUTH_SECRET="tu-secreto-largo-y-aleatorio"

# GitHub OAuth
GITHUB_CLIENT_ID="tu-client-id"
GITHUB_CLIENT_SECRET="tu-client-secret"
```

## Base de datos

```bash
# Aplicar schema a la BD
npx prisma db push

# (Opcional) Seed de datos
npm run db:seed
```

## Scripts

| Comando           | Descripción                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo (puerto **8000**)      |
| `npm run build`   | Build de producción                           |
| `npm start`       | Servidor en modo producción (puerto **8000**) |
| `npm run lint`    | Linter ESLint                                 |
| `npm test`        | Pruebas unitarias (Vitest)                    |
| `npm run db:push` | Sincronizar schema Prisma con la BD           |

## Documentación de la API

Con el servidor en marcha:

- **Swagger UI:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **OpenAPI JSON:** [http://localhost:8000/api/docs?json=1](http://localhost:8000/api/docs?json=1)

Todos los endpoints están documentados (parámetros, respuestas, seguridad por cookie de sesión).

## Despliegue en Vercel

1. En Vercel, crea un nuevo proyecto importando este repositorio (`Backend-PrevalentWare-Prueba`).
2. En **Settings → Environment Variables**, configura todas las variables definidas en la sección anterior (`DATABASE_URL`, `DIRECT_URL`, `FRONTEND_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, etc.), usando los valores de tu entorno.
3. Deja la configuración por defecto de framework:
   - Framework: **Next.js**
   - Comando de build: `npm run build`
   - Comando de start: `npm start`
4. Haz clic en **Deploy**.  
   Al finalizar, Vercel mostrará la URL pública del backend (por ejemplo `https://backend-prevalentware-prueba.vercel.app`).

## Estructura relevante

```
src/
├── pages/api/          # Rutas API
│   ├── auth/            # Better Auth (GitHub)
│   ├── movements/      # CRUD movimientos
│   ├── users/          # CRUD usuarios (solo ADMIN)
│   ├── reports/        # Saldo y datos para gráficos (solo ADMIN)
│   └── docs.ts         # OpenAPI/Swagger
├── core/               # Dominio, repositorios, servicios
├── lib/                # auth, withAuth (RBAC), swagger
└── __tests__/          # Pruebas unitarias
```

## Seguridad

- **RBAC:** Rutas de usuarios y reportes protegidas con `withAuthAdmin`; movimientos con `withAuth` (crear/editar/eliminar solo ADMIN).
- **Sesiones:** Better Auth con cookies; el backend rechaza peticiones no autenticadas (401).
- **CORS:** Configurado para `FRONTEND_URL` con credenciales.
