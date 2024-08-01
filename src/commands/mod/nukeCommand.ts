import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionOverwrites,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
class NukeCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("reset-channel")
      .setDescription("resetting a channel.")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Select description to nuke")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(false),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    let chnl = interaction.options.getChannel("channel") as TextChannel | null;
    if (!chnl || chnl === null) {
      chnl = interaction.channel as TextChannel;
    }
    const channel = chnl;
    const channelName = channel.name;
    const channelPermissions = channel.permissionOverwrites.cache;
    const parentCategory = channel.parent;
    const channelPosition = channel.position;

    await channel.delete();
    const newChannel = (await interaction.guild?.channels.create({
      name: channelName,
      type: channel.type,
      parent: parentCategory,
      position: channelPosition,
      permissionOverwrites: channelPermissions.map((permission: PermissionOverwrites) => ({
        id: permission.id,
        type: permission.type,
        allow: permission.allow.bitfield,
        deny: permission.deny.bitfield,
      })),
    })) as TextChannel;
    const embed = new EmbedBuilder()
      .setTitle("Nuked")
      .setDescription("Channel Nuked! :fire: :volcano:")
      .setColor("DarkRed")
      .setImage("https://imgur.com/XYQCZCx.png");
    await newChannel.send({ embeds: [embed] });
  }
}
export default NukeCommand;
