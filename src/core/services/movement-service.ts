import { movementRepository } from "@/core/repositories/movement-repository";
import type { MovementDomain, MovementCreateDomain } from "@/core/domain";
import type { UserRole } from "@/core/domain";

/**
 * Protección IDOR: solo el dueño (userId) o un ADMIN pueden editar/eliminar un movimiento.
 */
export class MovementService {
  async list(): Promise<MovementDomain[]> {
    return movementRepository.findAll();
  }

  async listPage(
    page: number,
    pageSize: number
  ): Promise<{ items: MovementDomain[]; total: number }> {
    return movementRepository.findPage(page, pageSize);
  }

  async getById(id: string): Promise<MovementDomain | null> {
    return movementRepository.findById(id);
  }

  async create(
    data: Omit<MovementCreateDomain, "userId">,
    sessionUserId: string,
    sessionRole: UserRole
  ): Promise<MovementDomain> {
    return movementRepository.create({
      ...data,
      userId: sessionUserId,
    });
  }

  async update(
    id: string,
    data: Partial<Omit<MovementCreateDomain, "userId">>,
    sessionUserId: string,
    sessionRole: UserRole
  ): Promise<MovementDomain | null> {
    const movement = await movementRepository.findById(id);
    if (!movement) return null;
    if (sessionRole !== "ADMIN" && movement.userId !== sessionUserId) {
      return null;
    }
    return movementRepository.update(id, data);
  }

  async delete(
    id: string,
    sessionUserId: string,
    sessionRole: UserRole
  ): Promise<boolean> {
    const movement = await movementRepository.findById(id);
    if (!movement) return false;
    if (sessionRole !== "ADMIN" && movement.userId !== sessionUserId) {
      return false;
    }
    await movementRepository.delete(id);
    return true;
  }
}

export const movementService = new MovementService();
