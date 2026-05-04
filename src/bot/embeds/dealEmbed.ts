import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import { Offer } from '../../marktguru/client';
import { ITEMS_PER_PAGE } from '../pagination';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export interface DealResponse {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
}

export interface DealResponseOptions {
  zipCode?: number;
  retailers?: string[];
  maxPrice?: number | null;
}

export function buildDealResponse(
  query: string,
  offers: Offer[],
  page: number,
  cacheKey: string,
  opts: DealResponseOptions = {},
): DealResponse {
  const totalPages = Math.max(1, Math.ceil(offers.length / ITEMS_PER_PAGE));
  const safeP = Math.min(page, totalPages - 1);
  const slice = offers.slice(safeP * ITEMS_PER_PAGE, (safeP + 1) * ITEMS_PER_PAGE);
  const offset = safeP * ITEMS_PER_PAGE;

  const embed = new EmbedBuilder().setTimestamp();

  if (offers.length === 0) {
    return {
      embeds: [
        embed
          .setColor(0xfee75c)
          .setTitle(`🔍  ${query}`)
          .setDescription('No deals found.\nTry a different keyword or adjust your filters.')
          .setFooter({ text: 'marktguru.de' }),
      ],
      components: [],
    };
  }

  const zip = opts.zipCode ?? 60487;
  const retailerLabel = opts.retailers?.length ? opts.retailers.join(', ') : 'All retailers';
  const priceLabel = opts.maxPrice != null ? `  ·  💶 ≤ ${opts.maxPrice.toFixed(2)} €` : '';
  const meta = `> 📍 **${zip}**  ·  🏪 **${retailerLabel}**${priceLabel}`;

  const lines = slice.map((offer, i) => {
    const retailer = offer.advertisers[0]?.name ?? 'Unknown';
    const name = offer.product?.name ?? offer.description;
    const dates = offer.validityDates[0];
    const validity = dates ? `  ·  📅 ${formatDate(dates.from)} – ${formatDate(dates.to)}` : '';
    return `**${offset + i + 1}.** ${retailer} — ${name}\n　💰 **${offer.price.toFixed(2)} €**${validity}`;
  });

  embed
    .setColor(0x57f287)
    .setTitle(`🔍  ${query}  ·  ${offers.length} deal${offers.length !== 1 ? 's' : ''} found`)
    .setDescription(`${meta}\n\n${lines.join('\n\n')}`)
    .setFooter({ text: `Page ${safeP + 1} / ${totalPages}  ·  marktguru.de` });

  const prev = new ButtonBuilder()
    .setCustomId(`oh:prev:${cacheKey}`)
    .setLabel('◀  Prev')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(safeP === 0);

  const next = new ButtonBuilder()
    .setCustomId(`oh:next:${cacheKey}`)
    .setLabel('Next  ▶')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(safeP >= totalPages - 1);

  const refresh = new ButtonBuilder()
    .setCustomId(`oh:ref:${cacheKey}`)
    .setLabel('🔄  Refresh')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prev, next, refresh);

  return { embeds: [embed], components: [row] };
}

export function buildErrorEmbed(message: string): DealResponse {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle('⚠️  Something went wrong')
        .setDescription(message)
        .setFooter({ text: 'marktguru.de' })
        .setTimestamp(),
    ],
    components: [],
  };
}
