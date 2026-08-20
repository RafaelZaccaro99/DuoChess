/**
 * Promove uma conta existente a administrador (A7).
 *
 * Sem autocadastro e sem SQL manual: `npm run admin:promote -- email@exemplo.com`.
 * Mesmo padrão do prisma/seed.ts — PrismaClient próprio, carrega .env se preciso.
 */

import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL && existsSync(".env")) process.loadEnvFile(".env");

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Uso: npm run admin:promote -- email@exemplo.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Nenhuma conta com o e-mail ${email}. Crie a conta pelo app antes de promover.`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`${email} agora é administrador.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
