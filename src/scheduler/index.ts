import cron, { ScheduledTask } from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { GuildConfig } from '@prisma/client';
import { randomUUID } from 'crypto';
import { fetchDeals } from '../marktguru/client';
import { buildDealResponse } from '../bot/embeds/dealEmbed';
import { storePagination } from '../bot/pagination';
import prisma from '../db';

const jobs = new Map<string, ScheduledTask>();

async function runJob(client: Client, config: GuildConfig): Promise<void> {
  try {
    const channel = await client.channels.fetch(config.channelId);
    if (!(channel instanceof TextChannel)) return;

    const keywords = config.keywords.split(',').map(k => k.trim());
    const retailers = config.retailers ? config.retailers.split(',').map(r => r.trim()) : undefined;
    const zipCode = parseInt(config.zipCode, 10);

    for (const keyword of keywords) {
      const offers = await fetchDeals({ query: keyword, zipCode, allowedRetailers: retailers, maxPrice: config.maxPrice });
      const cacheKey = randomUUID();
      storePagination(cacheKey, { offers, query: keyword, zipCode, retailers, maxPrice: config.maxPrice, page: 0 });
      const response = buildDealResponse(keyword, offers, 0, cacheKey, { zipCode, retailers, maxPrice: config.maxPrice });
      await channel.send(response);
    }
  } catch (err) {
    console.error(`[scheduler] Job failed for guild ${config.guildId}:`, err);
  }
}

export function rescheduleGuild(guildId: string, config: GuildConfig | null): void {
  const existing = jobs.get(guildId);
  if (existing) { existing.stop(); jobs.delete(guildId); }
  if (!config) return;

  const clientRef = (globalThis as typeof globalThis & { __offhunterClient?: Client }).__offhunterClient;
  if (!clientRef) return;

  if (!cron.validate(config.schedule)) {
    console.warn(`[scheduler] Invalid cron for guild ${guildId}: ${config.schedule}`);
    return;
  }

  const task = cron.schedule(config.schedule, () => runJob(clientRef, config));
  jobs.set(guildId, task);
}

export async function initScheduler(client: Client): Promise<number> {
  (globalThis as typeof globalThis & { __offhunterClient: Client }).__offhunterClient = client;
  const configs = await prisma.guildConfig.findMany();
  for (const config of configs) rescheduleGuild(config.guildId, config);
  return configs.length;
}
