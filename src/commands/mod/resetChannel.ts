import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
class ResetChannelCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("reset-channel")
      .setDescription("resetting a channel.")
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Select channel").addChannelTypes(ChannelType.GuildText),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = (interaction.options.getChannel("channel") as TextChannel) || (interaction.channel as TextChannel);

    await channel.delete();
    const newChannel = await channel.clone();
    const embed = new EmbedBuilder()
      .setTitle("Channel reseted")
      .setDescription("Channel reseted! :fire: :volcano:")
      .setColor("DarkRed")
      .setImage("https://imgur.com/XYQCZCx.png");
    newChannel.send({ embeds: [embed] });
    interaction.reply({ content: "Channel has been successfully reset", ephemeral: true });
  }
}
export default ResetChannelCommand;
