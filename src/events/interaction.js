const { Events, InteractionType } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param {CustomClient} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          console.warn(`No command found for ${interaction.commandName}`);
          return;
        }

        try {
          await command.execute(client, interaction);
        } catch (error) {
          console.error(`Error executing command ${interaction.commandName}:`, error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
          }
        }

        return;
      }

      if (interaction.type === InteractionType.ModalSubmit) {
        const [interactionName] = interaction.customId.split('*');
        const modalInteraction = client.interactions.get(interactionName);
        if (!modalInteraction) {
          console.warn(`No modal interaction handler found for ${interactionName}`);
          return;
        }

        try {
          await modalInteraction.execute(client, interaction);
        } catch (error) {
          console.error(`Error handling modal interaction ${interaction.customId}:`, error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: 'There was an error while processing your submission!',
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: 'There was an error while processing your submission!',
              ephemeral: true,
            });
          }
        }

        return;
      }

      if (interaction.isButton() || interaction.isAnySelectMenu()) {
        let interactionName = interaction.customId.split('*')[0];

        if (interaction.isUserSelectMenu()) {
          interactionName = 'addUser';
        }

        const interactionHandler = client.interactions.get(interactionName);
        if (!interactionHandler) {
          console.warn(`No interaction handler found for ${interactionName}`);
          return;
        }

        try {
          await interactionHandler.execute(client, interaction);
        } catch (error) {
          console.error(`Error handling interaction ${interaction.customId}:`, error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: 'There was an error while processing your interaction!',
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: 'There was an error while processing your interaction!',
              ephemeral: true,
            });
          }
        }

        return;
      }

    } catch (error) {
      console.error('Unexpected error in interactionCreate handler:', error);
    }
  },
};
