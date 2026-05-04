import { ButtonInteraction } from 'discord.js';
import { getPagination, storePagination, updatePaginationPage, ITEMS_PER_PAGE } from '../pagination';
import { buildDealResponse, buildErrorEmbed } from '../embeds/dealEmbed';
import { fetchDeals } from '../../marktguru/client';

export async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const parts = interaction.customId.split(':');
  if (parts[0] !== 'oh' || parts.length < 3) return;

  const action   = parts[1]!;
  const cacheKey = parts[2]!;

  await interaction.deferUpdate();

  const entry = getPagination(cacheKey);
  if (!entry) {
    await interaction.editReply(buildErrorEmbed('Interaction expired', 'Use `/deals` to search again.'));
    return;
  }

  const totalPages = Math.ceil(entry.offers.length / ITEMS_PER_PAGE);
  const opts       = { zipCode: entry.zipCode, retailers: entry.retailers, maxPrice: entry.maxPrice };

  if (action === 'prev') {
    const newPage = Math.max(0, entry.page - 1);
    updatePaginationPage(cacheKey, newPage);
    await interaction.editReply(buildDealResponse(entry.query, entry.offers, newPage, cacheKey, opts));
  } else if (action === 'next') {
    const newPage = Math.min(totalPages - 1, entry.page + 1);
    updatePaginationPage(cacheKey, newPage);
    await interaction.editReply(buildDealResponse(entry.query, entry.offers, newPage, cacheKey, opts));
  } else if (action === 'ref') {
    try {
      const fresh = await fetchDeals({
        query: entry.query,
        zipCode: entry.zipCode,
        allowedRetailers: entry.retailers,
        maxPrice: entry.maxPrice,
      });
      storePagination(cacheKey, { ...entry, offers: fresh, page: 0 });
      await interaction.editReply(buildDealResponse(entry.query, fresh, 0, cacheKey, opts));
    } catch {
      await interaction.editReply(buildErrorEmbed('Refresh failed', 'Could not reach marktguru. Try again.'));
    }
  }
}
