import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { version } from "../../../package.json";

class AvatarCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("avatar")
      .setDescription("Send user avatar.")
      .addUserOption((option) => option.setName("user").setDescription("user avatar."));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("user") || interaction.user;

    const embedAvatar = new EmbedBuilder()
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
      .setTitle("User Avatar")
      .setImage(user.avatarURL({ size: 4096 }))
      .setColor("White")
      .setFooter({ text: `Center Bot Version: ${version}` });

    await interaction.reply({ embeds: [embedAvatar] });
  }
}

export default AvatarCommand;
