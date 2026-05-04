import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

function createClient(): PrismaClient {
  const url = process.env['DATABASE_URL'] ?? '';

  if (url.startsWith('file:')) {
    const Database = require('better-sqlite3') as typeof import('better-sqlite3');
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3') as typeof import('@prisma/adapter-better-sqlite3');
    const sqlite = new (Database as any)(url.slice('file:'.length));
    const adapter = new PrismaBetterSqlite3(sqlite);
    return new PrismaClient({ adapter } as any);
  }

  if (url.startsWith('mysql:') || url.startsWith('mariadb:')) {
    const mariadb = require('mariadb') as typeof import('mariadb');
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb') as typeof import('@prisma/adapter-mariadb');
    const pool = mariadb.createPool(url) as any;
    const adapter = new PrismaMariaDb(pool);
    return new PrismaClient({ adapter } as any);
  }

  if (url.startsWith('postgres')) {
    const { Pool } = require('pg') as typeof import('pg');
    const { PrismaPg } = require('@prisma/adapter-pg') as typeof import('@prisma/adapter-pg');
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
  }

  throw new Error(`Unsupported DATABASE_URL scheme. Expected file:, mysql:, mariadb:, or postgres(ql)://`);
}

const prisma = createClient();
export default prisma;
