import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import { Offer } from '../../marktguru/client';
import { ITEMS_PER_PAGE } from '../pagination';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function fmtPrice(price: number): string {
  return price.toFixed(2) + ' €';
}

function savingsPct(price: number, old: number): string {
  return `-${Math.round((1 - price / old) * 100)}%`;
}

function offerBlock(offer: Offer, n: number): string {
  const store   = offer.advertisers[0]?.name ?? 'Unknown';
  const product = offer.product?.name ?? offer.description;
  const dates   = offer.validityDates[0];

  // Price line
  let price = `**${fmtPrice(offer.price)}**`;
  if (offer.oldPrice != null) {
    price = `~~${fmtPrice(offer.oldPrice)}~~  ${price}  (${savingsPct(offer.price, offer.oldPrice)})`;
  }
  if (offer.referencePrice > 0 && offer.unit?.shortName) {
    price += `   ${fmtPrice(offer.referencePrice)}/${offer.unit.shortName}`;
  }

  // Secondary line
  const secondary: string[] = [];
  if (dates) secondary.push(`${fmtDate(dates.from)} – ${fmtDate(dates.to)}`);
  if (offer.requiresLoyalityMembership) secondary.push('loyalty card required');

  const line2 = secondary.join('  ·  ');

  return [
    `**${n}.** ${store} — ${product}`,
    `${price}${line2 ? '\n    ' + line2 : ''}`,
  ].join('\n');
}

export interface DealResponse {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
}

export interface DealResponseOptions {
  zipCode?: number;
  retailers?: string[];
  maxPrice?: number | null;
  showDealLink?: boolean;
}

export function buildDealResponse(
  query: string,
  offers: Offer[],
  page: number,
  cacheKey: string,
  opts: DealResponseOptions = {},
): DealResponse {
  const totalPages = Math.max(1, Math.ceil(offers.length / ITEMS_PER_PAGE));
  const p     = Math.min(page, totalPages - 1);
  const slice = offers.slice(p * ITEMS_PER_PAGE, (p + 1) * ITEMS_PER_PAGE);
  const off   = p * ITEMS_PER_PAGE;

  if (offers.length === 0) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle(`${query}`)
          .setDescription('No deals found. Try a different keyword or adjust your filters.')
          .setFooter({ text: 'marktguru.de' })
          .setTimestamp(),
      ],
      components: [],
    };
  }

  // Metadata header
  const zip       = opts.zipCode ?? 60487;
  const retailers = opts.retailers?.length ? opts.retailers.join(', ') : 'all retailers';
  const maxPrice  = opts.maxPrice != null ? `  ·  max ${fmtPrice(opts.maxPrice)}` : '';
  const meta      = `${zip}  ·  ${retailers}${maxPrice}`;

  const blocks = slice.map((o, i) => offerBlock(o, off + i + 1));
  const description = `${meta}\n\n${blocks.join('\n\n')}`;

  // Thumbnail — first product image on this page
  const thumb = slice.find(o => o.images?.urls?.medium)?.images?.urls?.medium ?? null;

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle(`${query}  —  ${offers.length} deal${offers.length !== 1 ? 's' : ''} found`)
    .setDescription(description)
    .setFooter({ text: `${p + 1} / ${totalPages}  ·  marktguru.de` })
    .setTimestamp();

  if (thumb) embed.setThumbnail(thumb);

  // Buttons
  const prev = new ButtonBuilder()
    .setCustomId(`oh:prev:${cacheKey}`)
    .setLabel('Prev')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(p === 0);

  const next = new ButtonBuilder()
    .setCustomId(`oh:next:${cacheKey}`)
    .setLabel('Next')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(p >= totalPages - 1);

  const refresh = new ButtonBuilder()
    .setCustomId(`oh:ref:${cacheKey}`)
    .setLabel('Refresh')
    .setStyle(ButtonStyle.Primary);

  const btns: ButtonBuilder[] = [prev, next, refresh];

  if (opts.showDealLink) {
    const viewUrl = slice.find(o => o.externalUrl)?.externalUrl;
    if (viewUrl) {
      btns.push(
        new ButtonBuilder()
          .setLabel('View Deal')
          .setStyle(ButtonStyle.Link)
          .setURL(viewUrl),
      );
    }
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...btns);
  return { embeds: [embed], components: [row] };
}

export function buildErrorEmbed(title: string, detail?: string): DealResponse {
  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle(title)
    .setTimestamp();
  if (detail) embed.setDescription(detail);
  return { embeds: [embed], components: [] };
}

export function buildInfoEmbed(title: string, detail?: string): DealResponse {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(title)
    .setTimestamp();
  if (detail) embed.setDescription(detail);
  return { embeds: [embed], components: [] };
}
