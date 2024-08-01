import {
  ButtonInteraction,
  ClientEvents,
  EmbedBuilder,
  Guild,
  GuildMember,
  Interaction,
  Role,
  roleMention,
  User,
} from "discord.js";

import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";

class ReactionRolesEvent implements IEvent {
  name: keyof ClientEvents = "interactionCreate";
  once = false;
  async execute(interaction: Interaction, client: BotClient): Promise<void> {
    if (!interaction.isButton()) return;
    if (interaction.customId.split("-")[0] !== "rr") return;
    const roleId = interaction.customId.split("-")[1];
    await interaction.deferReply({ ephemeral: true });
    await this.handleReactions(interaction, roleId, client);
  }

  private async handleReactions(interaction: ButtonInteraction, roleId: string, client: BotClient): Promise<void> {
    const youHaveRole = new EmbedBuilder().setDescription(`➖ Removed role ${roleMention(roleId)}`).setColor("Green");

    const youDontHaveRole = new EmbedBuilder().setDescription(`➕ Added Role ${roleMention(roleId)}`).setColor("Green");

    const user = interaction.member as GuildMember;
    const guild = interaction.guild as Guild;
    const checkRole = (await guild.roles.fetch(roleId)) as Role;
    const botClient = client.user as User;

    if (!checkRole) {
      console.error(`Role with ID ${roleId} not found in the guild ${guild.id}`);
      await interaction.editReply({ content: "Error, role not found" });
      return;
    }

    const botRolePos = (await guild.members.fetch(botClient.id)).roles.highest.position;
    if (checkRole.position >= botRolePos) {
      console.error(`Role with ID ${roleId} is higher than bot ${guild.id}`);
      await interaction.editReply({ content: `Error, role ${roleMention(roleId)} is higher than bot` });
      return;
    }
    try {
      if (user.roles.cache.some((roleSome) => roleSome.id === roleId)) {
        await user.roles.remove(roleId);
        await interaction.editReply({ embeds: [youHaveRole] });
        return;
      }
      await user.roles.add(roleId);
      await interaction.editReply({ embeds: [youDontHaveRole] });
      return;
    } catch (error) {
      console.error(`Error while trying to modify roles for user ${user.id} in guild ${guild.id}`, error);
      await interaction.editReply({ content: "Error, could not modify roles" });
      return;
    }
  }
}

export default ReactionRolesEvent;
