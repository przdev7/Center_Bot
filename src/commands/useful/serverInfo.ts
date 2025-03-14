import { ChatInputCommandInteraction, EmbedBuilder, Guild, SlashCommandBuilder, User } from "discord.js";

import BotClient from "../../client";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { version } from "../../../package.json";
class ServerInfoCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder().setName("serverinfo").setDescription("Sending info about server");
  }
  async execute(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    const guild = interaction.guild as Guild;
    const guildOwnerId: string = guild.ownerId;
    const guildOwner = client.users.cache.get(guildOwnerId) as User;
    const serverInfoEmbed = new EmbedBuilder()
      .setTitle("Server Info")
      .setDescription("Info about this server")
      .addFields([
        {
          name: "Server Name:",
          value: guild.name,
          inline: false,
        },
        {
          name: "Server Owner:",
          value: guildOwner.username,
          inline: false,
        },
        {
          name: "Server Created Time",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: false,
        },
      ])
      .setColor("White")
      .setThumbnail(guild.bannerURL())
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${version}` });

    await interaction.reply({ embeds: [serverInfoEmbed] });
  }
}
export default ServerInfoCommand;
