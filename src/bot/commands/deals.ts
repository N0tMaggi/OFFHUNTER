import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { fetchDeals } from '../../marktguru/client.js';
import { buildDealResponse, buildErrorEmbed } from '../embeds/dealEmbed.js';
import { storePagination } from '../pagination.js';
import { locale } from '../../i18n/index.js';
import prisma from '../../db/index.js';

const { deals: cmd } = locale.commands;

export const data = new SlashCommandBuilder()
  .setName(cmd.name)
  .setDescription(cmd.description)
  .addStringOption(o =>
    o.setName('query').setDescription(cmd.options.query).setRequired(false))
  .addStringOption(o =>
    o.setName('zip').setDescription(cmd.options.zip).setRequired(false))
  .addStringOption(o =>
    o.setName('retailers').setDescription(cmd.options.retailers).setRequired(false))
  .addNumberOption(o =>
    o.setName('max_price').setDescription(cmd.options.max_price).setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const config = interaction.guildId
    ? await prisma.guildConfig.findUnique({ where: { guildId: interaction.guildId } })
    : null;

  const query = interaction.options.getString('query')
    ?? config?.keywords?.split(',')[0]?.trim()
    ?? 'energy drink';

  const zipCode = parseInt(
    interaction.options.getString('zip') ?? config?.zipCode ?? '60487',
    10,
  );

  const retailersRaw = interaction.options.getString('retailers') ?? config?.retailers ?? null;
  const retailers    = retailersRaw ? retailersRaw.split(',').map(r => r.trim()) : undefined;

  const maxPriceOpt = interaction.options.getNumber('max_price');
  const maxPrice    = maxPriceOpt !== null ? maxPriceOpt : (config?.maxPrice ?? null);

  try {
    const offers       = await fetchDeals({ query, zipCode, allowedRetailers: retailers, maxPrice });
    const showDealLink = config?.showDealLink ?? false;
    const cacheKey     = interaction.id;
    storePagination(cacheKey, { offers, query, zipCode, retailers, maxPrice, showDealLink, page: 0 });
    await interaction.editReply(buildDealResponse(query, offers, 0, cacheKey, { zipCode, retailers, maxPrice, showDealLink }));
  } catch (err) {
    console.error('[deals]', err);
    const e = locale.embeds.errors.fetchFailed;
    await interaction.editReply(buildErrorEmbed(e.title, e.detail));
  }
}
