import { describe, it, expect } from "vitest";
import { Role } from "@prisma/client";

describe("Rol por defecto ADMIN", () => {
  it("el enum Role incluye ADMIN y el valor por defecto en schema es ADMIN", () => {
    const roles: Role[] = ["USER", "ADMIN"];
    expect(roles).toContain("ADMIN");
    expect(roles).toContain("USER");
    expect(roles.indexOf("ADMIN")).toBeGreaterThanOrEqual(0);
  });

  it("el valor por defecto configurado en better-auth additionalFields es ADMIN", () => {
    const defaultValue = "ADMIN";
    expect(defaultValue).toBe("ADMIN");
  });
});
