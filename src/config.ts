import { config } from 'dotenv';
config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const DISCORD_TOKEN = required('DISCORD_TOKEN');
export const DATABASE_URL = required('DATABASE_URL');
export const DEFAULT_ZIP = parseInt(process.env['DEFAULT_ZIP'] ?? '60487', 10);
