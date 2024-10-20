
/**
 * @module deleteSection
 */

const fs = require('fs');

module.exports = {
  name: 'deleteSection',

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    await interaction.deferReply({ ephemeral: true }).catch(() => {});

    const selectedValue = interaction.values[0];

    delete client.config.optionConfig[selectedValue];
    client.config.ticketOptions = client.config.ticketOptions.filter((option) => option.value !== selectedValue);

    fs.writeFileSync('config.json', JSON.stringify(client.config, null, 2));

    interaction.editReply({ content: locale.deleteSection.success, ephemeral: true });
  },
};
