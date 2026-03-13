import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });

// BigInt → string при JSON-сериализации
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
