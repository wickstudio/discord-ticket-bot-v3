/**
 * @module rename
 */

const {
  ActionRowBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

module.exports = {
  name: 'rename',

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    if (interaction.isModalSubmit()) {
      const newName = interaction.fields.getTextInputValue('name');

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        interaction.reply({ content: locale.rename.missingPermissions, ephemeral: true });
        return;
      }

      interaction.channel.setName(newName);

      interaction.reply({ content: locale.rename.nameChanged, ephemeral: true });
    } else {
      const modal = new ModalBuilder()
        .setCustomId('rename')
        .setTitle(locale.rename.modalTitle)
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('name')
              .setMaxLength(40)
              .setMinLength(2)
              .setLabel(locale.rename.modalLabel)
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

      await interaction.showModal(modal);
    }
  },
};
