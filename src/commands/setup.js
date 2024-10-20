/**
 * @module setup
 */

const {
  StringSelectMenuBuilder,
  AttachmentBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require('discord.js');
const path = require('path');
const Locale = require('../locale/en.json');

module.exports = {
  name: 'setup',
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription(Locale.setup.Description)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    try {
      await interaction.deferReply({ ephemeral: true });

      const filesToSend = [];

      if (client.config.BACKGROUND) {
        filesToSend.push(new AttachmentBuilder(client.config.BACKGROUND, { name: 'BACKGROUND.png' }));
        console.log('Background image URL:', client.config.BACKGROUND);
      }

      if (client.config.LINE) {
        filesToSend.push(new AttachmentBuilder(client.config.LINE, { name: 'LINE.png' }));
        console.log('Line image URL:', client.config.LINE);
      }

      const selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select')
          .setPlaceholder(locale.setup.SelectPlaceholder)
          .addOptions(
            client.config.ticketOptions.map(option => ({
              label: option.label,
              value: option.value,
              ...(option.emoji ? { emoji: option.emoji } : {})
            }))
          )
      );

      const buttons = [];
      for (const button of client.config.ticketOptions) {
        const btn = new ButtonBuilder()
          .setCustomId(`select*${button.value}`)
          .setLabel(button.label)
          .setStyle('Secondary');

        if (button.emoji) {
          btn.setEmoji(button.emoji);
        }
        buttons.push(btn);
      }

      const rows = [];
      for (let i = 0; i < buttons.length; i += 5) {
        rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
      }

      const components = client.config.sectionType === 'list' ? [selectMenu] : rows;

      const messagePayload = { files: filesToSend, components: components.length ? components : [] };
      await interaction.channel.send(messagePayload);

      await interaction.editReply({ content: locale.setup.success, ephemeral: true });
    } catch (error) {
      console.error('Error executing command setup:', error);
      await interaction.editReply({ content: 'There was an error executing the setup command.', ephemeral: true });
    }
  },
};
