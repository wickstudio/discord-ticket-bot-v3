const claimHandler = require('./claim');
const closeHandler = require('./close');
const renameHandler = require('./rename');
const remindDMHandler = require('./remindDM');
const addUserHandler = require('./addUser');

module.exports = {
  name: 'adminOptions',

  /**
   * @async
   * @function execute
   * @param {CustomClient} client
   * @param {SelectMenuInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    const selectedOption = interaction.values[0];

    switch (selectedOption) {
      case 'claim':
        await claimHandler.execute(client, interaction);
        break;
      case 'close':
        await closeHandler.execute(client, interaction);
        break;
      case 'rename':
        await renameHandler.execute(client, interaction);
        break;
      case 'remindDM':
        await remindDMHandler.execute(client, interaction);
        break;
      case 'addUser':
        await addUserHandler.execute(client, interaction);
        break;
      default:
        await interaction.reply({ content: 'Invalid option selected.', ephemeral: true });
        break;
    }
  },
};
