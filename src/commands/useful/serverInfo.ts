import { ChatInputCommandInteraction, EmbedBuilder, Guild, SlashCommandBuilder, User } from "discord.js";

import BotClient from "../../client";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";
class ServerInfoCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder().setName("serverinfo").setDescription("Sending info about user");
  }
  async execute(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    const g = interaction.guild as Guild;
    const gOwnerId: string = g.ownerId;
    const gOwner = client.users.cache.get(gOwnerId) as User;
    const serverInfoEmbed = new EmbedBuilder()
      .setTitle("Server Info")
      .setDescription("Info about this server")
      .addFields([
        {
          name: "Server Name:",
          value: g.name,
          inline: false,
        },
        {
          name: "Server Owner:",
          value: gOwner.username,
          inline: false,
        },
        {
          name: "Server Created Time",
          value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`,
          inline: false,
        },
      ])
      .setColor("White")
      .setThumbnail(g.bannerURL())
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.reply({ embeds: [serverInfoEmbed] });
  }
}
export default ServerInfoCommand;
