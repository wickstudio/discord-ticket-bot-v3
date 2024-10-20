/**
 * @module remindDM
 */

const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits,
  } = require('discord.js');
  
  module.exports = {
    name: 'remindDM',
  
    /**
     * @async
     * @function execute
     * @param {Client} client
     * @param {Interaction} interaction
     */
    async execute(client, interaction) {
      const locale = client.locale.get(client.config.language);
  
      if (interaction.isModalSubmit()) {
        const dmMessage = interaction.fields.getTextInputValue('dmMessage');
  
        const userId = interaction.channel.topic;
  
        const user = await client.users.fetch(userId).catch(() => {});
  
        if (!user) {
          await interaction.reply({
            content: locale.remindDM.userNotFound || 'User not found.',
            ephemeral: true,
          });
          return;
        }
  
        try {
          await user.send({
            content: locale.remindDM.dmContent
              .replace('[admin]', interaction.user.tag)
              .replace('[channel]', interaction.channel.toString())
              .replace('[message]', dmMessage),
          });
          await interaction.reply({
            content: locale.remindDM.success || 'Reminder sent successfully.',
            ephemeral: true,
          });
        } catch (error) {
          console.error('Error sending DM:', error);
          await interaction.reply({
            content: locale.remindDM.dmFailed || 'Failed to send DM to the user.',
            ephemeral: true,
          });
        }
      } else {
        const modal = new ModalBuilder()
          .setCustomId('remindDM')
          .setTitle(locale.remindDM.modalTitle || 'Send Reminder DM')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('dmMessage')
                .setLabel(locale.remindDM.modalLabel || 'Enter your message')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );
  
        await interaction.showModal(modal);
      }
    },
  };
  