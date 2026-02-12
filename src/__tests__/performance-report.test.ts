import { describe, it, expect } from "vitest";
import { reportService } from "@/core/services/report-service";
import type { MovementDomain } from "@/core/domain";

describe("Rendimiento: cálculo de balance", () => {
  it("calcula balance para 10k movimientos en tiempo razonable", async () => {
    const movements: MovementDomain[] = [];
    for (let i = 0; i < 10_000; i++) {
      movements.push({
        id: String(i),
        concept: `Test ${i}`,
        amount: i % 2 === 0 ? 100 : 50,
        type: i % 2 === 0 ? "INCOME" : "EXPENSE",
        date: new Date(2025, i % 12, 1),
        userId: "u1",
      });
    }

    const start = Date.now();
    const result = await reportService.getBalance(movements);
    const elapsedMs = Date.now() - start;

    expect(result.balance).toBeGreaterThan(0);
    // 10k operaciones deben calcularse de forma casi instantánea en Node
    expect(elapsedMs).toBeLessThan(50);
  });
});

