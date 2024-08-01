import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";

class UnMuteCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("unmute")
      .setDescription("Unmuting a user from server.")
      .addUserOption((option) => option.setName("user").setDescription("Choose user to unmute").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getMember("user") as GuildMember;
    if (user.timeout.length === 0) {
      await interaction.reply({ content: "Member don't have timeout", ephemeral: true });
    }
    try {
      user.timeout(0);
    } catch (error) {
      await interaction.reply({ ephemeral: true, content: "Something went wrong" });
    }
  }
}

export default UnMuteCommand;
