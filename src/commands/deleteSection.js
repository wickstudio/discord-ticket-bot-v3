/**
 * @module delete_section
 */

const { ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Locale = require('../locale/en.json');


module.exports = {
  name: 'delete_section',
  data: new SlashCommandBuilder()
    .setName('delete_section')
    .setDescription(Locale.deleteSection.Description)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    await interaction.deferReply({ ephemeral: true });

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('deleteSection')
        .setPlaceholder(locale.deleteSection.SelectPlaceholder)
        .addOptions(client.config.ticketOptions)
    );

    interaction.editReply({ content: locale.deleteSection.deleteMessage, ephemeral: true, components: [selectMenu] });
  },
};
