import cron, { ScheduledTask } from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { GuildConfig } from '@prisma/client';
import { fetchDeals } from '../marktguru/client';
import { buildDealEmbed } from '../bot/embeds/dealEmbed';
import prisma from '../db';

const jobs = new Map<string, ScheduledTask>();

async function runJob(client: Client, config: GuildConfig): Promise<void> {
  try {
    const channel = await client.channels.fetch(config.channelId);
    if (!(channel instanceof TextChannel)) return;

    const keywords = config.keywords.split(',').map(k => k.trim());
    for (const keyword of keywords) {
      const retailers = config.retailers ? config.retailers.split(',').map(r => r.trim()) : undefined;
      const offers = await fetchDeals({
        query: keyword,
        zipCode: parseInt(config.zipCode, 10),
        allowedRetailers: retailers,
        maxPrice: config.maxPrice,
      });
      const embed = buildDealEmbed(keyword, offers);
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error(`[scheduler] Job failed for guild ${config.guildId}:`, err);
  }
}

export function rescheduleGuild(guildId: string, config: GuildConfig | null): void {
  const existing = jobs.get(guildId);
  if (existing) {
    existing.stop();
    jobs.delete(guildId);
  }
  if (!config) return;

  // Skip registration if no client is available yet (called before bot is ready)
  const clientRef = (globalThis as typeof globalThis & { __offhunterClient?: Client }).__offhunterClient;
  if (!clientRef) return;

  if (!cron.validate(config.schedule)) {
    console.warn(`[scheduler] Invalid cron expression for guild ${guildId}: ${config.schedule}`);
    return;
  }

  const task = cron.schedule(config.schedule, () => runJob(clientRef, config));
  jobs.set(guildId, task);
  console.log(`[scheduler] Registered job for guild ${guildId} with schedule "${config.schedule}"`);
}

export async function initScheduler(client: Client): Promise<void> {
  (globalThis as typeof globalThis & { __offhunterClient: Client }).__offhunterClient = client;

  const configs = await prisma.guildConfig.findMany();
  for (const config of configs) {
    rescheduleGuild(config.guildId, config);
  }
  console.log(`[scheduler] Loaded ${configs.length} guild job(s).`);
}
