import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";

class AvatarCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("avatar")
      .setDescription("Send user avatar.")
      .addUserOption((option) => option.setName("user").setDescription("user avatar."));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = (interaction.options.getUser("user") as User) || (interaction.user as User);

    const embedAvatar = new EmbedBuilder()
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
      .setTitle("User Avatar")
      .setImage(user.avatarURL({ size: 4096 }))
      .setColor("White")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.reply({ embeds: [embedAvatar] });
  }
}

export default AvatarCommand;
