import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { fetchDeals } from '../../marktguru/client';
import { buildDealEmbed } from '../embeds/dealEmbed';
import prisma from '../../db';

export const data = new SlashCommandBuilder()
  .setName('deals')
  .setDescription('Suche nach Angeboten auf marktguru.de')
  .addStringOption(o =>
    o.setName('query').setDescription('Suchbegriff (z.B. "Red Bull")').setRequired(false))
  .addStringOption(o =>
    o.setName('zip').setDescription('Postleitzahl (Standard: Servereinstellung)').setRequired(false))
  .addStringOption(o =>
    o.setName('retailers').setDescription('Händler, kommagetrennt (z.B. "lidl,rewe")').setRequired(false))
  .addNumberOption(o =>
    o.setName('max_price').setDescription('Maximaler Preis in €').setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const guildId = interaction.guildId;
  const config = guildId ? await prisma.guildConfig.findUnique({ where: { guildId } }) : null;

  const query =
    interaction.options.getString('query') ??
    config?.keywords?.split(',')[0]?.trim() ??
    'energy drink';

  const zipStr = interaction.options.getString('zip') ?? config?.zipCode ?? '60487';
  const zip = parseInt(zipStr, 10);

  const retailersStr = interaction.options.getString('retailers') ?? config?.retailers ?? null;
  const retailers = retailersStr ? retailersStr.split(',').map(r => r.trim()) : undefined;

  const maxPriceOpt = interaction.options.getNumber('max_price');
  const maxPrice = maxPriceOpt !== null ? maxPriceOpt : (config?.maxPrice ?? null);

  try {
    const offers = await fetchDeals({ query, zipCode: zip, allowedRetailers: retailers, maxPrice });
    const embed = buildDealEmbed(query, offers);
    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('[deals] Error fetching offers:', err);
    await interaction.editReply('Fehler beim Abrufen der Angebote. Bitte später erneut versuchen.');
  }
}
