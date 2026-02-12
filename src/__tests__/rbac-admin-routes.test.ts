import { describe, it, expect } from "vitest";

/**
 * Lógica RBAC: rutas ADMIN solo permiten rol ADMIN.
 * Verificación de denegación para rol USER.
 */
function requireAdminRole(role: string): { allowed: boolean; status?: number; error?: string } {
  if (role !== "ADMIN") {
    return { allowed: false, status: 403, error: "Acceso denegado. Solo administradores." };
  }
  return { allowed: true };
}

describe("Denegación de acceso a rutas ADMIN para USER", () => {
  it("debe denegar (403) cuando el rol es USER", () => {
    const result = requireAdminRole("USER");
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toContain("administradores");
  });

  it("debe denegar cuando el rol es undefined o vacío", () => {
    expect(requireAdminRole("")).toMatchObject({ allowed: false, status: 403 });
    expect(requireAdminRole(undefined as unknown as string)).toMatchObject({
      allowed: false,
      status: 403,
    });
  });

  it("debe permitir cuando el rol es ADMIN", () => {
    const result = requireAdminRole("ADMIN");
    expect(result.allowed).toBe(true);
  });
});
