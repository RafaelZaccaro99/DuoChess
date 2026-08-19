/**
 * Cliente Prisma.
 *
 * Singleton em desenvolvimento: o hot reload do Next recria módulos e, sem isto,
 * cada recarga abre um pool novo até o Postgres recusar conexões.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
