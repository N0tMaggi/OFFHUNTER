import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import prisma from '../../db';
import { rescheduleGuild } from '../../scheduler';

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Configure OFFHUNTER for this server')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s =>
    s.setName('channel')
      .setDescription('Set the channel for automatic deal posts')
      .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true)))
  .addSubcommand(s =>
    s.setName('keywords')
      .setDescription('Set search keywords (comma-separated)')
      .addStringOption(o => o.setName('terms').setDescription('e.g. "energy drink, red bull"').setRequired(true)))
  .addSubcommand(s =>
    s.setName('schedule')
      .setDescription('Set posting schedule as a cron expression')
      .addStringOption(o => o.setName('cron').setDescription('e.g. "0 8 * * *" = daily at 8am').setRequired(true)))
  .addSubcommand(s =>
    s.setName('zip')
      .setDescription('Set the postal code for deal searches')
      .addStringOption(o => o.setName('code').setDescription('German postal code, e.g. 10115').setRequired(true)))
  .addSubcommand(s =>
    s.setName('retailers')
      .setDescription('Filter deals by retailer (comma-separated, leave empty for all)')
      .addStringOption(o => o.setName('list').setDescription('e.g. "lidl, rewe, aldi-sued"').setRequired(true)))
  .addSubcommand(s =>
    s.setName('maxprice')
      .setDescription('Set a maximum deal price in € (0 = no limit)')
      .addNumberOption(o => o.setName('price').setDescription('Price in €').setRequired(true)))
  .addSubcommand(s => s.setName('view').setDescription('Show current configuration'))
  .addSubcommand(s => s.setName('reset').setDescription('Clear all server configuration'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
    return;
  }

  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (sub === 'view') {
    const config = await prisma.guildConfig.findUnique({ where: { guildId } });
    if (!config) {
      await interaction.editReply('No configuration found. Start with `/setup channel`.');
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('⚙️  OFFHUNTER Configuration')
      .addFields(
        { name: 'Channel', value: `<#${config.channelId}>`, inline: true },
        { name: 'Keywords', value: config.keywords, inline: true },
        { name: 'Schedule', value: `\`${config.schedule}\``, inline: true },
        { name: 'Postal Code', value: config.zipCode, inline: true },
        { name: 'Retailers', value: config.retailers ?? 'All', inline: true },
        { name: 'Max Price', value: config.maxPrice != null ? `${config.maxPrice.toFixed(2)} €` : 'No limit', inline: true },
      )
      .setFooter({ text: 'Use /setup <subcommand> to change any value.' });
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (sub === 'reset') {
    await prisma.guildConfig.deleteMany({ where: { guildId } });
    rescheduleGuild(guildId, null);
    await interaction.editReply('Configuration cleared.');
    return;
  }

  const existing = await prisma.guildConfig.findUnique({ where: { guildId } });

  if (sub === 'channel') {
    const channel = interaction.options.getChannel('channel', true);
    await prisma.guildConfig.upsert({
      where: { guildId },
      create: { guildId, channelId: channel.id, keywords: existing?.keywords ?? 'energy drink' },
      update: { channelId: channel.id },
    });
    await interaction.editReply(`Channel set to <#${channel.id}>.`);
    return;
  }

  if (!existing) {
    await interaction.editReply('No configuration found. Start with `/setup channel`.');
    return;
  }

  if (sub === 'keywords') {
    const terms = interaction.options.getString('terms', true);
    await prisma.guildConfig.update({ where: { guildId }, data: { keywords: terms } });
    await interaction.editReply(`Keywords updated to \`${terms}\`.`);
  } else if (sub === 'schedule') {
    const cronExpr = interaction.options.getString('cron', true);
    const { default: cron } = await import('node-cron');
    if (!cron.validate(cronExpr)) {
      await interaction.editReply('Invalid cron expression. Example: `0 8 * * *` (daily at 8am).');
      return;
    }
    await prisma.guildConfig.update({ where: { guildId }, data: { schedule: cronExpr } });
    const updated = await prisma.guildConfig.findUnique({ where: { guildId } });
    rescheduleGuild(guildId, updated!);
    await interaction.editReply(`Schedule updated to \`${cronExpr}\`.`);
  } else if (sub === 'zip') {
    const code = interaction.options.getString('code', true);
    await prisma.guildConfig.update({ where: { guildId }, data: { zipCode: code } });
    await interaction.editReply(`Postal code set to \`${code}\`.`);
  } else if (sub === 'retailers') {
    const list = interaction.options.getString('list', true).trim();
    const value = list === '' ? null : list;
    await prisma.guildConfig.update({ where: { guildId }, data: { retailers: value } });
    await interaction.editReply(`Retailer filter set to \`${value ?? 'all'}\`.`);
  } else if (sub === 'maxprice') {
    const price = interaction.options.getNumber('price', true);
    const value = price <= 0 ? null : price;
    await prisma.guildConfig.update({ where: { guildId }, data: { maxPrice: value } });
    await interaction.editReply(`Max price set to ${value != null ? `\`${value.toFixed(2)} €\`` : '`no limit`'}.`);
  }
}
