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

      if (client.config.BACKGROUND) {
        const backgroundAttachment = new AttachmentBuilder(client.config.BACKGROUND, { name: 'BACKGROUND.png' });
        await interaction.channel.send({ files: [backgroundAttachment] });
        console.log('Background image URL:', client.config.BACKGROUND);
      }

      if (client.config.ticketOptions && client.config.ticketOptions.length > 0) {
        if (client.config.sectionType === 'list') {
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

          await interaction.channel.send({ components: [selectMenu] });
        } else {
          const buttons = client.config.ticketOptions.map(option => {
            const btn = new ButtonBuilder()
              .setCustomId(`select*${option.value}`)
              .setLabel(option.label)
              .setStyle('Secondary');

            if (option.emoji) {
              btn.setEmoji(option.emoji);
            }

            return btn;
          });

          const buttonRows = [];
          for (let i = 0; i < buttons.length; i += 5) {
            buttonRows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
          }

          for (const row of buttonRows) {
            await interaction.channel.send({ components: [row] });
          }
        }
      } else {
        console.warn('No ticket options configured.');
      }

      if (client.config.LINE) {
        const lineAttachment = new AttachmentBuilder(client.config.LINE, { name: 'LINE.png' });
        await interaction.channel.send({ files: [lineAttachment] });
        console.log('Line image URL:', client.config.LINE);
      }

      await interaction.editReply({ content: locale.setup.success, ephemeral: true });
    } catch (error) {
      console.error('Error executing command setup:', error);
      await interaction.editReply({ content: 'There was an error executing the setup command.', ephemeral: true });
    }
  },
};
