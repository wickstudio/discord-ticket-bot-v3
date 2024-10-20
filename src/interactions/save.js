const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { generateHtmlPage } = require('../utils');

module.exports = {
  name: 'save',

  /**
   * @param {CustomClient} client
   * @param {ButtonInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    try {
      await interaction.deferUpdate();

      const ticketKey = `ticket-${interaction.guild.id}-${interaction.channel.topic}`;
      const Ticketdata = await client.db.get(ticketKey);

      const embed = new EmbedBuilder()
        .setTitle(locale.save.ticketClosed || 'Ticket Closed')
        .setColor('#05131f')
        .addFields(
          { name: locale.save.openedBy || 'Opened By', value: `<@${interaction.channel.topic}>`, inline: true },
          { name: locale.save.claimedBy || 'Claimed By', value: Ticketdata?.claimed ? `<@${Ticketdata.claimed}>` : locale.save.noOne || 'No one', inline: true },
          { name: locale.save.closedBy || 'Closed By', value: `<@${Ticketdata?.closedBy}>`, inline: true },
          { name: locale.save.openTime || 'Open Time', value: new Date(interaction.channel.createdTimestamp).toLocaleString(), inline: true },
          { name: locale.save.closeTime || 'Close Time', value: new Date().toLocaleString(), inline: true }
        )
        .setTimestamp();

      const htmlPage = await generateHtmlPage(interaction.channel);

      const logChannel = interaction.guild.channels.cache.get(client.config.logChannel);
      if (!logChannel) {
        console.error(`Log channel with ID ${client.config.logChannel} not found.`);
        return;
      }

      const msg = await logChannel.send({ embeds: [embed], files: [{ name: 'ticket.html', attachment: Buffer.from(htmlPage) }] });
      console.info(`Ticket ${Ticketdata.id} saved and logged in ${logChannel.name}`);

      const downloadButton = new ButtonBuilder()
        .setURL(msg.attachments.first()?.url)
        .setLabel(locale.save.download || 'Download')
        .setStyle(ButtonStyle.Link);

      const actionRow = new ActionRowBuilder().addComponents(downloadButton);

      await msg.edit({ components: [actionRow] });

      const updatedActionRow = ActionRowBuilder.from(interaction.message.components[0])
        .setComponents(
          interaction.message.components[0].components.map(button => 
            button.customId === 'save'
              ? ButtonBuilder.from(button).setDisabled(true)
              : ButtonBuilder.from(button)
          )
        );

      await interaction.editReply({ components: [updatedActionRow] });

    } catch (error) {
      console.error('Error in save interaction:', error);
      await interaction.followUp({ content: 'There was an error while saving the ticket.', ephemeral: true });
    }
  },
};
