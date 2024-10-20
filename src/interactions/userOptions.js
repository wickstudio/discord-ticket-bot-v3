/**
 * @module userOptions
 */

const closeHandler = require('./close');

module.exports = {
  name: 'userOptions',

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {SelectMenuInteraction} interaction
   */
  async execute(client, interaction) {
    const selectedOption = interaction.values[0];

    switch (selectedOption) {
      case 'close':
        await closeHandler.execute(client, interaction);
        break;
      default:
        await interaction.reply({ content: 'Invalid option selected.', ephemeral: true });
        break;
    }
  },
};
