import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

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
    const user = interaction.options.getUser("user") || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("User Info")
      .setDescription("Info about the user.")
      .addFields([
        {
          name: "username:",
          value: user.username,
          inline: false,
        },
        {
          name: "user id:",
          value: user.id,
          inline: false,
        },
        {
          name: "Joined to discord at",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: false,
        },
      ])
      .setThumbnail(user.displayAvatarURL({}))
      .setColor("White")
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.reply({ embeds: [embed] });
  }
}

export default UserInfoCommand;
