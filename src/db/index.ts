import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

function createClient(): PrismaClient {
  const url = process.env['DATABASE_URL'] ?? '';

  if (url.startsWith('file:')) {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3') as typeof import('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({ url });
    return new PrismaClient({ adapter } as any);
  }

  if (url.startsWith('mysql:') || url.startsWith('mariadb:')) {
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb') as typeof import('@prisma/adapter-mariadb');
    const adapter = new PrismaMariaDb(url);
    return new PrismaClient({ adapter } as any);
  }

  if (url.startsWith('postgres')) {
    const { PrismaPg } = require('@prisma/adapter-pg') as typeof import('@prisma/adapter-pg');
    const adapter = new PrismaPg(url);
    return new PrismaClient({ adapter } as any);
  }

  throw new Error(`Unsupported DATABASE_URL. Expected: file:, mysql:, mariadb:, or postgres(ql)://`);
}

const prisma = createClient();
export default prisma;
