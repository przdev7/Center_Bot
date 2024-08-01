import Discord, {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";
class LockCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("lock")
      .setDescription("Locking channel.")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Select channel for locking")
          .addChannelTypes(Discord.ChannelType.GuildText)
          .setRequired(false),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const { guild } = interaction;
    const channel = (interaction.options.getChannel("channel") as TextChannel) || (interaction.channel as TextChannel);
    if (!guild) {
      throw new Error("Guild is null or undefined");
    }
    const embed = new EmbedBuilder()
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    if (!channel.permissionsFor(guild?.id)?.has("SendMessages")) {
      await interaction.reply({
        embeds: [embed.setTitle("Error").setColor("Red").setDescription("Channel is already locked.")],
      });
      return;
    }
    await channel.permissionOverwrites.edit(guild?.id, {
      SendMessages: false,
    });

    await interaction.reply({
      embeds: [embed.setTitle("Success!").setColor("Green").setDescription("Successfully locked channel")],
    });
  }
}

export default LockCommand;
