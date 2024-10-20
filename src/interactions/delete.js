/**
 * @module delete
 */

module.exports = {
  name: 'delete',

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);
    interaction.reply({ content: locale.delete.deleteTimer, ephemeral: true });

    setTimeout(() => {
      interaction.channel.delete();
    }, 5000);
  },
};
