const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonInteraction,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  name: 'options',

  /**
   * @async
   * @function execute
   * @param {CustomClient} client
   * @param {ButtonInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    await interaction.deferReply({ ephemeral: true });

    const ticketData = await client.db.get(`ticket-${interaction.guild.id}-${interaction.channel.topic}`);
    if (!ticketData) {
      await interaction.editReply({ content: locale.options.ticketDataNotFound || 'Ticket data not found.', ephemeral: true });
      return;
    }

    const { selectedOption } = ticketData;
    const { roleId } = client.config.optionConfig[selectedOption];

    const isTicketCreator = interaction.user.id === interaction.channel.topic;

    const isAdmin = interaction.member.roles.cache.has(roleId);

    const optionEmojis = {
      close: '❌',
      rename: '✏️',
      remindDM: '📩',
      addUser: '➕',
    };

    let selectMenu;
    if (isAdmin) {
      selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('adminOptions')
          .setPlaceholder(locale.options.selectPlaceholder || 'Choose an option')
          .addOptions([
            {
              label: locale.options.closeLabel,
              value: 'close',
              emoji: optionEmojis.close,
            },
            {
              label: locale.options.renameLabel,
              value: 'rename',
              emoji: optionEmojis.rename,
            },
            {
              label: locale.options.remindDMLabel,
              value: 'remindDM',
              emoji: optionEmojis.remindDM,
            },
            {
              label: locale.options.addUserLabel,
              value: 'addUser',
              emoji: optionEmojis.addUser,
            },
          ])
      );
    } else if (isTicketCreator) {
      selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('userOptions')
          .setPlaceholder(locale.options.selectPlaceholder || 'Choose an option')
          .addOptions([
            {
              label: locale.options.closeLabel,
              value: 'close',
              emoji: optionEmojis.close,
            },
          ])
      );
    } else {
      await interaction.editReply({
        content: locale.options.noPermission || 'You do not have permission to use this.',
        ephemeral: true,
      });
      return;
    }

    await interaction.editReply({
      content: locale.options.selectMenuPrompt || 'Please select an option:',
      components: [selectMenu],
      ephemeral: true,
    });
  },
};
