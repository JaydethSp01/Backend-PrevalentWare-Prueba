import { PrismaClient, Role as PrismaRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear roles normalizados si no existen
  const admin = await prisma.roleEntity.upsert({
    where: { code: "ADMIN" },
    update: {},
    create: {
      code: "ADMIN",
      label: "Administrador",
    },
  });

  const user = await prisma.roleEntity.upsert({
    where: { code: "USER" },
    update: {},
    create: {
      code: "USER",
      label: "Usuario",
    },
  });

  // Asignar roleEntityId a usuarios existentes según el enum Role
  await prisma.user.updateMany({
    where: { role: "ADMIN" as PrismaRole, roleEntityId: null },
    data: { roleEntityId: admin.id },
  });

  await prisma.user.updateMany({
    where: { role: "USER" as PrismaRole, roleEntityId: null },
    data: { roleEntityId: user.id },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

