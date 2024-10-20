const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { generateHtmlPage } = require('../utils');

module.exports = {
  name: 'feedbackSubmit',

  /**
   * @param {CustomClient} client
   * @param {ModalSubmitInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    try {
      const [_, ratingStr, originalMessageId, ticketNumber] = interaction.customId.split('*');
      const rating = parseInt(ratingStr, 10);

      if (isNaN(rating) || rating < 1 || rating > 5) {
        await interaction.reply({ content: locale.feedbackRating.invalidRating || 'Invalid rating selected.', ephemeral: true });
        return;
      }

      const feedbackMessage = interaction.fields.getTextInputValue('feedbackMessage') || locale.feedback.noMessage || 'No feedback provided.';

      const feedbackLogChannel = client.channels.cache.get(client.config.feedbackLogChannel);
      if (!feedbackLogChannel) {
        console.error(`Feedback log channel with ID ${client.config.feedbackLogChannel} not found.`);
        await interaction.reply({ content: locale.feedback.logChannelNotFound || 'Feedback log channel not found.', ephemeral: true });
        return;
      }

      console.info(`Feedback log channel found: ${feedbackLogChannel.name}`);

      const feedbackEmbed = new EmbedBuilder()
        .setTitle(locale.feedback.receivedTitle || 'New Feedback Received')
        .setColor('#05131f')
        .addFields(
          { name: locale.feedback.user || 'User 👤', value: `<@${interaction.user.id}>`, inline: true },
          { name: locale.feedback.rating || 'Rating ⭐', value: `${'⭐'.repeat(rating)}`, inline: true },
          { name: locale.feedback.message || 'Message ✉️', value: feedbackMessage },
          { name: locale.feedback.ticketNumber || 'Ticket Number 📋', value: `#${ticketNumber}`, inline: true }
        )
        .setTimestamp();

      await feedbackLogChannel.send({ embeds: [feedbackEmbed] });
      console.info(`Feedback from <@${interaction.user.id}> logged in ${feedbackLogChannel.name}`);

      try {
        const dmChannel = interaction.channel; // The DM channel
        const originalMessage = await dmChannel.messages.fetch(originalMessageId);
        if (originalMessage) {
          const disabledComponents = originalMessage.components.map((row) => {
            const actionRow = ActionRowBuilder.from(row);
            const disabledRow = ActionRowBuilder.from(actionRow).setComponents(
              row.components.map((component) => ButtonBuilder.from(component).setDisabled(true))
            );
            return disabledRow;
          });

          await originalMessage.edit({ components: disabledComponents });
          console.info(`Feedback buttons disabled for message ID ${originalMessageId}`);
        } else {
          console.warn(`Original feedback message with ID ${originalMessageId} not found.`);
        }
      } catch (error) {
        console.error('Error fetching or editing original message:', error);
      }

      await interaction.reply({ content: locale.feedback.thankYou || 'Thank you for your feedback!', ephemeral: true });
    } catch (error) {
      console.error(`Error in 'feedbackSubmit' interaction:`, error);
      await interaction.reply({ content: 'An unexpected error occurred while processing your feedback. Please try again later.', ephemeral: true });
    }
  },
};
