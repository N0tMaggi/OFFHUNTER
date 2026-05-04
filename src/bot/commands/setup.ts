import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import prisma from '../../db';
import { rescheduleGuild } from '../../scheduler';

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Konfiguriere den OFFHUNTER-Bot für diesen Server')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s =>
    s.setName('channel')
      .setDescription('Kanal für automatische Posts setzen')
      .addChannelOption(o => o.setName('channel').setDescription('Kanal').setRequired(true)))
  .addSubcommand(s =>
    s.setName('keywords')
      .setDescription('Suchbegriffe setzen (kommagetrennt)')
      .addStringOption(o => o.setName('terms').setDescription('z.B. "energy drink,red bull"').setRequired(true)))
  .addSubcommand(s =>
    s.setName('schedule')
      .setDescription('Cron-Zeitplan setzen (z.B. "0 8 * * *" = täglich 8 Uhr)')
      .addStringOption(o => o.setName('cron').setDescription('Cron-Ausdruck').setRequired(true)))
  .addSubcommand(s =>
    s.setName('zip')
      .setDescription('Postleitzahl für Suche setzen')
      .addStringOption(o => o.setName('code').setDescription('z.B. 10115').setRequired(true)))
  .addSubcommand(s =>
    s.setName('retailers')
      .setDescription('Händler-Filter setzen (kommagetrennt, leer = alle)')
      .addStringOption(o => o.setName('list').setDescription('z.B. "lidl,rewe,aldi-sued"').setRequired(true)))
  .addSubcommand(s =>
    s.setName('maxprice')
      .setDescription('Maximalen Preis in € setzen (0 = kein Limit)')
      .addNumberOption(o => o.setName('price').setDescription('Preis in €').setRequired(true)))
  .addSubcommand(s => s.setName('view').setDescription('Aktuelle Konfiguration anzeigen'))
  .addSubcommand(s => s.setName('reset').setDescription('Konfiguration zurücksetzen'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: 'Dieser Befehl funktioniert nur auf Servern.', ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId;

  await interaction.deferReply({ ephemeral: true });

  if (sub === 'view') {
    const config = await prisma.guildConfig.findUnique({ where: { guildId } });
    if (!config) {
      await interaction.editReply('Keine Konfiguration gefunden. Nutze `/setup channel` um zu starten.');
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('⚙️ OFFHUNTER Konfiguration')
      .addFields(
        { name: 'Kanal', value: `<#${config.channelId}>`, inline: true },
        { name: 'Keywords', value: config.keywords, inline: true },
        { name: 'Schedule', value: `\`${config.schedule}\``, inline: true },
        { name: 'PLZ', value: config.zipCode, inline: true },
        { name: 'Händler', value: config.retailers ?? 'Alle', inline: true },
        { name: 'Max. Preis', value: config.maxPrice != null ? `${config.maxPrice} €` : 'Kein Limit', inline: true },
      );
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (sub === 'reset') {
    await prisma.guildConfig.deleteMany({ where: { guildId } });
    rescheduleGuild(guildId, null);
    await interaction.editReply('Konfiguration zurückgesetzt.');
    return;
  }

  const existing = await prisma.guildConfig.findUnique({ where: { guildId } });

  if (sub === 'channel') {
    const channel = interaction.options.getChannel('channel', true);
    const data = { channelId: channel.id, keywords: existing?.keywords ?? 'energy drink' };
    await prisma.guildConfig.upsert({ where: { guildId }, create: { guildId, ...data }, update: data });
    await interaction.editReply(`Kanal auf <#${channel.id}> gesetzt.`);
    return;
  }

  if (!existing) {
    await interaction.editReply('Bitte zuerst einen Kanal mit `/setup channel` setzen.');
    return;
  }

  if (sub === 'keywords') {
    const terms = interaction.options.getString('terms', true);
    await prisma.guildConfig.update({ where: { guildId }, data: { keywords: terms } });
    await interaction.editReply(`Keywords auf \`${terms}\` gesetzt.`);
  } else if (sub === 'schedule') {
    const cron = interaction.options.getString('cron', true);
    await prisma.guildConfig.update({ where: { guildId }, data: { schedule: cron } });
    const updated = await prisma.guildConfig.findUnique({ where: { guildId } });
    rescheduleGuild(guildId, updated!);
    await interaction.editReply(`Schedule auf \`${cron}\` gesetzt.`);
  } else if (sub === 'zip') {
    const code = interaction.options.getString('code', true);
    await prisma.guildConfig.update({ where: { guildId }, data: { zipCode: code } });
    await interaction.editReply(`Postleitzahl auf \`${code}\` gesetzt.`);
  } else if (sub === 'retailers') {
    const list = interaction.options.getString('list', true);
    const value = list.trim() === '' ? null : list;
    await prisma.guildConfig.update({ where: { guildId }, data: { retailers: value } });
    await interaction.editReply(`Händler-Filter auf \`${value ?? 'Alle'}\` gesetzt.`);
  } else if (sub === 'maxprice') {
    const price = interaction.options.getNumber('price', true);
    const value = price <= 0 ? null : price;
    await prisma.guildConfig.update({ where: { guildId }, data: { maxPrice: value } });
    await interaction.editReply(`Max. Preis auf \`${value != null ? value + ' €' : 'kein Limit'}\` gesetzt.`);
  }
}
