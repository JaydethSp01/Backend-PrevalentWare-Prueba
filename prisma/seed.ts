import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MOVIMIENTOS_REALISTAS: { concept: string; amount: number; type: "INCOME" | "EXPENSE"; date: Date }[] = [
  { concept: "Nómina marzo", amount: 2450, type: "INCOME", date: new Date("2025-03-01") },
  { concept: "Nómina abril", amount: 2450, type: "INCOME", date: new Date("2025-04-01") },
  { concept: "Nómina mayo", amount: 2520, type: "INCOME", date: new Date("2025-05-01") },
  { concept: "Freelance proyecto web", amount: 1200, type: "INCOME", date: new Date("2025-03-15") },
  { concept: "Alquiler vivienda", amount: 850, type: "EXPENSE", date: new Date("2025-03-05") },
  { concept: "Alquiler vivienda", amount: 850, type: "EXPENSE", date: new Date("2025-04-05") },
  { concept: "Alquiler vivienda", amount: 850, type: "EXPENSE", date: new Date("2025-05-05") },
  { concept: "Supermercado", amount: 187.5, type: "EXPENSE", date: new Date("2025-03-08") },
  { concept: "Supermercado", amount: 203.2, type: "EXPENSE", date: new Date("2025-04-12") },
  { concept: "Supermercado", amount: 165.8, type: "EXPENSE", date: new Date("2025-05-10") },
  { concept: "Luz", amount: 72, type: "EXPENSE", date: new Date("2025-03-15") },
  { concept: "Luz", amount: 68, type: "EXPENSE", date: new Date("2025-04-15") },
  { concept: "Internet + móvil", amount: 55, type: "EXPENSE", date: new Date("2025-03-20") },
  { concept: "Internet + móvil", amount: 55, type: "EXPENSE", date: new Date("2025-04-20") },
  { concept: "Gasolina", amount: 120, type: "EXPENSE", date: new Date("2025-03-22") },
  { concept: "Gasolina", amount: 95, type: "EXPENSE", date: new Date("2025-05-18") },
  { concept: "Restaurante", amount: 45.9, type: "EXPENSE", date: new Date("2025-03-10") },
  { concept: "Cine", amount: 24, type: "EXPENSE", date: new Date("2025-04-08") },
  { concept: "Suscripción streaming", amount: 14.99, type: "EXPENSE", date: new Date("2025-05-01") },
  { concept: "Farmacia", amount: 32.5, type: "EXPENSE", date: new Date("2025-04-25") },
  { concept: "Bono transporte", amount: 40, type: "EXPENSE", date: new Date("2025-05-02") },
  { concept: "Curso online", amount: 89, type: "EXPENSE", date: new Date("2025-03-18") },
  { concept: "Consultoría extra", amount: 500, type: "INCOME", date: new Date("2025-04-20") },
  { concept: "Reembolso gastos", amount: 120, type: "INCOME", date: new Date("2025-05-12") },
  { concept: "Seguro coche", amount: 95, type: "EXPENSE", date: new Date("2025-03-25") },
  { concept: "Regalo cumpleaños", amount: 50, type: "EXPENSE", date: new Date("2025-04-14") },
];

async function main() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  let userId1: string;
  let userId2: string | null = null;

  if (users.length >= 1) {
    userId1 = users[0].id;
    console.log("Usuario 1:", users[0].email);
    if (users.length >= 2) {
      userId2 = users[1].id;
      console.log("Usuario 2:", users[1].email);
    }
  } else {
    const u1 = await prisma.user.create({
      data: {
        name: "Admin Demo",
        email: "admin@prevalentware.demo",
        emailVerified: true,
        role: "ADMIN",
        phone: "+34 600 000 000",
      },
    });
    const u2 = await prisma.user.create({
      data: {
        name: "Ana García",
        email: "ana.garcia@prevalentware.demo",
        emailVerified: true,
        role: "USER",
        phone: "+34 611 222 333",
      },
    });
    userId1 = u1.id;
    userId2 = u2.id;
    console.log("Usuarios demo creados.");
  }

  await prisma.movement.deleteMany({});
  console.log("Movimientos anteriores eliminados.");

  const userIds = userId2 ? [userId1, userId2] : [userId1];
  const data = MOVIMIENTOS_REALISTAS.map((m, i) => ({
    concept: m.concept,
    amount: m.amount,
    type: m.type,
    date: m.date,
    userId: userIds[i % userIds.length],
  }));
  await prisma.movement.createMany({ data });

  const countAfter = await prisma.movement.count();
  console.log("Movimientos en BD:", countAfter);
  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
