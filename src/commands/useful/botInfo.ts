import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BotClient from "../../client";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { version, dependencies } from "../../../package.json";
class BotInfoCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("botinfo")
      .setDescription("Sending informations about bot.");
  }
  async execute(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    const infoEmbed = new EmbedBuilder()
      .setTitle("Informations about bot")
      .addFields(
        { name: "Authors", value: "xczur3k & torenn. & ativ3k" },
        { name: "Date of first line of code", value: "<t:1717689600>" },
        { name: "Actual version", value: `discord.js@${dependencies["discord.js"]}` },
        { name: "Programming language", value: "TypeScript" },
        { name: "Library", value: version },
        { name: "Bot is on", value: `${client.guilds.cache.size} servers` },
      )
      .setColor("White")
      .setFooter({ text: `Center Bot Version: ${version}` })
      .setTimestamp()
      .setImage("https://imgur.com/XYQCZCx.png");

    await interaction.reply({ embeds: [infoEmbed] });
  }
}
export default BotInfoCommand;
