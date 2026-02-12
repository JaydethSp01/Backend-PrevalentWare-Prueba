import { prisma } from "@/infrastructure/database/prisma";
import type { UserDomain, UserUpdateDomain } from "@/core/domain";

export class UserRepository {
  async findPage(
    page: number,
    pageSize: number
  ): Promise<{ items: UserDomain[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [rows, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);
    return {
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        image: r.image,
        role: r.role as "ADMIN" | "USER",
        phone: r.phone,
      })),
      total,
    };
  }

  async findAll(): Promise<UserDomain[]> {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      image: r.image,
      role: r.role as "ADMIN" | "USER",
      phone: r.phone,
    }));
  }

  async findById(id: string): Promise<UserDomain | null> {
    const r = await prisma.user.findUnique({
      where: { id },
    });
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      image: r.image,
      role: r.role as "ADMIN" | "USER",
      phone: r.phone,
    };
  }

  async update(id: string, data: UserUpdateDomain): Promise<UserDomain | null> {
    const r = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.role != null && { role: data.role as "ADMIN" | "USER" }),
        ...(data.phone != null && { phone: data.phone }),
      },
    });
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      image: r.image,
      role: r.role as "ADMIN" | "USER",
      phone: r.phone,
    };
  }

  async delete(id: string): Promise<boolean> {
    await prisma.user.delete({ where: { id } });
    return true;
  }
}

export const userRepository = new UserRepository();
