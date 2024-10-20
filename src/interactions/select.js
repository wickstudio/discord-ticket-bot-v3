const {
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
  ChannelType,
  PermissionFlagsBits,
  ButtonStyle,
} = require('discord.js');
const { CustomClient } = require('../utils');

module.exports = {
  name: 'select',

  /**
   * @async
   * @function execute
   * @param {CustomClient} client
   * @param {ButtonInteraction | AnySelectMenuInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    await interaction.deferReply({ ephemeral: true }).catch(() => {});

    const selectedValue = interaction.isAnySelectMenu() ? interaction.values[0] : interaction.customId.split('*')[1];

    if (client.config.optionConfig[selectedValue]) {
      const { roleId, image, categoryID } = client.config.optionConfig[selectedValue];

      const categoryId = categoryID ? categoryID : client.config.categoryID;
      const ticketCategory = interaction.guild.channels.cache.get(categoryId);

      if (!ticketCategory || ticketCategory.type !== ChannelType.GuildCategory) {
        return;
      }

      const hasTicket = await ticketCategory.children.cache.find((ch) => ch.topic == interaction.user.id);
      if (hasTicket) {
        interaction.editReply({ content: locale.select.alreadyCreated, ephemeral: true });
        return;
      }

      const ID = (await client.db.get('tickets')) || 0;
      const ticketChannel = await interaction.guild.channels.create({
        name: `🎫・${ID + 1}`,
        type: ChannelType.GuildText,
        topic: interaction.user.id,
        parent: ticketCategory.id,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: roleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
        ],
      });

      await client.db.set('tickets', ID + 1);
      await client.db.set(`ticket-${interaction.guild.id}-${interaction.user.id}`, {
        id: ID + 1,
        channel: ticketChannel.id,
        selectedOption: selectedValue,
        claimed: null,
      });

      const userMention = `<@${interaction.user.id}>`;
      const roleMention = `<@&${roleId}>`;
      const attach3 = new AttachmentBuilder(image, { name: 'image.png' });

      const ticketMessage = await ticketChannel.send({
        content: locale.select.helloUser.replace('[user]', userMention).replace('[role]', roleMention),
        files: [attach3],
      });

      const optionsButton = new ButtonBuilder()
        .setCustomId('options')
        .setLabel(locale.buttons.options || 'Options')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚙️');

      const claimButton = new ButtonBuilder()
        .setCustomId('claim')
        .setLabel(locale.buttons.claim || 'Claim')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔒');

      const ticketRow = new ActionRowBuilder().addComponents(optionsButton, claimButton);

      await ticketMessage.edit({ components: [ticketRow] });

      await interaction
        .editReply({ content: locale.select.created.replace('[channel]', ticketChannel), ephemeral: true })
        .catch(() => {});
    }
  },
};
