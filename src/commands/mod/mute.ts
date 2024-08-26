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
  private allowedTimeUnits: string[] = ["s", "m", "d"];
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("mute")
      .setDescription("Muting a user from server.")
      .addUserOption((option) => option.setName("user").setDescription("Choose user to mute").setRequired(true))
      .addStringOption((option) => option.setName("time").setDescription("Type a time for mute.").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("Type reason for mute.").setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const reason: string = interaction.options.getString("reason") || "no reason";
    const user = interaction.options.getMember("user") as GuildMember;
    const uTime: string = interaction.options.getString("time", true);

    if (!user.moderatable || !user.manageable) {
      await interaction.reply({ content: "This user is unmoderatable or unmanagable", ephemeral: true });
      return;
    }
    if (user.id === interaction.user.id) {
      await interaction.reply({ content: "You can't mute yourself", ephemeral: true });
      return;
    }
    try {
      const [time, unit] = uTime.split(/\D/);

      if (!this.allowedTimeUnits.includes(unit)) {
        await interaction.reply({
          content: "Invalid unit, you can use only; s (seconds), m (minutes), d (days)",
          ephemeral: true,
        });
        return;
      }
      if (parseInt(time) > ms("30d")) {
        await interaction.reply({ content: "Invalid time max = 30days", ephemeral: true });
      }

      user.timeout(ms(time + unit), reason).then(async () => {
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
