import { ChatInputCommandInteraction, EmbedBuilder, Guild, SlashCommandBuilder, User } from "discord.js";

import BotClient from "../../client";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
const client = BotClient.getInstance();
import { BOT_VERSION } from "../../utils/constants";
class ServerInfoCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder().setName("serverinfo").setDescription("Sending info about user");
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild as Guild;
    const gOwnerId: string = g.ownerId;
    const gOwner = client.users.cache.get(gOwnerId) as User;
    const serverInfoEmbed = new EmbedBuilder()
      .setTitle("Server Info")
      .setDescription(
        `Server Name: **${g?.name}**\nServer Owner: **${gOwner.username}**\nServer ID: **${
          g?.id
        }**\nServer Created Time <t:${Math.floor(g.createdTimestamp / 1000)}:R>`,
      )
      .setColor("White")
      .setThumbnail(g.bannerURL())
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.reply({ embeds: [serverInfoEmbed] });
  }
}
export default ServerInfoCommand;
