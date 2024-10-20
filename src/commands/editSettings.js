/**
 * @module edit_settings
 */

const { PermissionFlagsBits, SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const Locale = require('../locale/en.json');


module.exports = {
  name: 'edit_settings',
  data: new SlashCommandBuilder()
    .setName('edit_settings')
    .setDescription(Locale.editSettings.Description)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option.setName('category').addChannelTypes(ChannelType.GuildCategory).setDescription(Locale.editSettings.category)
    )
    .addChannelOption((option) => option.setName('logs').addChannelTypes(ChannelType.GuildText).setDescription(Locale.editSettings.logs))
    .addAttachmentOption((option) => option.setName('background').setDescription(Locale.editSettings.BACKGROUND))
    .addAttachmentOption((option) => option.setName('line').setDescription(Locale.editSettings.LINE))
    .addStringOption((option) =>
      option
        .setName('section_type')
        .setDescription(Locale.editSettings.SECTION_TYPE)
        .addChoices({ name: 'Buttons', value: 'buttons' }, { name: 'List', value: 'list' })
    ),

  /**
   * @async
   * @function execute
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    await interaction.deferReply({ ephemeral: true }).catch(() => {});

    const category = interaction.options.getChannel('category');
    const logs = interaction.options.getChannel('logs');
    const BACKGROUND = interaction.options.getAttachment('background');
    const LINE = interaction.options.getAttachment('line');
    const SECTION_TYPE = interaction.options.getString('section_type');

    if (category && category.type !== ChannelType.GuildCategory) {
      interaction.editReply({ content: locale.editSettings.error, ephemeral: true });
      return;
    }
    if (logs && logs.type !== ChannelType.GuildText) {
      interaction.editReply({ content: locale.editSettings.error, ephemeral: true });
      return;
    }

    if (category) client.config.categoryID = category.id;
    if (logs) client.config.log = logs.id;
    if (BACKGROUND) client.config.BACKGROUND = BACKGROUND.url;
    if (LINE) client.config.LINE = LINE.url;
    if (SECTION_TYPE) client.config.SECTION_TYPE = SECTION_TYPE;

    fs.writeFileSync('config.json', JSON.stringify(client.config, null, 2));

    interaction.editReply({ content: locale.editSettings.success, ephemeral: true });
  },
};
