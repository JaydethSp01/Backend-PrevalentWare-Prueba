import { movementRepository } from "@/core/repositories/movement-repository";
import type { MovementDomain } from "@/core/domain";

export interface BalanceReport {
  income: number;
  expense: number;
  balance: number;
}

export interface ChartPoint {
  month: string;
  ingresos: number;
  egresos: number;
}

export class ReportService {
  async getBalance(movements?: MovementDomain[]): Promise<BalanceReport> {
    const list = movements ?? (await movementRepository.findAll());
    const income = list
      .filter((m) => m.type === "INCOME")
      .reduce((s, m) => s + m.amount, 0);
    const expense = list
      .filter((m) => m.type === "EXPENSE")
      .reduce((s, m) => s + m.amount, 0);
    return { income, expense, balance: income - expense };
  }

  async getChartData(movements?: MovementDomain[]): Promise<ChartPoint[]> {
    const list = movements ?? (await movementRepository.findAll());
    const byMonth: Record<string, { ingresos: number; egresos: number }> = {};
    for (const m of list) {
      const key = `${m.date.getFullYear()}-${String(m.date.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { ingresos: 0, egresos: 0 };
      if (m.type === "INCOME") byMonth[key].ingresos += m.amount;
      else byMonth[key].egresos += m.amount;
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month: month.slice(0, 7),
        ingresos: v.ingresos,
        egresos: v.egresos,
      }));
  }
}

export const reportService = new ReportService();
