import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";

class KickCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("kick")
      .setDescription("Kicking a user from server.")
      .addUserOption((option) => option.setName("user").setDescription("Choose user to kick").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("Type reason for kick.").setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const reason: string | null = interaction.options.getString("reason") || "no reason";
    const user = interaction.options.getMember("user") as GuildMember;
    const g = interaction.guild;
    if (user.id === g?.ownerId) {
      await interaction.reply("You can't kick owner of the guild");
      return;
    }
    if (user.id === interaction.user.id) {
      await interaction.reply("You can't kick yourself");
      return;
    }
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle("Kicked!")
        .setDescription(`You were kicked by: ${interaction.user.username} for: ${reason}`)
        .setColor("Green")
        .setImage("https://imgur.com/XYQCZCx.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await user.send({ embeds: [dmEmbed] }).catch(() => {});

      user.kick(reason).then(async () => {
        const embed = new EmbedBuilder()
          .setTitle("Kicked!")
          .setDescription(`You kicked: <@${user.id}> For: ${reason}`)
          .setColor("Green")
          .setImage("https://imgur.com/XYQCZCx.png")
          .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
        await interaction.reply({ embeds: [embed] });
      });
    } catch (error) {
      await interaction.reply("Bot don't have permissions to kick this member or something went wrong.");
    }
  }
}

export default KickCommand;
