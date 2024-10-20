/**
 * @module claim
 */

const { PermissionFlagsBits } = require('discord.js');
const { CustomClient } = require('../utils');

module.exports = {
  name: 'claim',

  /**
   * @async
   * @function execute
   * @param {CustomClient} client
   * @param {ButtonInteraction} interaction
   */
  async execute(client, interaction) {
    const locale = client.locale.get(client.config.language);

    try {
      await interaction.deferReply({ ephemeral: true });

      const creatorId = interaction.channel.topic;
      if (!creatorId) {
        await interaction.editReply({ content: locale.options.ticketDataNotFound || 'Ticket data not found.', ephemeral: true });
        return;
      }

      const ticketKey = `ticket-${interaction.guild.id}-${creatorId}`;
      const ticketData = await client.db.get(ticketKey);
      if (!ticketData) {
        await interaction.editReply({ content: locale.options.ticketDataNotFound || 'Ticket data not found.', ephemeral: true });
        return;
      }

      if (ticketData.claimed) {
        const claimer = `<@${ticketData.claimed}>`;
        await interaction.editReply({ content: locale.claim.claimedBy.replace('[user]', claimer) || `Ticket already claimed by ${claimer}.`, ephemeral: true });
        return;
      }

      const selectedOption = ticketData.selectedOption;
      const { roleId } = client.config.optionConfig[selectedOption];
      if (!roleId) {
        await interaction.editReply({ content: 'Admin role not configured for this ticket type.', ephemeral: true });
        return;
      }

      const isAdmin = interaction.member.roles.cache.has(roleId);
      if (!isAdmin) {
        await interaction.editReply({ content: locale.claim.missingPermission || "You don't have permission to claim this ticket.", ephemeral: true });
        return;
      }

      if (interaction.user.id === creatorId) {
        await interaction.editReply({ content: locale.claim.userClaimError || "You cannot claim the ticket you opened.", ephemeral: true });
        return;
      }

      await client.db.set(ticketKey, {
        ...ticketData,
        claimed: interaction.user.id,
      });

      await interaction.channel.permissionOverwrites.edit(roleId, {
        ViewChannel: false,
        SendMessages: false,
      });

      await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      await interaction.channel.send({ content: locale.claim.claimedBy.replace('[user]', interaction.user.toString()) || `<@${interaction.user.id}> has claimed this ticket.`, ephemeral: false });

      await interaction.editReply({ content: locale.claim.claimedSuccessfully || "You have successfully claimed this ticket. ✅", ephemeral: true });
    } catch (error) {
      console.error(`Error in 'claim' interaction:`, error);
      await interaction.editReply({ content: 'An unexpected error occurred while claiming the ticket. Please try again later.', ephemeral: true });
    }
  },
};
