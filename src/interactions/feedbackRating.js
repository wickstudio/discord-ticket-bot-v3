/**
 * @module feedbackRating
 */

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  name: 'feedbackRating',

  /**

   * @async
   * @function execute
   * @param {CustomClient} client
   * @param {ButtonInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    const [interactionName, ratingStr, ticketNumber] = interaction.customId.split('*');

    const parsedRating = parseInt(ratingStr, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      await interaction.reply({ content: 'Invalid rating selected.', ephemeral: true });
      return;
    }

    const originalMessageId = interaction.message.id;

    const modal = new ModalBuilder()
      .setCustomId(`feedbackSubmit*${parsedRating}*${originalMessageId}*${ticketNumber}`)
      .setTitle(locale.feedback.modalTitle || 'Your Feedback');

    const feedbackInput = new TextInputBuilder()
      .setCustomId('feedbackMessage')
      .setLabel(locale.feedback.modalLabel || 'Please provide additional feedback (optional):')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(1000);

    const firstActionRow = new ActionRowBuilder().addComponents(feedbackInput);

    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  },
};
