import Discord, {
  ChatInputCommandInteraction,
  Guild,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";
class UnlockCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("unlock")
      .setDescription("Unlocking channel.")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Select channel for unlocking")
          .addChannelTypes(Discord.ChannelType.GuildText)
          .setRequired(false),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild as Guild;
    let channel = interaction.options.getChannel("channel") as TextChannel | null;
    if (!channel || channel === null) {
      channel = interaction.channel as TextChannel;
    }
    const embed = new Discord.EmbedBuilder()
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    if (channel.permissionsFor(guild?.id)?.has("SendMessages")) {
      await interaction.reply({
        embeds: [embed.setTitle("Error").setColor("Red").setDescription("Channel is already unlocked.")],
      });
      return;
    }
    channel.permissionOverwrites.edit(guild?.id, {
      SendMessages: true,
    });

    await interaction.reply({
      embeds: [embed.setTitle("Success!").setColor("Green").setDescription("Successfully unlocked channel")],
    });
  }
}

export default UnlockCommand;
