import { EmbedBuilder } from 'discord.js';
import { Offer } from '../../marktguru/client';

const MAX_SHOWN = 10;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.`;
}

function offerLine(offer: Offer): string {
  const retailer = offer.advertisers[0]?.name ?? 'Unbekannt';
  const name = offer.product?.name ?? offer.description;
  const dates = offer.validityDates[0];
  const validity = dates ? `📅 ${formatDate(dates.from)} – ${formatDate(dates.to)}` : '';
  return `**${retailer}** — ${name}\n💰 ${offer.price.toFixed(2)} € ${validity}`;
}

export function buildDealEmbed(query: string, offers: Offer[]): EmbedBuilder {
  const shown = offers.slice(0, MAX_SHOWN);
  const extra = offers.length - shown.length;

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle(`🛒 ${query} Angebote — ${offers.length} gefunden`)
    .setFooter({ text: 'Quelle: marktguru.de' })
    .setTimestamp();

  if (shown.length === 0) {
    embed.setDescription('Keine Angebote gefunden.');
    return embed;
  }

  embed.setDescription(shown.map(offerLine).join('\n\n'));

  if (extra > 0) {
    embed.addFields({ name: '​', value: `… und ${extra} weitere Angebote.` });
  }

  return embed;
}
