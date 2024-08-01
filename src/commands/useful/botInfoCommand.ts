import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BotClient from "../../client";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";
import { version } from "../../../package.json";
const client = BotClient.getInstance();
class BotInfoCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("botinfo")
      .setDescription("Sending informations about bot.");
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const infoEmbed = new EmbedBuilder()
      .setTitle("Informations about bot")
      .addFields(
        { name: "Authors", value: "xczur3k & torenn. & ativ3k" },
        { name: "Date of first line of code", value: "<t:1717689600>" },
        { name: "Actual version", value: `${version}` },
        { name: "Programming language", value: "TypeScript" },
        { name: "Library", value: "Discord.JS@14.15.2" },
        { name: "Bot is on", value: `${client.guilds.cache.size} servers` },
      )
      .setColor("White")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
      .setTimestamp()
      .setImage("https://imgur.com/XYQCZCx.png");

    await interaction.reply({ embeds: [infoEmbed] });
  }
}
export default BotInfoCommand;
