import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";

class BanCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("ban")
      .setDescription("Banning a user from server")
      .addUserOption((option) => option.setName("user").setDescription("Choose user to ban").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("Type reason for ban.").setRequired(false))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const reason: string | null = interaction.options.getString("reason") || "no reason";
    const user = interaction.options.getMember("user") as GuildMember;
    const g = interaction.guild;
    console.log(reason);
    if (user.id === g?.ownerId) {
      await interaction.reply("You can't ban owner of the guild");
      return;
    }
    if (user.id === interaction.user.id) {
      await interaction.reply("You can't ban yourself");
      return;
    }

    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle("Banned!")
        .setDescription(`You were banned by: ${interaction.user.username} for: ${reason}`)
        .setColor("Green")
        .setImage("https://imgur.com/XYQCZCx.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await user.send({ embeds: [dmEmbed] }).catch(() => {});

      g?.bans.create(user, { reason: reason }).then(async () => {
        const serverEmbed = new EmbedBuilder()
          .setTitle("Banned!")
          .setImage("https://imgur.com/XYQCZCx.png")
          .setDescription(`You banned: <@${user.id}> for: ${reason}`)
          .setColor("Green")
          .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

        await interaction.reply({ embeds: [serverEmbed] });
      });
    } catch (error) {
      console.log(error);
      await interaction.reply("Bot don't have permissions to ban this member or something went wrong.");
    }
  }
}

export default BanCommand;
