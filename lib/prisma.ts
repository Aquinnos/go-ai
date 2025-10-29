import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnectionPromise: Promise<void> | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

if (!globalForPrisma.prismaConnectionPromise) {
  globalForPrisma.prismaConnectionPromise = prisma
    .$connect()
    .then(() => {
      logger.info('Database connection established.');
    })
    .catch((error) => {
      logger.error('Database connection failed.', { error });
    });
}

void globalForPrisma.prismaConnectionPromise;

export default prisma;
