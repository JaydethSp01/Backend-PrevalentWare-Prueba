import { describe, it, expect } from "vitest";
import { reportService } from "@/core/services/report-service";
import type { MovementDomain } from "@/core/domain";

describe("Lógica de saldo (Ingresos vs Egresos)", () => {
  it("calcula balance como ingresos menos egresos", async () => {
    const movements: MovementDomain[] = [
      { id: "1", concept: "A", amount: 100, type: "INCOME", date: new Date(), userId: "u1" },
      { id: "2", concept: "B", amount: 30, type: "EXPENSE", date: new Date(), userId: "u1" },
      { id: "3", concept: "C", amount: 50, type: "EXPENSE", date: new Date(), userId: "u1" },
    ];
    const result = await reportService.getBalance(movements);
    expect(result.income).toBe(100);
    expect(result.expense).toBe(80);
    expect(result.balance).toBe(20);
  });

  it("balance cero cuando no hay movimientos", async () => {
    const result = await reportService.getBalance([]);
    expect(result.income).toBe(0);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(0);
  });

  it("balance negativo cuando egresos superan ingresos", async () => {
    const movements: MovementDomain[] = [
      { id: "1", concept: "E", amount: 100, type: "EXPENSE", date: new Date(), userId: "u1" },
    ];
    const result = await reportService.getBalance(movements);
    expect(result.balance).toBe(-100);
  });
});
