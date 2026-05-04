import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { fetchDeals } from '../../marktguru/client';
import { buildDealResponse, buildErrorEmbed } from '../embeds/dealEmbed';
import { storePagination } from '../pagination';
import prisma from '../../db';

export const data = new SlashCommandBuilder()
  .setName('deals')
  .setDescription('Search for deals on marktguru.de')
  .addStringOption(o =>
    o.setName('query').setDescription('Search term (e.g. "Red Bull")').setRequired(false))
  .addStringOption(o =>
    o.setName('zip').setDescription('German postal code (default: server setting)').setRequired(false))
  .addStringOption(o =>
    o.setName('retailers').setDescription('Filter by retailers, comma-separated (e.g. "lidl,rewe")').setRequired(false))
  .addNumberOption(o =>
    o.setName('max_price').setDescription('Maximum price in €').setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const config = interaction.guildId
    ? await prisma.guildConfig.findUnique({ where: { guildId: interaction.guildId } })
    : null;

  const query =
    interaction.options.getString('query') ??
    config?.keywords?.split(',')[0]?.trim() ??
    'energy drink';

  const zipCode = parseInt(
    interaction.options.getString('zip') ?? config?.zipCode ?? '60487',
    10,
  );

  const retailersRaw = interaction.options.getString('retailers') ?? config?.retailers ?? null;
  const retailers = retailersRaw ? retailersRaw.split(',').map(r => r.trim()) : undefined;

  const maxPriceOpt = interaction.options.getNumber('max_price');
  const maxPrice = maxPriceOpt !== null ? maxPriceOpt : (config?.maxPrice ?? null);

  try {
    const offers = await fetchDeals({ query, zipCode, allowedRetailers: retailers, maxPrice });
    const cacheKey = interaction.id;
    storePagination(cacheKey, { offers, query, zipCode, retailers, maxPrice, page: 0 });
    await interaction.editReply(buildDealResponse(query, offers, 0, cacheKey, { zipCode, retailers, maxPrice }));
  } catch (err) {
    console.error('[deals] Error:', err);
    await interaction.editReply(buildErrorEmbed('Failed to fetch deals. Please try again later.'));
  }
}
