import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import prisma from '../../db';
import { rescheduleGuild } from '../../scheduler';
import { buildErrorEmbed } from '../embeds/dealEmbed';
import { locale } from '../../i18n';

const { setup: cmd } = locale.commands;
const { subs, errors } = cmd;

export const data = new SlashCommandBuilder()
  .setName(cmd.name)
  .setDescription(cmd.description)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s =>
    s.setName(subs.channel.name)
      .setDescription(subs.channel.description)
      .addChannelOption(o => o.setName('channel').setDescription(subs.channel.optDesc).setRequired(true)))
  .addSubcommand(s =>
    s.setName(subs.keywords.name)
      .setDescription(subs.keywords.description)
      .addStringOption(o => o.setName('terms').setDescription(subs.keywords.optDesc).setRequired(true)))
  .addSubcommand(s =>
    s.setName(subs.schedule.name)
      .setDescription(subs.schedule.description)
      .addStringOption(o => o.setName('cron').setDescription(subs.schedule.optDesc).setRequired(true)))
  .addSubcommand(s =>
    s.setName(subs.zip.name)
      .setDescription(subs.zip.description)
      .addStringOption(o => o.setName('code').setDescription(subs.zip.optDesc).setRequired(true)))
  .addSubcommand(s =>
    s.setName(subs.retailers.name)
      .setDescription(subs.retailers.description)
      .addStringOption(o => o.setName('list').setDescription(subs.retailers.optDesc).setRequired(true)))
  .addSubcommand(s =>
    s.setName(subs.maxprice.name)
      .setDescription(subs.maxprice.description)
      .addNumberOption(o => o.setName('price').setDescription(subs.maxprice.optDesc).setRequired(true)))
  .addSubcommand(s =>
    s.setName(subs.deallink.name)
      .setDescription(subs.deallink.description)
      .addBooleanOption(o => o.setName('enabled').setDescription(subs.deallink.optDesc).setRequired(true)))
  .addSubcommand(s => s.setName(subs.view.name).setDescription(subs.view.description))
  .addSubcommand(s => s.setName(subs.reset.name).setDescription(subs.reset.description));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ ...buildErrorEmbed(errors.serverOnly.title, errors.serverOnly.detail), flags: MessageFlags.Ephemeral });
    return;
  }

  const sub     = interaction.options.getSubcommand();
  const guildId = interaction.guildId;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (sub === subs.view.name) {
    const config = await prisma.guildConfig.findUnique({ where: { guildId } });
    if (!config) {
      await interaction.editReply(buildErrorEmbed(subs.view.noConfig, subs.view.noConfigDetail(cmd.name, subs.channel.name)));
      return;
    }
    const f = subs.view.fields;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(subs.view.title)
      .addFields(
        { name: f.channel,   value: `<#${config.channelId}>`,                                                    inline: true },
        { name: f.keywords,  value: config.keywords,                                                              inline: true },
        { name: f.schedule,  value: `\`${config.schedule}\``,                                                     inline: true },
        { name: f.zip,       value: config.zipCode,                                                               inline: true },
        { name: f.retailers, value: config.retailers ?? f.all,                                                    inline: true },
        { name: f.maxPrice,  value: config.maxPrice != null ? `${config.maxPrice.toFixed(2)} €` : f.none,        inline: true },
        { name: f.dealLink,  value: config.showDealLink ? f.enabled : f.disabled,                                inline: true },
      )
      .setFooter({ text: subs.view.footer(cmd.name) });
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (sub === subs.reset.name) {
    await prisma.guildConfig.deleteMany({ where: { guildId } });
    rescheduleGuild(guildId, null);
    await interaction.editReply({ content: subs.reset.success });
    return;
  }

  const existing = await prisma.guildConfig.findUnique({ where: { guildId } });

  if (sub === subs.channel.name) {
    const channel = interaction.options.getChannel('channel', true);
    await prisma.guildConfig.upsert({
      where:  { guildId },
      create: { guildId, channelId: channel.id, keywords: existing?.keywords ?? 'energy drink' },
      update: { channelId: channel.id },
    });
    await interaction.editReply({ content: subs.channel.success(channel.id) });
    return;
  }

  if (!existing) {
    await interaction.editReply(buildErrorEmbed(errors.noConfig.title, errors.noConfig.detail(cmd.name, subs.channel.name)));
    return;
  }

  if (sub === subs.keywords.name) {
    const terms = interaction.options.getString('terms', true);
    await prisma.guildConfig.update({ where: { guildId }, data: { keywords: terms } });
    await interaction.editReply({ content: subs.keywords.success(terms) });
  } else if (sub === subs.schedule.name) {
    const expr = interaction.options.getString('cron', true);
    const { default: cron } = await import('node-cron');
    if (!cron.validate(expr)) {
      await interaction.editReply(buildErrorEmbed('Invalid cron expression', subs.schedule.invalid));
      return;
    }
    await prisma.guildConfig.update({ where: { guildId }, data: { schedule: expr } });
    const updated = await prisma.guildConfig.findUnique({ where: { guildId } });
    rescheduleGuild(guildId, updated!);
    await interaction.editReply({ content: subs.schedule.success(expr) });
  } else if (sub === subs.zip.name) {
    const code = interaction.options.getString('code', true);
    await prisma.guildConfig.update({ where: { guildId }, data: { zipCode: code } });
    await interaction.editReply({ content: subs.zip.success(code) });
  } else if (sub === subs.retailers.name) {
    const raw   = interaction.options.getString('list', true).trim();
    const value = raw === '' ? null : raw;
    await prisma.guildConfig.update({ where: { guildId }, data: { retailers: value } });
    await interaction.editReply({ content: value ? subs.retailers.success(value) : subs.retailers.cleared });
  } else if (sub === subs.deallink.name) {
    const enabled = interaction.options.getBoolean('enabled', true);
    await prisma.guildConfig.update({ where: { guildId }, data: { showDealLink: enabled } });
    await interaction.editReply({ content: enabled ? subs.deallink.enabled : subs.deallink.disabled });
  } else if (sub === subs.maxprice.name) {
    const price = interaction.options.getNumber('price', true);
    const value = price <= 0 ? null : price;
    await prisma.guildConfig.update({ where: { guildId }, data: { maxPrice: value } });
    await interaction.editReply({ content: value != null ? subs.maxprice.success(value.toFixed(2)) : subs.maxprice.cleared });
  }
}
