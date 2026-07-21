import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaPg } from '@prisma/adapter-pg';

function createClient(): PrismaClient {
  const url = process.env['DATABASE_URL'] ?? '';

  if (url.startsWith('file:')) {
    const adapter = new PrismaBetterSqlite3({ url });
    return new PrismaClient({ adapter });
  }

  if (url.startsWith('mysql:') || url.startsWith('mariadb:')) {
    const adapter = new PrismaMariaDb(url);
    return new PrismaClient({ adapter });
  }

  if (url.startsWith('postgres')) {
    const adapter = new PrismaPg(url);
    return new PrismaClient({ adapter });
  }

  throw new Error(`Unsupported DATABASE_URL. Expected: file:, mysql:, mariadb:, or postgres(ql)://`);
}

const prisma = createClient();
export default prisma;
