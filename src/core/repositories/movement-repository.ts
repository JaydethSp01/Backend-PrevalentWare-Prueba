import { prisma } from "@/infrastructure/database/prisma";
import type { MovementDomain, MovementCreateDomain } from "@/core/domain";

function toDomain(r: { id: string; concept: string; amount: number; type: string; date: Date; userId: string; user?: { name: string | null } | null }): MovementDomain {
  return {
    id: r.id,
    concept: r.concept,
    amount: r.amount,
    type: r.type as MovementDomain["type"],
    date: r.date,
    userId: r.userId,
    userName: r.user?.name ?? undefined,
  };
}

export class MovementRepository {
  async findPage(
    page: number,
    pageSize: number
  ): Promise<{ items: MovementDomain[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [rows, total] = await prisma.$transaction([
      prisma.movement.findMany({
        skip,
        take: pageSize,
        include: { user: { select: { name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.movement.count(),
    ]);
    return {
      items: rows.map(toDomain),
      total,
    };
  }

  async findAll(): Promise<MovementDomain[]> {
    const rows = await prisma.movement.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { date: "desc" },
    });
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<MovementDomain | null> {
    const r = await prisma.movement.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });
    if (!r) return null;
    return toDomain(r);
  }

  async create(data: MovementCreateDomain): Promise<MovementDomain> {
    const r = await prisma.movement.create({
      data: {
        concept: data.concept,
        amount: data.amount,
        type: data.type as MovementDomain["type"],
        date: data.date,
        userId: data.userId,
      },
      include: { user: { select: { name: true } } },
    });
    return toDomain(r);
  }

  async update(
    id: string,
    data: Partial<Omit<MovementCreateDomain, "userId">>
  ): Promise<MovementDomain | null> {
    const r = await prisma.movement.update({
      where: { id },
      data: {
        ...(data.concept != null && { concept: data.concept }),
        ...(data.amount != null && { amount: data.amount }),
        ...(data.type != null && { type: data.type as MovementDomain["type"] }),
        ...(data.date != null && { date: data.date }),
      },
      include: { user: { select: { name: true } } },
    });
    return toDomain(r);
  }

  async delete(id: string): Promise<boolean> {
    await prisma.movement.delete({ where: { id } });
    return true;
  }
}

export const movementRepository = new MovementRepository();
