/**
 * @module add_section
 */

const Locale = require('../locale/en.json');
const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { CustomClient } = require('../utils');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'add_section',
  data: new SlashCommandBuilder()
    .setName('add_section')
    .setDescription(Locale.addSection.Description)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('section_name')
        .setDescription(Locale.addSection.SectionNameDescription)
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription(Locale.addSection.RoleDescription)
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName('image')
        .setDescription(Locale.addSection.imageDescription)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription(Locale.addSection.emoji)
        .setRequired(false)
    ),

  /**
   * @async
   * @function execute
   * @param {CustomClient} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language) || Locale.addSection;

    try {
      await interaction.deferReply({ ephemeral: true });

      const sectionNameOption = interaction.options.getString('section_name');
      const roleOption = interaction.options.getRole('role');
      const imageOption = interaction.options.getAttachment('image');
      const emojiOption = interaction.options.getString('emoji');

      if (!sectionNameOption || !roleOption || !imageOption) {
        await interaction.editReply({
          content: locale.missingOptions || 'Missing required options.',
          ephemeral: true,
        });
        return;
      }

      const sectionName = sectionNameOption.trim();
      const roleId = roleOption.id;
      const imageUrl = imageOption.url;
      const emoji = emojiOption ? emojiOption.trim() : null;

      if (emoji) {
        const emojiRegex = /(?::\w+:|<:[^:\s]+:\d+>|[\uD83C-\uDBFF\uDC00-\uDFFF\uD83D\uDC00-\uDE4F\uD83D\uDE80-\uDEF3])/;
        if (!emojiRegex.test(emoji)) {
          await interaction.editReply({
            content: locale.emojiError || 'Please provide a valid emoji.',
            ephemeral: true,
          });
          return;
        }
      }

      if (client.config.optionConfig[sectionName]) {
        await interaction.editReply({
          content: locale.error || 'A section with this name already exists.',
          ephemeral: true,
        });
        return;
      }

      client.config.optionConfig[sectionName] = {
        roleId: roleId,
        image: imageUrl,
      };

      const newOption = {
        label: sectionName,
        value: sectionName,
      };

      if (emoji) {
        newOption.emoji = emoji;
      }

      client.config.ticketOptions.push(newOption);

      const configPath = path.resolve(__dirname, '../../config.json');

      fs.writeFile(configPath, JSON.stringify(client.config, null, 2), (err) => {
        if (err) {
          console.error('Error writing to config.json:', err);
          interaction.editReply({
            content: locale.writeError || 'There was an error saving the configuration.',
            ephemeral: true,
          });
          return;
        }

        interaction.editReply({
          content: locale.success || 'Section added successfully!',
          ephemeral: true,
        });
      });
    } catch (error) {
      console.error(`Error executing add_section command: ${error}`);
      await interaction.editReply({
        content: locale.generalError || 'An unexpected error occurred.',
        ephemeral: true,
      });
    }
  },
};
