/**
 * @module confirm_no
 */
const { ButtonInteraction } = require('discord.js');

module.exports = {
  name: 'confirm_no',

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {ButtonInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    await interaction.deferUpdate();
    await interaction.editReply({ content: locale.confirmNo.cancelConfirmation });
  },
};
