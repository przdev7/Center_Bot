import Discord, { ButtonBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";
class PingCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder().setName("addbot").setDescription("Add bot to your server");
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new Discord.EmbedBuilder()
      .setTitle("Add bot")
      .setURL(
        "https://discord.com/oauth2/authorize?client_id=1246864538050232330&permissions=364870364415&integration_type=0&scope=bot",
      )
      .setColor("White")
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    const row = new Discord.ActionRowBuilder<ButtonBuilder>().addComponents(
      new Discord.ButtonBuilder()
        .setLabel("Click me to add bot")
        .setStyle(Discord.ButtonStyle.Link)
        .setEmoji("➡️")
        .setURL(
          "https://discord.com/oauth2/authorize?client_id=1246864538050232330&permissions=364870364415&integration_type=0&scope=bot",
        ),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
export default PingCommand;
