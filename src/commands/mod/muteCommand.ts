import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import ms from "ms";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";

class MuteCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("mute")
      .setDescription("Muting a user from server.")
      .addUserOption((option) => option.setName("user").setDescription("Choose user to mute").setRequired(true))
      .addNumberOption((option) =>
        option.setName("time").setDescription("Type a time for mute. IN MINUTES").setMinValue(1).setRequired(true),
      )
      .addStringOption((option) => option.setName("reason").setDescription("Type reason for mute.").setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const reason: string | null = interaction.options.getString("reason") || "no reason";
    const user = interaction.options.getMember("user") as GuildMember;
    const time: number | null = interaction.options.getNumber("time");

    const g = interaction.guild;
    if (user.id === g?.ownerId) {
      await interaction.reply("You can't mute owner of the guild");
      return;
    }
    if (user.id === interaction.user.id) {
      await interaction.reply("You can't mute yourself");
      return;
    }
    try {
      user.timeout(ms(`${time?.toString() + "m"}`), reason).then(async () => {
        const embed = new EmbedBuilder()
          .setTitle("Muted!")
          .setDescription(`You muted: <@${user.id}> For: ${reason}`)
          .setColor("Green")
          .setImage("https://imgur.com/XYQCZCx.png")
          .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
        await interaction.reply({ embeds: [embed] });
      });
    } catch (error) {
      await interaction.reply("Bot don't have permissions to mute this member or something went wrong.");
    }
  }
}

export default MuteCommand;
