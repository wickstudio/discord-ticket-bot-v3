/**
 * @module confirm_yes
 */

const {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');
const { generateHtmlPage, CustomClient } = require('../utils');

module.exports = {
  name: 'confirm_yes',

  /**
   * @async
   * @function execute
   * @param {CustomClient} client
   * @param {ButtonInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    await interaction.deferUpdate();
    await interaction.channel.permissionOverwrites
      .set([
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: interaction.channel.topic,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ])
      .catch(() => {});
    await interaction.editReply({ content: locale.confirmYes.closed, embeds: [], components: [], ephemeral: true });

    const confirmEmbed = new EmbedBuilder().setColor('#05131f').setTitle(locale.confirmYes.closed);

    await interaction.channel.setName(`${interaction.channel.name.replace('🎫', '🔒')}`);

    const saveButton = new ButtonBuilder()
      .setCustomId('save')
      .setLabel(locale.confirmYes.save)
      .setStyle(ButtonStyle.Secondary);
    const deleteButton = new ButtonBuilder()
      .setCustomId('delete')
      .setLabel(locale.confirmYes.delete)
      .setStyle(ButtonStyle.Secondary);

    const confirmRow = new ActionRowBuilder().addComponents(saveButton, deleteButton);
    await interaction.followUp({ embeds: [confirmEmbed], components: [confirmRow] });

    const Ticketdata = await client.db.get(`ticket-${interaction.guild.id}-${interaction.channel.topic}`);
    await client.db.set(`ticket-${interaction.guild.id}-${interaction.channel.topic}`, {
      ...Ticketdata,
      closedBy: interaction.user.id,
    });

    const htmlPage = await generateHtmlPage(interaction.channel);

    const embed = new EmbedBuilder()
      .setTitle(locale.confirmYes.ticketClosed)
      .setColor('#05131f')
      .addFields(
        { name: locale.confirmYes.openedBy, value: `<@${interaction.channel.topic}>`, inline: true },
        {
          name: locale.confirmYes.claimedBy,
          value: Ticketdata.claimed ? `<@${Ticketdata.claimed}>` : locale.confirmYes.noOne,
          inline: true,
        },
        { name: locale.confirmYes.closedBy, value: `<@${interaction.user.id}>`, inline: true },
        { name: locale.confirmYes.openTime, value: new Date(interaction.channel.createdTimestamp).toLocaleString(), inline: true },
        { name: locale.confirmYes.closeTime, value: new Date().toLocaleString(), inline: true }
      );

    const user = await interaction.guild.members.fetch(interaction.channel.topic).catch(() => {});
    if (user) {
      try {
        const msg = await user.send({
          embeds: [embed],
          files: [{ name: 'ticket.html', attachment: Buffer.from(htmlPage) }],
        });

        const downloadButton = new ButtonBuilder()
          .setURL(msg.attachments.first().url)
          .setLabel(locale.confirmYes.download)
          .setStyle(ButtonStyle.Link);
        const ticketRow = new ActionRowBuilder().addComponents(downloadButton);

        await msg.edit({ components: [ticketRow] });

        const feedbackEmbed = new EmbedBuilder()
          .setTitle(locale.feedback.title)
          .setDescription(locale.feedback.description)
          .setColor('#05131f');

        const feedbackButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`feedbackRating*1*${Ticketdata.id}`)
            .setLabel('⭐')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`feedbackRating*2*${Ticketdata.id}`)
            .setLabel('⭐⭐')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`feedbackRating*3*${Ticketdata.id}`)
            .setLabel('⭐⭐⭐')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`feedbackRating*4*${Ticketdata.id}`)
            .setLabel('⭐⭐⭐⭐')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`feedbackRating*5*${Ticketdata.id}`)
            .setLabel('⭐⭐⭐⭐⭐')
            .setStyle(ButtonStyle.Secondary)
        );

        await user.send({ embeds: [feedbackEmbed], components: [feedbackButtons] });
      } catch (error) {
        console.error('Error sending DM to user:', error);
      }
    }
  },
};
