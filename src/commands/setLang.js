const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'setlang',
  data: new SlashCommandBuilder()
    .setName('setlang')
    .setDescription('Set the language for the bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('The language to set')
        .addChoices({ name: 'English', value: 'en' }, { name: 'Arabic', value: 'ar' })
        .setRequired(true)
    ),

  async execute(client, interaction) {
    const language = interaction.options.getString('language');

    client.config.language = language;

    fs.writeFileSync('config.json', JSON.stringify(client.config, null, 2));

    const locale = client.locale.get(language);
    interaction.reply({ content: locale.setLang.success, ephemeral: true });
  },
};