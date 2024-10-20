/**
 * @module addUser
 */

const { ActionRowBuilder, UserSelectMenuBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'addUser',

  /**
   * @async
   * @function execute
   * @param {CustomClient} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    if (interaction.isUserSelectMenu() && interaction.customId === 'addUser') {
      await interaction.deferReply({ ephemeral: true });

      const selectedUserId = interaction.values[0];

      if (!selectedUserId) {
        await interaction.editReply({ content: locale.addUser.userNotSelected, ephemeral: true });
        return;
      }

      const userToAdd = await interaction.guild.members.fetch(selectedUserId).catch(() => null);

      if (!userToAdd) {
        await interaction.editReply({ content: locale.addUser.userNotFound, ephemeral: true });
        return;
      }

      const channel = interaction.channel;
      const permissions = channel.permissionsFor(userToAdd);

      if (permissions && permissions.has(PermissionsBitField.Flags.ViewChannel)) {
        await interaction.editReply({ content: locale.addUser.alreadyInChannel, ephemeral: true });
        return;
      }

      try {
        await channel.permissionOverwrites.edit(userToAdd.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
        });

        await interaction.editReply({
          content: locale.addUser.addedSuccessfully.replace('[user]', userToAdd.user.tag),
          ephemeral: true,
        });

        try {
          await userToAdd.send({
            content: locale.addUser.dmNotification
              .replace('[channel]', channel.toString())
              .replace('[guild]', interaction.guild.name),
          });
        } catch (error) {
          console.error('Error sending DM to added user:', error);
        }
      } catch (error) {
        console.error('Error adding user to channel:', error);
        await interaction.editReply({ content: locale.addUser.addFailed, ephemeral: true });
      }
    } else {
      const userSelectMenu = new UserSelectMenuBuilder()
        .setCustomId('addUser')
        .setPlaceholder(locale.addUser.selectMenuPlaceholder)
        .setMinValues(1)
        .setMaxValues(1);

      const actionRow = new ActionRowBuilder().addComponents(userSelectMenu);

      await interaction.reply({
        content: locale.addUser.selectUserPrompt,
        components: [actionRow],
        ephemeral: true,
      });
    }
  },
};
