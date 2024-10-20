const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { CustomClient } = require('../utils');

module.exports = {
  name: 'close',

  /**
   * @param {CustomClient} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    await interaction.deferReply();

    const confirmEmbed = new EmbedBuilder()
      .setColor('#05131f')
      .setTitle('Confirmation')
      .setDescription(locale.close.confirm);

    const yesButton = new ButtonBuilder()
      .setCustomId('confirm_yes')
      .setLabel(locale.close.yes)
      .setStyle(ButtonStyle.Secondary);

    const noButton = new ButtonBuilder()
      .setCustomId('confirm_no')
      .setLabel(locale.close.no)
      .setStyle(ButtonStyle.Danger);

    const confirmRow = new ActionRowBuilder().addComponents(yesButton, noButton);

    await interaction.editReply({
      embeds: [confirmEmbed],
      components: [confirmRow],
    });
  },
};
