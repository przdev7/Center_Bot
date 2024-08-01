import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";

class UserInfoCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Sending info about user.")
      .addUserOption((option) =>
        option.setName("user").setRequired(false).setDescription("Select user that you want to get info"),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    let user = interaction.options.getUser("user");
    if (!user) {
      user = interaction.user as User;
    }

    const embed = new EmbedBuilder()
      .setTitle("User Info")
      .setDescription(
        `Display Name: **${user.displayName}**\nName: **${user.username}**\nID: **${
          user.id
        }**\nDiscord Join Time: <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
      )
      .setThumbnail(user.displayAvatarURL({}))
      .setColor("White")
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.reply({ embeds: [embed] });
  }
}

export default UserInfoCommand;
